import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_APP_USERNAME,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Envoyer un email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.GMAIL_APP_USERNAME || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email non configuré. Passez cette étape.');
    console.warn('   Pour activer les emails, configurez GMAIL_APP_USERNAME et GMAIL_APP_PASSWORD dans .env');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Gestion Juridique" <${process.env.GMAIL_APP_USERNAME}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId, 'à', options.to);
    return true;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email à', options.to);
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    return false;
  }
};

/**
 * Envoyer un email de bienvenue
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bienvenue sur Gestion Juridique</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName} ${lastName},</h2>
          <p>Nous sommes ravis de vous accueillir sur notre plateforme de gestion juridique.</p>
          <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à utiliser nos services.</p>
          <center>
            <a href="http://localhost:3001/auth/login" class="button">Se connecter</a>
          </center>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2025 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Bienvenue sur Gestion Juridique',
    html,
  });
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  firstName: string
): Promise<boolean> => {
  const resetUrl = `http://localhost:3001/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          <center>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </center>
          <div class="warning">
            <strong>Important :</strong>
            <p>Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2025 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html,
  });
};

/**
 * Envoyer un email de confirmation de changement de mot de passe
 */
export const sendPasswordChangedEmail = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .info { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mot de passe modifié</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre mot de passe a été modifié avec succès.</p>
          <div class="info">
            <strong>✓ Confirmation</strong>
            <p>Cette modification a été effectuée le ${new Date().toLocaleString('fr-FR')}.</p>
          </div>
          <p>Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2025 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Votre mot de passe a été modifié',
    html,
  });
};

/**
 * Envoyer un email de notification de rendez-vous
 */
export const sendAppointmentNotification = async (
  email: string,
  firstName: string,
  appointmentDate: Date,
  lawyerName: string,
  appointmentType: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .appointment-details { background-color: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau Rendez-vous</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Un nouveau rendez-vous a été programmé :</p>
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Date et heure :</span>
              <span class="detail-value">${appointmentDate.toLocaleString('fr-FR')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Avocat :</span>
              <span class="detail-value">${lawyerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type :</span>
              <span class="detail-value">${appointmentType}</span>
            </div>
          </div>
          <p>Nous vous rappelons d'être ponctuel(le). En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.</p>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2025 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirmation de votre rendez-vous',
    html,
  });
};

/**
 * Envoyer un email à l'avocat pour une nouvelle demande client
 */
export const sendNewRequestToLawyer = async (
  lawyerEmail: string,
  lawyerFirstName: string,
  clientName: string,
  requestTitle: string,
  requestDescription: string,
  urgency: string,
  caseCategory: string
): Promise<boolean> => {
  const urgencyColors: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#dc2626'
  };

  const urgencyLabels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .request-details { background-color: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-weight: bold; color: #6b7280; display: block; margin-bottom: 5px; }
        .detail-value { color: #1f2937; }
        .urgency-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button-secondary { background-color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📩 Nouvelle Demande Client</h1>
        </div>
        <div class="content">
          <h2>Bonjour Me ${lawyerFirstName},</h2>
          <p>Vous avez reçu une nouvelle demande d'un client sur la plateforme Gestion Juridique.</p>
          
          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">Client :</span>
              <span class="detail-value">${clientName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Titre de la demande :</span>
              <span class="detail-value"><strong>${requestTitle}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Catégorie :</span>
              <span class="detail-value">${caseCategory}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Urgence :</span>
              <span class="urgency-badge" style="background-color: ${urgencyColors[urgency] || '#6b7280'}">
                ${urgencyLabels[urgency] || urgency}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Description :</span>
              <p class="detail-value">${requestDescription}</p>
            </div>
          </div>

          <p><strong>Actions requises :</strong></p>
          <p>Veuillez vous connecter à votre espace avocat pour consulter les détails complets de la demande et y répondre.</p>
          
          <center>
            <a href="http://localhost:3001/dashboard" class="button">Voir la demande</a>
          </center>

          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2026 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: lawyerEmail,
    subject: `Nouvelle demande client : ${requestTitle}`,
    html,
  });
};

/**
 * Envoyer un email au client quand l'avocat accepte sa demande
 */
export const sendRequestAcceptedToClient = async (
  clientEmail: string,
  clientFirstName: string,
  lawyerName: string,
  requestTitle: string,
  caseId?: string
): Promise<boolean> => {
  const caseUrl = caseId ? `http://localhost:3001/cases/${caseId}` : 'http://localhost:3001/cases';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .success-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .icon { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Demande Acceptée</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${clientFirstName},</h2>
          <div class="success-box">
            <p><strong>Bonne nouvelle !</strong></p>
            <p>Me ${lawyerName} a accepté de traiter votre demande concernant : <strong>"${requestTitle}"</strong></p>
          </div>
          <p>Votre dossier a été créé et vous pouvez maintenant :</p>
          <ul>
            <li> Consulter les détails de votre dossier</li>
            <li> Télécharger des documents</li>
            <li> Communiquer avec votre avocat</li>
            <li> Prendre rendez-vous</li>
          </ul>
          <center>
            <a href="${caseUrl}" class="button">Accéder à mon dossier</a>
          </center>
          <p>Votre avocat vous contactera prochainement pour définir les prochaines étapes.</p>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2026 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Votre demande a été acceptée par Me ${lawyerName}`,
    html,
  });
};

/**
 * Envoyer un email au client quand l'avocat refuse sa demande
 */
export const sendRequestRejectedToClient = async (
  clientEmail: string,
  clientFirstName: string,
  lawyerName: string,
  requestTitle: string,
  rejectionReason?: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .info-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réponse à votre demande</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${clientFirstName},</h2>
          <div class="info-box">
            <p>Me ${lawyerName} ne peut malheureusement pas donner suite à votre demande concernant : <strong>"${requestTitle}"</strong></p>
            ${rejectionReason ? `<p><strong>Motif :</strong> ${rejectionReason}</p>` : ''}
          </div>
          <p>Nous vous encourageons à :</p>
          <ul>
            <li>Consulter d'autres avocats spécialisés sur notre plateforme</li>
            <li>Reformuler votre demande si nécessaire</li>
            <li>Nous contacter si vous avez des questions</li>
          </ul>
          <center>
            <a href="http://localhost:3001/lawyers" class="button">Trouver un autre avocat</a>
          </center>
          <p>Merci de votre compréhension.</p>
          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2026 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Réponse à votre demande : ${requestTitle}`,
    html,
  });
};

/**
 * Envoyer un email de notification de changement de statut de dossier
 */
export const sendCaseStatusChangedEmail = async (
  clientEmail: string,
  clientFirstName: string,
  caseTitle: string,
  oldStatus: string,
  newStatus: string,
  caseId: string
): Promise<boolean> => {
  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    on_hold: 'En pause',
    closed: 'Fermé',
    archived: 'Archivé'
  };

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    on_hold: '#6b7280',
    closed: '#10b981',
    archived: '#9ca3af'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .status-box { background-color: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; color: white; font-weight: bold; margin: 10px; }
        .arrow { font-size: 24px; color: #6b7280; margin: 0 10px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mise à jour de votre dossier</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${clientFirstName},</h2>
          <p>Le statut de votre dossier <strong>"${caseTitle}"</strong> a été mis à jour.</p>
          
          <div class="status-box">
            <span class="status-badge" style="background-color: ${statusColors[oldStatus] || '#6b7280'}">
              ${statusLabels[oldStatus] || oldStatus}
            </span>
            <span class="arrow">→</span>
            <span class="status-badge" style="background-color: ${statusColors[newStatus] || '#6b7280'}">
              ${statusLabels[newStatus] || newStatus}
            </span>
          </div>

          ${newStatus === 'closed' ? `
            <p style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
              <strong>Félicitations !</strong> Votre dossier a été clôturé avec succès.
            </p>
          ` : ''}

          <p>Connectez-vous pour consulter les détails et l'historique complet de votre dossier.</p>
          
          <center>
            <a href="http://localhost:3001/cases/${caseId}" class="button">Voir mon dossier</a>
          </center>

          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2026 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Mise à jour de votre dossier : ${caseTitle}`,
    html,
  });
};

/**
 * Envoyer un email de notification d'upload de document
 */
export const sendDocumentUploadedEmail = async (
  recipientEmail: string,
  recipientFirstName: string,
  uploaderName: string,
  documentTitle: string,
  caseTitle: string,
  caseId: string,
  isConfidential: boolean = false
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .document-box { background-color: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .document-icon { font-size: 48px; text-align: center; margin-bottom: 15px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        ${isConfidential ? '.confidential-badge { background-color: #fef2f2; color: #dc2626; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }' : ''}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau document</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${recipientFirstName},</h2>
          <p>${uploaderName} a ajouté un nouveau document à votre dossier <strong>"${caseTitle}"</strong>.</p>
          
          <div class="document-box">
            <p style="text-align: center;">
              <strong>${documentTitle}</strong>
              ${isConfidential ? '<br><span class="confidential-badge">Document confidentiel</span>' : ''}
            </p>
          </div>

          <p>Vous pouvez consulter ce document dès maintenant dans votre espace client.</p>
          
          <center>
            <a href="http://localhost:3001/cases/${caseId}" class="button">Consulter le document</a>
          </center>

          <p>Cordialement,<br>L'équipe Gestion Juridique</p>
        </div>
        <div class="footer">
          <p>© 2026 Gestion Juridique. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Nouveau document : ${documentTitle}`,
    html,
  });
};

/**
 * Tester la configuration email
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Configuration email valide');
    return true;
  } catch (error) {
    console.error('Configuration email invalide:', error);
    return false;
  }
};