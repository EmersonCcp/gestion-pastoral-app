export function formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';

    // Si viene formato ISO completo, extraer solo la parte de la fecha
    const simpleDate = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [year, month, day] = simpleDate.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return fechaStr;

    // Crear fecha en hora local (mes empieza en 0)
    const fecha = new Date(year, month - 1, day);
    fecha.setHours(0, 0, 0, 0);

    const hoy = new Date();
    const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);

    const diffDays = Math.round(
      (fecha.getTime() - hoyLocal.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';

    return fecha.toLocaleDateString('es-ES');
  }

   export function  formatHorario(horarioStr: string): string {
    const [hora, minuto] = horarioStr.split(':').map(Number);
    const sufijo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora % 12 === 0 ? 12 : hora % 12;
    return `${hora12}:${minuto.toString().padStart(2, '0')} ${sufijo}`;
  }