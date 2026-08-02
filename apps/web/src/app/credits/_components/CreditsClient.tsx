import { AIContributorGrid } from "./AIContributorGrid";
import { CreatorCard } from "./CreatorCard";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { SpecialThanks } from "./SpecialThanks";
import { TechStackGrid } from "./TechStackGrid";

export function CreditsClient() {
	return (
		<div className="space-y-8 max-w-4xl mx-auto pb-12">
			<Hero />
			<CreatorCard />
			<AIContributorGrid />
			<TechStackGrid />
			<SpecialThanks />
			<Footer />
		</div>
	);
}
