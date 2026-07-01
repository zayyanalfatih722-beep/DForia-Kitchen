/**
 * WhatsApp Service Wrapper
 * Provides structured APIs to send messages via popular WhatsApp providers (Fonnte, Twilio, Meta, etc.)
 */

export interface WhatsAppConfig {
  provider: 'fonnte' | 'twilio' | 'meta' | 'mock';
  apiKey?: string;
  senderNumber?: string;
  twilioSid?: string;
  metaPhoneNumberId?: string;
}

// Default mock configuration - can be easily customized by the user in production
const defaultConfig: WhatsAppConfig = {
  provider: 'mock',
  apiKey: process.env.VITE_WHATSAPP_API_KEY || '',
  senderNumber: process.env.VITE_WHATSAPP_SENDER || '',
};

export const whatsappService = {
  /**
   * Sends a WhatsApp message using the configured provider.
   * @param recipientPhone Recipient's phone number in international format (e.g., 628123456789)
   * @param message The content of the message
   * @returns Promise<boolean> indicating success
   */
  async sendMessage(recipientPhone: string, message: string): Promise<boolean> {
    const config = this.getConfig();
    let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

    // Convert local Indonesian format (08...) to international format (628...)
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    console.log(`[WhatsAppService] Sending message to ${cleanPhone} via provider "${config.provider}":`);
    console.log(`[WhatsAppService] Content: "${message}"`);

    if (config.provider === 'mock') {
      // Simulated delay for WhatsApp sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }

    try {
      if (config.provider === 'fonnte') {
        // Fonnte API implementation
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': config.apiKey || '',
          },
          body: new URLSearchParams({
            target: cleanPhone,
            message: message,
          }),
        });
        const result = await response.json();
        return result.status === true;
      }

      if (config.provider === 'twilio') {
        // Twilio API implementation
        if (!config.twilioSid || !config.apiKey) {
          throw new Error('Twilio SID and Auth Token are required');
        }
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioSid}/Messages.json`;
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${config.twilioSid}:${config.apiKey}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `whatsapp:+${cleanPhone}`,
            From: `whatsapp:${config.senderNumber || ''}`,
            Body: message,
          }),
        });
        return response.ok;
      }

      if (config.provider === 'meta') {
        // Meta WhatsApp Cloud API implementation
        if (!config.metaPhoneNumberId || !config.apiKey) {
          throw new Error('Meta Phone Number ID and Access Token are required');
        }
        const metaUrl = `https://graph.facebook.com/v17.0/${config.metaPhoneNumberId}/messages`;
        const response = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message },
          }),
        });
        return response.ok;
      }

      return false;
    } catch (error) {
      console.error('[WhatsAppService] Error sending WhatsApp message:', error);
      return false;
    }
  },

  /**
   * Retrieves current WhatsApp config.
   */
  getConfig(): WhatsAppConfig {
    // Check if user has specified env vars or fallback to default
    const provider = (import.meta.env.VITE_WHATSAPP_PROVIDER as any) || 'mock';
    return {
      provider,
      apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || defaultConfig.apiKey,
      senderNumber: import.meta.env.VITE_WHATSAPP_SENDER || defaultConfig.senderNumber,
      twilioSid: import.meta.env.VITE_WHATSAPP_TWILIO_SID || '',
      metaPhoneNumberId: import.meta.env.VITE_WHATSAPP_META_PHONE_ID || '',
    };
  },
};
