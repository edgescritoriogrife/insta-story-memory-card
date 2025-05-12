
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/dateUtils";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  currency: string;
  memory_card_id: string | null;
  memory_card?: {
    event_name: string;
    person_name: string;
  } | null;
}

export const PaymentsHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            memory_card:memory_card_id (
              event_name,
              person_name
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar histórico de pagamentos:", error);
          toast.error("Não foi possível carregar o histórico de pagamentos.");
          return;
        }

        setPayments(data || []);
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
        toast.error("Erro ao carregar histórico de pagamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    
    return formatter.format(amount / 100);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'success':
        return <span className="text-green-600 font-medium">Aprovado</span>;
      case 'pending':
        return <span className="text-amber-600 font-medium">Pendente</span>;
      case 'failed':
        return <span className="text-red-600 font-medium">Falhou</span>;
      case 'canceled':
        return <span className="text-gray-600 font-medium">Cancelado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Seus pagamentos aparecerão aqui</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">
            Você ainda não realizou nenhum pagamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <CardDescription>Todos os seus pagamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cartão</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(new Date(payment.created_at))}</TableCell>
                <TableCell>
                  {payment.memory_card ? (
                    <span>
                      {payment.memory_card.event_name} ({payment.memory_card.person_name})
                    </span>
                  ) : (
                    <span className="text-gray-500">Indisponível</span>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                <TableCell>{getStatusLabel(payment.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
