import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { businessSlugMap } from "./businessSlugMap";

export default function ProtectedBusinessRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug } = useParams();
  const { user } = useAuth();

  if (!user) return null;

  const business = slug ? businessSlugMap[slug] : undefined;

  if (!business) {
    return <Navigate to="/forbidden" replace />;
  }

  if (!user.allowedBusinesses.includes(business)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
