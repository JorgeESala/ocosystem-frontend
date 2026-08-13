import { Datepicker, Label, Textarea, TextInput } from "flowbite-react";

export default function BaseExpenseFields({
  form,
  setForm,
}: {
  form: any;
  setForm: (fn: any) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Fecha</Label>
        <Datepicker
          language="es-MX"
          value={form.date}
          onChange={(date) => setForm((f: any) => ({ ...f, date }))}
        />
      </div>

      <div>
        <Label>Monto</Label>
        <TextInput
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) =>
            setForm((f: any) => ({ ...f, amount: e.target.value }))
          }
        />
      </div>

      <div>
        <Label>Descripcion</Label>
        <Textarea
          rows={2}
          value={form.reason}
          onChange={(e) =>
            setForm((f: any) => ({ ...f, reason: e.target.value }))
          }
        />
      </div>
    </div>
  );
}
