
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Preço em centavos (R$ 17,90 = 1790 centavos)
const PRICE_IN_CENTS = 1790;

serve(async (req) => {
  // Lidar com requisições preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardId } = await req.json();

    if (!cardId) {
      throw new Error("ID do cartão de memória não fornecido");
    }

    // Inicializar clientes do Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Cliente para autenticação do usuário
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente com role de serviço para operações privilegiadas no banco
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação do usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autorização não fornecida");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o cartão existe e pertence ao usuário
    const { data: cardData, error: cardError } = await supabaseClient
      .from("memory_cards")
      .select("*")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .single();
    
    if (cardError || !cardData) {
      throw new Error("Cartão não encontrado ou não pertence ao usuário atual");
    }

    // Inicializar o Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });

    // Verificar se o cliente Stripe já existe para o usuário
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else if (user.email) {
      // Criar um novo cliente Stripe se não existir
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
    }

    // Criar uma sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId && user.email ? user.email : undefined,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Cartão de Memória: ${cardData.event_name}`,
              description: `Celebração para ${cardData.person_name}`,
              metadata: {
                card_id: cardId
              }
            },
            unit_amount: PRICE_IN_CENTS
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&session_id=${session.id}&card_id=${cardId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=canceled&card_id=${cardId}`
    });

    // Registrar a sessão de pagamento no banco de dados
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        memory_card_id: cardId,
        stripe_session_id: session.id,
        amount: PRICE_IN_CENTS,
        currency: "brl",
        status: "pending"
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Erro ao salvar pagamento:", paymentError);
      // Mesmo com erro ao salvar no banco, continuamos com o checkout
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("Erro no checkout:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar pagamento" }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 400
      }
    );
  }
});
