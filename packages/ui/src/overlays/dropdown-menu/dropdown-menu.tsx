"use client";

import {
	FloatingPortal,
	type Placement,
	flip,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
	useTypeahead,
} from "@floating-ui/react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

// Types from spec
export interface DropdownMenuItem {
	type: "item" | "separator";
}

export interface DropdownMenuActionItem extends DropdownMenuItem {
	type: "item";
	label: string;
	icon?: LucideIcon;
	variant?: "default" | "danger";
	isDisabled?: boolean;
	onClick: () => void;
}

export interface DropdownMenuSeparator extends DropdownMenuItem {
	type: "separator";
}

export interface DropdownMenuProps {
	trigger: React.ReactNode;
	items: DropdownMenuItem[];
	placement?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	className?: string;
}

interface DropdownMenuContext {
	activeIndex: number | null;
	setActiveIndex: (index: number | null) => void;
	listRef: React.MutableRefObject<(HTMLButtonElement | null)[]>;
	labelsRef: React.MutableRefObject<(string | null)[]>;
	onOpenChange: (isOpen: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContext | null>(
	null,
);

export const DropdownMenu = ({
	trigger,
	items,
	placement = "bottom-end",
	isOpen,
	onOpenChange,
	className,
}: DropdownMenuProps) => {
	const dropdownId = React.useId();
	const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
	const listRef = React.useRef<(HTMLButtonElement | null)[]>([]);
	const labelsRef = React.useRef<(string | null)[]>([]);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange,
		placement,
		middleware: [flip()],
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
	});
	const typeahead = useTypeahead(context, {
		listRef: labelsRef,
		activeIndex,
		onMatch: setActiveIndex,
	});
	const { getReferenceProps, getFloatingProps } = useInteractions([
		click,
		dismiss,
		listNavigation,
		typeahead,
	]);

	// Reset activeIndex when menu closes
	React.useEffect(() => {
		if (!isOpen) {
			setActiveIndex(null);
		}
	}, [isOpen]);

	// Clean up refs on unmount
	React.useEffect(() => {
		return () => {
			listRef.current = [];
			labelsRef.current = [];
		};
	}, []);

	return (
		<DropdownMenuContext.Provider
			value={{ activeIndex, setActiveIndex, listRef, labelsRef, onOpenChange }}
		>
			{React.cloneElement(
				trigger as React.ReactElement,
				getReferenceProps({
					ref: refs.setReference,
					"aria-haspopup": "menu",
					"aria-expanded": isOpen,
					"aria-controls": dropdownId,
				}),
			)}

			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						role="menu"
						id={dropdownId}
						className={cn(
							"rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--shadow-dropdown)] border border-[var(--color-border-subtle)] min-w-[160px] max-w-[220px]",
							className,
						)}
						{...getFloatingProps()}
					>
						{items.map((item, index) => {
							const key =
								item.type === "separator"
									? `sep-${index}`
									: `item-${(item as DropdownMenuActionItem).label}-${index}`;
							if (item.type === "separator") {
								return (
									<hr
										key={key}
										className="my-[var(--space-1)] border-[var(--color-border-subtle)]"
									/>
								);
							}

							const actionItem = item as DropdownMenuActionItem;
							return (
								<DropdownMenuItemRenderer
									key={key}
									item={actionItem}
									index={
										items.slice(0, index).filter((i) => i.type === "item")
											.length
									}
								/>
							);
						})}
					</div>
				</FloatingPortal>
			)}
		</DropdownMenuContext.Provider>
	);
};

const DropdownMenuItemRenderer = React.memo(
	({
		item,
		index,
	}: {
		item: DropdownMenuActionItem;
		index: number;
	}) => {
		const context = React.useContext(DropdownMenuContext);
		if (!context)
			throw new Error(
				"DropdownMenuItemRenderer must be used within DropdownMenu",
			);

		const { activeIndex, setActiveIndex, listRef, labelsRef, onOpenChange } =
			context;
		const Icon = item.icon;
		const isDanger = item.variant === "danger";
		const isActive = activeIndex === index;

		return (
			<button
				ref={(node) => {
					listRef.current[index] = node;
					labelsRef.current[index] = item.label;
				}}
				type="button"
				role="menuitem"
				disabled={item.isDisabled}
				aria-disabled={item.isDisabled}
				tabIndex={isActive ? 0 : -1}
				onMouseEnter={() => setActiveIndex(index)}
				onMouseLeave={() => setActiveIndex(null)}
				onClick={() => {
					if (!item.isDisabled) {
						item.onClick();
						onOpenChange(false);
					}
				}}
				className={cn(
					"flex items-center gap-[var(--space-2)] w-full px-[var(--space-3)] py-[var(--space-2)] body-sm text-[var(--color-text-primary)] rounded-md transition-colors duration-[var(--dur-instant)] ease-[var(--ease-out)]",
					isDanger
						? "text-[var(--color-text-error)] hover:bg-[var(--color-bg-error)]"
						: "hover:bg-[var(--color-bg-surface)]",
					isActive &&
						(isDanger
							? "bg-[var(--color-bg-error)] ring-2 ring-[var(--color-border-error)]"
							: "bg-[var(--color-bg-surface)] ring-2 ring-[var(--shadow-focus)]"),
					item.isDisabled && "opacity-40 cursor-not-allowed",
				)}
			>
				{Icon && (
					<Icon
						size={16}
						className={cn(
							isDanger
								? "text-[var(--color-text-error)]"
								: "text-[var(--color-text-secondary)]",
						)}
					/>
				)}
				{item.label}
			</button>
		);
	},
);
DropdownMenuItemRenderer.displayName = "DropdownMenuItemRenderer";
