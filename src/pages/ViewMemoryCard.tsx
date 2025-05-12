
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { MemoryCardContent } from "@/components/MemoryCardContent";
import { parseDate } from "@/utils/dateUtils";
import { supabaseService } from "@/services/supabaseService";
import { MemoryCard } from "@/utils/storage";

const ViewMemoryCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      console.log("Tentando carregar cartão:", id);
      setIsLoading(true);
      
      async function fetchCard() {
        try {
          // Tenta obter o cartão do Supabase
          const storedCard = await supabaseService.getMemoryCard(id);
          
          console.log("Resultado da busca:", storedCard ? "Encontrado" : "Não encontrado");
          
          if (storedCard) {
            // Verificar se o cartão foi pago
            if (!storedCard.is_paid) {
              console.log("Cartão não pago:", id);
              toast.error("Este cartão ainda não foi pago e não pode ser visualizado");
              setCardData(null);
              setIsLoading(false);
              return;
            }
            
            try {
              // Converte datas de string para objetos Date para formatação da UI se necessário
              const dateObj = parseDate(storedCard.celebrationDate);
              
              const convertedCard = {
                ...storedCard,
                // Só converte se conseguiu fazer o parsing, senão mantém a string original
                celebrationDate: dateObj || storedCard.celebrationDate
              };
              
              setCardData(convertedCard);
              console.log("Cartão carregado do Supabase:", id);
              
              // Confirma que o cartão foi carregado com sucesso
              toast.success("Cartão carregado com sucesso");
            } catch (error) {
              console.error("Erro ao processar cartão:", error);
              // Mesmo com erro de processamento, usa o cartão original
              setCardData(storedCard);
              toast.error("Erro ao processar dados do cartão");
            }
          } else {
            console.log("Cartão não encontrado:", id);
            toast.error("Cartão não encontrado");
            setCardData(null);
          }
        } catch (error) {
          console.error("Erro ao buscar cartão:", error);
          toast.error("Erro ao buscar cartão");
          setCardData(null);
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchCard();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando cartão...</h1>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cartão não encontrado</h1>
          <p className="mb-4 text-gray-600">O cartão que você está procurando não existe, não foi pago ou foi removido.</p>
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
