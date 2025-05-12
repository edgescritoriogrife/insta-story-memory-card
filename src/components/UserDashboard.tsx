
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { MemoryCard } from "@/utils/storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, LogOut, CreditCard } from "lucide-react";
import { supabaseService } from "@/services/supabaseService";
import { paymentService } from "@/services/paymentService"; 
import { useAuth } from "@/providers/AuthProvider";

export const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  
  // Extrair parâmetros da URL para verificar status de pagamento
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('payment');
  const cardId = queryParams.get('card_id');
  const sessionId = queryParams.get('session_id');
  
  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Carregar cartões
    loadCards();
    
    // Verificar status de pagamento, se houver
    if (paymentStatus === 'success' && cardId && sessionId) {
      verifyPayment(sessionId);
    } else if (paymentStatus === 'success' && cardId) {
      toast.success("Pagamento realizado com sucesso!");
      // Limpar parâmetros da URL
      navigate('/dashboard', { replace: true });
      // Recarregar cartões para atualizar status
      loadCards();
    } else if (paymentStatus === 'canceled') {
      toast.error("Pagamento cancelado");
      // Limpar parâmetros da URL
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, paymentStatus, cardId, sessionId]);
  
  // Função para verificar pagamento
  const verifyPayment = async (sessionId: string) => {
    try {
      const result = await paymentService.verifyPaymentStatus(sessionId);
      if (result && result.success) {
        toast.success("Pagamento confirmado com sucesso!");
        // Recarregar cartões para mostrar status atualizado
        loadCards();
      } else {
        toast.error("Não foi possível confirmar o pagamento. Tente novamente mais tarde.");
      }
      // Limpar parâmetros da URL
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
      toast.error("Erro ao verificar pagamento");
      // Limpar parâmetros da URL
      navigate('/dashboard', { replace: true });
    }
  };
  
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

  const handlePayment = async (id: string) => {
    try {
      setProcessingPayment(id);
      const result = await paymentService.createCheckoutSession(id);
      
      if (result && result.url) {
        // Redirecionar para a página de checkout do Stripe
        window.location.href = result.url;
      } else {
        toast.error("Erro ao processar pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);
      toast.error("Erro ao iniciar pagamento");
    } finally {
      setProcessingPayment(null);
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
                  <div>
                    <p className="font-medium">Status:</p>
                    <p className={card.is_paid ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                      {card.is_paid ? "Pago" : "Pendente de Pagamento"}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center md:col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLinkToClipboard(card.id)}
                      disabled={!card.is_paid}
                      title={!card.is_paid ? "Faça o pagamento para compartilhar" : "Copiar link"}
                    >
                      Copiar Link
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => viewCard(card.id)}
                      disabled={!card.is_paid}
                      title={!card.is_paid ? "Faça o pagamento para visualizar" : "Ver cartão"}
                    >
                      Ver Cartão
                    </Button>
                    {!card.is_paid && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handlePayment(card.id)}
                        disabled={processingPayment === card.id}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      >
                        {processingPayment === card.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" /> 
                            Pagar R$17,90
                          </>
                        )}
                      </Button>
                    )}
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
