
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Serviço para gerenciar pagamentos com Stripe
export const paymentService = {
  // Criar uma sessão de checkout do Stripe para um cartão de memória
  createCheckoutSession: async (cardId: string): Promise<{ url: string, sessionId: string } | null> => {
    try {
      console.log("Iniciando criação de sessão de checkout para cardId:", cardId);
      
      const response = await supabase.functions.invoke('create-payment', {
        body: { cardId }
      });
      
      const { data, error } = response;
      // Obtemos o status code a partir da propriedade status no objeto response
      const statusCode = response.status || 500;

      if (error) {
        console.error("Erro ao criar sessão de checkout:", error, "Status:", statusCode);
        toast.error(`Erro ao processar pagamento: ${error.message || "Tente novamente mais tarde"}`);
        throw error;
      }

      if (statusCode !== 200) {
        console.error("Status não esperado da função create-payment:", statusCode);
        toast.error(`Erro ao processar pagamento: resposta com status ${statusCode}`);
        throw new Error(`Resposta com status ${statusCode}`);
      }

      if (!data || !data.url || !data.sessionId) {
        console.error("Resposta inválida da função create-payment:", data);
        toast.error("Erro ao processar pagamento: resposta inválida do servidor");
        throw new Error("Resposta inválida do servidor");
      }

      console.log("Sessão de checkout criada com sucesso:", data);
      return data;
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Falha ao iniciar pagamento: ${errorMessage}`);
      return null;
    }
  },

  // Verificar o status de um pagamento
  verifyPaymentStatus: async (sessionId: string): Promise<{ success: boolean, status: string, cardId?: string } | null> => {
    try {
      console.log("Verificando status do pagamento para sessionId:", sessionId);
      
      const response = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      
      const { data, error } = response;
      // Obtemos o status code a partir da propriedade status no objeto response
      const statusCode = response.status || 500;

      if (error) {
        console.error("Erro ao verificar status do pagamento:", error, "Status:", statusCode);
        toast.error(`Erro ao verificar pagamento: ${error.message || "Tente novamente mais tarde"}`);
        throw error;
      }

      if (statusCode !== 200) {
        console.error("Status não esperado da função verify-payment:", statusCode);
        toast.error(`Erro ao verificar pagamento: resposta com status ${statusCode}`);
        throw new Error(`Resposta com status ${statusCode}`);
      }

      if (!data) {
        console.error("Resposta inválida da função verify-payment");
        toast.error("Erro ao verificar pagamento: resposta inválida do servidor");
        throw new Error("Resposta inválida do servidor");
      }

      console.log("Status do pagamento verificado:", data);
      return data;
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Falha ao verificar pagamento: ${errorMessage}`);
      return null;
    }
  }
};
