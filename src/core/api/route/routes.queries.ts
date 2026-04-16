import { useQuery } from "@tanstack/react-query";
import * as api from "@/core/api/route/route.api";
export const useRoutes = () => {
  return useQuery({
    queryKey: ["routes"],
    queryFn: api.getRoutes,
    staleTime: 1000 * 60 * 10, // Las rutas rara vez cambian, podemos dejarlas 10 min en caché
  });
};
