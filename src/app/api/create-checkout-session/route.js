import { NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { supabase } from '@/src/lib/db/supabase-client';

export async function POST(req) {
  try {
    const { quoteId, clientEmail } = await req.json();

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // Fetch the quote details from Supabase
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Fetch quote items
    const { data: quoteItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch quote items' },
        { status: 500 }
      );
    }

    // Create line items for Stripe
    const lineItems = quoteItems?.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.description || 'Service',
          description: `Quantity: ${item.quantity}`,
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    })) || [];

    // If no line items, create a single item for the total
    if (lineItems.length === 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Painting Service',
            description: 'Total service cost',
          },
          unit_amount: Math.round(parseFloat(quote.total_price) * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/customer?payment=success&quote_id=${quoteId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/customer?payment=cancelled`,
      customer_email: clientEmail,
      metadata: {
        quote_id: quoteId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

