import type * as React from "react";
export const Modal = ({
	children,
	isOpen,
}: { children: React.ReactNode; isOpen: boolean }) =>
	isOpen ? (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			{children}
		</div>
	) : null;
