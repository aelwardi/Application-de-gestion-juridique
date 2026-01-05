import { pool } from '../config/database.config';
import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoyer un rappel par email pour un rendez-vous
 */
export const sendAppointmentReminder = async (appointmentId: string, reminderType: '24h' | '2h') => {
  try {
    // Récupérer les détails du rendez-vous
    const query = `
      SELECT 
        a.*,
        l.first_name as lawyer_first_name,
        l.last_name as lawyer_last_name,
        l.email as lawyer_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email
      FROM appointments a
      LEFT JOIN users l ON a.lawyer_id = l.id
      LEFT JOIN users c ON a.client_id = c.id
      WHERE a.id = $1 AND a.status IN ('scheduled', 'confirmed')
    `;

    const result = await pool.query(query, [appointmentId]);

    if (result.rows.length === 0) {
      console.log(`Rendez-vous ${appointmentId} non trouvé ou déjà annulé`);
      return false;
    }

    const appointment = result.rows[0];

    // Vérifier si le rappel n'a pas déjà été envoyé
    if (reminderType === '24h' && appointment.reminder_24h_sent) {
      console.log(`Rappel 24h déjà envoyé pour ${appointmentId}`);
      return false;
    }

    if (reminderType === '2h' && appointment.reminder_2h_sent) {
      console.log(`Rappel 2h déjà envoyé pour ${appointmentId}`);
      return false;
    }

    const timeText = reminderType === '24h' ? 'demain' : 'dans 2 heures';
    const startTime = new Date(appointment.start_time).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Contenu de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel de Rendez-vous</h1>
            <p>Votre rendez-vous est prévu ${timeText}</p>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Ceci est un rappel concernant votre rendez-vous à venir.</p>
            
            <div class="appointment-details">
              <h2>📅 Détails du rendez-vous</h2>
              <div class="detail-row">
                <span class="label">Sujet:</span> ${appointment.title}
              </div>
              <div class="detail-row">
                <span class="label">Date et heure:</span> ${startTime}
              </div>
              <div class="detail-row">
                <span class="label">Type:</span> ${getAppointmentTypeLabel(appointment.appointment_type)}
              </div>
              ${appointment.location_address ? `
                <div class="detail-row">
                  <span class="label">Lieu:</span> ${appointment.location_address}
                </div>
              ` : ''}
              ${appointment.meeting_url ? `
                <div class="detail-row">
                  <span class="label">Lien visio:</span> <a href="${appointment.meeting_url}">${appointment.meeting_url}</a>
                </div>
              ` : ''}
              ${appointment.description ? `
                <div class="detail-row">
                  <span class="label">Description:</span><br>${appointment.description}
                </div>
              ` : ''}
            </div>

            <p>Merci de confirmer votre présence ou de nous informer en cas d'empêchement.</p>
            
            <a href="${process.env.FRONTEND_URL}/appointments/${appointment.id}" class="button">
              Voir les détails
            </a>
          </div>
          <div class="footer">
            <p>Cet email est un rappel automatique. Merci de ne pas y répondre.</p>
            <p>© 2026 Plateforme Juridique - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'email à l'avocat
    if (appointment.lawyer_email) {
      await transporter.sendMail({
        from: `"Plateforme Juridique" <${process.env.SMTP_USER}>`,
        to: appointment.lawyer_email,
        subject: `⏰ Rappel: Rendez-vous ${timeText} - ${appointment.title}`,
        html: emailHtml,
      });
      console.log(`✅ Rappel envoyé à l'avocat: ${appointment.lawyer_email}`);
    }

    // Envoyer l'email au client
    if (appointment.client_email) {
      await transporter.sendMail({
        from: `"Plateforme Juridique" <${process.env.SMTP_USER}>`,
        to: appointment.client_email,
        subject: `⏰ Rappel: Rendez-vous ${timeText} - ${appointment.title}`,
        html: emailHtml,
      });
      console.log(`✅ Rappel envoyé au client: ${appointment.client_email}`);
    }

    // Marquer le rappel comme envoyé
    const updateField = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_2h_sent';
    await pool.query(
      `UPDATE appointments SET ${updateField} = true, ${updateField}_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [appointmentId]
    );

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel:', error);
    return false;
  }
};

/**
 * Trouver et envoyer les rappels 24h avant
 */
export const sendDailyReminders = async () => {
  try {
    console.log('🔔 Début de l\'envoi des rappels 24h...');

    // Trouver les rendez-vous dans 24h (±1h)
    const query = `
      SELECT id 
      FROM appointments 
      WHERE start_time >= NOW() + INTERVAL '23 hours'
        AND start_time <= NOW() + INTERVAL '25 hours'
        AND status IN ('scheduled', 'confirmed')
        AND (reminder_24h_sent = false OR reminder_24h_sent IS NULL)
    `;

    const result = await pool.query(query);
    console.log(`📋 ${result.rows.length} rappel(s) 24h à envoyer`);

    for (const row of result.rows) {
      await sendAppointmentReminder(row.id, '24h');
      // Attendre 1 seconde entre chaque email pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Rappels 24h terminés');
    return result.rows.length;
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels quotidiens:', error);
    throw error;
  }
};

/**
 * Trouver et envoyer les rappels 2h avant
 */
export const sendHourlyReminders = async () => {
  try {
    console.log('🔔 Début de l\'envoi des rappels 2h...');

    // Trouver les rendez-vous dans 2h (±30min)
    const query = `
      SELECT id 
      FROM appointments 
      WHERE start_time >= NOW() + INTERVAL '90 minutes'
        AND start_time <= NOW() + INTERVAL '150 minutes'
        AND status IN ('scheduled', 'confirmed')
        AND (reminder_2h_sent = false OR reminder_2h_sent IS NULL)
    `;

    const result = await pool.query(query);
    console.log(`📋 ${result.rows.length} rappel(s) 2h à envoyer`);

    for (const row of result.rows) {
      await sendAppointmentReminder(row.id, '2h');
      // Attendre 1 seconde entre chaque email
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Rappels 2h terminés');
    return result.rows.length;
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels horaires:', error);
    throw error;
  }
};

/**
 * Helper pour obtenir le label du type de rendez-vous
 */
function getAppointmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    tribunal: 'Tribunal',
    client_meeting: 'Rencontre client',
    expertise: 'Expertise',
    teleconference: 'Téléconférence',
    other: 'Autre'
  };
  return labels[type] || type;
}

export default {
  sendAppointmentReminder,
  sendDailyReminders,
  sendHourlyReminders
};

