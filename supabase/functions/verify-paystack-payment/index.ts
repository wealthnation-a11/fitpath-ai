
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reference } = await req.json()
    
    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Payment verification service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const verificationData = await verifyResponse.json()
    
    if (!verifyResponse.ok) {
      console.error('Paystack verification failed:', verificationData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment verification failed',
          details: verificationData 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const isSuccessful = verificationData.status && 
                        verificationData.data?.status === 'success'

    return new Response(
      JSON.stringify({ 
        success: isSuccessful, 
        data: verificationData.data,
        message: isSuccessful ? 'Payment verified successfully' : 'Payment verification failed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during payment verification' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
