import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialize Stripe with your secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15', // Specify the Stripe API version
});

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log('========== WEBHOOK REQUEST RECEIVED ==========');
    console.log('Request method:', req.method);
    
    // Log environment variables status (without exposing values)
    console.log('Environment check:', {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });

    // Get the stripe signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature found in request');
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );

    console.log('Event type:', event.type);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing checkout session:', session.id);

      // Extract the customer email and subscription details
      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription;

      if (!customerEmail) {
        throw new Error('No customer email found in session');
      }

      // Get subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get user details from Supabase
      const { data: profiles, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (profileError || !profiles) {
        throw new Error(`Error finding user: ${profileError?.message}`);
      }

      // Insert or update subscription in your database
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          profile_id: profiles.id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
        });

      if (subscriptionError) {
        throw new Error(`Error updating subscription: ${subscriptionError.message}`);
      }

      console.log('Successfully processed subscription for:', customerEmail);
    }

    // Return a 200 response
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
