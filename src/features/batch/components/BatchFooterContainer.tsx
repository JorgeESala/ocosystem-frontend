export const BatchFooterContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-xs font-medium text-gray-300">
    {children}
  </div>
);
