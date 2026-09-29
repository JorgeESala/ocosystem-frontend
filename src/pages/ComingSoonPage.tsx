import { Card } from "flowbite-react";
import { HiOutlineClock } from "react-icons/hi";

interface Props {
  title?: string;
  description?: string;
}

export default function ComingSoonPage({
  title = "Estamos trabajando en esta sección",
  description = "Muy pronto podrás consultar este módulo.",
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6 text-center text-gray-100">
      <Card className="w-full max-w-md border-none bg-gray-800 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-blue-900/30 p-4 text-blue-400">
            <HiOutlineClock className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>
      </Card>
    </div>
  );
}
