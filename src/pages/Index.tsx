
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MemoryCardCreator } from "@/components/MemoryCardCreator";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold fancy-text text-purple-700">MemóriasCard</div>
          <div className="flex gap-4">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Meus Cartões</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" /> Entrar
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 fancy-text text-purple-700">
            Cartões de Memória
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Crie lindos cartões digitais para comemorar datas especiais e compartilhe com quem você ama.
          </p>
          <div className="flex justify-center items-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              <Heart className="h-4 w-4" /> Dia das Mães
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 text-pink-700">
              <Heart className="h-4 w-4" /> Aniversários
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              <Heart className="h-4 w-4" /> Casamentos
            </span>
          </div>
        </section>

        <MemoryCardCreator />
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t text-center text-sm text-gray-600">
        <p>MemóriasCard © {new Date().getFullYear()}</p>
        <p className="mt-2">Cartões de memória digitais para momentos especiais</p>
      </footer>
    </div>
  );
};

export default Index;
