import type { JSX } from "preact";

interface ButtonProps {
  text?: string;
  variant?: "primary" | "secondary" | "blue" | "red" | "green";
  icon?: string;
  iconPosition?: "left" | "top" | "right" | "bottom";
  onClick?: () => void;
}

const Button = ({ text = "Click me", variant = "primary", onClick }: ButtonProps): JSX.Element => {
  const colors = {
    primary: "#3a2e6c", // Jackson's Purple
    secondary: "#b8b8b8", // Snuff
    blue: "#007bff", // Blue
    red: "#dc3545", // Red
    green: "#28a745", // Green
  };

  const backgroundColor = colors[variant] || colors.primary;

  return (
    <button
      class={`btn btn-${variant}`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        clipPath: "polygon(0 100%, 10% 0, 100% 0, 100% 0, 90% 100%, 0 100%)",
        borderTop: "3px solid black",
        borderBottom: "3px solid black",
        borderRadius: "5px",
        backgroundColor,
        color: "white",
      }}
    >
      {text}
    </button>
  );
};

export default Button;
