
import React from "react";
import { Link } from "react-router-dom";
import { UserDashboard } from "@/components/UserDashboard";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold fancy-text text-purple-700">
            <Link to="/">MemóriasCard</Link>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/profile" className="flex items-center gap-1">
                <User className="h-4 w-4" /> Meu Perfil
              </Link>
            </Button>
            <Button asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" /> Criar Novo Cartão
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <UserDashboard />
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t text-center text-sm text-gray-600">
        <p>MemóriasCard © {new Date().getFullYear()}</p>
        <p className="mt-2">Cartões de memória digitais para momentos especiais</p>
      </footer>
    </div>
  );
};

export default Dashboard;
