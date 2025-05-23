
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Get PayPal credentials from environment variables
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY') || '';

// Base URL for PayPal API - make sure we're using the correct endpoint
const PAYPAL_BASE_URL = 'https://api-m.paypal.com';

// Get PayPal OAuth token for API authentication
async function getPayPalAccessToken() {
  try {
    console.log('Getting PayPal access token');
    
    // Verify credentials exist
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error('PayPal credentials not configured in environment variables');
    }
    
    // Create authorization string with proper encoding
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);
    
    // Request access token from PayPal
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    // Log response status for debugging
    console.log('PayPal token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPal token error details:', errorText);
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.status}`);
    }

    const data = await tokenResponse.json();
    console.log('Successfully retrieved PayPal access token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

// Handle subscription check or cancel
async function handleSubscription(subscriptionId: string, action?: 'check' | 'cancel') {
  try {
    // Validate inputs
    if (!subscriptionId) {
      return {
        success: false,
        message: 'Subscription ID is required',
        isActive: false,
      };
    }
    
    console.log(`Processing ${action || 'check'} for subscription ID: ${subscriptionId}`);
    
    // Check if we have valid PayPal credentials
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      console.error('Missing PayPal credentials');
      return {
        success: false,
        message: 'PayPal API credentials are not configured',
        isActive: false,
        warning: 'Please contact the administrator. PayPal integration is not properly configured.'
      };
    }
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Check subscription details
    const getSubscriptionResponse = await fetch(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!getSubscriptionResponse.ok) {
      const errorText = await getSubscriptionResponse.text();
      console.error('PayPal subscription get error:', errorText);
      return {
        success: false,
        message: `Failed to get subscription details: ${getSubscriptionResponse.status}`,
        isActive: false,
      };
    }

    const subscriptionData = await getSubscriptionResponse.json();
    console.log("PayPal subscription data:", JSON.stringify(subscriptionData));
    
    // Determine if subscription is active
    const isActive = subscriptionData.status === 'ACTIVE';
    
    // Handle cancellation if requested
    if (action === 'cancel' && isActive) {
      const cancelResponse = await fetch(
        `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            reason: 'Cancelled by customer request'
          }),
        }
      );

      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text();
        console.error('PayPal cancel error:', errorText);
        return {
          success: false,
          message: `Failed to cancel subscription: ${cancelResponse.status}`,
          isActive: true,
          paypalStatus: subscriptionData.status,
        };
      }

      // Update status in Supabase database
      try {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ status: 'CANCELLED' })
          .eq('paypal_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        isActive: false,
        paypalStatus: 'CANCELLED',
      };
    }

    // Return subscription status
    return {
      success: true,
      message: 'Subscription status retrieved successfully',
      isActive: isActive,
      paypalStatus: subscriptionData.status,
    };
  } catch (error) {
    console.error('Error handling subscription:', error);
    return {
      success: false,
      message: `Error processing subscription: ${error.message || 'Unknown error'}`,
      isActive: false,
      warning: 'There was a problem communicating with PayPal. Please try again later.'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request information for debugging
    console.log(`Received ${req.method} request to paypal-subscription function`);
    
    const { subscriptionId, action } = await req.json();
    console.log(`Processing request for subscription ID: ${subscriptionId}, action: ${action || 'check'}`);

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Subscription ID is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await handleSubscription(subscriptionId, action);
    console.log("Response from handleSubscription:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error processing request: ${error.message || 'Unknown error'}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
