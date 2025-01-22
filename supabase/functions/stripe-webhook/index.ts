import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Map price IDs to subscription tiers
const PRICE_TIERS = {
  'price_1QjnEQGzG3fnRtlNTvP9oWuj': 'pro',
  'price_1QjnF9GzG3fnRtlNJrAlsuh5': 'unleashed'
} as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.buggit.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

serve(async (req) => {
  console.log('Webhook received:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  console.log('Environment variables present:', {
    hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe signature:', signature);

    if (!signature) {
      console.error('No stripe signature found in request');
      return new Response('No signature provided', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const body = await req.text();
    console.log('Webhook body received:', body);
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed:`, err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { 
        status: 400,
        headers: corsHeaders
      });
    }

    console.log(`🔔  Event received: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Retrieve the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const customerId = session.customer as string;
        const userId = session.metadata?.user_id;
        const priceId = subscription.items.data[0].price.id;
        const tier = PRICE_TIERS[priceId as keyof typeof PRICE_TIERS] || 'free';

        if (!userId) {
          throw new Error('No user_id in metadata');
        }

        console.log('Updating subscription for user:', userId, 'to tier:', tier);

        // Update or insert subscription in Supabase
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            profile_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            price_id: priceId,
            status: subscription.status,
            tier: tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'profile_id'
          });

        if (upsertError) {
          console.error('Error updating subscription:', upsertError);
          throw upsertError;
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        const tier = PRICE_TIERS[priceId as keyof typeof PRICE_TIERS] || 'free';
        
        // Get user_id from existing subscription record
        const { data: existingSubscription, error: selectError } = await supabase
          .from('subscriptions')
          .select('profile_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (selectError) {
          console.error('Error finding existing subscription:', selectError);
          throw selectError;
        }

        if (!existingSubscription?.profile_id) {
          throw new Error('No subscription found for customer');
        }

        console.log('Updating subscription status for user:', existingSubscription.profile_id);

        // Update subscription in Supabase
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            profile_id: existingSubscription.profile_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            price_id: priceId,
            tier: tier,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'profile_id'
          });

        if (upsertError) {
          console.error('Error updating subscription:', upsertError);
          throw upsertError;
        }

        break;
      }

      default: {
        console.log(`🤷‍♀️  Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    return new Response(
      JSON.stringify({
        error: {
          message: err.message,
          stack: err.stack,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
