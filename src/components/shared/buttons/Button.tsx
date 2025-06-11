import type { JSX } from "preact";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  id?: string;
  text?: string;
  variant?: "primary" | "secondary" | "blue" | "red" | "green";
  icon?: string;
  iconPosition?: "left" | "top" | "right" | "bottom";
  props?: JSX.HTMLAttributes<HTMLButtonElement>;
}

const Button = ({
  id,
  text = "Click me",
  variant = "primary",
  icon,
  iconPosition,
  ...props
}: ButtonProps): JSX.Element => {
  const colors = {
    primary: "var(--color-jacksons-purple-500)",
    secondary: "var(--color-snuff-500)",
    blue: "var(--color-blue-500)",
    red: "var(--color-red-500)",
    green: "var(--color-green-500)",
  };
  const backgroundColor = colors[variant] || colors.primary;

  // Manejo de eventos por ID
  const handleClick = () => {
    if (id === "boton-uno") {
      console.log(`On click del boton 1`);
    }
  };

  return (
    <button
      class={`btn btn-${variant}`}
      style={{
        cursor: "pointer",
        clipPath: "polygon(0 100%, 10% 0, 100% 0, 100% 0, 90% 100%, 0 100%)",
        borderTop: "3px solid black",
        borderBottom: "3px solid black",
        borderRadius: "5px",
        backgroundColor,
        color: "white",
      }}
      onClick={handleClick}
      {...props}
    >
      {text}
    </button>
  );
};
export default Button;
