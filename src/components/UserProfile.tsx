
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, User } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
          toast.error("Não foi possível carregar as informações do perfil.");
          return;
        }

        setProfile(data as Profile);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        toast.error("Erro ao carregar informações do perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Perfil</CardTitle>
        <CardDescription>Suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || ""} alt="Foto de perfil" />
            <AvatarFallback className="text-lg bg-purple-100 text-purple-700">
              {getInitials(profile?.full_name || user?.email)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-4 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-medium flex items-center justify-center sm:justify-start gap-2">
                <User className="h-4 w-4 text-purple-600" /> 
                Nome
              </h3>
              <p className="text-gray-600">{profile?.full_name || "Não informado"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-4 w-4 text-purple-600" /> 
                Email
              </h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
