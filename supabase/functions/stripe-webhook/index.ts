import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature provided', { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return new Response(`Webhook signature verification failed.`, { status: 400 });
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

        if (!userId) {
          throw new Error('No user_id in metadata');
        }

        // Update or insert subscription in Supabase
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Get user_id from existing subscription record
        const { data: existingSubscription, error: selectError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (selectError) {
          throw selectError;
        }

        if (!existingSubscription?.user_id) {
          throw new Error('No subscription found for customer');
        }

        // Update subscription in Supabase
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: existingSubscription.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        break;
      }

      default: {
        console.log(`🤷‍♀️  Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
