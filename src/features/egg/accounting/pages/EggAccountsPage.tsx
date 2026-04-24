import { useState } from "react";
import { Button } from "flowbite-react";

import { RegisterPaymentModal } from "../../../accounting/components/RegisterPaymentModal";
import { AccountsOpenTable } from "../../../accounting/components/AccountsOpenTable";
import { useOpenAccounts } from "../../../accounting/api/accounts-payable.queries";
import { AccountsPayableHistoryDrawer } from "../../../accounting/components/AccountsPayableHistoryDrawer";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";
import { CreateEggAccountsPayableModal } from "../components/CreateEggAccountsPayableModal";

export const EggAccountsPage = () => {
  // --- UI state ---
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccountForPay, setSelectedAccountForPay] =
    useState<AccountsPayableResponse | null>(null);

  const [selectedAccountForHistory, setSelectedAccountForHistory] =
    useState<AccountsPayableResponse | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const handlePay = (account: AccountsPayableResponse) => {
    setSelectedAccountForPay(account);
  };

  const handleViewHistory = (account: AccountsPayableResponse) => {
    setSelectedAccountForHistory(account);
    setHistoryOpen(true);
  };

  // --- contexto actual (luego puede venir de auth) ---
  const EGG_CEDIS_ORIGINAL_ID = 1;
  const EGG_CEDIS_CHUNHUHUB_ID = 3;
  const EGG_CEDIS_MORELOS_ID = 2;

  // --- modo de vista ---
  // true = Me deben
  // false = Debo
  const [receivable, setReceivable] = useState(true);
  // --- query params ---
  const queryParams = receivable
    ? {
        creditorOriginalIds: [
          EGG_CEDIS_ORIGINAL_ID,
          EGG_CEDIS_CHUNHUHUB_ID,
          EGG_CEDIS_MORELOS_ID,
        ],
        creditorEntityType: "EGGCEDIS",
      }
    : {
        debtorOriginalIds: [
          EGG_CEDIS_ORIGINAL_ID,
          EGG_CEDIS_CHUNHUHUB_ID,
          EGG_CEDIS_MORELOS_ID,
        ],
        debtorEntityType: "EGGCEDIS",
      };

  const { data = [], isLoading } = useOpenAccounts(queryParams);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Cuentas</h1>

        <Button onClick={() => setOpenCreateModal(true)}>Crear Cuenta</Button>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-2">
        <Button
          color={receivable ? "blue" : "gray"}
          onClick={() => setReceivable(true)}
        >
          Por cobrar
        </Button>

        <Button
          color={!receivable ? "blue" : "gray"}
          onClick={() => setReceivable(false)}
        >
          Por pagar
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-lg bg-gray-800 shadow">
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : (
          <AccountsOpenTable
            data={data}
            onPay={handlePay}
            onViewHistory={handleViewHistory}
          />
        )}
        <AccountsPayableHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          account={selectedAccountForHistory}
        />
      </div>

      {/* Modal crear deuda */}
      <CreateEggAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* Modal registrar pago */}
      <RegisterPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
        cedisList={[
          EGG_CEDIS_ORIGINAL_ID,
          EGG_CEDIS_CHUNHUHUB_ID,
          EGG_CEDIS_MORELOS_ID,
        ]}
        creditorEntity="EGGCEDIS"
      />
    </div>
  );
};
