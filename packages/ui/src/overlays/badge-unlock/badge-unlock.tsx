import * as React from "react";
import type { BadgeChipProps } from "../../molecules/badge-chip/badge-chip";

export const BadgeUnlock = ({ badge }: { badge: BadgeChipProps["badge"] }) => (
	<div className="fixed top-4 right-4 border p-4 rounded-lg">
		Badge Unlocked: {badge.name}
	</div>
);
