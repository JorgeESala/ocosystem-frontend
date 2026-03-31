import { useQuery } from "@tanstack/react-query";
import { fetchSolicitors } from "./solicitor.api";
import { solicitorKeys } from "./solicitor.keys";
import { useParams } from "react-router-dom";

export const useSolicitors = (params?: {
  accountingEntityId?: number;
  active?: boolean;
}) => {
  // Extraemos el slug directamente aquí para no pasarlo como parámetro extra
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    // Usamos el slug extraído de la URL para las llaves
    queryKey: solicitorKeys.listByEntity(slug!, params),

    queryFn: () => fetchSolicitors(params).then((r) => r.data),

    // Se habilita solo si existe el slug (tenant)
    // y si hay accountingEntityId (si es que es requerido para la búsqueda)
    enabled: !!slug && (params?.accountingEntityId !== undefined || !params),

    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });
};
