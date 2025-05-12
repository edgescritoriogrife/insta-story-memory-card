
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("ID da sessão não fornecido");
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

    // Inicializar o Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });

    // Buscar a sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verificar se o pagamento foi bem-sucedido
    if (session.payment_status === "paid") {
      // Atualizar o status do pagamento no banco de dados
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (paymentError) {
        console.error("Erro ao atualizar pagamento:", paymentError);
        throw new Error("Erro ao atualizar status do pagamento");
      }

      // Marcar o cartão de memória como pago
      const { error: cardError } = await supabaseAdmin
        .from("memory_cards")
        .update({ is_paid: true })
        .eq("id", payment.memory_card_id);

      if (cardError) {
        console.error("Erro ao atualizar cartão:", cardError);
        // Continuamos mesmo com erro ao atualizar o cartão
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          status: session.payment_status,
          cardId: payment.memory_card_id
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
          status: 200
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        status: session.payment_status
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
    console.error("Erro na verificação do pagamento:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao verificar pagamento" }),
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
