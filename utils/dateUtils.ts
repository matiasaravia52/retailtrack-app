// Función para formatear una fecha en formato legible
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para obtener la fecha actual en formato ISO
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

// Función para obtener la fecha de inicio del día actual
export const getStartOfDay = (): string => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

// Función para obtener la fecha de fin del día actual
export const getEndOfDay = (): string => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

// Función para obtener la fecha de inicio de la semana actual
export const getStartOfWeek = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que la semana comience el lunes
  const startOfWeek = new Date(date.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString();
};

// Función para obtener la fecha de inicio del mes actual
export const getStartOfMonth = (): string => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

// Función para formatear una fecha para input de tipo date
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};
