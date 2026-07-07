import React from "react";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

// Un componente genérico para las vistas previas que aún no existen
export const GenericPlaceholderOverview: React.FC<{
  batch: any;
  autoExpandId?: number | null;
}> = ({ batch }) => (
  <div className="rounded-xl border border-dashed border-gray-600 p-6 text-center">
    <p className="text-gray-400">
      Vista de remesa #{batch.id} para un módulo en desarrollo.
    </p>
  </div>
);

// Un componente genérico para los formularios que aún no existen
export const GenericPlaceholderForm: React.FC<any> = () => (
  <div className="p-4">
    <Alert color="info" icon={HiInformationCircle}>
      <span className="font-medium">Módulo en construcción.</span> Próximamente
      podrás gestionar esta unidad de negocio.
    </Alert>
  </div>
);

// Un campo vacío para los formularios dinámicos
export const EmptyFields: React.FC<any> = () => null;

// Tabla de movimientos vacía para unidades que aún no soportan la vista
// detallada (PORK, BRANCHES). Cumple con la firma MovementsTable que ahora
// recibe unitType y batchId.
export const EmptyMovementsTable: React.FC<{
  movements: any[];
  onEdit: (mov: any) => void;
  unitType: string;
  batchId: number;
}> = () => null;
