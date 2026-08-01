import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup admin Supabase client with service_role to bypass RLS for guest checkouts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderNumber, shippingForm, shippingMethod, shippingCost, subtotal, discountAmount, grandTotal, items, userId } = await req.json();

    // 1. Insert Order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId || null,
        email: shippingForm.email || 'whatsapp-order@kroma.com',
        shipping_address: {
          name: shippingForm.name,
          phone: shippingForm.phone,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip,
          lat: shippingForm.lat || null,
          lon: shippingForm.lon || null,
          verifiedAddress: shippingForm.verifiedAddress || null,
          verificationStatus: shippingForm.verificationStatus || null,
        },
        billing_address: {
          name: shippingForm.name,
          phone: shippingForm.phone,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip,
          lat: shippingForm.lat || null,
          lon: shippingForm.lon || null,
          verifiedAddress: shippingForm.verifiedAddress || null,
          verificationStatus: shippingForm.verificationStatus || null,
        },
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        subtotal: subtotal,
        discount_amount: discountAmount,
        total: grandTotal,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        notes: `WhatsApp Phone: ${shippingForm.phone} | Name: ${shippingForm.name}`,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Order Items
    const orderItems = items.map((it: any) => ({
      order_id: orderData.id,
      product_id: it.product.id,
      title: it.product.title,
      quantity: it.quantity,
      unit_price: it.variant?.price ?? it.product.price,
      line_total: (it.variant?.price ?? it.product.price) * it.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Send WhatsApp Notification
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER;

    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID && RECIPIENT_NUMBER) {
      const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
      const messageBody = `🔔 *New Kroma Order!*\n\n*Order No:* ${orderNumber}\n*Customer:* ${shippingForm.name}\n*WhatsApp:* ${shippingForm.phone}\n*Items:* ${items.length}\n*Total Value:* ₹${grandTotal.toLocaleString('en-IN')}\n\nPlease contact the customer to confirm the order.`;

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

      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(err => console.error('Failed to send WhatsApp message', err));
    }

    return NextResponse.json({ success: true, orderId: orderNumber });
  } catch (error: any) {
    console.error('Checkout Process Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
