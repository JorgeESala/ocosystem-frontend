import { Card } from "flowbite-react";

// Sub-componente para los KPI Cards
export const KPICard = ({ title, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: "bg-blue-900/30 text-blue-400",
    purple: "bg-purple-900/30 text-purple-400",
    green: "bg-green-900/30 text-green-400",
    orange: "bg-orange-900/30 text-orange-400",
    yellow: "bg-yellow-900/30 text-yellow-400",
    pink: "bg-pink-900/30 text-pink-400",
    red: "bg-red-900/30 text-red-400",
  };

  return (
    <Card className="border-none bg-gray-800 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium tracking-wider text-gray-400 uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${colorMap[color]}`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </Card>
  );
};
