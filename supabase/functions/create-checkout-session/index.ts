import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid price IDs - replace these with your actual Stripe price IDs
const validPriceIds = [
  'price_1QjlXeGzG3fnRtlNZ42xtgNB',
  'price_1QcrzyGzG3fnRtlNkBROAAQY',
  'price_1QjnEQGzG3fnRtlNTvP9oWuj',
  'price_1QjnF9GzG3fnRtlNJrAlsuh5'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    const email = user?.email;

    if (!email) {
      throw new Error('No email found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Parse request body
    const requestBody = await req.json();
    const { priceId, createPortalSession } = requestBody;

    // If createPortalSession is true, only create a portal session
    if (createPortalSession) {
      // Get customer ID
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (customers.data.length === 0) {
        throw new Error('No Stripe customer found');
      }

      const customer_id = customers.data[0].id;

      // Create portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer_id,
        return_url: `${req.headers.get('origin')}/account`,
      });

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // If no priceId, throw error
    if (!priceId) {
      throw new Error('No price ID provided');
    }

    // Validate price ID
    if (!validPriceIds.includes(priceId)) {
      throw new Error('Invalid price ID');
    }

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer_id: string | undefined;
    
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      // Update existing customer metadata
      await stripe.customers.update(customer_id, {
        metadata: {
          user_id: user.id
        }
      });

      // Check if already subscribed to this price
      const subscriptions = await stripe.subscriptions.list({
        customer: customer_id,
        status: 'active',
        price: priceId,
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        throw new Error("You are already subscribed to this plan");
      }
    } else {
      // Create new customer with metadata
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: user.id
        }
      });
      customer_id = customer.id;
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?success=true`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        user_id: user.id,
        price_id: priceId
      },
      subscription_data: {
        metadata: {
          user_id: user.id
        }
      },
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true
    });

    // Create portal session if customer exists
    let portalUrl: string | undefined;
    if (customer_id) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer_id,
        return_url: `${req.headers.get('origin')}/account`,
      });
      portalUrl = portalSession.url;
    }

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        portalUrl: portalUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    let message = 'An unexpected error occurred';
    let statusCode = 500;

    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          message = 'Your card was declined';
          statusCode = 402;
          break;
        case 'StripeInvalidRequestError':
          message = 'Invalid subscription parameters';
          statusCode = 400;
          break;
        case 'StripeConnectionError':
          message = 'Could not connect to Stripe';
          statusCode = 503;
          break;
        default:
          message = error.message;
      }
    } else {
      message = error.message;
    }

    return new Response(
      JSON.stringify({ 
        error: message,
        code: error instanceof Stripe.errors.StripeError ? error.code : 'unknown_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
