export interface SendEmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentEmailData {
  email: string;
  firstName: string;
  appointmentDate: Date | string;
  lawyerName: string;
  appointmentType: string;
}

export const useEmail = () => {
  const { apiFetch } = useApi();


  const sendCustomEmail = async (data: SendEmailData) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>('/email/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  };


  const sendAppointmentNotification = async (data: AppointmentEmailData) => {
    try {
      const response = await apiFetch<{ success: boolean; message: string }>('/email/appointment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error sending appointment notification:', error);
      return { success: false, message: 'Failed to send notification' };
    }
  };

  return {
    sendCustomEmail,
    sendAppointmentNotification,
  };
};

