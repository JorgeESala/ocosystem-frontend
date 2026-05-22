import { Label, TextInput } from "flowbite-react";

export const ChickenEntryFields: React.FC<{ register: any }> = ({
  register,
}) => (
  <>
    <div className="col-span-1">
      <Label>Cantidad (Aves)</Label>
      <TextInput type="number" {...register("quantity")} />
    </div>
    <div className="col-span-1">
      <Label>Precio por Kg</Label>
      <TextInput type="number" step="0.01" {...register("pricePerKg")} />
    </div>
    <div className="col-span-1">
      <Label>Peso Declarado (Nota)</Label>
      <TextInput type="number" step="0.01" {...register("weight")} />
    </div>
    <div className="col-span-1">
      <Label>Peso Real (Báscula)</Label>
      <TextInput type="number" step="0.01" {...register("realWeight")} />
    </div>
  </>
);
