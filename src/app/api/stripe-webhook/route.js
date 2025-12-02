import { NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { supabase } from '@/src/lib/db/supabase-client';

// Disable body parsing, need raw body for webhook verification
export const runtime = 'nodejs';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const quoteId = session.metadata.quote_id;

        if (quoteId) {
          // Get quote details for payment record
          const { data: quote } = await supabase
            .from('quotes')
            .select(`
              id,
              project_type,
              total_amount,
              client_id,
              clients (
                first_name,
                last_name
              )
            `)
            .eq('id', quoteId)
            .single();

          // Update the quote status to paid
          const { error: updateError } = await supabase
            .from('quotes')
            .update({
              payment_status: 'paid',
              stripe_payment_id: session.payment_intent,
              paid_at: new Date().toISOString(),
            })
            .eq('id', quoteId);

          if (updateError) {
            console.error('Error updating quote:', updateError);
          }

          // Check if payment record already exists
          const { data: existingPayment } = await supabase
            .from('payments')
            .select('id')
            .eq('quote_id', quoteId)
            .single();

          const clientName = quote?.clients 
            ? `${quote.clients.first_name} ${quote.clients.last_name}`
            : 'Unknown';

          if (existingPayment) {
            // Update existing payment record (Stripe payment completed)
            const { error: updatePaymentError } = await supabase
              .from('payments')
              .update({
                paid: session.amount_total / 100,
                payment_method: 'Stripe',  // Set to Stripe since this is a Stripe payment
                payment_status: 'Paid',
                stripe_payment_id: session.payment_intent,
              })
              .eq('id', existingPayment.id);

            if (updatePaymentError) {
              console.error('Error updating payment record:', updatePaymentError);
            }
          } else {
            // Create new payment record (no existing record found)
            const { error: createPaymentError } = await supabase
              .from('payments')
              .insert({
                quote_id: quoteId,
                project: quote?.project_type || 'Service',
                client: clientName,
                total: session.amount_total / 100,
                paid: session.amount_total / 100,
                payment_method: 'Stripe',
                payment_status: 'Paid',
                stripe_payment_id: session.payment_intent,
              });

            if (createPaymentError) {
              console.error('Error creating payment record:', createPaymentError);
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('PaymentIntent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

