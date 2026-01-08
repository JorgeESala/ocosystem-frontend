import { Datepicker, Label, Textarea, TextInput } from "flowbite-react";

export default function BaseExpenseFields() {
  return (
    <div className="space-y-3">
      <div>
        <Label> Fecha </Label>
        <Datepicker language="es-MX" />
      </div>

      <div>
        <Label> Monto </Label>
        <TextInput type="number" step="0.01" />
      </div>

      <div>
        <Label> Descripción </Label>
        <Textarea rows={2} />
      </div>
    </div>
  );
}
