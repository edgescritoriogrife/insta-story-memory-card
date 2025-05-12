
export type MemoryCard = {
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
  is_paid?: boolean;
};

export type SupabaseMemoryCard = {
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
  is_paid?: boolean;
};
