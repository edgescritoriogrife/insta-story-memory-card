
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getMemoryCardById } from "@/utils/storage";
import { toast } from "sonner";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { MemoryCardContent } from "@/components/MemoryCardContent";
import { parseDate } from "@/utils/dateUtils";

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

const ViewMemoryCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      // Tenta obter o cartão do armazenamento
      const storedCard = getMemoryCardById(id);
      
      console.log("Tentando carregar cartão:", id);
      console.log("Resultado da busca:", storedCard ? "Encontrado" : "Não encontrado");
      
      if (storedCard) {
        try {
          // Converte datas de string para objetos Date para formatação da UI se necessário
          const dateObj = parseDate(storedCard.celebrationDate);
          
          const convertedCard = {
            ...storedCard,
            // Só converte se conseguiu fazer o parsing, senão mantém a string original
            celebrationDate: dateObj || storedCard.celebrationDate
          };
          
          setCardData(convertedCard);
          console.log("Cartão carregado do armazenamento:", id);
        } catch (error) {
          console.error("Erro ao processar cartão:", error);
          // Mesmo com erro de processamento, usa o cartão original
          setCardData(storedCard);
          toast.error("Erro ao processar dados do cartão");
        }
      } 
      // Volta para dados simulados se não encontrado no armazenamento
      else if (id in mockCards) {
        setCardData(mockCards[id as keyof typeof mockCards]);
        console.log("Usando dados simulados para:", id);
        toast("Usando dados de exemplo (cartão não encontrado no armazenamento)");
      } else {
        console.log("Cartão não encontrado:", id);
        toast.error("Cartão não encontrado");
      }
    }
  }, [id]);

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
      <MemoryCardContent cardData={cardData} />
      
      {/* Player do Spotify abaixo do cartão com espaço aumentado */}
      {cardData.spotifyLink && (
        <div className="mt-8">
          <SpotifyPlayer spotifyLink={cardData.spotifyLink} />
        </div>
      )}
      
      <div className="mt-8">
        <Button asChild variant="outline" className="text-white bg-purple-900 hover:bg-purple-800 border-purple-700">
          <Link to="/">Criar seu próprio Cartão</Link>
        </Button>
      </div>
    </div>
  );
};

export default ViewMemoryCard;
