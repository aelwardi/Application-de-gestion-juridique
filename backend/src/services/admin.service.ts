import * as adminQueries from '../database/queries/admin.queries';
import { sendEmail } from '../utils/email.util';
import { hashPassword } from '../utils/password.util';
import { createUser, findUserByEmail } from '../database/queries/auth.queries';

/**
 * Create a new admin user
 */
export const createAdmin = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string | null,
  creatorAdminId: string
) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const newAdmin = await createUser(
    email,
    passwordHash,
    'admin',
    firstName,
    lastName,
    phone || undefined
  );

  await adminQueries.createActivityLog(
    creatorAdminId,
    'ADMIN_CREATED',
    'user',
    newAdmin.id,
    null,
    null
  );

  sendEmail({
    to: email,
    subject: 'Votre compte administrateur',
    html: `
      <h1>Compte Administrateur Créé</h1>
      <p>Bonjour ${firstName} ${lastName},</p>
      <p>Un compte administrateur a été créé pour vous sur la plateforme de Gestion Juridique.</p>
      <p><strong>Email :</strong> ${email}<br>
      <strong>Mot de passe temporaire :</strong> ${password}</p>
      <p><strong>Important :</strong> Veuillez changer votre mot de passe dès votre première connexion.</p>
      <p><a href="http://localhost:3001/auth/login">Se connecter</a></p>
    `,
  }).catch(err => console.error('Failed to send admin creation email:', err));

  return { success: true, admin: newAdmin };
};

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async () => {
  return await adminQueries.getDashboardStats();
};

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (
  page: number,
  limit: number,
  role?: string,
  search?: string,
  isActive?: boolean
) => {
  return await adminQueries.getAllUsers(page, limit, role, search, isActive);
};

/**
 * Get user details
 */
export const getUserDetails = async (userId: string) => {
  const user = await adminQueries.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Activate or deactivate user
 */
export const toggleUserStatus = async (userId: string, isActive: boolean, adminId: string) => {
  await adminQueries.updateUserStatus(userId, isActive);

  await adminQueries.createActivityLog(
    adminId,
    isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    'user',
    userId,
    null,
    null
  );

  return { success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` };
};

/**
 * Verify user account
 */
export const verifyUser = async (userId: string, adminId: string) => {
  await adminQueries.updateUserVerification(userId, true);

  await adminQueries.createActivityLog(
    adminId,
    'USER_VERIFIED',
    'user',
    userId,
    null,
    null
  );

  const user = await adminQueries.getUserById(userId);
  if (user) {
    sendEmail({
      to: user.email,
      subject: 'Votre compte a été vérifié',
      html: `
        <h1>Compte vérifié</h1>
        <p>Bonjour ${user.first_name},</p>
        <p>Votre compte a été vérifié par un administrateur. Vous avez maintenant accès à toutes les fonctionnalités de la plateforme.</p>
      `,
    }).catch(err => console.error('Failed to send verification email:', err));
  }

  return { success: true, message: 'User verified successfully' };
};

/**
 * Delete user account
 */
export const deleteUserAccount = async (userId: string, adminId: string) => {
  const user = await adminQueries.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  await adminQueries.createActivityLog(
    adminId,
    'USER_DELETED',
    'user',
    userId,
    null,
    null
  );

  await adminQueries.deleteUser(userId);

  sendEmail({
    to: user.email,
    subject: 'Votre compte a été supprimé',
    html: `
      <h1>Compte supprimé</h1>
      <p>Bonjour ${user.first_name},</p>
      <p>Votre compte a été supprimé de notre plateforme.</p>
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.</p>
    `,
  }).catch(err => console.error('Failed to send deletion email:', err));

  return { success: true, message: 'User deleted successfully' };
};

/**
 * Get user growth statistics
 */
export const getUserGrowthStats = async (days: number = 30) => {
  return await adminQueries.getUserGrowthStats(days);
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (page: number, limit: number, userId?: string) => {
  return await adminQueries.getActivityLogs(page, limit, userId);
};

/**
 * Send bulk email to users by role
 */
export const sendBulkEmailByRole = async (
  role: string,
  subject: string,
  message: string,
  adminId: string
) => {
  let targetRole: string | undefined;

  if (role !== 'all') {
    targetRole = role;
  }

  const { users } = await adminQueries.getAllUsers(1, 10000, targetRole, undefined);

  if (users.length === 0) {
    return {
      success: true,
      message: 'No users found for this role',
      sent: 0
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; margin-top: 20px; }
        .message { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 ${subject}</h1>
        </div>
        <div class="content">
          <div class="message">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Cet email a été envoyé par l'équipe d'administration de la plateforme de Gestion Juridique.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailPromises = users.map(user =>
    sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    })
  );

  const results = await Promise.allSettled(emailPromises);
  const successCount = results.filter(r => r.status === 'fulfilled').length;

  await adminQueries.createActivityLog(
    adminId,
    'BULK_EMAIL_SENT',
    'email',
    null,
    null,
    null,
    { role, recipientsCount: users.length, successCount }
  );

  return {
    success: true,
    message: `Email envoyé à ${successCount}/${users.length} utilisateurs`,
    sent: successCount,
    total: users.length
  };
};

/**
 * Send bulk email to users (legacy - par IDs)
 */
export const sendBulkEmail = async (
  recipientIds: string[],
  subject: string,
  htmlContent: string,
  adminId: string
) => {
  const users = await Promise.all(
    recipientIds.map(id => adminQueries.getUserById(id))
  );

  const validUsers = users.filter(u => u !== null);

  const emailPromises = validUsers.map(user =>
    sendEmail({
      to: user!.email,
      subject,
      html: htmlContent,
    })
  );

  await Promise.allSettled(emailPromises);

  await adminQueries.createActivityLog(
    adminId,
    'BULK_EMAIL_SENT',
    'email',
    null,
    null,
    null
  );

  return {
    success: true,
    message: `Email sent to ${validUsers.length} users`,
    sent: validUsers.length
  };
};

/**
 * Export users data
 */
export const exportUsersData = async (role?: string) => {
  const { users } = await adminQueries.getAllUsers(1, 10000, role);

  const headers = ['ID', 'Email', 'Role', 'First Name', 'Last Name', 'Phone', 'Active', 'Verified', 'Created At'];
  const rows = users.map(user => [
    user.id,
    user.email,
    user.role,
    user.first_name,
    user.last_name,
    user.phone || '',
    user.is_active ? 'Yes' : 'No',
    user.is_verified ? 'Yes' : 'No',
    user.created_at.toISOString(),
  ]);

  return {
    headers,
    data: rows,
  };
};