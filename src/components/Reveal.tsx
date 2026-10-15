import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
};

/** Small entrance animation, disabled automatically for reduced-motion users. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div
      className={className ? `reveal ${className}` : "reveal"}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
