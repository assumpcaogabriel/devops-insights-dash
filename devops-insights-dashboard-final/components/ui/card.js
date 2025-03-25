export const Card = ({ children, className }) => (
  <div className={`rounded-xl p-4 bg-white/10 shadow ${className}`}>{children}</div>
);
export const CardContent = ({ children, className }) => (
  <div className={`mt-2 ${className}`}>{children}</div>
);