import { pool } from '../config/database.config';

/**
 * Utilitaire pour résoudre les IDs d'avocats
 * Convertit automatiquement un ID de la table lawyers en user_id
 * ou valide qu'un user_id correspond bien à un avocat
 */

export interface LawyerIdResolution {
  userId: string;
  lawyerId?: string;
  isValid: boolean;
}

/**
 * Résout un lawyer_id pour obtenir le user_id correspondant
 * Accepte soit un user_id (d'un utilisateur avocat) soit un lawyer.id
 *
 * @param lawyerId - L'ID à résoudre (peut être users.id ou lawyers.id)
 * @returns Le user_id résolu et des infos sur la résolution
 * @throws Error si l'ID n'est pas valide ou ne correspond pas à un avocat
 */
export async function resolveLawyerId(lawyerId: string): Promise<string> {
  if (!lawyerId) {
    throw new Error('Lawyer ID is required');
  }

  // Étape 1 : Vérifier si c'est un user_id valide (utilisateur avec role='lawyer')
  const userCheck = await pool.query(
    'SELECT id, role FROM users WHERE id = $1',
    [lawyerId]
  );

  if (userCheck.rows.length > 0) {
    const user = userCheck.rows[0];

    // Vérifier que c'est bien un avocat
    if (user.role === 'lawyer' || user.role === 'avocat') {
      console.log(`[LAWYER_ID_RESOLVER] Valid user_id for lawyer: ${lawyerId}`);
      return lawyerId; // C'est déjà un user_id valide
    } else {
      throw new Error(`User ${lawyerId} is not a lawyer (role: ${user.role})`);
    }
  }

  // Étape 2 : Si pas trouvé comme user, chercher dans la table lawyers
  const lawyerCheck = await pool.query(
    'SELECT user_id FROM lawyers WHERE id = $1',
    [lawyerId]
  );

  if (lawyerCheck.rows.length > 0) {
    const resolvedUserId = lawyerCheck.rows[0].user_id;
    console.log(`[LAWYER_ID_RESOLVER] Converted lawyers.id ${lawyerId} to user_id ${resolvedUserId}`);
    return resolvedUserId;
  }

  // Étape 3 : Si toujours pas trouvé, erreur
  throw new Error(`Lawyer with ID ${lawyerId} not found in users or lawyers table`);
}

/**
 * Résout plusieurs lawyer_ids en parallèle
 * @param lawyerIds - Tableau d'IDs à résoudre
 * @returns Tableau des user_ids résolus
 */
export async function resolveLawyerIds(lawyerIds: string[]): Promise<string[]> {
  const promises = lawyerIds.map(id => resolveLawyerId(id));
  return await Promise.all(promises);
}

/**
 * Résout un lawyer_id optionnel (peut être null/undefined)
 * @param lawyerId - L'ID à résoudre ou null/undefined
 * @returns Le user_id résolu ou null
 */
export async function resolveLawyerIdOptional(lawyerId: string | null | undefined): Promise<string | null> {
  if (!lawyerId) {
    return null;
  }

  try {
    return await resolveLawyerId(lawyerId);
  } catch (error) {
    console.error(`[LAWYER_ID_RESOLVER] Failed to resolve optional lawyer_id ${lawyerId}:`, error);
    return null;
  }
}

/**
 * Obtient le lawyer.id depuis un user_id
 * Utile pour les cas où on a besoin de l'ID de la table lawyers
 * @param userId - L'ID utilisateur
 * @returns L'ID de la table lawyers ou null
 */
export async function getLawyerTableId(userId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT id FROM lawyers WHERE user_id = $1',
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0].id : null;
}

/**
 * Valide qu'un user_id est bien un avocat
 * @param userId - L'ID utilisateur à vérifier
 * @returns true si c'est un avocat, false sinon
 */
export async function isLawyer(userId: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const role = result.rows[0].role;
  return role === 'lawyer' || role === 'avocat';
}

