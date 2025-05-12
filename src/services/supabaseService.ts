
import { supabase } from "@/integrations/supabase/client";
import { MemoryCard, SupabaseMemoryCard } from "@/utils/storage";
import { toast } from "sonner";

// Função para converter o formato do banco de dados para o formato da aplicação
const mapSupabaseToMemoryCard = (card: SupabaseMemoryCard): MemoryCard => {
  return {
    id: card.id,
    userId: card.user_id || undefined,
    eventName: card.event_name,
    personName: card.person_name,
    celebrationDate: card.celebration_date,
    createdAt: card.created_at,
    expiresAt: card.expires_at,
    spotifyLink: card.spotify_link || undefined,
    emoji: card.emoji,
    theme: card.theme,
    message: card.message || undefined,
    photos: card.photos || undefined,
    is_paid: card.is_paid || false,
  };
};

// Função para converter o formato da aplicação para o formato do banco de dados
const mapMemoryCardToSupabase = (card: MemoryCard): SupabaseMemoryCard => {
  return {
    id: card.id,
    user_id: card.userId,
    event_name: card.eventName,
    person_name: card.personName,
    celebration_date: card.celebrationDate,
    created_at: card.createdAt,
    expires_at: card.expiresAt,
    spotify_link: card.spotifyLink,
    emoji: card.emoji,
    theme: card.theme,
    message: card.message,
    photos: card.photos,
    is_paid: card.is_paid || false,
  };
};

// Serviço para interação com o Supabase
export const supabaseService = {
  // Verificar se o usuário está autenticado
  isUserAuthenticated: async (): Promise<boolean> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Erro de autenticação:", error.message);
        return false;
      }
      
      if (!user) {
        console.log("Usuário não autenticado: nenhum usuário encontrado");
        return false;
      }
      
      console.log("Usuário autenticado:", user.id);
      return true;
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      return false;
    }
  },

  // Recuperar todos os cartões de memória do usuário atual
  getMemoryCards: async (): Promise<MemoryCard[]> => {
    try {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Usuário não autenticado:", authError?.message || "Usuário não encontrado");
        toast.error("Você precisa estar logado para ver seus cartões.");
        return [];
      }
      
      console.log("Buscando cartões para o usuário:", user.id);

      const { data: cards, error } = await supabase
        .from("memory_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar cartões:", error);
        toast.error(`Erro ao buscar cartões: ${error.message || "Tente novamente mais tarde"}`);
        throw error;
      }
      
      console.log(`${cards?.length || 0} cartões encontrados`);
      return (cards as SupabaseMemoryCard[]).map(mapSupabaseToMemoryCard);
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
      toast.error("Erro ao buscar cartões. Tente novamente mais tarde.");
      throw error;
    }
  },

  // Obter um cartão de memória específico
  getMemoryCard: async (id: string): Promise<MemoryCard | null> => {
    try {
      console.log("Buscando cartão com ID:", id);
      
      const { data, error } = await supabase
        .from("memory_cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar cartão:", error);
        return null;
      }

      console.log("Cartão encontrado:", data ? "sim" : "não");
      return data ? mapSupabaseToMemoryCard(data as SupabaseMemoryCard) : null;
    } catch (error) {
      console.error("Erro ao buscar cartão:", error);
      return null;
    }
  },

  // Salvar um novo cartão de memória
  saveMemoryCard: async (card: MemoryCard): Promise<MemoryCard | null> => {
    try {
      // Obter dados do usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error("Erro ao obter dados do usuário:", userError?.message || "Usuário não encontrado");
        toast.error("Você precisa estar logado para criar um cartão. Por favor, faça login primeiro.");
        throw new Error("Usuário não autenticado");
      }
      
      const supabaseCard = mapMemoryCardToSupabase(card);
      
      // Adiciona o ID do usuário atual
      supabaseCard.user_id = userData.user.id;
      
      console.log("Salvando cartão para o usuário:", supabaseCard.user_id);
      console.log("Dados do cartão:", JSON.stringify(supabaseCard));

      const { data, error } = await supabase
        .from("memory_cards")
        .insert([supabaseCard])
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar cartão:", error);
        console.error("Código do erro:", error.code);
        console.error("Detalhes do erro:", error.details);
        
        if (error.code === "42501") {
          toast.error("Erro de permissão. Por favor, faça login novamente.");
        } else if (error.message.includes("violates row-level security policy")) {
          toast.error("Erro de segurança. Verifique se você está logado corretamente.");
        } else {
          toast.error(`Erro ao salvar cartão: ${error.message || "Tente novamente mais tarde"}`);
        }
        
        throw error;
      }

      toast.success("Cartão salvo com sucesso!");
      return mapSupabaseToMemoryCard(data as SupabaseMemoryCard);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      if (error instanceof Error) {
        if (error.message === "Usuário não autenticado") {
          // Erro já tratado acima
        } else {
          toast.error(`Erro ao salvar cartão: ${error.message}`);
        }
      } else {
        toast.error("Erro desconhecido ao salvar cartão");
      }
      throw error;
    }
  },

  // Excluir um cartão de memória
  deleteMemoryCard: async (id: string): Promise<boolean> => {
    try {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Usuário não autenticado:", authError?.message || "Usuário não encontrado");
        toast.error("Você precisa estar logado para excluir um cartão.");
        return false;
      }

      console.log("Excluindo cartão com ID:", id);
      const { error } = await supabase
        .from("memory_cards")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir cartão:", error);
        toast.error(`Erro ao excluir cartão: ${error.message || "Tente novamente mais tarde"}`);
        return false;
      }

      toast.success("Cartão excluído com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
      toast.error("Erro ao excluir cartão. Tente novamente mais tarde.");
      return false;
    }
  },

  // Upload de uma foto para o storage
  uploadPhoto: async (file: File, folderName: string): Promise<string | null> => {
    try {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Usuário não autenticado:", authError?.message || "Usuário não encontrado");
        toast.error("Você precisa estar logado para fazer upload de fotos.");
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;
      
      console.log("Fazendo upload de foto:", filePath);

      const { error } = await supabase.storage
        .from('memory_card_photos')
        .upload(filePath, file);

      if (error) {
        console.error("Erro ao fazer upload da foto:", error);
        toast.error(`Erro ao fazer upload da foto: ${error.message || "Tente novamente mais tarde"}`);
        return null;
      }

      // Obtém a URL da foto
      const { data } = supabase.storage
        .from('memory_card_photos')
        .getPublicUrl(filePath);

      console.log("URL da foto:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao fazer upload da foto. Tente novamente mais tarde.");
      return null;
    }
  }
};
