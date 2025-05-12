
import { supabase } from "@/integrations/supabase/client";

// Serviço para gerenciar pagamentos com Stripe
export const paymentService = {
  // Criar uma sessão de checkout do Stripe para um cartão de memória
  createCheckoutSession: async (cardId: string): Promise<{ url: string, sessionId: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { cardId }
      });

      if (error) {
        console.error("Erro ao criar sessão de checkout:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      throw error;
    }
  },

  // Verificar o status de um pagamento
  verifyPaymentStatus: async (sessionId: string): Promise<{ success: boolean, status: string, cardId?: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error);
      throw error;
    }
  }
};
