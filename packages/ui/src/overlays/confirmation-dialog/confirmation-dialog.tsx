import * as React from "react";
import { Button } from "../../atoms/button";

export const ConfirmationDialog = ({
	onConfirm,
	onCancel,
}: { onConfirm: () => void; onCancel: () => void }) => (
	<div className="fixed inset-0 flex items-center justify-center bg-black/50">
		<div className="rounded-lg bg-white p-6">
			<p>Are you sure?</p>
			<div className="mt-4 flex gap-2">
				<Button onClick={onCancel}>Cancel</Button>
				<Button variant="destructive" onClick={onConfirm}>
					Confirm
				</Button>
			</div>
		</div>
	</div>
);
