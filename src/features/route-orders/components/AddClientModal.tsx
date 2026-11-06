import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Client } from "@/core/api/types";

interface Props {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onAdd: (client: Client) => void;
}

const subtitleFor = (client: Client): string =>
  [client.businessName, client.localityName].filter(Boolean).join(" · ") ||
  "Cliente registrado";

export const AddClientModal: React.FC<Props> = ({
  open,
  clients,
  onClose,
  onAdd,
}) => {
  const [selected, setSelected] = useState<Client | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
  }, [open]);

  return (
    <Modal show={open} size="md" onClose={onClose}>
      <ModalHeader>Agregar cliente a esta hoja</ModalHeader>
      <ModalBody>
        <p className="mb-3 text-sm text-slate-300">
          Solo puedes agregar clientes ya registrados. Si el cliente no existe,
          créalo primero en Clientes y Rutas.
        </p>
        <SearchableSelect
          items={clients}
          selected={selected}
          onChange={setSelected}
          getValue={(client) => client.id}
          getLabel={(client) => client.name}
          getSubtitle={subtitleFor}
          placeholder="Buscar cliente por nombre"
          emptyMessage="No hay clientes disponibles para agregar"
        />
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          color="blue"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onAdd(selected);
            }
          }}
        >
          Agregar cliente
        </Button>
      </ModalFooter>
    </Modal>
  );
};
