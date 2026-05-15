import { Label, TextInput } from "flowbite-react";

export const ChickenMovementFields: React.FC<{ register: any }> = ({
  register,
}) => (
  <>
    <div>
      <Label>Cabezas (Aves)</Label>
      <TextInput type="number" {...register("quantity")} />
    </div>
    <div>
      <Label>Peso Kg (Real)</Label>
      <TextInput type="number" step="0.01" {...register("weight")} />
    </div>
  </>
);
