import { useEffect, useState } from "react";
import { Button } from "flowbite-react";

import { CreateAccountsPayableModal } from "../../../accounting/components/CreateAccountsPayableModal";
import { RegisterPaymentModal } from "../../../accounting/components/RegisterPaymentModal";
import { AccountsOpenTable } from "../../../accounting/components/AccountsOpenTable";
import { useOpenAccounts } from "../../../accounting/api/accounts-payable.queries";
import { AccountsPayableHistoryDrawer } from "../../../accounting/components/AccountsPayableHistoryDrawer";
import type { AccountsPayableResponse } from "@/features/live-chicken/accounting/accounts-payable/types";

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
  const CEDIS_ID = 2;

  // --- modo de vista ---
  // true = Me deben (CEDIS es acreedor)
  // false = Debo (CEDIS es deudor)
  const [receivable, setReceivable] = useState(true);

  // --- query params ---
  const queryParams = receivable
    ? {
        creditorId: CEDIS_ID,
      }
    : {
        debtorId: CEDIS_ID,
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
      <CreateAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* Modal registrar pago */}
      <RegisterPaymentModal
        open={!!selectedAccountForPay}
        account={selectedAccountForPay ?? undefined}
        onClose={() => setSelectedAccountForPay(null)}
      />
    </div>
  );
};
