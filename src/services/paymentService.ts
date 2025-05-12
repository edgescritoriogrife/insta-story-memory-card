
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
      
      // Verificamos se temos um erro explícito
      if (error) {
        console.error("Erro ao criar sessão de checkout:", error);
        toast.error(`Erro ao processar pagamento: ${error.message || "Tente novamente mais tarde"}`);
        throw error;
      }

      // Verificamos a status code (pode estar em diferentes locais dependendo da versão da API)
      if (response.error) {
        console.error("Erro ao criar sessão de checkout:", response.error);
        toast.error(`Erro ao processar pagamento: ${response.error.message || "Tente novamente mais tarde"}`);
        throw new Error(response.error.message || "Erro ao processar pagamento");
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
      
      // Verificamos se temos um erro explícito
      if (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        toast.error(`Erro ao verificar pagamento: ${error.message || "Tente novamente mais tarde"}`);
        throw error;
      }

      // Verificamos a status code (pode estar em diferentes locais dependendo da versão da API)
      if (response.error) {
        console.error("Erro ao verificar status do pagamento:", response.error);
        toast.error(`Erro ao verificar pagamento: ${response.error.message || "Tente novamente mais tarde"}`);
        throw new Error(response.error.message || "Erro ao verificar pagamento");
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
