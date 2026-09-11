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
  <div className="space-y-1.5">
    <p>
      Movimientos de esta deuda específica, en orden cronológico: desde su
      creación hasta su saldo actual. Para ver todas las deudas del cliente
      juntas, usa el reporte mensual.
    </p>
    <p>
      La etiqueta "Saldo a favor" marca los movimientos que se crearon al
      aplicar un anticipo o saldo a favor a esta deuda.
    </p>
  </div>
);

export const SaldoFavorHelpContent = () => (
  <div className="space-y-1.5">
    <p>Es dinero pagado que todavía no se ha aplicado a ninguna deuda.</p>
    <p>
      No se aplica solo: cuando registras un anticipo eliges si se aplica a las
      deudas abiertas o si queda como saldo a favor. Aplicarlo después siempre
      pide confirmación.
    </p>
  </div>
);

export const ConfirmacionPagoHelpContent = () => (
  <div className="space-y-1.5">
    <p>
      Antes de guardar un anticipo, el sistema muestra cómo se repartiría entre
      las deudas abiertas, de la más antigua a la más reciente.
    </p>
    <p>
      Puedes aplicar el pago a esas deudas o dejarlo completo como saldo a
      favor. Nada se guarda hasta que eliges una opción.
    </p>
  </div>
);

export const CancelarPagoHelpContent = () => (
  <div className="space-y-1.5">
    <p>
      Cancelar un pago devuelve el dinero a las deudas donde estaba aplicado y
      conserva el folio para poder rastrearlo.
    </p>
    <p>
      Antes de cancelar, el sistema dice cuántas deudas se reactivarán y por
      cuánto dinero.
    </p>
  </div>
);
