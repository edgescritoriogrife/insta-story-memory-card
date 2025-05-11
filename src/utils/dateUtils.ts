
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Analisa uma string de data no formato dd/mm/yyyy e retorna um objeto Date
 */
export const parseDate = (dateString: string | Date): Date | undefined => {
  try {
    if (!dateString) return undefined;
    
    // Se já for um objeto Date, retorna diretamente
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Tenta analisar como string no formato dd/mm/yyyy
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Tenta analisar como ISO string ou outro formato suportado
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    return undefined;
  } catch (error) {
    console.error("Erro ao analisar data:", error);
    return undefined;
  }
};

/**
 * Formata um objeto Date para o formato dd de mmmm de yyyy em português
 */
export const formatDate = (date: Date | undefined) => {
  if (!date) return "";

  try {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro de formatação de data:", error);
    return "";
  }
};
