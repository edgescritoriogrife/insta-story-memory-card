import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Music, Pause, Play } from "lucide-react";
import { toast } from "sonner";

type MemoryCardData = {
  eventName: string;
  personName: string;
  celebrationDate: Date | undefined;
  spotifyLink: string;
  emoji: string;
  theme: string;
  photos: string[] | null;
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

// Componente para o player do Spotify no modo de pré-visualização
const SpotifyPreviewPlayer = ({ spotifyLink }: { spotifyLink?: string }) => {
  // Função para extrair o ID da faixa do link do Spotify
  const getSpotifyEmbedUrl = (spotifyLink?: string) => {
    if (!spotifyLink) return null;
    
    try {
      // Lida com diferentes formatos de URL do Spotify
      let trackId = '';
      
      if (spotifyLink.includes('/track/')) {
        trackId = spotifyLink.split('/track/')[1].split('?')[0];
      } else if (spotifyLink.includes('spotify:track:')) {
        trackId = spotifyLink.split('spotify:track:')[1];
      }
      
      if (!trackId) return null;
      
      // Retorna o formato de URL incorporado
      return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    } catch (error) {
      console.error("Erro ao analisar link do Spotify:", error);
      return null;
    }
  };

  const embedUrl = getSpotifyEmbedUrl(spotifyLink);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="spotify-player">
      <iframe 
        src={embedUrl} 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allowFullScreen 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        title="Spotify Preview Player"
      ></iframe>
    </div>
  );
};

export const MemoryCardPreview = ({ data }: { data: MemoryCardData }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Apresentação de slides automática para fotos
  useEffect(() => {
    if (data.photos && data.photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % data.photos!.length);
      }, 3000); // Muda a foto a cada 3 segundos
      
      return () => clearInterval(interval);
    }
  }, [data.photos]);

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
      console.error("Erro de formatação de data:", error);
      return "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`memory-card rounded-xl shadow-lg ${getThemeStyles(
          data.theme
        )} relative flex flex-col aspect-[9/16] max-h-[70vh]`}
      >
        <EmojiAnimation emoji={data.emoji} />
        
        {/* Imagem de fundo em tela cheia com apresentação de slides */}
        <div className="absolute inset-0 w-full h-full z-0 transition-opacity duration-1000 ease-in-out">
          {data.photos && data.photos.length > 0 && (
            <>
              {data.photos.map((photo, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentPhotoIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img 
                    src={photo} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {/* Removendo o backdrop-blur-sm para evitar o desfoque nas imagens */}
              <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
            </>
          )}
        </div>
        
        <div className="flex flex-col justify-between items-center h-full p-6 relative z-20">
          <div className="text-center flex flex-col items-center justify-start w-full mt-8 space-y-4">
            <h1 className="text-3xl md:text-4xl fancy-text mb-2 text-white text-center">
              {data.eventName}
            </h1>
            
            <div className="w-16 h-1 bg-white opacity-60 my-2"></div>
            
            <h2 className="text-2xl md:text-3xl font-light mb-4 text-white">
              {data.personName}
            </h2>
          </div>
          
          {/* Área de conteúdo principal */}
          <div className="flex flex-col items-center mb-4">
            {data.celebrationDate && (
              <div className="mb-4 text-center">
                <p className="text-sm uppercase tracking-wider text-white opacity-90 mb-1">
                  Data da Celebração
                </p>
                <p className="text-lg font-medium text-white">
                  {formatDate(data.celebrationDate)}
                </p>
              </div>
            )}
          </div>
          
          {/* Seção de rodapé */}
          <div className="w-full mt-auto flex flex-col items-center space-y-4">          
            <div className="w-16 h-1 bg-white opacity-60"></div>
            
            <div className="text-sm text-white opacity-70 mb-2">
              Cartão de Memória • Acesso por 1 ano
            </div>
          </div>
        </div>
      </div>
      
      {/* Player do Spotify abaixo do cartão */}
      {data.spotifyLink && (
        <SpotifyPreviewPlayer spotifyLink={data.spotifyLink} />
      )}
    </div>
  );
};
