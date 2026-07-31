"use client";

import { FilterChip, SearchBar } from "@presethub/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
	"velocity",
	"transition",
	"color",
	"anime",
	"gaming",
	"lyric",
];

const SORT_OPTIONS = [
	{ label: "Newest", value: "created_at" },
	{ label: "Most Downloaded", value: "download_count" },
	{ label: "Most Liked", value: "like_count" },
	{ label: "Most Viewed", value: "view_count" },
];

export const ExploreControls = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialSearch = searchParams.get("search") ?? "";
	const [searchValue, setSearchValue] = useState(initialSearch);

	const handleSearch = (query: string) => {
		const params = new URLSearchParams(searchParams);
		if (query.trim()) params.set("search", query.trim());
		else params.delete("search");
		router.push(`/explore?${params.toString()}`);
	};

	const handleFilterClick = (category: string) => {
		const params = new URLSearchParams(searchParams);
		if (category === "All") params.delete("category");
		else params.set("category", category);
		router.push(`/explore?${params.toString()}`);
	};

	const handleSortChange = (sort: string) => {
		const params = new URLSearchParams(searchParams);
		if (sort === "created_at") params.delete("sort");
		else params.set("sort", sort);
		router.push(`/explore?${params.toString()}`);
	};

	const activeCategory = searchParams.get("category");
	const activeSort = searchParams.get("sort") ?? "created_at";

	return (
		<div className="space-y-6">
			<div className="flex justify-center">
				<SearchBar
					value={searchValue}
					onChange={setSearchValue}
					onSubmit={handleSearch}
					size="hero"
					placeholder="Search presets by name, category, or tag..."
				/>
			</div>

			<div className="flex flex-wrap gap-2 justify-center">
				<FilterChip
					label="All"
					isActive={!activeCategory}
					onClick={() => handleFilterClick("All")}
				/>
				{CATEGORIES.map((category) => (
					<FilterChip
						key={category}
						label={category.charAt(0).toUpperCase() + category.slice(1)}
						isActive={activeCategory === category}
						onClick={() => handleFilterClick(category)}
					/>
				))}
			</div>

			<div className="flex flex-wrap gap-2 justify-center">
				{SORT_OPTIONS.map((option) => (
					<FilterChip
						key={option.value}
						label={option.label}
						isActive={activeSort === option.value}
						onClick={() => handleSortChange(option.value)}
					/>
				))}
			</div>
		</div>
	);
};
