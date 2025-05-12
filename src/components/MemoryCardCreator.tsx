import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { MemoryCard } from "@/utils/storage";
import { supabase } from "@/integrations/supabase/client";

interface MemoryCardCreatorProps {
  // onCardSave: (cardData: MemoryCard) => void;
}

const MemoryCardCreator = () => {
  const [eventName, setEventName] = useState("");
  const [personName, setPersonName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [spotifyLink, setSpotifyLink] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [theme, setTheme] = useState("default");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 30)));
  const [loading, setLoading] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  // Verificar autenticação ao carregar o componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        const isAuth = !!user && !error;
        setIsUserAuthenticated(isAuth);
        
        if (!isAuth) {
          toast.error("Você precisa estar logado para criar um cartão.");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsUserAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSave = async (cardToSave: MemoryCard) => {
    try {
      setLoading(true);

      if (!eventName || !personName || !date) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
      
      if (!isUserAuthenticated) {
        toast.error("Você precisa estar logado para salvar um cartão.");
        navigate('/auth');
        return;
      }

      const cardId = uuidv4();
      const formattedDate = date ? date.toISOString() : new Date().toISOString();
      const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();

      const cardData: MemoryCard = {
        id: cardId,
        eventName,
        personName,
        celebrationDate: formattedDate,
        spotifyLink,
        emoji,
        theme,
        message,
        photos,
        createdAt: new Date().toISOString(),
        expiresAt: formattedExpiresAt,
      };

      // Salvar o cartão no Supabase
      const savedCard = await supabaseService.saveMemoryCard(cardData);

      if (savedCard) {
        toast.success("Cartão de memória criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar o cartão:", error);
      
      // Se o erro for de autenticação, redirecionar para login
      if (error instanceof Error && error.message === "Usuário não autenticado") {
        navigate('/auth');
      } else {
        toast.error("Erro ao salvar o cartão. Verifique se você está logado.");
      }
    } finally {
      setLoading(false);
      // Limpar os campos após salvar
      setEventName("");
      setPersonName("");
      setDate(undefined);
      setSpotifyLink("");
      setEmoji("🎉");
      setTheme("default");
      setMessage("");
      setPhotos([]);
      setExpiresAt(new Date(new Date().setDate(new Date().getDate() + 30)));
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (file) {
      try {
        // Fazer upload da imagem para o Supabase
        return await supabaseService.uploadPhoto(file, 'memory-cards');
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        toast.error("Erro ao fazer upload da imagem");
        return null;
      }
    }
    return null;
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          return await handleImageUpload(file);
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedUrls.filter(url => url !== null) as string[];

        setPhotos(prevPhotos => [...prevPhotos, ...validUrls]);
        toast.success("Fotos adicionadas com sucesso!");
      } catch (error) {
        console.error("Erro ao adicionar fotos:", error);
        toast.error("Erro ao adicionar fotos");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!eventName || !personName || !date) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    if (!isUserAuthenticated) {
      toast.error("Você precisa estar logado para salvar um cartão.");
      navigate('/auth');
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Salvando seu cartão...");

      const cardId = uuidv4();
      const formattedDate = date ? date.toISOString() : new Date().toISOString();
      const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();

      const cardData: MemoryCard = {
        id: cardId,
        eventName,
        personName,
        celebrationDate: formattedDate,
        spotifyLink,
        emoji,
        theme,
        message,
        photos,
        createdAt: new Date().toISOString(),
        expiresAt: formattedExpiresAt,
      };

      // Salvar o cartão no Supabase
      const savedCard = await supabaseService.saveMemoryCard(cardData);

      if (savedCard) {
        toast.success("Cartão criado com sucesso!");
        // Redirecionar para o dashboard com um parâmetro de consulta para destacar o novo cartão
        navigate("/dashboard?new_card=" + savedCard.id);
      }
    } catch (error) {
      console.error("Erro ao salvar o cartão:", error);
      
      // Se o erro for de autenticação, redirecionar para login
      if (error instanceof Error && error.message === "Usuário não autenticado") {
        navigate('/auth');
      } else {
        toast.error("Erro ao salvar o cartão. Verifique se você está logado.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Se o status de autenticação ainda estiver sendo verificado, mostre um indicador de carregamento
  if (isUserAuthenticated === null) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 flex justify-center items-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, mostre uma mensagem e um botão para redirecionar para login
  if (isUserAuthenticated === false) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center fancy-text text-purple-600">
          Autenticação Necessária
        </h2>
        <p className="text-center mb-4">
          Você precisa estar logado para criar um cartão de memória.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/auth')} className="w-full md:w-auto">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center fancy-text text-purple-600">
        Crie seu Cartão de Memória
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="eventName">Nome do Evento</Label>
          <Input
            type="text"
            id="eventName"
            placeholder="Ex: Aniversário, Casamento..."
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="personName">Nome da Pessoa</Label>
          <Input
            type="text"
            id="personName"
            placeholder="Ex: João, Maria..."
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Data da Celebração</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date(new Date().setDate(new Date().getDate() - 1))
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="expiresAt">Data de Expiração</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expiresAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiresAt ? format(expiresAt, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={setExpiresAt}
                disabled={(date) =>
                  date < new Date(new Date().setDate(new Date().getDate() - 1))
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="spotifyLink">Link do Spotify (opcional)</Label>
          <Input
            type="url"
            id="spotifyLink"
            placeholder="Ex: https://open.spotify.com/..."
            value={spotifyLink}
            onChange={(e) => setSpotifyLink(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emoji">Emoji</Label>
          <Input
            type="text"
            id="emoji"
            placeholder="Ex: 🎉, 🎂..."
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="theme">Tema</Label>
          <Input
            type="text"
            id="theme"
            placeholder="Ex: default, dark..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="message">Mensagem (opcional)</Label>
          <Input
            type="text"
            id="message"
            placeholder="Escreva uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="photos">Fotos (opcional)</Label>
          <Input
            type="file"
            id="photos"
            multiple
            accept="image/*"
            onChange={handleAddPhoto}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Imagem ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 bg-white/50 text-gray-700 hover:text-red-500"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={loading || submitting} className="w-full">
          {loading ? "Salvando..." : "Salvar Cartão"}
        </Button>
      </form>
    </div>
  );
};

export default MemoryCardCreator;
