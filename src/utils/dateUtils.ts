
// Função para formatar datas no padrão brasileiro
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para analisar uma string de data e retornar um objeto Date
export const parseDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Erro ao analisar data:', error);
    return null;
  }
};
