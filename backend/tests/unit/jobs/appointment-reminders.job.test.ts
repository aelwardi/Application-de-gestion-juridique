import * as appointmentRemindersJob from '../../../src/jobs/appointment-reminders.job';
import * as reminderService from '../../../src/services/reminder.service';
import * as autoCompleteJob from '../../../src/jobs/auto-complete-appointments.job';
import cron from 'node-cron';

jest.mock('node-cron');
jest.mock('../../../src/services/reminder.service');
jest.mock('../../../src/jobs/auto-complete-appointments.job');

describe('AppointmentRemindersJob', () => {
  let dailyScheduleCallback: (() => Promise<void>) | null = null;
  let hourlyScheduleCallback: (() => Promise<void>) | null = null;
  let completeScheduleCallback: (() => Promise<void>) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    dailyScheduleCallback = null;
    hourlyScheduleCallback = null;
    completeScheduleCallback = null;

    (cron.schedule as jest.Mock).mockImplementation(
      (schedule: string, callback: () => Promise<void>) => {
        if (schedule === '0 8 * * *') {
          dailyScheduleCallback = callback;
        } else if (schedule === '*/30 * * * *') {
          hourlyScheduleCallback = callback;
        } else if (schedule === '0 * * * *') {
          completeScheduleCallback = callback;
        }
        return { stop: jest.fn(), start: jest.fn() };
      }
    );
  });

  describe('startReminderJobs', () => {
    it('should initialize all cron jobs', () => {
      appointmentRemindersJob.startReminderJobs();

      expect(cron.schedule).toHaveBeenCalledTimes(3);
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 8 * * *',
        expect.any(Function),
        expect.objectContaining({ timezone: 'Europe/Paris' })
      );
      expect(cron.schedule).toHaveBeenCalledWith(
        '*/30 * * * *',
        expect.any(Function),
        expect.objectContaining({ timezone: 'Europe/Paris' })
      );
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function),
        expect.objectContaining({ timezone: 'Europe/Paris' })
      );
    });

    it('should execute daily reminder job successfully', async () => {
      (reminderService.sendDailyReminders as jest.Mock).mockResolvedValue(5);

      appointmentRemindersJob.startReminderJobs();

      expect(dailyScheduleCallback).not.toBeNull();
      if (dailyScheduleCallback) {
        await dailyScheduleCallback();
      }

      expect(reminderService.sendDailyReminders).toHaveBeenCalled();
    });

    it('should handle daily reminder job errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (reminderService.sendDailyReminders as jest.Mock).mockRejectedValue(error);

      appointmentRemindersJob.startReminderJobs();

      expect(dailyScheduleCallback).not.toBeNull();
      if (dailyScheduleCallback) {
        await expect(dailyScheduleCallback()).resolves.not.toThrow();
      }

      expect(reminderService.sendDailyReminders).toHaveBeenCalled();
    });

    it('should execute hourly reminder job successfully', async () => {
      (reminderService.sendHourlyReminders as jest.Mock).mockResolvedValue(3);

      appointmentRemindersJob.startReminderJobs();

      expect(hourlyScheduleCallback).not.toBeNull();
      if (hourlyScheduleCallback) {
        await hourlyScheduleCallback();
      }

      expect(reminderService.sendHourlyReminders).toHaveBeenCalled();
    });

    it('should handle hourly reminder job errors gracefully', async () => {
      const error = new Error('Email service unavailable');
      (reminderService.sendHourlyReminders as jest.Mock).mockRejectedValue(error);

      appointmentRemindersJob.startReminderJobs();

      expect(hourlyScheduleCallback).not.toBeNull();
      if (hourlyScheduleCallback) {
        await expect(hourlyScheduleCallback()).resolves.not.toThrow();
      }

      expect(reminderService.sendHourlyReminders).toHaveBeenCalled();
    });

    it('should execute auto-complete job successfully', async () => {
      (autoCompleteJob.autoCompleteAppointments as jest.Mock).mockResolvedValue(2);

      appointmentRemindersJob.startReminderJobs();

      expect(completeScheduleCallback).not.toBeNull();
      if (completeScheduleCallback) {
        await completeScheduleCallback();
      }

      expect(autoCompleteJob.autoCompleteAppointments).toHaveBeenCalled();
    });

    it('should handle auto-complete job with zero appointments', async () => {
      (autoCompleteJob.autoCompleteAppointments as jest.Mock).mockResolvedValue(0);

      appointmentRemindersJob.startReminderJobs();

      expect(completeScheduleCallback).not.toBeNull();
      if (completeScheduleCallback) {
        await completeScheduleCallback();
      }

      expect(autoCompleteJob.autoCompleteAppointments).toHaveBeenCalled();
    });

    it('should handle auto-complete job errors gracefully', async () => {
      const error = new Error('Query execution failed');
      (autoCompleteJob.autoCompleteAppointments as jest.Mock).mockRejectedValue(error);

      appointmentRemindersJob.startReminderJobs();

      expect(completeScheduleCallback).not.toBeNull();
      if (completeScheduleCallback) {
        await expect(completeScheduleCallback()).resolves.not.toThrow();
      }

      expect(autoCompleteJob.autoCompleteAppointments).toHaveBeenCalled();
    });
  });
});