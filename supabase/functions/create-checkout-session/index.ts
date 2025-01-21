import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Valid price IDs - replace these with your live mode price IDs from Stripe
const validPriceIds = [
  'price_1QjnEQGzG3fnRtlNTvP9oWuj', // Test Pro Price ID
  'price_1QjnF9GzG3fnRtlNJrAlsuh5', // Test Unleashed Price ID
  'price_1QjlXeGzG3fnRtlNZ42xtgNB', // Pro plan price ID
  'price_1QcrzyGzG3fnRtlNkBROAAQY' // Unleashed plan price ID
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('No email found');
    }

    // Get request body and validate
    const { priceId, createPortalSession } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Handle portal session creation
    if (createPortalSession) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length === 0) {
        throw new Error('No Stripe customer found');
      }

      const customer_id = customers.data[0].id;
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

    // Validate priceId for checkout session
    if (!priceId) {
      throw new Error('No price ID provided');
    }

    if (!validPriceIds.includes(priceId)) {
      throw new Error('Invalid price ID');
    }

    // Get or create customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customer_id: string;
    
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
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customer_id = customer.id;
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
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
      allow_promotion_codes: true,
      customer_update: {
        name: 'auto',
        address: 'auto',
        shipping: 'auto'
      }
    });

    console.log('Session created:', {
      id: session.id,
      url: session.url
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    // Create portal session if customer exists
    let portalUrl: string | undefined;
    if (customer_id) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer_id,
        return_url: `${req.headers.get('origin')}/account`,
      });
      portalUrl = portalSession.url;
    }

    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        portalUrl: portalUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
