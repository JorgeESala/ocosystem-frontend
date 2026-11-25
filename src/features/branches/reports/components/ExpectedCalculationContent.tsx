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
  wastePerChickenKg = 0.25,
  exactMoney = false,
  missingProduct = false,
  missingPrice = false,
  missingAmount = false,
  note,
}: ExpectedCalculationProps) => {
  const hasKg =
    birdsSold != null && avgChickenWeight != null && expectedKg != null;

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
        {missingProduct ? (
          <p className="text-amber-300">Sin producto de referencia.</p>
        ) : pricePerKg != null ? (
          expectedMoney != null ? (
            exactMoney && expectedKg != null ? (
              <p className="font-mono text-[11px] text-white">
                {formatKgValue(expectedKg)} × {formatPricePerKg(pricePerKg)} ={" "}
                {formatMoney(expectedMoney)}
              </p>
            ) : (
              <>
                <p>Precio efectivo: {formatPricePerKg(pricePerKg)}</p>
                <p>Mínimo comparable: {formatMoney(expectedMoney)}</p>
                <p className="text-gray-400">
                  Suma de kg esperados × precio de cada día con monto
                  registrado.
                </p>
              </>
            )
          ) : missingAmount ? (
            <p className="text-amber-300">
              Sin monto registrado en una o más ventas.
            </p>
          ) : (
            <p className="text-gray-400">Sin monto comparable.</p>
          )
        ) : missingPrice ? (
          <p className="text-amber-300">Sin precio de referencia.</p>
        ) : (
          <p className="text-amber-300">Sin precio de referencia.</p>
        )}
      </div>

      <p className="border-t border-gray-700 pt-1 text-[11px] text-gray-400">
        {note ??
          "El peso promedio es ponderado por pollos vendidos; el resultado suma cada venta de remesa."}
      </p>
    </div>
  );
};
