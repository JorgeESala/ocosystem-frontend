import { Label, TextInput } from "flowbite-react";

export const EggEntryFields: React.FC<{ register: any; watch: any }> = ({
  register,
  watch,
}) => {
  const watchTotalAmount = watch("totalAmount") || 0;
  const watchBoxes = watch("boxes") || 0;
  const watchCartons = watch("cartons") || 0;

  const totalCartons = Number(watchBoxes) * 12 + Number(watchCartons);
  const pricePerCarton =
    totalCartons > 0 ? (Number(watchTotalAmount) / totalCartons).toFixed(2) : 0;

  return (
    <>
      <div className="col-span-1">
        <Label>Cajas</Label>
        <TextInput type="number" {...register("boxes")} />
      </div>
      <div className="col-span-1">
        <Label>Casilleros</Label>
        <TextInput type="number" {...register("cartons")} />
      </div>
      <div className="col-span-2">
        <Label>Total Pagado ($)</Label>
        <TextInput type="number" step="0.01" {...register("totalAmount")} />
        {totalCartons > 0 && (
          <p className="mt-1 text-xs text-green-400 italic">
            Costo calculado: ${pricePerCarton} por casillero
          </p>
        )}
      </div>
    </>
  );
};
