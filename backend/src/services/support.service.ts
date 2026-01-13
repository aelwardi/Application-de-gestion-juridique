import * as supportQueries from '../database/queries/support.queries';
import { sendEmail } from '../utils/email.util';

/**
 * Get all tickets
 */
export const getAllTickets = async (
  page: number,
  limit: number,
  status?: string,
  priority?: string,
  assignedToMe?: boolean,
  adminId?: string
) => {
  return await supportQueries.getAllTickets(page, limit, status, priority, assignedToMe, adminId);
};

/**
 * Get user's tickets with messages
 */
export const getUserTickets = async (userId: string) => {
  const tickets = await supportQueries.getUserTickets(userId);

  const ticketsWithMessages = await Promise.all(
    tickets.map(async (ticket) => {
      const messages = await supportQueries.getTicketMessages(ticket.id, false);
      return {
        ...ticket,
        messages
      };
    })
  );

  return ticketsWithMessages;
};

/**
 * Get ticket details with messages
 */
export const getTicketDetails = async (ticketId: string, isAdmin: boolean) => {
  const ticket = await supportQueries.getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const messages = await supportQueries.getTicketMessages(ticketId, isAdmin);

  return { ticket, messages };
};

/**
 * Create a new ticket
 */
export const createTicket = async (
  userId: string,
  subject: string,
  description: string,
  priority: string,
  category: string | null
) => {
  const ticket = await supportQueries.createTicket(userId, subject, description, priority, category);

  console.log(`New ticket created: ${ticket.id} by user ${userId}`);

  return ticket;
};

/**
 * Add message to ticket
 */
export const addMessage = async (
  ticketId: string,
  userId: string,
  message: string,
  isInternal: boolean = false
) => {
  const newMessage = await supportQueries.addTicketMessage(ticketId, userId, message, isInternal);

  const ticket = await supportQueries.getTicketById(ticketId);
  if (ticket && !isInternal) {
  }

  return newMessage;
};

/**
 * Update ticket status
 */
export const updateStatus = async (
  ticketId: string,
  status: string,
  adminId: string
) => {
  await supportQueries.updateTicketStatus(ticketId, status, adminId);

  if (status === 'resolved') {
    const ticket = await supportQueries.getTicketById(ticketId);
    if (ticket) {
      sendEmail({
        to: ticket.user_email!,
        subject: `Ticket résolu: ${ticket.subject}`,
        html: `
          <h1>Ticket Résolu</h1>
          <p>Bonjour ${ticket.user_name},</p>
          <p>Votre ticket de support a été résolu.</p>
          <p><strong>Sujet:</strong> ${ticket.subject}</p>
          <p>Si vous avez d'autres questions, n'hésitez pas à créer un nouveau ticket.</p>
        `,
      }).catch(err => console.error('Failed to send ticket resolution email:', err));
    }
  }

  return { success: true };
};

/**
 * Assign ticket to admin
 */
export const assignToAdmin = async (
  ticketId: string,
  adminId: string
) => {
  await supportQueries.assignTicket(ticketId, adminId);
  return { success: true };
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async () => {
  return await supportQueries.getTicketStats();
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (ticketId: string, userId: string) => {
  const ticket = await supportQueries.getTicketById(ticketId);

  if (!ticket) {
    return { success: false, message: 'Ticket not found' };
  }

  if (ticket.user_id !== userId) {
    return { success: false, message: 'Access denied' };
  }

  await supportQueries.deleteTicket(ticketId);
  return { success: true };
};

/**
 * Get FAQ items
 */
export const getFAQItems = async (category?: string) => {
  return await supportQueries.getFAQItems(category);
};