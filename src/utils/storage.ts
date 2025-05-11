
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
  const cardsJSON = localStorage.getItem(STORAGE_KEY);
  return cardsJSON ? JSON.parse(cardsJSON) : [];
};

// Add a new memory card to storage
export const saveMemoryCard = (card: MemoryCard): void => {
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
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

// Get a specific memory card by ID
export const getMemoryCardById = (id: string): MemoryCard | undefined => {
  const cards = getMemoryCards();
  return cards.find(card => card.id === id);
};

// Delete a memory card by ID
export const deleteMemoryCard = (id: string): void => {
  const cards = getMemoryCards();
  const filteredCards = cards.filter(card => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
};
