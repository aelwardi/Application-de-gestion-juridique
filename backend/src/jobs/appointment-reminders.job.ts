import cron from 'node-cron';
import { sendDailyReminders, sendHourlyReminders } from '../services/reminder.service';
import { autoCompleteAppointments } from './auto-complete-appointments.job';

/**
 * Job Cron pour les rappels de rendez-vous et la complétion automatique
 *
 * Rappels 24h: Tous les jours à 8h00
 * Rappels 2h: Toutes les 30 minutes
 * Auto-complétion: Toutes les heures
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

  // Job toutes les heures pour marquer les rendez-vous passés comme terminés
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Exécution du job de complétion automatique des rendez-vous...');
    try {
      const count = await autoCompleteAppointments();
      if (count > 0) {
        console.log(`✅ Job de complétion terminé: ${count} rendez-vous marqué(s) comme terminé(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur dans le job de complétion automatique:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  console.log('✅ Jobs de rappels et complétion configurés et en attente d\'exécution');
  console.log('   - Rappels 24h: tous les jours à 8h00');
  console.log('   - Rappels 2h: toutes les 30 minutes');
  console.log('   - Auto-complétion: toutes les heures');
};

export default { startReminderJobs };