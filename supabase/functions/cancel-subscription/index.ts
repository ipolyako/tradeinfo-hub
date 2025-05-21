
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    console.log("Subscription function called");
    
    // Parse request body
    const requestData = await req.json();
    const { subscriptionId, action } = requestData;
    
    if (!subscriptionId) {
      console.error("No subscription ID provided");
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing request for subscription: ${subscriptionId}, action: ${action || 'check'}`);
    
    // Get Supabase URL and API key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not set');
    }
    
    if (!supabaseServiceRoleKey && !supabaseAnonKey) {
      throw new Error('Neither Supabase service role key nor anon key is set');
    }
    
    const apiKey = supabaseServiceRoleKey || supabaseAnonKey;
    
    // Extract user information from the auth header if available
    const authHeader = req.headers.get('Authorization') || '';
    let userId = null;
    
    try {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        
        // Make a request to Supabase auth API to get user info
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey || ''
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
          console.log(`User authenticated: ${userId}`);
        } else {
          console.warn('Failed to authenticate user from token');
        }
      }
    } catch (error) {
      console.error('Error extracting user info:', error);
    }
    
    // First check if the subscription exists in our database
    console.log("Checking subscription in database...");
    
    let queryParams = new URLSearchParams();
    queryParams.append('paypal_subscription_id', `eq.${subscriptionId}`);
    
    const checkUrl = `${supabaseUrl}/rest/v1/subscriptions?${queryParams.toString()}&select=id,user_id,plan_id,tier,price,paypal_subscription_id`;
    
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'apikey': apiKey,
        'Prefer': 'return=representation'
      }
    });
    
    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error("Database check error:", errorText, "Status:", checkResponse.status);
      throw new Error(`Failed to check subscription in database: ${errorText}`);
    }
    
    const subscriptions = await checkResponse.json();
    
    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Subscription not found in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    const subscription = subscriptions[0];
    
    // Get PayPal CLIENT_ID and SECRET from environment variables
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    // Check if we have PayPal API credentials
    if (!clientId || !clientSecret) {
      console.warn("PayPal API credentials not found, cannot check subscription status");
      return new Response(
        JSON.stringify({
          success: false,
          message: 'PayPal API credentials not available',
          subscription: subscription
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Get PayPal OAuth token
    console.log("Getting PayPal OAuth token");
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("PayPal token error:", errorText, "Status:", tokenResponse.status);
      throw new Error(`Failed to get PayPal token: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Check subscription status in PayPal
    console.log("Checking PayPal subscription status");
    const paypalResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error("PayPal subscription check error:", errorText, "Status:", paypalResponse.status);
      
      // If subscription not found in PayPal, it's likely cancelled or invalid
      if (paypalResponse.status === 404) {
        return new Response(
          JSON.stringify({
            success: true,
            paypalStatus: 'NOT_FOUND',
            message: 'Subscription not found in PayPal',
            isActive: false,
            subscription: subscription
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      throw new Error(`Failed to check PayPal subscription: ${errorText}`);
    }
    
    const paypalData = await paypalResponse.json();
    const paypalStatus = paypalData.status;
    
    console.log(`PayPal subscription status: ${paypalStatus}`);
    
    // If the action is 'cancel', cancel the subscription in PayPal
    if (action === 'cancel') {
      console.log("Cancelling subscription in PayPal");
      
      const cancelResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Cancelled by user'
        })
      });
      
      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text();
        console.error("PayPal cancellation error:", errorText, "Status:", cancelResponse.status);
        throw new Error(`Failed to cancel PayPal subscription: ${errorText}`);
      }
      
      console.log("Subscription successfully cancelled in PayPal");
      
      // Re-check status to confirm cancellation
      const recheckResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const recheckData = await recheckResponse.json();
      const updatedStatus = recheckData.status;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully',
          paypalStatus: updatedStatus,
          isActive: updatedStatus === 'ACTIVE',
          subscription: subscription
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // For status check, just return the current status
    const isActive = paypalStatus === 'ACTIVE' || paypalStatus === 'APPROVED';
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription status retrieved from PayPal',
        paypalStatus: paypalStatus,
        isActive: isActive,
        subscription: subscription
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in subscription handler:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred while processing request' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
