// "use client";

// import { useState } from "react";
// import {
//   Button,
//   Datepicker,
//   Modal,
//   ModalBody,
//   ModalHeader,
// } from "flowbite-react";

// export default function EggBatchAndSalesPage() {
//   const [openModal, setOpenModal] = useState(false);
//   const [startDate, setStartDate] = useState<Date | null>(new Date());
//   const [endDate, setEndDate] = useState<Date | null>(new Date());
//   const [hasSearched, setHasSearched] = useState(false);

//   const createInboundBatchMutation = useCreateInboundBatch();

//   const handleBatchCreated = async (values: InboundBatchFormValues) => {
//     if (!values.date || !values.supplierId) return;

//     await createInboundBatchMutation.mutateAsync({
//       supplierId: values.supplierId,
//       date: values.date.toISOString().split("T")[0], // YYYY-MM-DD
//       realWeight: Number(values.realWeight),
//       declaredWeight: Number(values.declaredWeight),
//       chickenQuantity: Number(values.chickenQuantity),
//       pricePerKg: Number(values.pricePerKg),
//     });

//     setOpenModal(false);
//   };

//   const handleSearch = () => {
//     setHasSearched(true);
//   };
//   return (
//     <div>
//       <h1 className="mt-4 text-center text-2xl font-bold">Pollo Vivo</h1>
//       <div className="mx-auto mt-6 max-w-xl">
//         {/* --- Header igual al de Gastos --- */}
//         <div className="mb-4 flex items-center justify-between">
//           <h1 className="text-2xl font-semibold text-white">
//             Remesas y Ventas
//           </h1>

//           <Button onClick={() => setOpenModal(true)}>Nueva Remesa</Button>
//         </div>

//         {/* --- MultiSelect centrado y con altura limitada --- */}

//         <div>
//           <label>Inicio</label>
//           <Datepicker onChange={(d) => setStartDate(d)} language="es-MX" />
//         </div>

//         <div>
//           <label>Fin</label>
//           <Datepicker onChange={(d) => setEndDate(d)} language="es-MX" />
//         </div>
//         <div className="mt-2">
//           <Button disabled fullSized onClick={handleSearch}>
//             Buscar
//           </Button>
//         </div>
//       </div>
//       {/* --- Tabla --- */}
//       <div className="mt-4">
//         <EggBatchList
//           startDate={startDate}
//           endDate={endDate}
//           enabled={hasSearched}
//         />
//       </div>

//       {/* --- Modal --- */}
//       <Modal
//         show={openModal}
//         onClose={() => setOpenModal(false)}
//         size="md"
//         popup
//         className="bg-gray-800"
//       >
//         <ModalHeader></ModalHeader>

//         <ModalBody>
//           <EggBatchEntryForm
//             open={openModal}
//             onClose={() => setOpenModal(false)}
//             onSubmit={handleBatchCreated}
//           />
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// }
