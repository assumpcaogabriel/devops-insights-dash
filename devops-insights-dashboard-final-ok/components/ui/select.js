export const Select = ({ children, onValueChange, defaultValue }) => (
  <select
    defaultValue={defaultValue}
    onChange={(e) => onValueChange(e.target.value)}
    className="p-2 text-black rounded"
  >
    {children}
  </select>
);
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);