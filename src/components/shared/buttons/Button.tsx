import type { ImageMetadata } from "astro";
import type { JSX } from "preact";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  id?: string;
  text?: string;
  variant?: "primary" | "secondary" | "blue" | "red" | "green";
  icon?: string | ImageMetadata;
  iconPosition?: "left" | "top" | "right" | "bottom";
  props?: JSX.HTMLAttributes<HTMLButtonElement>;
}

const Button = ({ id, text, variant = "primary", icon, iconPosition = "left", ...props }: ButtonProps): JSX.Element => {
  const colors = {
    primary: "var(--color-jacksons-purple-500)",
    secondary: "var(--color-snuff-500)",
    blue: "var(--color-blue-500)",
    red: "var(--color-red-500)",
    green: "var(--color-green-500)",
  };
  const backgroundColor = colors[variant] || colors.primary;

  // Manejo de eventos por ID
  const handleClick = () => {};

  return (
    <button
      class={`btn btn-${variant}`}
      style={{
        all: "unset",
        alingItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        display: "inline-flex",
        padding: "0rem 2rem",
        textAlign: "center",
        clipPath: "polygon(0 100%, 10% 0, 100% 0, 100% 0, 90% 100%, 0 100%)",
        borderTop: "3px solid black",
        borderBottom: "3px solid black",
        borderRadius: "5px",
        backgroundColor,
        cursor: "pointer",
      }}
      onClick={handleClick}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <img src={typeof icon === "string" ? icon : icon?.src} alt="" style={{ height: "1.5em" }} />
      )}
      <span>{text}</span>
      {icon && iconPosition === "right" && (
        <img src={typeof icon === "string" ? icon : icon?.src} alt="" style={{ height: "1.5em" }} />
      )}
    </button>
  );
};
export default Button;
