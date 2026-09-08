export const TotalPendienteHelpContent = () => (
  <p>
    Suma de los saldos de las cuentas visibles en la tabla. Si hay filtros
    activos, es el total filtrado; si no, el consolidado de los CEDIS de huevo.
  </p>
);

export const DocumentosHelpContent = () => (
  <p>
    Cantidad de cuentas con saldo mayor a cero. Las deudas ya liquidadas no
    aparecen aquí, pero sí en el reporte mensual del cliente.
  </p>
);

export const AntiguedadHelpContent = () => (
  <p>
    Días desde la cuenta abierta más antigua dentro de la vista actual. La tabla
    muestra la antigüedad de cada cuenta en su propia columna.
  </p>
);

export const SaldoColumnaHelpContent = () => (
  <p>
    Lo que falta por pagar de esta cuenta: total menos lo ya aplicado. Es el
    saldo vivo, no el total original.
  </p>
);
