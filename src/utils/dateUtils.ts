
import { format, formatRelative, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição no formato DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Analisa uma string de data e retorna um objeto Date
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error('Erro ao analisar data:', error);
    return null;
  }
};

/**
 * Formata uma data para exibição relativa (ex: "há 2 dias")
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatRelative(date, new Date(), { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error);
    return dateString;
  }
};

/**
 * Verifica se uma data está no passado
 */
export const isPastDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch (error) {
    console.error('Erro ao verificar data:', error);
    return false;
  }
};

/**
 * Formata uma data para exibição no formato DD de MMMM de YYYY
 */
export const formatLongDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data longa:', error);
    return dateString;
  }
};
