import { useQuery } from "@tanstack/react-query";
import { cedisApi } from "./cedis.api";
import { cedisKeys } from "./cedis.keys";

export const useCedis = () =>
  useQuery({
    queryKey: cedisKeys.list(),
    queryFn: cedisApi.getAll,
  });
