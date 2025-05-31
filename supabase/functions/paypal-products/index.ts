
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

// Base URL for PayPal API
const PAYPAL_BASE_URL = 'https://api-m.paypal.com';

// Get PayPal OAuth token for API authentication
async function getPayPalAccessToken() {
  try {
    console.log('Getting PayPal access token for product creation');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error('PayPal credentials not configured in environment variables');
    }
    
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);
    
    const tokenResponse = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

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

// Create PayPal product
async function createPayPalProduct(productData: any) {
  try {
    console.log('Creating PayPal product:', JSON.stringify(productData));
    
    const accessToken = await getPayPalAccessToken();
    
    const createProductResponse = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(productData),
    });

    console.log('PayPal product creation response status:', createProductResponse.status);

    if (!createProductResponse.ok) {
      const errorText = await createProductResponse.text();
      console.error('PayPal product creation error:', errorText);
      throw new Error(`Failed to create PayPal product: ${createProductResponse.status} - ${errorText}`);
    }

    const responseData = await createProductResponse.json();
    console.log('PayPal product created successfully:', JSON.stringify(responseData));
    
    return {
      success: true,
      data: responseData,
      message: 'Product created successfully'
    };
  } catch (error) {
    console.error('Error creating PayPal product:', error);
    return {
      success: false,
      message: `Error creating product: ${error.message || 'Unknown error'}`,
      error: error.message
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Received ${req.method} request to paypal-products function`);
    
    const { productData } = await req.json();
    console.log(`Processing product creation request:`, JSON.stringify(productData));

    if (!productData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Product data is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await createPayPalProduct(productData);
    console.log("Response from createPayPalProduct:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
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
