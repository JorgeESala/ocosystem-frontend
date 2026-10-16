import type { BusinessUnitType } from "@/features/batch/types.batch";

export interface Ingresos {
  ventasNetas: number;
  ventasContado: number;
  ventasCredito: number;
}

export interface CostoVentas {
  costoRemesas: number;
  alimento: number;
  merma: number;
  total: number;
}

export interface GastoItem {
  categoria: string;
  nombre: string;
  monto: number;
  movimientos: number;
}

export interface GastosSeccion {
  gastos: GastoItem[];
  total: number;
}

export interface GastosOperacion {
  venta: GastosSeccion;
  administracion: GastosSeccion;
  total: number;
}

export interface EfectivoPeriodo {
  entradasVentasContado: number;
  entradasCobros: number;
  entradasOtros: number;
  entradasTotal: number;
  salidasGastos: number;
  salidasPagosProveedores: number;
  salidasOtros: number;
  salidasTotal: number;
  neto: number;
}

export interface PuenteEfectivo {
  ventasContado: number;
  ventasCredito: number;
  cobros: number;
  efectivoEntrado: number;
  variacionCartera: number;
  cuadreDisponible: boolean;
  cuadreDiferencia: number | null;
}

export interface RutaResumen {
  rutaId: number | null;
  rutaNombre: string;
  ventas: number;
  costo: number;
  combustible: number;
  margen: number;
}

export interface IncomeStatement {
  start: string;
  end: string;
  unitType: BusinessUnitType;
  ingresos: Ingresos;
  costoVentas: CostoVentas;
  utilidadBruta: number;
  gastosOperacion: GastosOperacion;
  utilidadOperativa: number;
  utilidadNeta: number;
  efectivo: EfectivoPeriodo | null;
  puente: PuenteEfectivo;
  rutas: RutaResumen[];
}
