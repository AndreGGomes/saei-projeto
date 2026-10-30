// Junta classes condicionais sem depender de biblioteca externa.
export function cx(...partes) {
  return partes.filter(Boolean).join(' ');
}
