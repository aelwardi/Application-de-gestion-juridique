import { testEmailConfiguration, sendWelcomeEmail } from '../src/utils/email.util';

const testEmail = async () => {
  console.log('Testing email configuration...');

  const configValid = await testEmailConfiguration();

  if (configValid) {
    console.log('Email configuration is valid');

    console.log('Sending test welcome email...');
    const emailSent = await sendWelcomeEmail(
      'test@example.com',
      'John',
      'Doe'
    );

    if (emailSent) {
      console.log('Test email sent successfully');
    } else {
      console.log('Failed to send test email');
    }
  } else {
    console.log('Email configuration is invalid');
  }
};

testEmail();

