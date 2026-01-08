import cron from 'node-cron';
import { sendDailyReminders, sendHourlyReminders } from '../services/reminder.service';
import { autoCompleteAppointments } from './auto-complete-appointments.job';

/**
 * Job Cron pour les rappels de rendez-vous et la complétion automatique
 */

export const startReminderJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const count = await sendDailyReminders();
    } catch (error) {
      console.error('Erreur dans le job quotidien:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  cron.schedule('*/30 * * * *', async () => {
    console.log('Exécution du job horaire de rappels 2h...');
    try {
      const count = await sendHourlyReminders();
    } catch (error) {
      console.error('Erreur dans le job horaire:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  cron.schedule('0 * * * *', async () => {
    try {
      const count = await autoCompleteAppointments();
      if (count > 0) {
        console.log(`Job de complétion terminé: ${count} rendez-vous marqué(s) comme terminé(s)`);
      }
    } catch (error) {
      console.error('Erreur dans le job de complétion automatique:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });
};

export default { startReminderJobs };