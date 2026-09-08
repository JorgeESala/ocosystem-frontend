export const SaldoInicialHelpContent = () => (
  <div className="space-y-1.5">
    <p>Lo que el cliente debía al empezar el mes.</p>
    <p>
      Se obtiene como: saldo actual menos los movimientos del mes menos las
      deudas creadas en el mes. No se necesita ninguna fecha fija: el pasado se
      deduce solo.
    </p>
  </div>
);

export const CargosHelpContent = () => (
  <div className="space-y-1.5">
    <p>Todo lo que aumentó la deuda en el mes.</p>
    <p>
      Incluye las deudas creadas en el mes (etiqueta Cargo) y los ajustes por
      actualizaciones de documentos. Meses viejos pueden mostrar cargos en cero
      porque antes esos aumentos no dejaban rastro.
    </p>
  </div>
);

export const PagosHelpContent = () => (
  <p>
    Todo lo que redujo la deuda en el mes: pagos, compensaciones y reversas
    aplicadas a las cuentas del cliente.
  </p>
);

export const SaldoFinalHelpContent = () => (
  <p>
    Lo que el cliente debe al terminar el mes. Siempre cumple: inicial + cargos
    − pagos = final.
  </p>
);

export const MovimientosCuentaHelpContent = () => (
  <p>
    Movimientos de esta deuda específica, en orden cronológico: desde su
    creación hasta su saldo actual. Para ver todas las deudas del cliente
    juntas, usa el reporte mensual.
  </p>
);
