
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/UserProfile";
import { PaymentsHistory } from "@/components/PaymentsHistory";
import { UserDashboard } from "@/components/UserDashboard";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold fancy-text text-purple-700">
            <Link to="/">MemóriasCard</Link>
          </div>
          <Button asChild>
            <Link to="/">Criar Novo Cartão</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <UserProfile />
          <PaymentsHistory />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Seus Cartões</h2>
            <UserDashboard hideHeader={true} />
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t text-center text-sm text-gray-600">
        <p>MemóriasCard © {new Date().getFullYear()}</p>
        <p className="mt-2">Cartões de memória digitais para momentos especiais</p>
      </footer>
    </div>
  );
};

export default Profile;
