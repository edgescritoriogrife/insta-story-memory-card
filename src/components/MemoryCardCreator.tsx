import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Music, Upload, Image, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { MemoryCardPreview } from "./MemoryCardPreview";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";
import { saveMemoryCard } from "@/utils/storage";

type MemoryCardData = {
  eventName: string;
  personName: string;
  celebrationDate: Date | undefined;
  spotifyLink: string;
  emoji: string;
  theme: string;
  message: string; // Nova propriedade para a mensagem
  photos: string[] | null; // Changed from photo to photos array
};

const emojis = ["❤️", "🌟", "🎉", "🎂", "💐", "💍", "🎊", "🎁", "✨", "💖"];
const themes = [
  { name: "Rosa Romântico", value: "pink" },
  { name: "Lavanda Suave", value: "purple" },
  { name: "Azul Celeste", value: "blue" },
  { name: "Verde Menta", value: "mint" },
  { name: "Dourado Elegante", value: "gold" },
  { name: "Creme Clássico", value: "cream" },
];

export const MemoryCardCreator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "preview" | "payment" | "processing">("form");
  const [formData, setFormData] = useState<MemoryCardData>({
    eventName: "",
    personName: "",
    celebrationDate: undefined,
    spotifyLink: "",
    emoji: "❤️",
    theme: "pink",
    message: "", // Inicialização do campo de mensagem
    photos: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, celebrationDate: date }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Create an array to store all processed photos
      const newPhotos: string[] = [];
      const existingPhotos = formData.photos || [];
      const totalFiles = e.target.files.length;
      let processedFiles = 0;
      
      // Process each file
      Array.from(e.target.files).forEach((file) => {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Arquivo muito grande", {
            description: `${file.name} é maior que 5MB. Será ignorado.`
          });
          processedFiles++;
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error("Tipo de arquivo inválido", {
            description: `${file.name} não é uma imagem válida. Será ignorado.`
          });
          processedFiles++;
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
            
            // Update the form data after all files are processed
            processedFiles++;
            if (processedFiles === totalFiles) {
              setFormData((prev) => ({
                ...prev,
                photos: [...existingPhotos, ...newPhotos]
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (indexToRemove: number) => {
    if (formData.photos) {
      const updatedPhotos = formData.photos.filter((_, index) => index !== indexToRemove);
      setFormData((prev) => ({
        ...prev,
        photos: updatedPhotos.length > 0 ? updatedPhotos : null
      }));
    }
  };

  const validateSpotifyLink = (link: string) => {
    return (
      link.includes("spotify.com") ||
      link.includes("open.spotify.com") ||
      link === ""
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.eventName) {
      toast.error("Campo obrigatório", {
        description: "Por favor, informe o nome do evento."
      });
      return;
    }
    
    if (!formData.personName) {
      toast.error("Campo obrigatório", {
        description: "Por favor, informe o nome da pessoa ou casal."
      });
      return;
    }
    
    if (!formData.celebrationDate) {
      toast.error("Campo obrigatório", {
        description: "Por favor, selecione a data da celebração."
      });
      return;
    }

    if (formData.spotifyLink && !validateSpotifyLink(formData.spotifyLink)) {
      toast.error("Link inválido", {
        description: "Por favor, insira um link válido do Spotify."
      });
      return;
    }

    setStep("preview");
  };

  const handlePayment = () => {
    // Show processing state
    setStep("processing");
    
    // This would be connected to a payment processor in a real app
    const toastId = toast.loading("Processando pagamento...");
    
    // Simulate payment processing
    setTimeout(() => {
      // Dismiss the loading toast
      toast.dismiss(toastId);
      
      // Generate a unique ID for the memory card
      const cardId = `memory-${Date.now()}`;
      
      // Calculate creation and expiration dates
      const now = new Date();
      const createdAt = format(now, "dd/MM/yyyy");
      
      // Set expiration date to 1 year from now
      const expiresAt = format(new Date(now.setFullYear(now.getFullYear() + 1)), "dd/MM/yyyy");
      
      // Create the memory card object
      const memoryCard = {
        id: cardId,
        eventName: formData.eventName,
        personName: formData.personName,
        celebrationDate: formData.celebrationDate ? format(formData.celebrationDate, "dd/MM/yyyy") : "",
        spotifyLink: formData.spotifyLink,
        emoji: formData.emoji,
        theme: formData.theme,
        message: formData.message, // Adicionando a mensagem ao cartão
        photos: formData.photos,
        createdAt,
        expiresAt
      };
      
      // Save the memory card to storage
      const saveSuccess = saveMemoryCard(memoryCard);
      
      if (saveSuccess) {
        toast.success("Pagamento confirmado! Seu cartão foi salvo.");
        
        // Navigate to dashboard after successful payment
        setTimeout(() => navigate(`/memory/${cardId}`), 1000);
      } else {
        toast.error("Erro ao salvar o cartão. O armazenamento pode estar cheio.");
        setStep("preview"); // Return to preview step so they can try again
      }
    }, 2000);
  };

  // Processing view
  if (step === "processing") {
    return (
      <div className="bg-white p-12 rounded-lg shadow-lg text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-purple-200 rounded-full mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 fancy-text text-purple-600">Processando Pagamento</h2>
          <p className="text-gray-600 mb-6">Por favor, aguarde enquanto processamos seu pagamento...</p>
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {step === "form" && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center fancy-text text-purple-600">
            Crie seu Cartão de Memória
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventName">Nome da Data Especial</Label>
              <Input
                id="eventName"
                name="eventName"
                placeholder="Ex: Dia das Mães, Aniversário de Casamento"
                value={formData.eventName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personName">Nome da Pessoa ou Casal</Label>
              <Input
                id="personName"
                name="personName"
                placeholder="Ex: Maria e João"
                value={formData.personName}
                onChange={handleChange}
              />
            </div>
            
            {/* Novo campo de mensagem */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Escreva uma mensagem especial para este cartão..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="celebrationDate">Data da Celebração</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.celebrationDate ? (
                      format(formData.celebrationDate, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.celebrationDate}
                    onSelect={handleDateSelect}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photos">Adicionar Fotos</Label>
              <div className="space-y-4">
                {/* Photo upload button */}
                <div className="flex items-center gap-4">
                  <Label 
                    htmlFor="photo-upload" 
                    className="flex flex-col items-center justify-center w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Image className="w-8 h-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Escolher fotos</span>
                  </Label>
                  <div className="text-sm text-gray-500">
                    <p>Formato: JPG, PNG</p>
                    <p>Tamanho máximo: 5MB por foto</p>
                  </div>
                  <input
                    id="photo-upload"
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                
                {/* Preview of uploaded photos */}
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-4">
                    <Label className="block mb-2">Fotos Selecionadas</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Foto ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-md" 
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spotifyLink">Link da Música no Spotify (opcional)</Label>
              <Input
                id="spotifyLink"
                name="spotifyLink"
                placeholder="https://open.spotify.com/track/..."
                value={formData.spotifyLink}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji para Animação</Label>
              <Select
                value={formData.emoji}
                onValueChange={(value) => handleSelectChange("emoji", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha um emoji" />
                </SelectTrigger>
                <SelectContent>
                  {emojis.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      <span className="text-lg mr-2">{emoji}</span> {emoji}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Tema do Cartão</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => handleSelectChange("theme", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha um tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full">
              Avançar para Visualização
            </Button>
          </form>
        </div>
      )}

      {step === "preview" && (
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="w-full md:w-1/2 md:max-w-sm">
            <MemoryCardPreview data={formData} />
          </div>
          <div className="w-full md:w-1/2 space-y-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center fancy-text text-purple-600">
              Seu Cartão de Memória
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Nome do Evento:</p>
                <p>{formData.eventName}</p>
              </div>
              <div>
                <p className="font-medium">Nome da Pessoa/Casal:</p>
                <p>{formData.personName}</p>
              </div>
              {formData.message && (
                <div>
                  <p className="font-medium">Mensagem:</p>
                  <p className="text-sm">{formData.message}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Data da Celebração:</p>
                <p>
                  {formData.celebrationDate
                    ? format(formData.celebrationDate, "dd/MM/yyyy")
                    : "Não definida"}
                </p>
              </div>
              {formData.photos && formData.photos.length > 0 && (
                <div>
                  <p className="font-medium">Fotos ({formData.photos.length}):</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="w-16 h-16">
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="font-medium">Emoji:</p>
                <p className="text-2xl">{formData.emoji}</p>
              </div>
              {formData.spotifyLink && (
                <div>
                  <p className="font-medium">Música:</p>
                  <p className="truncate text-sm">{formData.spotifyLink}</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="mb-6">
                <p className="text-lg font-bold">Preço:</p>
                <p className="text-xl text-purple-600 font-bold">R$ 27,90</p>
                <p className="text-sm text-gray-500">Acesso por 1 ano</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("form")}
                  className="w-full"
                >
                  Editar
                </Button>
                <Button onClick={handlePayment} className="w-full">
                  Finalizar Pagamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
