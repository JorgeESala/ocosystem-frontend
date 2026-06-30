import type { Batch, BatchResponseDTO, BusinessUnitType } from "../types.batch";
import { EggBatchOverview } from "../components/egg/EggBatchOverview";
import { ChickenBatchOverview } from "../components/live-chicken/ChickenBatchOverview";

import { EggQuantityDisplay } from "../components/egg/EggQuantityDisplay";
import { EggMovementFields } from "../components/egg/EggMovementFields";
import { ChickenMovementFields } from "../components/live-chicken/ChickenMovementFields";
import { EggEntryFields } from "../components/egg/EggEntryFields";
import { ChickenEntryFields } from "../components/live-chicken/ChickenEntryFields";
import {
  GenericPlaceholderOverview,
  EmptyFields,
  EmptyMovementsTable,
} from "../components/common/UnitPlaceholders";
import { ChickenHeaderStats } from "../components/live-chicken/ChickentHeaderStats";
import { ChickenFooterStats } from "../components/live-chicken/ChickenFooterStats";
import { EggHeaderStats } from "../components/egg/EggHeaderStats";
import { EggFooterStats } from "../components/egg/EggFooterStats";
import { ChickenMovementsTable } from "../components/live-chicken/ChickenMovementsTable";
import { EggMovementsTable } from "../components/egg/EggMovementsTable";
interface UnitConfigValue {
  label: string;
  description: string;
  overviewComponent: React.FC<{ batch: any; autoExpandId?: number | null }>;
  renderMovementQuantity: (movement: any) => React.ReactNode;
  // 🔥 Agregamos setValue aquí:
  movementFormFields: React.FC<{
    register: any;
    watch: any;
    setValue: any;
    batch: Batch;
  }>;
  entryFormFields: React.FC<{ register: any; watch: any; control: any }>;
  HeaderStats: React.FC<{ batch: BatchResponseDTO }>;
  FooterStats: React.FC<{ batch: BatchResponseDTO }>;
  MovementsTable: React.FC<{
    movements: any[];
    onEdit: (mov: any) => void;
    unitType: BusinessUnitType;
    batchId: number;
  }>;
}
export const UNIT_CONFIG: Record<BusinessUnitType, UnitConfigValue> = {
  EGG: {
    label: "Huevo",
    description: "Control de inventario por cajas, cartones y piezas.",
    overviewComponent: EggBatchOverview,
    renderMovementQuantity: (mov) => (
      <EggQuantityDisplay totalPieces={mov.quantity} />
    ),
    movementFormFields: EggMovementFields,
    entryFormFields: EggEntryFields,
    HeaderStats: EggHeaderStats,
    FooterStats: EggFooterStats,
    MovementsTable: EggMovementsTable,
  },
  LIVE_CHICKEN: {
    label: "Pollo Vivo",
    description: "Control de aves, peso real y mermas por remesa.",
    overviewComponent: ChickenBatchOverview,
    renderMovementQuantity: (mov) => (
      <div className="flex flex-col">
        <span className="text-white">{mov.quantity} aves</span>
        <span className="text-xs text-gray-500">{mov.weight} kg</span>
      </div>
    ),
    movementFormFields: ChickenMovementFields,
    entryFormFields: ChickenEntryFields,
    HeaderStats: ChickenHeaderStats, // Implementa el diseño de la imagen 144627.png
    FooterStats: ChickenFooterStats,
    MovementsTable: ChickenMovementsTable,
  },
  PORK: {
    label: "Cerdo",
    description: "Control de canales y peso.",
    overviewComponent: GenericPlaceholderOverview,
    movementFormFields: EmptyFields,
    entryFormFields: EmptyFields,
    renderMovementQuantity: (mov) => <span>{mov.quantity} kg</span>,
    HeaderStats: EmptyFields,
    FooterStats: EmptyFields,
    MovementsTable: EmptyMovementsTable,
  },
  BRANCHES: {
    label: "Sucursales",
    description: "Traslados entre puntos de venta.",
    overviewComponent: GenericPlaceholderOverview,
    movementFormFields: EmptyFields,
    entryFormFields: EmptyFields,
    renderMovementQuantity: (mov) => <span>{mov.quantity} uds</span>,
    HeaderStats: EmptyFields,
    FooterStats: EmptyFields,
    MovementsTable: EmptyMovementsTable,
  },
};
