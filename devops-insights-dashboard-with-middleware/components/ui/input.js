export const Input = (props) => (
  <input
    {...props}
    className={`border p-2 rounded text-black ${props.className || ""}`}
  />
);