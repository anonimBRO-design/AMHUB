"use client";

import { useEffect } from "react";

export function PointerCaptureGuard() {
	useEffect(() => {
		if (typeof window !== "undefined" && typeof Element !== "undefined") {
			const originalReleasePointerCapture =
				Element.prototype.releasePointerCapture;
			const originalSetPointerCapture = Element.prototype.setPointerCapture;

			Element.prototype.releasePointerCapture = function (pointerId: number) {
				try {
					if (
						typeof this.hasPointerCapture === "function" &&
						!this.hasPointerCapture(pointerId)
					) {
						return;
					}
					originalReleasePointerCapture.call(this, pointerId);
				} catch (_) {
					// Ignore invalid pointer ID error during unmounting or touch interactions
				}
			};

			Element.prototype.setPointerCapture = function (pointerId: number) {
				try {
					originalSetPointerCapture.call(this, pointerId);
				} catch (_) {
					// Ignore invalid pointer ID during fast touch gestures
				}
			};
		}
	}, []);

	return null;
}
