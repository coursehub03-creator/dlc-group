import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.28)]",
        className
      )}
      {...props}
    />
  );
}
