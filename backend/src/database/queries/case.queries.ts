import { pool } from '../../config/database.config';

/**
 * ACCEPTER UNE OFFRE
 * Simplifié : lawyer_id et client_id sont directement des users.id
 */
export const acceptOfferQuery = async (offerId: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Récupérer l'offre
        const offerRes = await client.query(
            'SELECT * FROM client_requests WHERE id = $1',
            [offerId]
        );
        const offer = offerRes.rows[0];
        if (!offer) throw new Error("Offre introuvable");

        // 2. lawyer_id et client_id sont directement des users.id
        const lawyerId = offer.lawyer_id;
        const clientId = offer.client_id;

        // Génération d'un numéro de dossier
        const caseNumber = `DOS-${Date.now().toString().slice(-6)}`;

        // 3. Insertion dans 'cases'
        const insertCaseQuery = `
            INSERT INTO cases (
                case_number, title, description, case_type, 
                status, client_id, lawyer_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            RETURNING id;
        `;

        const newCaseResult = await client.query(insertCaseQuery, [
            caseNumber,
            offer.title || 'Nouveau dossier',
            offer.description,
            offer.case_category || 'Général',
            'in_progress', 
            clientId,
            lawyerId
        ]);

        // 4. Mettre à jour le statut de la requête initiale
        await client.query(
            "UPDATE client_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [offerId]
        );

        await client.query('COMMIT');
        return { success: true, caseNumber, caseId: newCaseResult.rows[0].id };

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('[ACCEPT_OFFER ERROR]', error.message);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * DÉCLINER L'OFFRE
 */
export const declineOfferQuery = async (offerId: string) => {
    const result = await pool.query(
        "UPDATE client_requests SET status = 'rejected' WHERE id = $1 RETURNING id",
        [offerId]
    );
    return (result.rowCount ?? 0) > 0;
};





// dernier fichier a jour apres demaden client/avocat
/*import { pool } from '../../config/database.config';
export const acceptOfferQuery = async (offerId: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. On récupère les détails de l'offre (le formulaire client)
        const offerRes = await client.query(
            'SELECT * FROM case_offers WHERE id = $1 AND status = $2',
            [offerId, 'pending']
        );
        const offer = offerRes.rows[0];

        if (!offer) {
            throw new Error("Offre non trouvée ou déjà traitée.");
        }

        // 2. Générer un numéro de dossier unique
        const caseNumber = `DOS-${Date.now().toString().slice(-6)}`;

        // 3. Insérer dans la table 'cases' (en utilisant tes colonnes exactes)
        const insertCaseQuery = `
            INSERT INTO cases (
                case_number, 
                title, 
                description, 
                case_type, 
                status, 
                priority, 
                client_id, 
                lawyer_id, 
                opening_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
            RETURNING id;
        `;

        const newCase = await client.query(insertCaseQuery, [
            caseNumber,
            offer.title,
            offer.description,
            offer.case_type,
            'in_progress', // Le dossier devient actif
            'medium',      // Priorité par défaut
            offer.client_id,
            offer.lawyer_id
        ]);

        // 4. Mettre à jour le statut de l'offre
        await client.query(
            'UPDATE case_offers SET status = $1, updated_at = NOW() WHERE id = $2',
            ['accepted', offerId]
        );

        // 5. Créer une entrée dans l'historique (ta table case_status_history)
        await client.query(
            'INSERT INTO case_status_history (case_id, old_status, new_status, changed_by, comment) VALUES ($1, $2, $3, $4, $5)',
            [newCase.rows[0].id, null, 'in_progress', offer.lawyer_id, 'Dossier créé via acceptation d\'offre']
        );

        await client.query('COMMIT');
        return { success: true, caseId: newCase.rows[0].id };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

*/