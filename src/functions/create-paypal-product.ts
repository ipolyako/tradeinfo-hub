
import { supabase } from "@/integrations/supabase/client";

// Function to create a PayPal product using our edge function
export async function createPayPalProduct(productData: {
  name: string;
  description: string;
  type: string;
  category: string;
}) {
  try {
    console.log("Creating PayPal product:", productData);
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('paypal-products', {
      body: {
        productData
      }
    });

    if (error) {
      console.error('Error calling PayPal products function:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
    
    console.log("PayPal product creation response:", data);
    return data;
  } catch (error) {
    console.error('Error in createPayPalProduct:', error);
    return {
      success: false,
      message: `Error creating product: ${error.message || 'Unknown error'}`,
      error: error.message
    };
  }
}

// Example usage function for the exact product you want to create
export async function create5DayFreeProduct() {
  const productData = {
    name: "5-Day Free-Only Product",
    description: "Exact 5-day $0 subscription",
    type: "SERVICE",
    category: "SOFTWARE"
  };
  
  return await createPayPalProduct(productData);
}
