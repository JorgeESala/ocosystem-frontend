export const BatchFooterContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-xs font-medium text-gray-300">
    {children}
  </div>
);

const StatItem: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}> = ({ icon: Icon, label, value, color = "text-white" }) => (
  <div className="flex items-center gap-2">
    <Icon className="text-lg text-gray-500" />
    <span>
      {label}: <span className={color}>{value}</span>
    </span>
  </div>
);
