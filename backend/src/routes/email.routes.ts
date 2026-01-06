import { Router, Request, Response } from 'express';
import { sendCustomEmail, sendAppointmentEmail } from '../services/email.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/email/send
 * Envoyer un email personnalisé (protégé)
 */
router.post('/send', authenticate, async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, html',
      });
      return;
    }

    const result = await sendCustomEmail({ to, subject, html, text });

    if (result) {
      res.json({
        success: true,
        message: 'Email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
      });
    }
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/email/appointment
 * Envoyer une notification de rendez-vous (protégé)
 */
router.post('/appointment', authenticate, async (req: Request, res: Response) => {
  try {
    const { email, firstName, appointmentDate, lawyerName, appointmentType } = req.body;

    if (!email || !firstName || !appointmentDate || !lawyerName || !appointmentType) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    const result = await sendAppointmentEmail({
      email,
      firstName,
      appointmentDate: new Date(appointmentDate),
      lawyerName,
      appointmentType,
    });

    if (result) {
      res.json({
        success: true,
        message: 'Appointment notification sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send appointment notification',
      });
    }
  } catch (error) {
    console.error('Send appointment email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;