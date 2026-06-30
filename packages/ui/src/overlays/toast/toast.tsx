import * as React from "react";
export const Toast = ({ message }: { message: string }) => (
	<div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg">
		{message}
	</div>
);
