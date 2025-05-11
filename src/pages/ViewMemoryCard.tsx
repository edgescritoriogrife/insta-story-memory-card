
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Music, Pause, Play } from "lucide-react";
import { getMemoryCardById, MemoryCard } from "@/utils/storage";
import { toast } from "sonner";

// Dados simulados - Em um aplicativo real, isso viria de uma API
const mockCards = {
  "memory-1": {
    eventName: "Aniversário de Casamento",
    personName: "Maria e João",
    celebrationDate: new Date(2025, 5, 15), // 15 de junho de 2025
    spotifyLink: "https://open.spotify.com/track/123456",
    emoji: "❤️",
    theme: "pink",
    photos: ["https://images.unsplash.com/photo-1522673607200-164d1b3ce551?auto=format&fit=crop&w=300", 
             "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300"],
  },
  "memory-2": {
    eventName: "Dia das Mães",
    personName: "Ana Silva",
    celebrationDate: new Date(2025, 4, 14), // 14 de maio de 2025
    spotifyLink: "https://open.spotify.com/track/654321",
    emoji: "💐",
    theme: "purple",
    photos: ["https://images.unsplash.com/photo-1591156021782-f3a5cb270695?auto=format&fit=crop&w=300",
             "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=300"],
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

// Componente para o player de música
const MusicPlayer = ({ spotifyLink }: { spotifyLink?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Limpa o áudio quando o componente é desmontado
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

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
      return `https://open.spotify.com/embed/track/${trackId}`;
    } catch (error) {
      console.error("Erro ao analisar link do Spotify:", error);
      return null;
    }
  };

  const togglePlay = () => {
    if (!spotifyLink) return;
    
    if (!audio) {
      // Se o áudio ainda não foi inicializado, crie-o
      const newAudio = new Audio(spotifyLink);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.addEventListener('error', (e) => {
        toast.error("Não foi possível reproduzir esta música");
        console.error("Erro de áudio:", e);
        setIsPlaying(false);
      });
      setAudio(newAudio);
      
      // Começa a tocar
      newAudio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Erro ao reproduzir áudio:", err);
          toast.error("Não foi possível reproduzir esta música");
        });
    } else {
      // Alterna play/pause no áudio existente
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Erro ao reproduzir áudio:", err);
            toast.error("Não foi possível reproduzir esta música");
          });
      }
    }
  };

  const embedUrl = getSpotifyEmbedUrl(spotifyLink);

  return (
    <div className="w-full">
      {spotifyLink && (
        <div className="flex items-center gap-2 p-3 rounded-full bg-white bg-opacity-70 shadow-lg w-full justify-center">
          <button 
            onClick={togglePlay} 
            className="flex items-center gap-2 w-full justify-center"
            aria-label={isPlaying ? "Pausar música" : "Tocar música"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span className="text-sm font-medium">Música Especial</span>
          </button>
        </div>
      )}
      
      {/* iframe oculto para incorporação do Spotify (fallback) */}
      {embedUrl && (
        <iframe 
          src={embedUrl} 
          width="0" 
          height="0" 
          frameBorder="0" 
          allow="encrypted-media"
          title="Spotify Player"
          style={{display: 'none'}}
        ></iframe>
      )}
    </div>
  );
};

const ViewMemoryCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (id) {
      // Tenta obter o cartão do armazenamento primeiro
      const storedCard = getMemoryCardById(id);
      
      if (storedCard) {
        // Converte datas de string para objetos Date para formatação da UI
        const convertedCard = {
          ...storedCard,
          celebrationDate: parseDate(storedCard.celebrationDate)
        };
        setCardData(convertedCard);
        
        // Registra que encontramos o cartão
        console.log("Cartão carregado do armazenamento:", id);
      } 
      // Volta para dados simulados se não encontrado no armazenamento
      else if (id in mockCards) {
        setCardData(mockCards[id as keyof typeof mockCards]);
        console.log("Usando dados simulados para:", id);
      } else {
        console.log("Cartão não encontrado:", id);
      }
    }
  }, [id]);
  
  // Função auxiliar para analisar strings de data
  const parseDate = (dateString: string): Date | undefined => {
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
      }
      return undefined;
    } catch (error) {
      console.error("Erro ao analisar data:", error);
      return undefined;
    }
  };

  // Apresentação de slides automática para fotos
  useEffect(() => {
    if (cardData?.photos && cardData.photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % cardData.photos.length);
      }, 3000); // Muda a foto a cada 3 segundos
      
      return () => clearInterval(interval);
    }
  }, [cardData?.photos]);

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
        )} relative flex flex-col max-w-sm mx-auto aspect-[9/16]`}
      >
        <EmojiAnimation emoji={cardData.emoji} />
        
        {/* Imagem de fundo em tela cheia com apresentação de slides */}
        <div className="absolute inset-0 w-full h-full z-0">
          {cardData.photos && cardData.photos.length > 0 && (
            <>
              {cardData.photos.map((photo: string, index: number) => (
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
              {/* Sobreposição para garantir que o texto permaneça legível */}
              <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-10"></div>
            </>
          )}
        </div>
        
        <div className="flex flex-col justify-between items-center h-full p-6 relative z-20">
          <div className="text-center flex flex-col items-center justify-start w-full mt-8 space-y-4">
            <h1 className="text-3xl md:text-4xl fancy-text mb-2 text-white text-center">
              {cardData.eventName}
            </h1>
            
            <div className="w-16 h-1 bg-white opacity-60 my-2"></div>
            
            <h2 className="text-2xl md:text-3xl font-light mb-4 text-white">
              {cardData.personName}
            </h2>
          </div>
          
          {/* Área de conteúdo principal */}
          <div className="flex flex-col items-center mb-4">
            {cardData.celebrationDate && (
              <div className="mb-4 text-center">
                <p className="text-sm uppercase tracking-wider text-white opacity-90 mb-1">
                  Data da Celebração
                </p>
                <p className="text-lg font-medium text-white">
                  {formatDate(cardData.celebrationDate)}
                </p>
              </div>
            )}
          </div>
          
          {/* Seção de rodapé com player de música na parte inferior */}
          <div className="w-full mt-auto flex flex-col items-center space-y-4">
            <div className="w-16 h-1 bg-white opacity-60"></div>
            
            <div className="text-sm text-white opacity-70 mb-2">
              Cartão de Memória • Com carinho
            </div>
            
            {/* Player de música posicionado na parte inferior */}
            <MusicPlayer spotifyLink={cardData.spotifyLink} />
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
