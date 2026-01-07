import { Router, Request, Response } from 'express';
import * as supportService from '../services/support.service';
import * as adminQueries from '../database/queries/admin.queries';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(authenticate);

/**
 * GET /api/support/my-tickets
 * Get current user's tickets
 */
router.get('/my-tickets', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await supportService.getUserTickets(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
    });
  }
});

/**
 * GET /api/support/tickets
 * Get all tickets (admin only)
 */
router.get('/tickets', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const assignedToMe = req.query.assignedToMe === 'true';
    const adminId = req.user!.userId;

    const result = await supportService.getAllTickets(
      page,
      limit,
      status,
      priority,
      assignedToMe,
      assignedToMe ? adminId : undefined
    );

    res.json({
      success: true,
      data: result.tickets,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
    });
  }
});

/**
 * GET /api/support/tickets/:id
 * Get ticket details with messages
 */
router.get('/tickets/:id', async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;
    const isAdmin = req.user!.role === 'admin';

    const result = await supportService.getTicketDetails(ticketId, isAdmin);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Ticket not found') {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    console.error('Get ticket details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details',
    });
  }
});

/**
 * POST /api/support/tickets
 * Create a new ticket
 */
router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const { subject, description, priority, category } = req.body;
    const userId = req.user!.userId;

    if (!subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Subject and description are required',
      });
      return;
    }

    const ticket = await supportService.createTicket(
      userId,
      subject,
      description,
      priority || 'medium',
      category || null
    );

    // Logger l'activité de création de ticket
    try {
      await adminQueries.createActivityLog(
        userId,
        'TICKET_CREATED',
        'support_ticket',
        ticket.id,
        req.ip || req.socket.remoteAddress || null,
        req.get('user-agent') || null,
        { subject, priority: priority || 'medium', category }
      );
    } catch (logError) {
      console.error('Failed to log TICKET_CREATED activity:', logError);
    }

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
    });
  }
});

/**
 * POST /api/support/tickets/:id/messages
 * Add message to ticket
 */
router.post('/tickets/:id/messages', async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { message, isInternal } = req.body;
    const userId = req.user!.userId;

    if (!message) {
      res.status(400).json({
        success: false,
        message: 'Message is required',
      });
      return;
    }

    const isInternalMessage = req.user!.role === 'admin' && isInternal;

    const newMessage = await supportService.addMessage(
      ticketId,
      userId,
      message,
      isInternalMessage
    );

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
    });
  }
});

/**
 * PATCH /api/support/tickets/:id/status
 * Update ticket status (admin only)
 */
router.patch('/tickets/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;
    const adminId = req.user!.userId;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
      });
      return;
    }

    await supportService.updateStatus(ticketId, status, adminId);

    // Logger l'activité de clôture si le statut est "closed"
    if (status === 'closed') {
      try {
        await adminQueries.createActivityLog(
          adminId,
          'TICKET_CLOSED',
          'support_ticket',
          ticketId,
          req.ip || req.socket.remoteAddress || null,
          req.get('user-agent') || null,
          { ticket_id: ticketId, closed_by: adminId }
        );
      } catch (logError) {
        console.error('Failed to log TICKET_CLOSED activity:', logError);
      }
    }

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
    });
  }
});

/**
 * PATCH /api/support/tickets/:id/assign
 * Assign ticket to admin (admin only)
 */
router.patch('/tickets/:id/assign', requireAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { adminId } = req.body;

    if (!adminId) {
      res.status(400).json({
        success: false,
        message: 'Admin ID is required',
      });
      return;
    }

    await supportService.assignToAdmin(ticketId, adminId);

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
    });
  }
});

/**
 * GET /api/support/stats
 * Get ticket statistics (admin only)
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await supportService.getTicketStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
    });
  }
});

export default router;