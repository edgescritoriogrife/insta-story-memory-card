
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Preço em centavos (R$ 17,90 = 1790 centavos)
const PRICE_IN_CENTS = 1790;

// Helper para logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
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
    
    const { cardId } = body;
    logStep("CardId extraído", { cardId });

    if (!cardId) {
      throw new Error("ID do cartão de memória não fornecido");
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

    // Verificar se o cartão existe e pertence ao usuário
    const { data: cardData, error: cardError } = await supabaseClient
      .from("memory_cards")
      .select("*")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .single();
    
    if (cardError) {
      logStep("Erro ao buscar cartão", { error: cardError.message });
      throw new Error("Cartão não encontrado: " + cardError.message);
    }
    
    if (!cardData) {
      logStep("Cartão não encontrado ou não pertence ao usuário");
      throw new Error("Cartão não encontrado ou não pertence ao usuário atual");
    }

    logStep("Cartão encontrado", { cardId: cardData.id, eventName: cardData.event_name });

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

    // Verificar se o cliente Stripe já existe para o usuário
    let customerId;
    
    if (user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      logStep("Busca de cliente Stripe", { found: customers.data.length > 0 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Criar um novo cliente Stripe se não existir
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id
          }
        });
        customerId = customer.id;
        logStep("Novo cliente Stripe criado", { customerId });
      }
    } else {
      logStep("Usuário sem email definido");
      throw new Error("Email do usuário não disponível");
    }

    // Criar uma sessão de checkout do Stripe
    logStep("Criando sessão de checkout");
    
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

    logStep("Sessão de checkout criada", { sessionId: session.id, url: session.url });

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
      logStep("Erro ao salvar pagamento no banco", { error: paymentError.message });
      // Mesmo com erro ao salvar no banco, continuamos com o checkout
    } else {
      logStep("Pagamento registrado no banco", { paymentId: paymentData.id });
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
