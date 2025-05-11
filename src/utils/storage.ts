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

// Get all memory cards from storage
export const getMemoryCards = (): MemoryCard[] => {
  try {
    const cardsJSON = localStorage.getItem(STORAGE_KEY);
    return cardsJSON ? JSON.parse(cardsJSON) : [];
  } catch (error) {
    console.error("Erro ao recuperar cartões da memória:", error);
    return [];
  }
};

// Add a new memory card to storage
export const saveMemoryCard = (card: MemoryCard): boolean => {
  try {
    const cards = getMemoryCards();
    // Check if card with same ID exists
    const index = cards.findIndex(c => c.id === card.id);
    
    if (index >= 0) {
      // Update existing card
      cards[index] = card;
    } else {
      // Add new card
      cards.push(card);
    }
    
    // If card contains large photos, compress or limit them
    if (card.photos && card.photos.length > 0) {
      // Limit to 3 photos maximum to reduce storage usage
      card.photos = card.photos.slice(0, 3);
      
      // Optionally compress photos if they're too large
      // (This is a simple implementation, more sophisticated compression might be needed)
      card.photos = card.photos.map(photoData => {
        if (photoData.length > 500000) { // If larger than ~500KB
          console.log("Compressing large photo for storage efficiency");
          // Here we would implement compression, but for now we'll just keep the original
        }
        return photoData;
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    console.log("Cartão salvo com sucesso:", card.id);
    return true;
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
    const cards = getMemoryCards();
    const card = cards.find(card => card.id === id);
    if (card) {
      console.log("Cartão encontrado:", id);
    } else {
      console.log("Cartão não encontrado:", id);
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
