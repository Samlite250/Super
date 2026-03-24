const axios = require('axios');

/**
 * Sends a WhatsApp OTP message using a configurable API Gateway.
 * To use this, you must set WHATSAPP_API_URL and WHATSAPP_TOKEN in your .env.
 * Example for UltraMsg: 
 * WHATSAPP_API_URL=https://api.ultramsg.com/instanceXXXXX/messages/chat
 * WHATSAPP_TOKEN=your_token_here
 */
exports.sendWhatsAppOTP = async (phone, otp) => {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_TOKEN;

  if (!apiUrl || !token) {
    console.warn('WhatsApp API not configured. OTP not sent to WhatsApp.');
    return;
  }

  const message = `🔐 *ADMINISTRATIVE CLEARANCE REQUIRED*\n\nYour secure logic token for terminal access is:\n👉 *${otp}*\n\n*Security Protocol Details:*\n• Validity: 10 Minutes\n• Origin: Restricted Infrastructure Node\n\n_If you did not initiate this request, please report a Security Breach immediately._`;

  try {
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('to', phone);
    params.append('body', message);

    await axios.post(apiUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log(`WhatsApp OTP sent to ${phone}`);
  } catch (error) {
    console.error('WhatsApp OTP Error:', error.response?.data || error.message);
  }
};
