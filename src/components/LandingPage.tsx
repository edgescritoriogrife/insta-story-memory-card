
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Calendar, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-100 to-pink-100 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-purple-800 fancy-text leading-tight">
                Crie memórias digitais para momentos especiais
              </h1>
              <p className="text-lg md:text-xl mb-8 text-purple-700 max-w-lg mx-auto lg:mx-0">
                Transforme suas mensagens em lindos cartões digitais para comemorar datas especiais e compartilhe com quem você ama.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-200 text-purple-800 font-medium">
                  <Heart className="h-4 w-4" /> Dia das Mães
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-200 text-pink-800 font-medium">
                  <Gift className="h-4 w-4" /> Aniversários
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-200 text-blue-800 font-medium">
                  <Calendar className="h-4 w-4" /> Datas Especiais
                </span>
              </div>
              <Button size="lg" className="px-8" asChild>
                <Link to={user ? "/dashboard" : "/auth"}>
                  {user ? "Meus Cartões" : "Comece Agora"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="relative mx-auto max-w-sm">
                <div className="w-full rounded-2xl overflow-hidden shadow-2xl transform rotate-3 bg-white p-3">
                  <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-b from-red-100 to-pink-200 p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-5xl mb-4">💐</div>
                    <h3 className="text-2xl font-bold mb-2 fancy-text text-pink-800">Feliz Dia das Mães!</h3>
                    <p className="text-sm text-pink-800">Para a melhor mãe do mundo. Com todo meu amor e carinho.</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-full rounded-2xl overflow-hidden shadow-xl transform -rotate-6 bg-white p-3">
                  <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gradient-to-b from-blue-100 to-cyan-200 p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-5xl mb-4">🎂</div>
                    <h3 className="text-2xl font-bold mb-2 fancy-text text-cyan-800">Feliz Aniversário!</h3>
                    <p className="text-sm text-cyan-800">Desejo um dia maravilhoso cheio de alegria e surpresas!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center fancy-text text-purple-700">
            Crie cartões digitais em minutos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-purple-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-purple-800">Cartões Personalizados</h3>
              <p className="text-purple-700">Personalize seus cartões com mensagens, emojis e escolha entre vários temas.</p>
            </div>
            
            <div className="bg-pink-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-pink-800">Expressão de Carinho</h3>
              <p className="text-pink-700">Demonstre seu amor e carinho em datas especiais com mensagens significativas.</p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-800">Compartilhamento Fácil</h3>
              <p className="text-blue-700">Compartilhe seus cartões com amigos e familiares através de um link exclusivo.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg" className="px-8" variant="outline" asChild>
              <Link to="/auth">Criar Meu Primeiro Cartão</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center fancy-text text-purple-700">
            O que as pessoas estão dizendo
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-purple-800">MF</span>
                </div>
                <div>
                  <h4 className="font-bold">Maria Fernanda</h4>
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-700">"Criei um cartão lindo para o aniversário da minha mãe. Ela adorou e se emocionou com a mensagem personalizada!"</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-blue-800">JS</span>
                </div>
                <div>
                  <h4 className="font-bold">João Silva</h4>
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-700">"Interface super intuitiva! Consegui criar um cartão em menos de 5 minutos para o aniversário de casamento!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-purple-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 fancy-text">
            Pronto para criar suas memórias?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Crie cartões digitais ilimitados para todas as ocasiões especiais e compartilhe suas mensagens de carinho.
          </p>
          <Button size="lg" className="bg-white text-purple-800 hover:bg-gray-100" asChild>
            <Link to="/auth">
              Comece gratuitamente <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
