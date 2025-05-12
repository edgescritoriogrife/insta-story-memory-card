
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MemoryCard } from "@/utils/storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, LogOut } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/providers/AuthProvider";

export const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Carregar cartões
    loadCards();
  }, [user, navigate]);
  
  // Função para atualizar cartões do Supabase
  const loadCards = async () => {
    setLoading(true);
    try {
      const cards = await supabaseService.getMemoryCards();
      setMemoryCards(cards);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
      toast.error("Erro ao carregar cartões");
    } finally {
      setLoading(false);
    }
  };
  
  const copyLinkToClipboard = (id: string) => {
    // Obter a URL base atual
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/memory/${id}`;
    
    navigator.clipboard.writeText(fullLink);
    toast("Link copiado para a área de transferência!");
  };

  const viewCard = (id: string) => {
    navigate(`/memory/${id}`);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  
  const handleDeleteCard = async (id: string) => {
    try {
      const success = await supabaseService.deleteMemoryCard(id);
      if (success) {
        setMemoryCards((prev) => prev.filter(card => card.id !== id));
        toast.success("Cartão removido com sucesso");
      } else {
        toast.error("Erro ao remover cartão");
      }
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      toast.error("Erro ao remover cartão");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto my-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl font-bold text-center md:text-left fancy-text text-purple-700 mb-4 md:mb-0">
          Meus Cartões de Memória
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="self-center md:self-auto flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full w-48 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full w-32"></div>
          </div>
        </div>
      )}

      {!loading && memoryCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Você ainda não criou nenhum cartão de memória.</p>
          <Button onClick={() => navigate("/")}>Criar Meu Primeiro Cartão</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {memoryCards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{card.eventName}</CardTitle>
                    <CardDescription className="text-gray-700">
                      {card.personName}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
