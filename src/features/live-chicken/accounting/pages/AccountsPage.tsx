import { useState } from "react";
import { Button } from "flowbite-react";

import { CreateAccountsPayableModal } from "../components/CreateAccountsPayableModal";
import { RegisterPaymentModal } from "../components/RegisterPaymentModal";
import { AccountsOpenTable } from "../components/AccountsOpenTable";
import type { AccountsPayableResponse } from "../accounts-payable/types";
import { useOpenAccounts } from "../accounts-payable/api/accounts-payable.queries";

export const AccountsPage = () => {
  // --- UI state ---
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountsPayableResponse | null>(null);

  // --- contexto actual (luego puede venir de auth) ---
  const CEDIS_ID = 2;

  // --- modo de vista ---
  // true = Me deben (CEDIS es acreedor)
  // false = Debo (CEDIS es deudor)
  const [meDeben, setMeDeben] = useState(true);

  // --- query params ---
  const queryParams = meDeben
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
        <h1 className="text-2xl font-semibold text-gray-900">Cuentas</h1>

        <Button onClick={() => setOpenCreateModal(true)}>+ Crear deuda</Button>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-2">
        <Button
          color={meDeben ? "blue" : "gray"}
          onClick={() => setMeDeben(true)}
        >
          Me deben
        </Button>

        <Button
          color={!meDeben ? "blue" : "gray"}
          onClick={() => setMeDeben(false)}
        >
          Debo
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-lg bg-white p-4 shadow">
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : (
          <AccountsOpenTable
            data={data}
            onPay={(account) => setSelectedAccount(account)}
          />
        )}
      </div>

      {/* Modal crear deuda */}
      <CreateAccountsPayableModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* Modal registrar pago */}
      <RegisterPaymentModal
        open={!!selectedAccount}
        account={selectedAccount ?? undefined}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
};
