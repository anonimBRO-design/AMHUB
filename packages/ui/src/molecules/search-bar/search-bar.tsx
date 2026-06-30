import { Loader2, Search, X } from "lucide-react";
import type * as React from "react";
import { Input } from "../../atoms/input";
import { cn } from "../../lib/utils";

export interface SearchBarProps {
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	onSubmit: (query: string) => void;
	isLoading?: boolean;
	className?: string;
	size?: "default" | "hero";
}

export const SearchBar = ({
	placeholder = "Search presets...",
	value,
	onChange,
	onSubmit,
	isLoading,
	className,
	size = "default",
}: SearchBarProps) => {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			onSubmit(value);
		}
	};

	return (
		<div
			className={cn(
				"relative w-full",
				size === "hero" ? "max-w-2xl" : "max-w-md",
				className,
			)}
		>
			<Input
				type="search"
				value={value}
				onChange={(val) => onChange(val)}
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
				className={cn(
					"pl-[var(--space-10)]",
					size === "hero" &&
						"h-[var(--space-8)] text-[var(--font-size-body-lg)]",
				)}
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
					aria-label="Clear search"
				>
					<X size={16} />
				</button>
			)}
		</div>
	);
};
