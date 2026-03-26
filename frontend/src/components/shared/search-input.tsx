import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/90 px-4 py-3 text-on-surface-variant transition-colors focus-within:border-primary/30 focus-within:text-on-surface",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <input
        className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
        type="search"
        {...props}
      />
    </label>
  );
}
