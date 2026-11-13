import { InfoTip } from "@/components/InfoTip";

export default function ComparisonPeriodHelp() {
  return (
    <InfoTip title="¿Cómo se compara?">
      <p>
        “Actual” es el rango de fechas seleccionado. “Anterior” es el rango
        inmediatamente anterior de la misma duración.
      </p>
      <p>
        Las diferencias y los porcentajes se calculan contra el periodo
        anterior.
      </p>
    </InfoTip>
  );
}
