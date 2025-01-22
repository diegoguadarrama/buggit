import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialize Stripe
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// Define price tiers
const PRICE_TIERS = {
  'price_1QjnEQGzG3fnRtlNTvP9oWuj': 'pro',
  'price_1QjnF9GzG3fnRtlNJrAlsuh5': 'unleashed'
} as const;

// Type for price tiers
type PriceTier = typeof PRICE_TIERS[keyof typeof PRICE_TIERS];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

async function updateUserSubscription(
  profile_id: string,
  stripe_customer_id: string,
  stripe_subscription_id: string,
  price_id: string,
  status: string,
  current_period_start: Date,
  current_period_end: Date,
  tier: PriceTier
) {
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      profile_id,
      stripe_customer_id,
      stripe_subscription_id,
      price_id,
      status,
      current_period_start,
      current_period_end,
      tier,
    });

  if (subscriptionError) {
    throw new Error(`Error updating subscription: ${subscriptionError.message}`);
  }
}

serve(async (req) => {
  console.log('========== WEBHOOK REQUEST RECEIVED ==========');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Log environment setup
    console.log('Environment check:', {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });

    // Get and verify stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature found in request');
    }

    // Get request body and verify webhook
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );

    console.log('Event type:', event.type);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing checkout session:', session.id);

      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription;

      if (!customerEmail) {
        throw new Error('No customer email found in session');
      }

      if (!subscriptionId) {
        throw new Error('No subscription ID found in session');
      }

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      // Verify price tier exists
      if (!(priceId in PRICE_TIERS)) {
        throw new Error(`Unknown price tier: ${priceId}`);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (profileError || !profile) {
        throw new Error(`Error finding user: ${profileError?.message}`);
      }

      // Update subscription
      await updateUserSubscription(
        profile.id,
        session.customer as string,
        subscription.id,
        priceId,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        PRICE_TIERS[priceId as keyof typeof PRICE_TIERS]
      );

      console.log('Successfully processed subscription for:', customerEmail);
    }

    // Handle customer.subscription.updated event
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log('Processing subscription update:', subscription.id);

      // Get customer email
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const customerEmail = customer.email;

      if (!customerEmail) {
        throw new Error('No customer email found');
      }

      const priceId = subscription.items.data[0].price.id;

      // Verify price tier exists
      if (!(priceId in PRICE_TIERS)) {
        throw new Error(`Unknown price tier: ${priceId}`);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (profileError || !profile) {
        throw new Error(`Error finding user: ${profileError?.message}`);
      }

      // Update subscription
      await updateUserSubscription(
        profile.id,
        subscription.customer as string,
        subscription.id,
        priceId,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        PRICE_TIERS[priceId as keyof typeof PRICE_TIERS]
      );

      console.log('Successfully updated subscription for:', customerEmail);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('signature') ? 401 : 400 
      }
    );
  }
});
