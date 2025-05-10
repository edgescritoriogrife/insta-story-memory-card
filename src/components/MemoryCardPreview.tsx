
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Music } from "lucide-react";

type MemoryCardData = {
  eventName: string;
  personName: string;
  celebrationDate: Date | undefined;
  spotifyLink: string;
  emoji: string;
  theme: string;
  photo: string | null;
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

export const MemoryCardPreview = ({ data }: { data: MemoryCardData }) => {
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

  const extractSpotifyArtist = (link: string) => {
    // This is a simple placeholder. In a real app, you might extract artist name from the link
    return "Música especial";
  };

  return (
    <div
      className={`memory-card rounded-xl shadow-lg ${getThemeStyles(
        data.theme
      )} relative flex flex-col aspect-[9/16] max-h-[70vh]`}
    >
      <EmojiAnimation emoji={data.emoji} />
      
      <div className="flex flex-col justify-center items-center h-full p-6 relative z-20">
        {/* Background layer with optional photo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl z-0">
          {data.photo ? (
            <>
              {/* Photo background with overlay */}
              <img 
                src={data.photo} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>
            </>
          ) : (
            <div className="w-full h-full bg-white bg-opacity-50 backdrop-blur-sm"></div>
          )}
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full w-full space-y-6">
          <h1 className="text-3xl md:text-4xl fancy-text mb-2 text-center">
            {data.eventName}
          </h1>
          
          <div className="w-16 h-1 bg-current opacity-60 my-4"></div>
          
          {/* Display photo in middle if exists */}
          {data.photo && (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
              <img 
                src={data.photo} 
                alt="Foto da memória" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h2 className="text-2xl md:text-3xl font-light mb-4">
            {data.personName}
          </h2>
          
          {data.celebrationDate && (
            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-wider opacity-70 mb-1">
                Data da Celebração
              </p>
              <p className="text-lg font-medium">
                {formatDate(data.celebrationDate)}
              </p>
            </div>
          )}
          
          {data.spotifyLink && (
            <div className="flex items-center gap-2 p-3 rounded-full bg-white bg-opacity-70 shadow-sm">
              <Music size={20} />
              <span className="text-sm font-medium">
                {extractSpotifyArtist(data.spotifyLink)}
              </span>
            </div>
          )}
          
          <div className="w-16 h-1 bg-current opacity-60 my-4"></div>
          
          <div className="text-sm opacity-70 mt-auto">
            Cartão de Memória • Acesso por 1 ano
          </div>
        </div>
      </div>
    </div>
  );
};
