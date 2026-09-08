import type { AccountsPayableResponse } from "../../live-chicken/accounting/accounts-payable/types";
import { AccountDetailDrawer } from "./AccountDetailDrawer";

interface Props {
  open: boolean;
  onClose: () => void;
  account?: AccountsPayableResponse | null;
}

export const AccountsPayableHistoryDrawer = ({
  open,
  onClose,
  account,
}: Props) => {
  return (
    <AccountDetailDrawer open={open} onClose={onClose} account={account} />
  );
};
