
import React, { useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

const Auth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
          <p className="text-purple-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              MemóriasCard © {new Date().getFullYear()}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Cartões de memória digitais para momentos especiais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
