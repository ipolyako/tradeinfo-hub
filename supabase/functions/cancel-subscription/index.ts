
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
    console.log("Cancel subscription function called");
    
    // Parse request body
    const requestData = await req.json();
    const { subscriptionId, forceCancel, forceSync, forceCheck } = requestData;
    
    if (!subscriptionId) {
      console.error("No subscription ID provided");
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing request for subscription: ${subscriptionId}`);
    console.log(`Request type: ${forceCancel ? 'force cancel' : forceSync ? 'force sync' : forceCheck ? 'status check' : 'cancellation'}`);
    
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
    console.log("Verifying subscription in database...");
    
    let queryParams = new URLSearchParams();
    queryParams.append('paypal_subscription_id', `eq.${subscriptionId}`);
    
    if (userId && !forceCancel && !forceSync && !forceCheck) {
      queryParams.append('user_id', `eq.${userId}`);
    }
    
    const checkUrl = `${supabaseUrl}/rest/v1/subscriptions?${queryParams.toString()}&select=id,status,user_id,plan_id,tier,price`;
    
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
    
    // If this is just a status check or sync request
    if (forceCheck || forceSync) {
      console.log("Performing status check/sync with our database");
      
      // For simplicity, we'll just return the current status from our database
      // In a production environment, you would make a call to PayPal's API here
      // to verify the actual subscription status
      
      // Get PayPal CLIENT_ID from environment variables
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
      
      if (!clientId) {
        console.warn("PayPal CLIENT_ID not set, skipping PayPal API check");
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Status retrieved from our database',
            status: subscription.status,
            dbRecord: subscription
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // For a proper implementation, you would fetch the actual status from PayPal
      // But for now, let's just use our database status
      let paypalStatus = subscription.status;
      
      // If forceSync is true and the status is different, update our database
      if (forceSync && paypalStatus !== subscription.status) {
        // Build the URL with query parameters for update
        const updateUrl = `${supabaseUrl}/rest/v1/subscriptions?id=eq.${subscription.id}`;
        
        try {
          // Update the subscription status
          const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'apikey': apiKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: paypalStatus,
              updated_at: new Date().toISOString()
            })
          });
          
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Database update error:", errorText, "Status:", updateResponse.status);
            throw new Error(`Failed to update subscription in database: ${errorText}`);
          }
          
          console.log(`Subscription status successfully synced from ${subscription.status} to ${paypalStatus}`);
        } catch (dbError) {
          console.error("Error updating database:", dbError);
          throw dbError;
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Status retrieved',
          status: subscription.status,
          paypalStatus: paypalStatus,
          dbRecord: subscription
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // If the subscription is already cancelled in our database and this is not a force operation
    if (subscription.status === 'CANCELLED' && !forceCancel) {
      console.log("Subscription is already cancelled in database");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription is already cancelled in database',
          status: 'CANCELLED'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Update the subscription status in our database
    console.log("Updating subscription in database...");
    
    // Build the URL with query parameters for update
    const updateUrl = `${supabaseUrl}/rest/v1/subscriptions?${queryParams.toString()}`;
    
    try {
      // Update the subscription status
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'apikey': apiKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Database update error:", errorText, "Status:", updateResponse.status);
        throw new Error(`Failed to update subscription in database: ${errorText}`);
      }
      
      console.log("Subscription successfully marked as cancelled in database");
      
      // Get PayPal CLIENT_ID and SECRET from environment variables
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
      
      let paypalCancellationMessage = "This only updates our database. If you haven't already, please ensure you've also cancelled in your PayPal account.";
      
      // In a production environment, you would also cancel the subscription in PayPal here
      // using the PayPal API, but that requires proper setup with CLIENT_ID and SECRET
      
      if (clientId && clientSecret) {
        console.log("PayPal API credentials found, but integration not implemented in this version");
        // You would implement the PayPal API call here
      } else {
        console.log("PayPal API credentials not found, skipping PayPal API call");
      }
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully in our database.',
          warning: forceCancel ? 
            'This is a forced cancellation. The subscription has been marked as cancelled in our database only.' :
            paypalCancellationMessage,
          status: 'CANCELLED'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (dbError) {
      console.error("Error updating database:", dbError);
      throw dbError;
    }
    
  } catch (error) {
    console.error("Error in cancel subscription handler:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred while processing cancellation' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
