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

          // Create payment record for admin dashboard
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              quote_id: quoteId,
              amount: session.amount_total / 100, // Convert from cents
              payment_method: 'stripe',
              payment_status: 'completed',
              stripe_payment_id: session.payment_intent,
              paid_at: new Date().toISOString(),
            });

          if (paymentError) {
            console.error('Error creating payment record:', paymentError);
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

