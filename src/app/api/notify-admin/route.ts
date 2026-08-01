import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderId, customerName, total, itemsCount, phone } = await req.json();

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !RECIPIENT_NUMBER) {
      console.warn('WhatsApp API credentials are not fully configured. Skipping notification.');
      // We don't want to throw an error and break the checkout if WhatsApp isn't set up yet
      return NextResponse.json({ success: true, message: 'Skipped WhatsApp notification due to missing credentials' });
    }

    // Official Meta WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    // Format the message
    const messageBody = `🔔 *New Order Received!*\n\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Customer Phone:* ${phone}\n*Items:* ${itemsCount}\n*Total Value:* ₹${total.toLocaleString('en-IN')}\n\nPlease review and confirm this order in the Admin Portal.`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: RECIPIENT_NUMBER,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Notify Admin Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
