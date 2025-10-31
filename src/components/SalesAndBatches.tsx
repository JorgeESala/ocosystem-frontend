import BatchEntryForm from "./BatchEntryForm";
import { BatchTable } from "./BatchTable";

export default function SalesAndBatches() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-white">Entradas y Ventas</h1>
      <BatchTable></BatchTable>
      <BatchEntryForm></BatchEntryForm>
    </div>
  );
}
