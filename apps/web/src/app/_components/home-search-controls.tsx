"use client";

import { FilterChip, SearchBar } from "@presethub/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
	{ id: "jj", label: "JJ" },
	{ id: "jj-tipis", label: "JJ Tipis" },
	{ id: "jj-melar", label: "JJ Kenyat-Kenyot" },
	{ id: "jj-belah", label: "JJ Belah" },
	{ id: "anime", label: "Anime" },
	{ id: "gaming", label: "Gaming" },
	{ id: "lyric", label: "Lyric" },
];

export const HomeSearchControls = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get("search") ?? "";
	const [searchValue, setSearchValue] = useState(initialSearch);

	const handleSearch = (query: string) => {
		const params = new URLSearchParams(searchParams);
		if (query.trim()) params.set("search", query.trim());
		else params.delete("search");
		router.push(`/?${params.toString()}`);
	};

	const handleFilterClick = (category: string) => {
		const params = new URLSearchParams(searchParams);
		if (category === "All") params.delete("category");
		else params.set("category", category);
		router.push(`/?${params.toString()}`);
	};

	return (
		<div className="space-y-8">
			<div className="flex justify-center">
				<SearchBar
					value={searchValue}
					onChange={setSearchValue}
					onSubmit={handleSearch}
				/>
			</div>

			<div className="flex flex-wrap gap-2 justify-center">
				<FilterChip
					label="All"
					isActive={!searchParams.has("category")}
					onClick={() => handleFilterClick("All")}
				/>
				{CATEGORIES.map((category) => (
					<FilterChip
						key={category.id}
						label={category.label}
						isActive={searchParams.get("category") === category.id}
						onClick={() => handleFilterClick(category.id)}
					/>
				))}
			</div>
		</div>
	);
};
