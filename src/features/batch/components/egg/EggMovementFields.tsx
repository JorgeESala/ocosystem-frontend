import { Label, TextInput } from "flowbite-react";

export const EggMovementFields: React.FC<{ register: any }> = ({
  register,
}) => (
  <>
    <div>
      <Label>Cajas</Label>
      <TextInput type="number" {...register("boxes")} />
    </div>
    <div>
      <Label>Casilleros</Label>
      <TextInput type="number" {...register("cartons")} />
    </div>
    <div>
      <Label>Piezas Sueltas</Label>
      <TextInput type="number" {...register("quantity")} />
    </div>
  </>
);
