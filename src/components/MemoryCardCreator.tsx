
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Music, Upload, Image, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type MemoryCardData = {
  eventName: string;
  personName: string;
  celebrationDate: Date | undefined;
  spotifyLink: string;
  emoji: string;
  theme: string;
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
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "preview" | "payment">("form");
  const [formData, setFormData] = useState<MemoryCardData>({
    eventName: "",
    personName: "",
    celebrationDate: undefined,
    spotifyLink: "",
    emoji: "❤️",
    theme: "pink",
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
          toast({
            title: "Arquivo muito grande",
            description: `${file.name} é maior que 5MB. Será ignorado.`,
            variant: "destructive",
          });
          processedFiles++;
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Tipo de arquivo inválido",
            description: `${file.name} não é uma imagem válida. Será ignorado.`,
            variant: "destructive",
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
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do evento.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.personName) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome da pessoa ou casal.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.celebrationDate) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione a data da celebração.",
        variant: "destructive",
      });
      return;
    }

    if (formData.spotifyLink && !validateSpotifyLink(formData.spotifyLink)) {
      toast({
        title: "Link inválido",
        description: "Por favor, insira um link válido do Spotify.",
        variant: "destructive",
      });
      return;
    }

    setStep("preview");
  };

  const handlePayment = () => {
    // This would be connected to a payment processor in a real app
    toast({
      title: "Processando pagamento",
      description: "R$ 27,90 - Processando...",
    });
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Pagamento confirmado!",
        description: "Seu cartão de memória foi salvo na sua dashboard.",
      });
      setStep("form");
      // Reset form data after successful payment
      setFormData({
        eventName: "",
        personName: "",
        celebrationDate: undefined,
        spotifyLink: "",
        emoji: "❤️",
        theme: "pink",
        photos: null,
      });
    }, 2000);
  };

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
