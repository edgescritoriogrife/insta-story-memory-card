
// Simple utility to manage memory cards in local storage

export type MemoryCard = {
  id: string;
  eventName: string;
  personName: string;
  celebrationDate: string;
  createdAt: string;
  expiresAt: string;
  spotifyLink?: string;
  emoji: string;
  theme: string;
  photos: string[] | null;
};

const STORAGE_KEY = 'memory-cards';

// Função para comprimir imagem usando canvas
const compressImage = (base64: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Redimensiona se a largura for maior que o máximo
      if (width > maxWidth) {
        height = Math.floor(height * maxWidth / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível obter o contexto do canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converte de volta para base64 com qualidade reduzida
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem para compressão'));
    };
    
    img.src = base64;
  });
};

// Estima o tamanho aproximado de uma string base64 em bytes
const estimateBase64Size = (base64: string): number => {
  // Remove cabeçalho data URI se presente
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  // Equação para estimar o tamanho: tamanho_bytes = (n * 0.75) onde n é o comprimento da string base64
  return Math.ceil(base64Data.length * 0.75);
};

// Calcula o espaço total usado pelos cartões em bytes
const calculateTotalStorageUsed = (cards: MemoryCard[]): number => {
  try {
    let totalSize = 0;
    const cardsJson = JSON.stringify(cards);
    totalSize += cardsJson.length * 2; // Cada caractere UTF-16 usa 2 bytes
    
    return totalSize;
  } catch (error) {
    console.error("Erro ao calcular espaço de armazenamento:", error);
    return 0;
  }
};

// Get all memory cards from storage
export const getMemoryCards = (): MemoryCard[] => {
  try {
    const cardsJSON = localStorage.getItem(STORAGE_KEY);
    const cards = cardsJSON ? JSON.parse(cardsJSON) : [];
    console.log(`Recuperados ${cards.length} cartões do localStorage`);
    return cards;
  } catch (error) {
    console.error("Erro ao recuperar cartões da memória:", error);
    return [];
  }
};

// Limpar todos os cartões de memória
export const clearAllMemoryCards = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Todos os cartões foram removidos do localStorage");
    return true;
  } catch (error) {
    console.error("Erro ao limpar cartões de memória:", error);
    return false;
  }
};

// Limpa cartões expirados para liberar espaço
const cleanupExpiredCards = (): void => {
  try {
    const cards = getMemoryCards();
    const now = new Date();
    
    // Filtra cartões expirados
    const validCards = cards.filter(card => {
      // Converte a data de expiração para um objeto Date (formato dd/MM/yyyy)
      const [day, month, year] = card.expiresAt.split('/').map(Number);
      const expiryDate = new Date(year, month - 1, day); // mês é base 0 em JS
      return expiryDate > now;
    });
    
    // Atualiza armazenamento se algum cartão foi removido
    if (validCards.length < cards.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCards));
      console.log(`Removidos ${cards.length - validCards.length} cartões expirados`);
    }
  } catch (error) {
    console.error("Erro ao limpar cartões expirados:", error);
  }
};

// Add a new memory card to storage
export const saveMemoryCard = async (card: MemoryCard): Promise<boolean> => {
  try {
    // Primeiro, limpa cartões expirados para liberar espaço
    cleanupExpiredCards();
    
    const cards = getMemoryCards();
    // Check if card with same ID exists
    const index = cards.findIndex(c => c.id === card.id);
    
    // Prepare the card object (copy to avoid modifying the original)
    const processedCard = { ...card };
    
    // Se o cartão contém fotos, comprime-as
    if (processedCard.photos && processedCard.photos.length > 0) {
      // Limita a 3 fotos no máximo para reduzir uso de armazenamento
      processedCard.photos = processedCard.photos.slice(0, 3);
      
      // Comprime cada foto
      try {
        const compressedPhotos = await Promise.all(processedCard.photos.map(async (photoData) => {
          // Estima o tamanho da foto
          const estimatedSize = estimateBase64Size(photoData);
          
          // Se a imagem for maior que 300KB, comprima-a
          if (estimatedSize > 300 * 1024) {
            console.log("Comprimindo foto grande para melhorar eficiência de armazenamento");
            return await compressImage(photoData, 800, 0.7); 
          }
          return photoData;
        }));
        
        processedCard.photos = compressedPhotos;
      } catch (error) {
        console.error("Erro ao comprimir fotos:", error);
        // Continua com as fotos originais se houver erro na compressão
      }
    }
    
    if (index >= 0) {
      // Update existing card
      console.log(`Atualizando cartão existente: ${card.id}`);
      cards[index] = processedCard;
    } else {
      // Add new card
      console.log(`Adicionando novo cartão: ${card.id}`);
      cards.push(processedCard);
    }
    
    // Verifica se o tamanho total do armazenamento excederá o limite
    const totalSize = calculateTotalStorageUsed(cards);
    const storageLimit = 5 * 1024 * 1024; // 5MB limite aproximado
    
    if (totalSize > storageLimit) {
      console.error("Armazenamento excede o limite de 5MB. Não é possível salvar mais cartões.");
      return false;
    }
    
    try {
      // Garantir que salvamos o cartão no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      
      // Verificar se o cartão foi realmente salvo lendo de volta
      const verifyCards = getMemoryCards();
      const savedCard = verifyCards.find(c => c.id === card.id);
      
      if (savedCard) {
        console.log(`Cartão ${card.id} verificado e confirmado no localStorage`);
        console.log(`Total de ${verifyCards.length} cartões salvos com sucesso`);
        console.log("IDs dos cartões salvos:", verifyCards.map(c => c.id).join(", "));
        return true;
      } else {
        console.error(`Erro: Cartão ${card.id} não foi encontrado após tentativa de salvamento`);
        return false;
      }
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
      return false;
    }
  } catch (error) {
    console.error("Erro ao salvar cartão de memória:", error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error("Cota de armazenamento excedida. Tente remover alguns cartões existentes primeiro.");
    }
    return false;
  }
};

// Get a specific memory card by ID
export const getMemoryCardById = (id: string): MemoryCard | undefined => {
  try {
    if (!id) {
      console.error("ID de cartão inválido:", id);
      return undefined;
    }
    
    const cards = getMemoryCards();
    console.log(`Buscando cartão ${id} entre ${cards.length} cartões disponíveis`);
    
    const card = cards.find(card => card.id === id);
    if (card) {
      console.log("Cartão encontrado:", id);
    } else {
      console.log("Cartão não encontrado:", id);
      // Listar todos os IDs para depuração
      console.log("IDs disponíveis:", cards.map(c => c.id).join(", "));
    }
    return card;
  } catch (error) {
    console.error("Erro ao buscar cartão por ID:", error);
    return undefined;
  }
};

// Delete a memory card by ID
export const deleteMemoryCard = (id: string): void => {
  const cards = getMemoryCards();
  const filteredCards = cards.filter(card => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
};
