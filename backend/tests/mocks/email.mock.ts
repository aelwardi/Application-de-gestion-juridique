export const mockEmailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendAppointmentConfirmation: jest.fn().mockResolvedValue(true),
  sendAppointmentReminder: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
};

export const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'test-message-id',
    accepted: ['test@example.com'],
    rejected: [],
    response: '250 Message accepted',
  }),
  verify: jest.fn().mockResolvedValue(true),
};

export const resetEmailMocks = () => {
  Object.values(mockEmailService).forEach((mock) => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
  mockTransporter.sendMail.mockReset();
  mockTransporter.verify.mockReset();
};
