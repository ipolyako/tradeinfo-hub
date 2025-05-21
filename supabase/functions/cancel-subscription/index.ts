
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { subscriptionId } = requestData;
    
    if (!subscriptionId) {
      console.error("No subscription ID provided");
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription ID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing cancellation for subscription: ${subscriptionId}`);
    
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
    
    // Update the subscription status in our database
    console.log("Updating subscription in database...");
    
    // Create the filter condition using URL parameters
    let queryParams = new URLSearchParams();
    queryParams.append('paypal_subscription_id', `eq.${subscriptionId}`);
    
    // If we have a user ID, add it to the filter
    if (userId) {
      queryParams.append('user_id', `eq.${userId}`);
    }
    
    // Build the URL with query parameters
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
          message: 'Subscription cancelled successfully.',
          warning: 'This only updates our database. If you haven\'t already, please ensure you\'ve also cancelled in your PayPal account.'
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
