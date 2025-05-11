
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMemoryCards, MemoryCard } from "@/utils/storage";

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  
  useEffect(() => {
    // Load memory cards from storage when component mounts
    const cards = getMemoryCards();
    setMemoryCards(cards);
  }, []);
  
  const copyLinkToClipboard = (id: string) => {
    // Get the current base URL from the window location
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/memory/${id}`;
    
    navigator.clipboard.writeText(fullLink);
    toast("Link copiado para a área de transferência!");
  };

  const viewCard = (id: string) => {
    navigate(`/memory/${id}`);
  };

  return (
    <div className="container max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold mb-8 text-center fancy-text text-purple-700">
        Meus Cartões de Memória
      </h1>

      {memoryCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Você ainda não criou nenhum cartão de memória.</p>
          <Button onClick={() => navigate("/")}>Criar Meu Primeiro Cartão</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {memoryCards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <CardTitle>{card.eventName}</CardTitle>
                <CardDescription className="text-gray-700">
                  {card.personName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <p className="font-medium">Data da Celebração:</p>
                    <p>{card.celebrationDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Criado em:</p>
                    <p>{card.createdAt}</p>
                  </div>
                  <div>
                    <p className="font-medium">Expira em:</p>
                    <p>{card.expiresAt}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLinkToClipboard(card.id)}
                    >
                      Copiar Link
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => viewCard(card.id)}
                    >
                      Ver Cartão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
