import type * as React from "react";
export const Tooltip = ({
	children,
	content,
}: { children: React.ReactNode; content: string }) => (
	<div className="relative group">
		{children}
		<span className="absolute bottom-full mb-2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100">
			{content}
		</span>
	</div>
);
