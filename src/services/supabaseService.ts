
import { supabase } from "@/integrations/supabase/client";
import { MemoryCard, SupabaseMemoryCard } from "@/utils/storage";

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
  };
};

// Serviço para interação com o Supabase
export const supabaseService = {
  // Recuperar todos os cartões de memória do usuário atual
  getMemoryCards: async (): Promise<MemoryCard[]> => {
    try {
      const { data: cards, error } = await supabase
        .from("memory_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar cartões:", error);
        throw error;
      }

      return (cards as SupabaseMemoryCard[]).map(mapSupabaseToMemoryCard);
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
      throw error;
    }
  },

  // Obter um cartão de memória específico
  getMemoryCard: async (id: string): Promise<MemoryCard | null> => {
    try {
      const { data, error } = await supabase
        .from("memory_cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar cartão:", error);
        return null;
      }

      return mapSupabaseToMemoryCard(data as SupabaseMemoryCard);
    } catch (error) {
      console.error("Erro ao buscar cartão:", error);
      return null;
    }
  },

  // Salvar um novo cartão de memória
  saveMemoryCard: async (card: MemoryCard): Promise<MemoryCard | null> => {
    try {
      const user = supabase.auth.getUser();
      const supabaseCard = mapMemoryCardToSupabase(card);
      
      // Adiciona o ID do usuário atual
      supabaseCard.user_id = (await user).data.user?.id;

      const { data, error } = await supabase
        .from("memory_cards")
        .insert([supabaseCard])
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar cartão:", error);
        throw error;
      }

      return mapSupabaseToMemoryCard(data as SupabaseMemoryCard);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      throw error;
    }
  },

  // Excluir um cartão de memória
  deleteMemoryCard: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("memory_cards")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir cartão:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
      return false;
    }
  },

  // Upload de uma foto para o storage
  uploadPhoto: async (file: File, folderName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;

      const { error } = await supabase.storage
        .from('memory_card_photos')
        .upload(filePath, file);

      if (error) {
        console.error("Erro ao fazer upload da foto:", error);
        return null;
      }

      // Obtém a URL da foto
      const { data } = supabase.storage
        .from('memory_card_photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      return null;
    }
  }
};
