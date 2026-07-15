import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Label, TextInput, Alert, Spinner } from "flowbite-react";
import { HiArrowLeft, HiSave } from "react-icons/hi";
import {
  useMetricFormulaConfig,
  useUpdateMetricFormulaConfig,
} from "../api/metric-formula-config.queries";
import { METRIC_HELP } from "../help/content";

interface ParameterField {
  key: string;
  type: string;
  min: number;
  max: number;
  defaultValue: number;
  description: string;
}

export default function FormulaConfigPage() {
  const { slug } = useParams();
  const { data: configs, isLoading, isError } = useMetricFormulaConfig();
  const updateMutation = useUpdateMetricFormulaConfig();

  const [formData, setFormData] = useState<
    Record<string, Record<string, number>>
  >({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (configs) {
      const initial: Record<string, Record<string, number>> = {};
      configs.forEach((config) => {
        initial[config.metricId] = config.parameters;
      });
      setFormData(initial);
    }
  }, [configs]);

  const handleParameterChange = (
    metricId: string,
    key: string,
    value: string,
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [metricId]: {
          ...prev[metricId],
          [key]: numValue,
        },
      }));
    }
  };

  const handleSave = (metricId: string) => {
    const parameters = formData[metricId];
    if (parameters) {
      updateMutation.mutate(
        { metricId, parameters },
        {
          onSuccess: () => {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          },
        },
      );
    }
  };

  const handleReset = (metricId: string, schema: ParameterField[]) => {
    const defaults: Record<string, number> = {};
    schema.forEach((field) => {
      defaults[field.key] = field.defaultValue;
    });
    setFormData((prev) => ({
      ...prev,
      [metricId]: defaults,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert color="failure">
        No se pudieron cargar las configuraciones de las fórmulas.
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Configuración de fórmulas
          </h1>
          <p className="text-sm text-slate-400">
            Ajusta los parámetros de las fórmulas de cada indicador. Los cambios
            afectan el cálculo del puntaje.
          </p>
        </div>
        <Link to={`/business/${slug}/checklist`}>
          <Button color="light">
            <HiArrowLeft aria-hidden className="mr-2 h-4 w-4" />
            Volver al checklist
          </Button>
        </Link>
      </header>

      {saveSuccess && (
        <Alert color="success">Configuración guardada correctamente.</Alert>
      )}

      {configs?.map((config) => {
        const help = METRIC_HELP[config.metricId];
        const schema = config.schema || [];

        if (schema.length === 0) {
          return null;
        }

        return (
          <Card
            key={config.metricId}
            className="border-slate-700/80 bg-slate-950/70"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {help?.title || config.metricId}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {help?.description}
                </p>
              </div>

              <div className="space-y-3">
                {schema.map((field) => (
                  <div key={field.key}>
                    <Label
                      htmlFor={`${config.metricId}-${field.key}`}
                      className="mb-1"
                    >
                      {field.description}
                    </Label>
                    <TextInput
                      id={`${config.metricId}-${field.key}`}
                      type="number"
                      step="0.01"
                      min={field.min}
                      max={field.max}
                      value={
                        formData[config.metricId]?.[field.key] ??
                        field.defaultValue
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          config.metricId,
                          field.key,
                          e.target.value,
                        )
                      }
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Rango: {field.min} - {field.max} (por defecto:{" "}
                      {field.defaultValue})
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  color="blue"
                  onClick={() => handleSave(config.metricId)}
                  disabled={updateMutation.isPending}
                >
                  <HiSave aria-hidden className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button
                  color="gray"
                  onClick={() => handleReset(config.metricId, schema)}
                >
                  Restablecer valores por defecto
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          ¿Cómo afectan estos cambios?
        </h2>
        <p className="text-sm text-blue-300">
          Los cambios en los parámetros de las fórmulas afectan inmediatamente
          el cálculo del puntaje de todas las sucursales.
        </p>
      </div>
    </div>
  );
}
