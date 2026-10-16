import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiDocumentDownload, HiPlus } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import { useRoutes } from "@/core/api/route/routes.queries";
import { formatMXN } from "@/utils/moneyNumbers";
import { useOpenAccounts } from "../api/accounts-payable.queries";
import {
  collectionsKeys,
  useRouteCollections,
} from "../api/collections.queries";
import type { RouteCollection } from "../api/collections.api";
import { openCollectionsSheet } from "../utils/collectionsSheet";
import { AgingBadge } from "./AgingBadge";
import { RegisterPaymentFirstModal } from "./RegisterPaymentFirstModal";

interface Props {
  creditorEntityType: "EGGCEDIS" | "CEDIS";
  businessUnitName: string;
  onSuccessToast?: (message: string) => void;
}

interface CollectionPaymentModalProps {
  target: RouteCollection;
  routeId: number;
  creditorEntityType: "EGGCEDIS" | "CEDIS";
  onClose: () => void;
  onSuccessToast?: (message: string) => void;
}

const CollectionPaymentModal = ({
  target,
  routeId,
  creditorEntityType,
  onClose,
  onSuccessToast,
}: CollectionPaymentModalProps) => {
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading } = useOpenAccounts({
    debtorId: target.accountingEntityId,
    creditorEntityType,
    status: "OPEN",
  });

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: collectionsKeys.all });
    queryClient.invalidateQueries({ queryKey: ["accounts-payable"] });
    onSuccessToast?.(message);
  };

  return (
    <RegisterPaymentFirstModal
      open
      onClose={onClose}
      side="RECEIVABLE"
      allowCompensation={false}
      onSuccessToast={handleSuccess}
      primaryAccounts={debts}
      secondaryAccounts={[]}
      primaryLoading={isLoading}
      secondaryLoading={false}
      initialRouteId={routeId}
      initialAmount={target.saldoRuta}
    />
  );
};

export const RouteCollectionsPanel = ({
  creditorEntityType,
  businessUnitName,
  onSuccessToast,
}: Props) => {
  const [routeId, setRouteId] = useState<number | null>(null);
  const [collectionTarget, setCollectionTarget] =
    useState<RouteCollection | null>(null);

  const { data: routes = [] } = useRoutes();
  const {
    data: collections = [],
    isLoading,
    isError,
  } = useRouteCollections(routeId);

  const selectedRoute = routes.find((r) => r.id === routeId);
  const totalRuta = collections.reduce((sum, row) => sum + row.saldoRuta, 0);

  const handlePrint = () => {
    if (!selectedRoute) return;
    openCollectionsSheet({
      routeName: selectedRoute.name,
      businessUnitName,
      dateLabel: new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      rows: collections.map((row) => ({
        displayName: row.debtorDisplayName,
        entityType: row.debtorEntityType,
        saldoRuta: row.saldoRuta,
        saldoTotal: row.saldoTotal,
        phone: row.phone,
      })),
      totalRuta,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="w-72">
          <label className="mb-1 block text-xs text-gray-400">Ruta</label>
          <Select
            value={routeId ?? ""}
            onChange={(e) =>
              setRouteId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Seleccionar ruta</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>

        {collections.length > 0 && (
          <>
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">
                Total a cobrar: {formatMXN(totalRuta)}
              </span>{" "}
              · {collections.length} deudor
              {collections.length === 1 ? "" : "es"}
            </p>
            <Button color="gray" size="sm" onClick={handlePrint}>
              <HiDocumentDownload className="mr-2 h-4 w-4" />
              Imprimir hoja
            </Button>
          </>
        )}
      </div>

      {isError && (
        <Alert color="failure">
          Error al cargar la cobranza de la ruta. Intenta de nuevo.
        </Alert>
      )}

      {!isError && routeId == null && (
        <p className="text-sm text-gray-500">
          Elige una ruta para ver los deudores con saldo de sus entregas.
        </p>
      )}

      {!isError && routeId != null && isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner size="md" />
        </div>
      )}

      {!isError &&
        routeId != null &&
        !isLoading &&
        collections.length === 0 && (
          <p className="text-sm text-gray-500">
            Sin deudores con saldo en esta ruta.
          </p>
        )}

      {collections.length > 0 && (
        <div className="rounded-lg bg-gray-800 shadow">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Deudor</TableHeadCell>
                <TableHeadCell className="text-right">
                  De esta ruta
                </TableHeadCell>
                <TableHeadCell className="text-right">
                  Total adeudado
                </TableHeadCell>
                <TableHeadCell>Antigüedad</TableHeadCell>
                <TableHeadCell>Teléfono</TableHeadCell>
                <TableHeadCell> </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collections.map((row) => (
                <TableRow key={row.accountingEntityId}>
                  <TableCell className="font-medium text-white">
                    {row.debtorDisplayName}
                    <Badge color="gray" className="ml-2 inline-block">
                      {row.debtorEntityType === "BRANCH"
                        ? "Sucursal"
                        : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-white tabular-nums">
                    {formatMXN(row.saldoRuta)}
                  </TableCell>
                  <TableCell className="text-right text-gray-400 tabular-nums">
                    {formatMXN(row.saldoTotal)}
                  </TableCell>
                  <TableCell>
                    {row.oldestDebtDateRuta ? (
                      <AgingBadge isoDate={row.oldestDebtDateRuta} />
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {row.phone ?? <span className="text-gray-600">—</span>}
                  </TableCell>
                  <TableCell>
                    <Button size="xs" onClick={() => setCollectionTarget(row)}>
                      <HiPlus className="mr-1 h-3 w-3" />
                      Cobrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {collectionTarget && routeId != null && (
        <CollectionPaymentModal
          target={collectionTarget}
          routeId={routeId}
          creditorEntityType={creditorEntityType}
          onClose={() => setCollectionTarget(null)}
          onSuccessToast={onSuccessToast}
        />
      )}
    </div>
  );
};
