
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MemoryCard = {
  id: string;
  eventName: string;
  personName: string;
  celebrationDate: string;
  createdAt: string;
  expiresAt: string;
  link: string;
};

// Mock data for the dashboard
const mockMemoryCards: MemoryCard[] = [
  {
    id: "1",
    eventName: "Aniversário de Casamento",
    personName: "Maria e João",
    celebrationDate: "15/06/2025",
    createdAt: "15/06/2024",
    expiresAt: "15/06/2025",
    link: "#memory-1",
  },
  {
    id: "2",
    eventName: "Dia das Mães",
    personName: "Ana Silva",
    celebrationDate: "14/05/2025",
    createdAt: "10/05/2024",
    expiresAt: "10/05/2025",
    link: "#memory-2",
  },
];

export const UserDashboard = () => {
  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(`https://memorycards.com${link}`);
    // In a real app, you would show a toast notification here
  };

  return (
    <div className="container max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold mb-8 text-center fancy-text text-purple-700">
        Meus Cartões de Memória
      </h1>

      <div className="grid gap-6">
        {mockMemoryCards.map((card) => (
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
                    onClick={() => copyLinkToClipboard(card.link)}
                  >
                    Copiar Link
                  </Button>
                  <Button size="sm" asChild>
                    <a href={card.link} target="_blank" rel="noopener noreferrer">
                      Ver Cartão
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
