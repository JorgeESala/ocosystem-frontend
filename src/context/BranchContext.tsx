// BranchContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { fetchBranches, type Branch } from "../services/api";

const BranchContext = createContext<Branch[]>([]);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState([] as Branch[]);

  useEffect(() => {
    async function loadBranches() {
      const branches = await fetchBranches();
      setBranches(branches);
    }
    loadBranches();
  }, []);

  return (
    <BranchContext.Provider value={branches}>{children}</BranchContext.Provider>
  );
}

export const useBranches = () => useContext(BranchContext);
