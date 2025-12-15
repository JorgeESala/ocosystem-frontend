import { useCallback, useEffect, useState } from "react";
import { fetchBranches, type Branch } from "../services/api";
import { useAuth } from "./AuthContext";
import { BranchContext } from "./BranchContext";

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const { isAuthenticated, token } = useAuth();

  const loadBranches = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadBranches();
    } else {
      setBranches([]);
    }
  }, [isAuthenticated, token, loadBranches]);

  return (
    <BranchContext.Provider value={{ branches, refreshBranches: loadBranches }}>
      {children}
    </BranchContext.Provider>
  );
}
