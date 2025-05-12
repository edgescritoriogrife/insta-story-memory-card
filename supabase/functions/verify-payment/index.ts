
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Lidar com requisições preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Função iniciada");
    
    const bodyText = await req.text();
    logStep("Body recebido", { body: bodyText });
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      logStep("Erro ao parsear JSON", { error: e.message });
      throw new Error("Formato de requisição inválido: " + e.message);
    }
    
    const { sessionId } = body;
    logStep("SessionId extraído", { sessionId });

    if (!sessionId) {
      throw new Error("ID da sessão não fornecido");
    }

    // Inicializar clientes do Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    logStep("Variáveis de ambiente", { 
      urlPresent: !!supabaseUrl, 
      anonKeyPresent: !!supabaseAnonKey,
      serviceKeyPresent: !!supabaseServiceKey 
    });
    
    // Cliente para autenticação do usuário
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Cliente com role de serviço para operações privilegiadas no banco
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação do usuário
    const authHeader = req.headers.get("Authorization");
    logStep("Header de autorização", { present: !!authHeader });
    
    if (!authHeader) {
      throw new Error("Autorização não fornecida");
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Token extraído", { tokenLength: token.length });
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Erro de autenticação", { error: userError.message });
      throw new Error("Erro na autenticação: " + userError.message);
    }
    
    if (!user) {
      logStep("Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    logStep("Usuário autenticado", { id: user.id, email: user.email });

    // Inicializar o Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Chave do Stripe não configurada");
      throw new Error("Chave do Stripe não está configurada");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16"
    });

    logStep("Cliente Stripe inicializado");

    // Buscar a sessão de checkout do Stripe
    logStep("Buscando sessão de checkout", { sessionId });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Sessão de checkout recuperada", { paymentStatus: session.payment_status });

    // Verificar se o pagamento foi bem-sucedido
    if (session.payment_status === "paid") {
      // Buscar o registro de pagamento
      const { data: payment, error: findPaymentError } = await supabaseAdmin
        .from("payments")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single();

      if (findPaymentError) {
        logStep("Erro ao encontrar pagamento no banco", { error: findPaymentError.message });
        throw new Error("Erro ao encontrar pagamento: " + findPaymentError.message);
      }
      
      if (!payment) {
        logStep("Pagamento não encontrado no banco");
        throw new Error("Registro de pagamento não encontrado");
      }
      
      logStep("Pagamento encontrado no banco", { paymentId: payment.id, cardId: payment.memory_card_id });

      // Atualizar o status do pagamento no banco de dados
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user.id);

      if (paymentError) {
        logStep("Erro ao atualizar pagamento", { error: paymentError.message });
        throw new Error("Erro ao atualizar status do pagamento: " + paymentError.message);
      }

      logStep("Pagamento atualizado com sucesso", { status: "paid" });

      // Marcar o cartão de memória como pago
      const { error: cardError } = await supabaseAdmin
        .from("memory_cards")
        .update({ is_paid: true })
        .eq("id", payment.memory_card_id);

      if (cardError) {
        logStep("Erro ao atualizar cartão", { error: cardError.message });
        // Continuamos mesmo com erro ao atualizar o cartão
      } else {
        logStep("Cartão atualizado como pago", { cardId: payment.memory_card_id });
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

    logStep("Pagamento não está com status paid", { status: session.payment_status });

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
