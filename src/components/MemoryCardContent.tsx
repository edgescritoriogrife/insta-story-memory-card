
import React, { useState, useEffect } from "react";
import { EmojiAnimation } from "./EmojiAnimation";
import { formatDate } from "@/utils/dateUtils";

type MemoryCardContentProps = {
  cardData: {
    eventName: string;
    personName: string;
    celebrationDate: Date | undefined;
    emoji: string;
    theme: string;
    message?: string; // Campo de mensagem opcional
    photos: string[] | undefined | null;
  };
};

export const MemoryCardContent = ({ cardData }: MemoryCardContentProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Apresentação de slides automática para fotos
  useEffect(() => {
    if (cardData?.photos && cardData.photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % cardData.photos!.length);
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

  return (
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
            {/* Fundo semi-transparente para melhor legibilidade */}
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
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
        
        {/* Seção de rodapé */}
        <div className="w-full mt-auto flex flex-col items-center space-y-4">
          {/* Exibição da mensagem personalizada */}
          {cardData.message && (
            <div className="mb-4 text-center px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
              <p className="text-white leading-relaxed italic">
                "{cardData.message}"
              </p>
            </div>
          )}
          
          <div className="w-16 h-1 bg-white opacity-60"></div>
          
          <div className="text-sm text-white opacity-70 mb-2">
            Cartão de Memória • Com carinho
          </div>
        </div>
      </div>
    </div>
  );
};
