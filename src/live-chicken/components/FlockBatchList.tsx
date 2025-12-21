// import { Spinner, Alert } from "flowbite-react";
// import { HiExclamation } from "react-icons/hi";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";

import { type Batch } from "../../services/api";
import { FlockBatchOverview } from "./FlockBatchOverview";

interface FlockBatchListProps {
  startDate: Date | null;
  endDate: Date | null;
  enabled: boolean;
}

export const FlockBatchList: React.FC<FlockBatchListProps> = () =>
  //   {
  //   startDate,
  //   endDate,
  //   enabled,
  // }
  {
    // const queryClient = useQueryClient();

    // const isReady = enabled && startDate !== null && endDate !== null;

    // const latestQuery = useQuery<Batch[]>({
    //   queryKey: ["batches", "latest"],
    //   queryFn: fetchLatestBatches,
    //   enabled: !enabled,
    // });

    // const searchQuery = useQuery<Batch[]>({
    //   queryKey: ["batches", "search", startDate, endDate],
    //   queryFn: () =>
    //     fetchBatchesByBranchesAndDateRange( startDate!, endDate!),
    //   enabled: isReady,
    // });

    // const batches = enabled ? (searchQuery.data ?? []) : (latestQuery.data ?? []);
    // const batches = [] as Batch[];
    const batchesMock: Batch[] = [
      {
        id: 1,
        branchId: 101,
        branchName: "Sucursal Centro",
        kgTotal: 120,
        pricePerKg: 32,
        date: new Date("2025-01-10"),
        provider: "Proveedor San Juan",
        chickenQuantity: 300,
        avgChickenWeight: 0.4,
        priceTotal: 3840,
      },
      {
        id: 2,
        branchId: 102,
        branchName: "Sucursal Norte",
        kgTotal: 95,
        pricePerKg: 31,
        date: new Date("2025-01-12"),
        provider: "Avícola El Rey",
        chickenQuantity: 240,
        avgChickenWeight: 0.395,
        priceTotal: 2945,
      },
      {
        id: 3,
        branchId: 103,
        branchName: "Sucursal Sur",
        kgTotal: 150,
        pricePerKg: 33,
        date: new Date("2025-01-15"),
        provider: "Pollos Martínez",
        chickenQuantity: 360,
        avgChickenWeight: 0.42,
        priceTotal: 4950,
      },
      {
        id: 4,
        branchId: 101,
        branchName: "Sucursal Centro",
        kgTotal: 110,
        pricePerKg: 30,
        date: new Date("2025-01-18"),
        provider: "Avícola La Granja",
        chickenQuantity: 275,
        avgChickenWeight: 0.4,
        priceTotal: 3300,
      },
      {
        id: 5,
        branchId: 104,
        branchName: "Sucursal Oriente",
        kgTotal: 80,
        pricePerKg: 34,
        date: new Date("2025-01-20"),
        provider: "Proveedor del Valle",
        chickenQuantity: 200,
        avgChickenWeight: 0.4,
        priceTotal: 2720,
      },
    ];

    // const isLoading = enabled ? searchQuery.isLoading : latestQuery.isLoading;

    // const error = enabled ? searchQuery.error : latestQuery.error;

    // useEffect(() => {
    //   if (batches.length === 0) return;

    //   batches.forEach((batch) => {
    //     queryClient.prefetchQuery({
    //       queryKey: ["batchSales", batch.id],
    //       queryFn: () => fetchBatchSalesByBatch(batch.id),
    //       staleTime: 1000 * 60 * 5,
    //     });
    //   });
    // }, [batches, queryClient]);

    // if (isLoading)
    //   return (
    //     <div className="flex justify-center py-8">
    //       <Spinner size="xl" />
    //     </div>
    //   );

    // if (error)
    //   return (
    //     <Alert color="failure" icon={HiExclamation}>
    //       No se pudieron cargar las remesas.
    //     </Alert>
    //   );
    return (
      <div className="space-y-6 p-4">
        {batchesMock.map((batch) => (
          <FlockBatchOverview key={batch.id} batch={batch} />
        ))}
      </div>
    );
  };
