
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Music, Heart, Star, Bookmark } from "lucide-react";
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

type MemoryCardData = {
  eventName: string;
  personName: string;
  celebrationDate: Date | undefined;
  spotifyLink: string;
  emoji: string;
  theme: string;
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
