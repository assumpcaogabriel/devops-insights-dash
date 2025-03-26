export const Tabs = ({ children }) => <div>{children}</div>;
export const TabsList = ({ children, className }) => (
  <div className={`flex gap-2 ${className}`}>{children}</div>
);
export const TabsTrigger = ({ value, children }) => (
  <button className="px-4 py-2 bg-white/20 rounded">{children}</button>
);
export const TabsContent = ({ value, children }) => <div>{children}</div>;