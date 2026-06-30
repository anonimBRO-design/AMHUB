"use client";

export default function AppError({ error }: { error: Error }) {
	return <div className="p-6 text-red-500">Error: {error.message}</div>;
}
