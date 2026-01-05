import cron from 'node-cron';
import { sendDailyReminders, sendHourlyReminders } from '../services/reminder.service';

/**
 * Job Cron pour les rappels de rendez-vous
 *
 * Rappels 24h: Tous les jours à 8h00
 * Rappels 2h: Toutes les 30 minutes
 */

export const startReminderJobs = () => {
  console.log('🚀 Démarrage des jobs de rappels automatiques...');

  // Job quotidien à 8h00 pour les rappels 24h avant
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Exécution du job quotidien de rappels 24h...');
    try {
      const count = await sendDailyReminders();
      console.log(`✅ Job quotidien terminé: ${count} rappel(s) envoyé(s)`);
    } catch (error) {
      console.error('❌ Erreur dans le job quotidien:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  // Job toutes les 30 minutes pour les rappels 2h avant
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Exécution du job horaire de rappels 2h...');
    try {
      const count = await sendHourlyReminders();
      console.log(`✅ Job horaire terminé: ${count} rappel(s) envoyé(s)`);
    } catch (error) {
      console.error('❌ Erreur dans le job horaire:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  console.log('✅ Jobs de rappels configurés et en attente d\'exécution');
  console.log('   - Rappels 24h: tous les jours à 8h00');
  console.log('   - Rappels 2h: toutes les 30 minutes');
};

export default { startReminderJobs };

