import {
  formatBirds,
  formatKgValue,
  formatMoney,
  formatPricePerKg,
  formatWeightValue,
} from "../utils/expectedSales";

export interface ExpectedCalculationProps {
  title?: string;
  scopeLabel?: string;
  birdsSold?: number | null;
  avgChickenWeight?: number | null;
  expectedKg?: number | null;
  pricePerKg?: number | null;
  expectedMoney?: number | null;
  moneyLabel?: string;
  moneyNote?: string;
  wastePerChickenKg?: number;
  exactMoney?: boolean;
  missingProduct?: boolean;
  missingPrice?: boolean;
  missingAmount?: boolean;
  note?: string;
}

export const ExpectedCalculationContent = ({
  title = "Cálculo de la venta esperada",
  scopeLabel,
  birdsSold,
  avgChickenWeight,
  expectedKg,
  pricePerKg,
  expectedMoney,
  moneyLabel = "Mínimo comparable",
  moneyNote = "Suma de kg esperados × precio de cada día con precio y monto registrado.",
  wastePerChickenKg = 0.25,
  exactMoney = false,
  missingProduct = false,
  missingPrice = false,
  missingAmount = false,
  note,
}: ExpectedCalculationProps) => {
  const hasKg =
    birdsSold != null && avgChickenWeight != null && expectedKg != null;
  const warnings = [
    missingProduct ? "Sin producto de referencia." : null,
    !missingProduct && missingPrice
      ? "Falta precio de referencia en uno o más días."
      : null,
    missingAmount ? "Falta monto registrado en una o más ventas." : null,
  ].filter((warning): warning is string => warning != null);

  return (
    <div className="max-w-xs space-y-1 text-left text-xs text-gray-200">
      <p className="font-semibold text-white">{title}</p>
      {scopeLabel && <p className="text-gray-400">{scopeLabel}</p>}

      <div className="space-y-0.5 border-t border-gray-700 pt-1">
        <p className="font-semibold text-gray-300">Kilos esperados</p>
        {hasKg ? (
          <>
            <p>
              Peso promedio de la remesa: {formatWeightValue(avgChickenWeight)}
            </p>
            <p>Merma por pollo: {formatWeightValue(wastePerChickenKg)}</p>
            <p>Pollos vendidos: {formatBirds(birdsSold)}</p>
            <p className="font-mono text-[11px] text-white">
              ({formatWeightValue(avgChickenWeight)} −{" "}
              {formatWeightValue(wastePerChickenKg)}) × {formatBirds(birdsSold)}{" "}
              = {formatKgValue(expectedKg)} kg
            </p>
          </>
        ) : (
          <p className="text-gray-400">
            Sin datos de remesa para calcular los kilos.
          </p>
        )}
      </div>

      <div className="space-y-0.5 border-t border-gray-700 pt-1">
        <p className="font-semibold text-gray-300">Mínimo en dinero</p>
        {expectedMoney != null ? (
          exactMoney && expectedKg != null && pricePerKg != null ? (
            <p className="font-mono text-[11px] text-white">
              {formatKgValue(expectedKg)} × {formatPricePerKg(pricePerKg)} ={" "}
              {formatMoney(expectedMoney)}
            </p>
          ) : (
            <>
              {pricePerKg != null && (
                <p>Precio efectivo: {formatPricePerKg(pricePerKg)}</p>
              )}
              <p>
                {moneyLabel}: {formatMoney(expectedMoney)}
              </p>
              <p className="text-gray-400">{moneyNote}</p>
            </>
          )
        ) : (
          <p className="text-gray-400">Sin mínimo calculado.</p>
        )}
        {warnings.length > 0 && (
          <div className="space-y-0.5 pt-1">
            {warnings.map((warning) => (
              <p key={warning} className="text-amber-300">
                {warning}
              </p>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-gray-700 pt-1 text-[11px] text-gray-400">
        {note ??
          "El peso promedio es ponderado por pollos vendidos; el resultado suma cada venta de remesa."}
      </p>
    </div>
  );
};
