import { Label, Select, TextInput } from "flowbite-react";
import { useCedis } from "@/core/cedis/api/cedis.queries";
import { useEffect } from "react";

export default function FoodFields({ form, setForm }: any) {
  const { data: cedis, isLoading } = useCedis();
  useEffect(() => {
    // Si aún no hay valor y existe el cedis con id = 1
    if (!form.food.cedisId && cedis?.length) {
      const defaultCedis = cedis.find((c) => c.id === 1);

      if (defaultCedis) {
        setForm((f: any) => ({
          ...f,
          food: {
            ...f.food,
            cedisId: String(defaultCedis.id),
          },
        }));
      }
    }
  }, [cedis, form.food.cedisId, setForm]);
  return (
    <div className="space-y-3 border-t pt-3">
      <Label>Cedis</Label>
      <Select
        value={form.food.cedisId}
        disabled={isLoading}
        onChange={(e) =>
          setForm((f: any) => ({
            ...f,
            food: { ...f.food, cedisId: e.target.value },
          }))
        }
      >
        <option value="">Seleccione</option>

        {cedis?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Label>Kilos</Label>
      <TextInput
        type="number"
        value={form.food.weight}
        onChange={(e) =>
          setForm((f: any) => ({
            ...f,
            food: { ...f.food, weight: e.target.value },
          }))
        }
      />
    </div>
  );
}
