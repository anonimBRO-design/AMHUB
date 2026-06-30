import * as React from "react";
import { Button } from "../../atoms/button";
import { cn } from "../../lib/utils";

export const UploadWizard = ({ currentStep = 1 }: { currentStep?: number }) => {
	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-6 flex justify-between">
				{["Files", "Details", "Preview"].map((step, i) => (
					<span
						key={step}
						className={cn(
							i + 1 === currentStep
								? "text-primary font-bold"
								: "text-gray-400",
						)}
					>
						{i + 1}. {step}
					</span>
				))}
			</div>
			<div className="min-h-[300px] border rounded-lg p-6">
				Step {currentStep} Content
			</div>
			<div className="mt-6 flex justify-between">
				<Button variant="ghost">Back</Button>
				<Button>Next</Button>
			</div>
		</div>
	);
};
