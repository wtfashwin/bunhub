import React from "react";

export default function ThemeToggle() {
  const toggle = () => {
    document.body.dataset.light =
      document.body.dataset.light === "0" ? "1" : "0";
  };
  return (
    <button
      className="btn-secondary mb-4"
      onClick={toggle}
    >
      Toggle Dark/Light
    </button>
  );
}
