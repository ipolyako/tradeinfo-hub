
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
    const { subscriptionId, forceCancel } = requestData;
    
    if (!subscriptionId) {
      console.error("No subscription ID provided");
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing ${forceCancel ? 'force cancellation' : 'cancellation'} for subscription: ${subscriptionId}`);
    
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
    
    if (userId && !forceCancel) {
      queryParams.append('user_id', `eq.${userId}`);
    }
    
    const checkUrl = `${supabaseUrl}/rest/v1/subscriptions?${queryParams.toString()}&select=id,status`;
    
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
    
    if (subscriptions[0].status === 'CANCELLED' && !forceCancel) {
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
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully in our database.',
          warning: forceCancel ? 
            'This is a forced cancellation. The subscription has been marked as cancelled in our database only.' :
            'This only updates our database. If you haven\'t already, please ensure you\'ve also cancelled in your PayPal account.',
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
