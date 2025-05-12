
import { supabase } from "@/integrations/supabase/client";
import { MemoryCard } from "@/utils/storage";

// Interface para representar o formato de cartão de memória no Supabase
export interface SupabaseMemoryCard {
  id: string;
  user_id?: string;
  event_name: string;
  person_name: string;
  celebration_date: string;
  created_at?: string;
  expires_at: string;
  spotify_link?: string | null;
  emoji: string;
  theme: string;
  message?: string | null;
  photos: string[] | null;
}

// Converter do formato Supabase para formato local
export const convertSupabaseToLocalCard = (card: SupabaseMemoryCard): MemoryCard => {
  return {
    id: card.id,
    eventName: card.event_name,
    personName: card.person_name,
    celebrationDate: card.celebration_date,
    createdAt: card.created_at ? new Date(card.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
    expiresAt: card.expires_at,
    spotifyLink: card.spotify_link || undefined,
    emoji: card.emoji,
    theme: card.theme,
    photos: card.photos || null,
    message: card.message || undefined,
  };
};

// Converter do formato local para formato Supabase
export const convertLocalToSupabaseCard = (card: MemoryCard): SupabaseMemoryCard => {
  return {
    id: card.id,
    event_name: card.eventName,
    person_name: card.personName,
    celebration_date: card.celebrationDate,
    expires_at: card.expiresAt,
    spotify_link: card.spotifyLink || null,
    emoji: card.emoji,
    theme: card.theme,
    photos: card.photos,
    message: card.message || null,
  };
};

// Funções para interagir com o Supabase
export const supabaseService = {
  // Salvar um cartão de memória
  async saveMemoryCard(card: MemoryCard): Promise<boolean> {
    try {
      console.log("Salvando cartão no Supabase:", card);
      const supabaseCard = convertLocalToSupabaseCard(card);
      
      const { data, error } = await supabase
        .from("memory_cards")
        .upsert(supabaseCard)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao salvar cartão no Supabase:", error);
        return false;
      }
      
      console.log("Cartão salvo com sucesso no Supabase:", data);
      return true;
    } catch (error) {
      console.error("Exceção ao salvar cartão no Supabase:", error);
      return false;
    }
  },

  // Obter todos os cartões de memória do usuário atual
  async getMemoryCards(): Promise<MemoryCard[]> {
    try {
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("Usuário não autenticado, usando armazenamento local.");
        return []; // Retorna array vazio se não estiver autenticado
      }
      
      const { data, error } = await supabase
        .from("memory_cards")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar cartões do Supabase:", error);
        return [];
      }
      
      console.log("Cartões recuperados do Supabase:", data);
      return data.map(convertSupabaseToLocalCard);
    } catch (error) {
      console.error("Exceção ao buscar cartões do Supabase:", error);
      return [];
    }
  },

  // Obter um cartão específico por ID
  async getMemoryCardById(id: string): Promise<MemoryCard | undefined> {
    try {
      if (!id) {
        console.error("ID de cartão inválido:", id);
        return undefined;
      }
      
      const { data, error } = await supabase
        .from("memory_cards")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar cartão do Supabase:", error);
        return undefined;
      }
      
      console.log("Cartão recuperado do Supabase:", data);
      return convertSupabaseToLocalCard(data);
    } catch (error) {
      console.error("Exceção ao buscar cartão do Supabase:", error);
      return undefined;
    }
  },

  // Excluir um cartão de memória
  async deleteMemoryCard(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("memory_cards")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Erro ao excluir cartão do Supabase:", error);
        return false;
      }
      
      console.log("Cartão excluído com sucesso do Supabase:", id);
      return true;
    } catch (error) {
      console.error("Exceção ao excluir cartão do Supabase:", error);
      return false;
    }
  },

  // Upload de uma imagem para o storage do Supabase
  async uploadImage(file: string, fileName: string): Promise<string | null> {
    try {
      // Converte base64 para blob
      const base64Data = file.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Gerar nome de arquivo único
      const uniqueFileName = `${Date.now()}_${fileName}`;
      
      const { data, error } = await supabase.storage
        .from("memory_card_photos")
        .upload(uniqueFileName, blob);
      
      if (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        return null;
      }
      
      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from("memory_card_photos")
        .getPublicUrl(data.path);
      
      console.log("Imagem enviada com sucesso:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Exceção ao fazer upload da imagem:", error);
      return null;
    }
  }
};
