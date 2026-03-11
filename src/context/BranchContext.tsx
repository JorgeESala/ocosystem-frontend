import { createContext, useContext } from "react";
import { type Branch } from "../services/api";

interface BranchContextType {
  branches: Branch[];
  refreshBranches: () => Promise<void>;
  loading: boolean;
}

export const BranchContext = createContext<BranchContextType | undefined>(
  undefined,
);

export function useBranches() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranches must be used inside BranchProvider");
  return ctx;
}
