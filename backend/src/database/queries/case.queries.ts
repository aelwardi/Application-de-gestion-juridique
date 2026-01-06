import { pool } from '../../config/database.config';

/**
 * ACCEPTER UNE OFFRE
 * Simplifié : lawyer_id et client_id sont directement des users.id
 */
export const acceptOfferQuery = async (offerId: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const offerRes = await client.query(
            'SELECT * FROM client_requests WHERE id = $1',
            [offerId]
        );
        const offer = offerRes.rows[0];
        if (!offer) throw new Error("Offre introuvable");

        const lawyerId = offer.lawyer_id;
        const clientId = offer.client_id;

        const caseNumber = `DOS-${Date.now().toString().slice(-6)}`;

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