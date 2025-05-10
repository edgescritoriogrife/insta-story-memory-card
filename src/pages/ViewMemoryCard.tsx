
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Music } from "lucide-react";

// Mock data - In a real app, this would come from an API
const mockCards = {
  "memory-1": {
    eventName: "Aniversário de Casamento",
    personName: "Maria e João",
    celebrationDate: new Date(2025, 5, 15), // June 15, 2025
    spotifyLink: "https://open.spotify.com/track/123456",
    emoji: "❤️",
    theme: "pink",
  },
  "memory-2": {
    eventName: "Dia das Mães",
    personName: "Ana Silva",
    celebrationDate: new Date(2025, 4, 14), // May 14, 2025
    spotifyLink: "https://open.spotify.com/track/654321",
    emoji: "💐",
    theme: "purple",
  },
};

type EmojiAnimationProps = {
  emoji: string;
};

const EmojiAnimation = ({ emoji }: EmojiAnimationProps) => {
  const [emojis, setEmojis] = useState<
    Array<{ id: number; left: string; delay: string; duration: string }>
  >([]);

  useEffect(() => {
    const newEmojis = Array.from({ length: 20 }).map((_, index) => {
      return {
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 3}s`,
      };
    });
    setEmojis(newEmojis);
  }, [emoji]);

  return (
    <div className="emoji-rain">
      {emojis.map((item) => (
        <span
          key={item.id}
          className="emoji"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

const ViewMemoryCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch card data from an API
    // This is just a mock
    if (id && id in mockCards) {
      setCardData(mockCards[id as keyof typeof mockCards]);
    }
  }, [id]);

  const getThemeStyles = (theme: string) => {
    const themes = {
      pink: "bg-gradient-to-b from-pink-200 to-pink-100 text-pink-900",
      purple: "bg-gradient-to-b from-purple-200 to-purple-100 text-purple-900",
      blue: "bg-gradient-to-b from-blue-200 to-blue-100 text-blue-900",
      mint: "bg-gradient-to-b from-green-200 to-green-100 text-green-900",
      gold: "bg-gradient-to-b from-yellow-200 to-yellow-100 text-yellow-900",
      cream: "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900",
    };
    return themes[theme as keyof typeof themes] || themes.pink;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";

    try {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cartão não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar para Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div
        className={`memory-card rounded-xl shadow-2xl ${getThemeStyles(
          cardData.theme
        )} relative flex flex-col max-w-sm mx-auto`}
      >
        <EmojiAnimation emoji={cardData.emoji} />
        
        <div className="flex flex-col justify-center items-center h-full p-6 relative z-20">
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 backdrop-blur-sm rounded-xl z-0"></div>
          
          <div className="relative z-10 text-center flex flex-col items-center justify-center h-full w-full space-y-6">
            <h1 className="text-3xl md:text-4xl fancy-text mb-2">
              {cardData.eventName}
            </h1>
            
            <div className="w-16 h-1 bg-current opacity-60 my-4"></div>
            
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              {cardData.personName}
            </h2>
            
            {cardData.celebrationDate && (
              <div className="mb-6 text-center">
                <p className="text-sm uppercase tracking-wider opacity-70 mb-1">
                  Data da Celebração
                </p>
                <p className="text-lg font-medium">
                  {formatDate(cardData.celebrationDate)}
                </p>
              </div>
            )}
            
            {cardData.spotifyLink && (
              <div className="flex items-center gap-2 p-3 rounded-full bg-white bg-opacity-70 shadow-sm">
                <Music size={20} />
                <span className="text-sm font-medium">Música Especial</span>
              </div>
            )}
            
            <div className="w-16 h-1 bg-current opacity-60 my-4"></div>
            
            <div className="text-sm opacity-70 mt-auto">
              Cartão de Memória • Com carinho
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Button asChild variant="outline" className="text-white bg-purple-900 hover:bg-purple-800 border-purple-700">
          <Link to="/">Criar seu próprio Cartão</Link>
        </Button>
      </div>
    </div>
  );
};

export default ViewMemoryCard;
