
import { v4 as uuidv4 } from 'uuid';

// Chave para armazenamento local
const STORAGE_KEY = 'memory_cards';

// Definição dos tipos para os cartões de memória
export interface MemoryCard {
  id: string;
  userId?: string;
  eventName: string;
  personName: string;
  celebrationDate: string;
  createdAt: string;
  expiresAt: string;
  spotifyLink?: string;
  emoji: string;
  theme: string;
  message?: string;
  photos?: string[];
}

// Formato do cartão no Supabase
export interface SupabaseMemoryCard {
  id: string;
  user_id?: string;
  event_name: string;
  person_name: string;
  celebration_date: string;
  created_at: string;
  expires_at: string;
  spotify_link?: string;
  emoji: string;
  theme: string;
  message?: string;
  photos?: string[];
}

// Temas disponíveis para os cartões
export const cardThemes = [
  {
    id: 'romantic',
    name: 'Romântico',
    bgColor: 'bg-gradient-to-b from-red-100 to-pink-200',
    textColor: 'text-pink-900'
  },
  {
    id: 'celebration',
    name: 'Celebração',
    bgColor: 'bg-gradient-to-b from-yellow-100 to-amber-200',
    textColor: 'text-amber-900'
  },
  {
    id: 'birthday',
    name: 'Aniversário',
    bgColor: 'bg-gradient-to-b from-purple-100 to-fuchsia-200',
    textColor: 'text-fuchsia-900'
  },
  {
    id: 'congrats',
    name: 'Parabéns',
    bgColor: 'bg-gradient-to-b from-blue-100 to-cyan-200',
    textColor: 'text-cyan-900'
  },
  {
    id: 'holiday',
    name: 'Férias',
    bgColor: 'bg-gradient-to-b from-green-100 to-emerald-200',
    textColor: 'text-emerald-900'
  }
];

// Classe para gerenciar o armazenamento de cartões
class MemoryCardStorage {
  private cards: MemoryCard[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  // Carregar cartões do armazenamento local
  private loadFromLocalStorage() {
    try {
      const savedCards = localStorage.getItem(STORAGE_KEY);
      if (savedCards) {
        this.cards = JSON.parse(savedCards);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      this.cards = [];
    }
  }

  // Salvar cartões no armazenamento local
  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards));
    } catch (error) {
      console.error('Erro ao salvar cartões:', error);
    }
  }

  // Obter todos os cartões
  getAll(): MemoryCard[] {
    return [...this.cards];
  }

  // Obter um cartão específico pelo ID
  getById(id: string): MemoryCard | undefined {
    return this.cards.find(card => card.id === id);
  }

  // Adicionar um novo cartão
  add(card: Omit<MemoryCard, 'id' | 'createdAt'>): MemoryCard {
    const newCard: MemoryCard = {
      ...card,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    this.cards.push(newCard);
    this.saveToLocalStorage();
    return newCard;
  }

  // Atualizar um cartão existente
  update(updatedCard: MemoryCard): MemoryCard {
    const index = this.cards.findIndex(card => card.id === updatedCard.id);
    
    if (index >= 0) {
      this.cards[index] = updatedCard;
      this.saveToLocalStorage();
      return updatedCard;
    }
    
    throw new Error(`Cartão com ID ${updatedCard.id} não encontrado.`);
  }

  // Excluir um cartão
  delete(id: string): boolean {
    const initialLength = this.cards.length;
    this.cards = this.cards.filter(card => card.id !== id);
    
    if (this.cards.length !== initialLength) {
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }
}

// Exportar uma instância da classe de armazenamento
export const memoryCardStorage = new MemoryCardStorage();
