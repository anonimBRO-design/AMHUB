/**
 * Alight Motion XML Parser & Asset Extractor
 * Safely parses .xml presets to extract required fonts, visual effects,
 * layer counts, and project metadata without needing Alight Motion installed.
 */

export interface AmXmlMetadata {
	fonts: {
		name: string;
		cleanName: string;
		searchUrl: string;
	}[];
	effects: {
		id: string;
		name: string;
	}[];
	layerStats: {
		total: number;
		text: number;
		media: number;
		shape: number;
		audio: number;
	};
	projectInfo: {
		width?: number;
		height?: number;
		fps?: number;
		aspectRatio?: string;
	};
}

const KNOWN_EFFECT_NAMES: Record<string, string> = {
	"com.alightcreative.effects.motionblur": "Motion Blur",
	"com.alightcreative.effects.tiles": "Tiles (Ubin)",
	"com.alightcreative.effects.shake": "Shake (Goyang)",
	"com.alightcreative.effects.oscillate": "Oscillate (Ayun)",
	"com.alightcreative.effects.rgbsplit": "RGB Split",
	"com.alightcreative.effects.rgb": "RGB Color Shift",
	"com.alightcreative.effects.glow": "Glow (Pijar)",
	"com.alightcreative.effects.exposure": "Exposure / Gamma",
	"com.alightcreative.effects.gaussianblur": "Gaussian Blur",
	"com.alightcreative.effects.directionalblur": "Directional Blur",
	"com.alightcreative.effects.pinch": "Pinch / Bulge",
	"com.alightcreative.effects.spin": "Spin (Putar)",
	"com.alightcreative.effects.swirl": "Swirl (Pusaran)",
	"com.alightcreative.effects.mirror": "Mirror (Cermin)",
	"com.alightcreative.effects.chromakey": "Chroma Key (Green Screen)",
	"com.alightcreative.effects.colorgradient": "Color Gradient",
	"com.alightcreative.effects.displacement": "Displacement Map",
	"com.alightcreative.effects.rays": "Light Rays (Sinar)",
	"com.alightcreative.effects.vignette": "Vignette",
	"com.alightcreative.effects.autoshake": "Auto Shake",
	"com.alightcreative.effects.turbulence": "Turbulent Displace",
	"com.alightcreative.effects.pixelate": "Pixelate",
	"com.alightcreative.effects.zoomblur": "Zoom Blur",
};

export function parseAlightMotionXml(xmlContent: string): AmXmlMetadata {
	const rawFonts = new Set<string>();
	const effectIds = new Set<string>();

	let totalLayers = 0;
	let textLayers = 0;
	let mediaLayers = 0;
	let shapeLayers = 0;
	let audioLayers = 0;

	// Extract project attributes
	let width: number | undefined;
	let height: number | undefined;
	let fps: number | undefined;

	// 1. Project / Scene dimensions
	const widthMatch = xmlContent.match(/\b(?:width|w)=["'](\d+)["']/i);
	if (widthMatch) width = parseInt(widthMatch[1], 10);

	const heightMatch = xmlContent.match(/\b(?:height|h)=["'](\d+)["']/i);
	if (heightMatch) height = parseInt(heightMatch[1], 10);

	const fpsMatch = xmlContent.match(/\b(?:fps|framerate)=["'](\d+)["']/i);
	if (fpsMatch) fps = parseInt(fpsMatch[1], 10);

	// Compute aspect ratio
	let aspectRatio: string | undefined;
	if (width && height) {
		const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
		const divisor = gcd(width, height);
		const rw = width / divisor;
		const rh = height / divisor;
		if (rw === 9 && rh === 16) aspectRatio = "9:16";
		else if (rw === 16 && rh === 9) aspectRatio = "16:9";
		else if (rw === 1 && rh === 1) aspectRatio = "1:1";
		else if (rw === 4 && rh === 5) aspectRatio = "4:5";
		else aspectRatio = `${width}:${height}`;
	}

	// 2. Extract Fonts
	const fontRegex = /\b(?:font|fontFamily)=["']([^"']+)["']/gi;
	let match: RegExpExecArray | null;
	while ((match = fontRegex.exec(xmlContent)) !== null) {
		const font = match[1]?.trim();
		if (font && !font.startsWith("http") && font.length > 1) {
			const clean = font.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
			if (clean) rawFonts.add(clean);
		}
	}

	const propFontRegex = /<property[^>]*name=["']font["'][^>]*value=["']([^"']+)["']/gi;
	while ((match = propFontRegex.exec(xmlContent)) !== null) {
		const font = match[1]?.trim();
		if (font && !font.startsWith("http") && font.length > 1) {
			const clean = font.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
			if (clean) rawFonts.add(clean);
		}
	}

	// 3. Extract Effects
	const effectRegex = /<effect[^>]*id=["']([^"']+)["']/gi;
	while ((match = effectRegex.exec(xmlContent)) !== null) {
		const eff = match[1]?.trim();
		if (eff) effectIds.add(eff);
	}

	const effectAttrRegex = /\beffectId=["']([^"']+)["']/gi;
	while ((match = effectAttrRegex.exec(xmlContent)) !== null) {
		const eff = match[1]?.trim();
		if (eff) effectIds.add(eff);
	}

	// 4. Layer counts
	const shapeMatches = xmlContent.match(/<shape\b/gi);
	if (shapeMatches) shapeLayers = shapeMatches.length;

	const textMatches = xmlContent.match(/<text\b/gi);
	if (textMatches) textLayers = textMatches.length;

	const mediaMatches = xmlContent.match(/<media\b/gi);
	if (mediaMatches) mediaLayers = mediaMatches.length;

	const audioMatches = xmlContent.match(/<audio\b|<media[^>]*type=["']audio["']/gi);
	if (audioMatches) audioLayers = audioMatches.length;

	const layerMatches = xmlContent.match(/<(?:layer|shape|text|media)\b/gi);
	totalLayers = layerMatches ? layerMatches.length : shapeLayers + textLayers + mediaLayers;

	// Format fonts
	const fonts = Array.from(rawFonts).map((font) => {
		const cleanName = font
			.replace(/[-_]/g, " ")
			.replace(/([a-z])([A-Z])/g, "$1 $2")
			.trim();
		return {
			name: font,
			cleanName,
			searchUrl: `https://www.google.com/search?q=${encodeURIComponent(
				`download font "${cleanName}" dafont`,
			)}`,
		};
	});

	// Format effects
	const effects = Array.from(effectIds).map((id) => {
		const lowerId = id.toLowerCase();
		if (KNOWN_EFFECT_NAMES[lowerId]) {
			return { id, name: KNOWN_EFFECT_NAMES[lowerId] };
		}
		const lastSegment = id.split(".").pop() || id;
		const name = lastSegment
			.replace(/[-_]/g, " ")
			.replace(/([a-z])([A-Z])/g, "$1 $2")
			.replace(/\b\w/g, (c) => c.toUpperCase());
		return { id, name };
	});

	return {
		fonts,
		effects,
		layerStats: {
			total: totalLayers,
			text: textLayers,
			media: mediaLayers,
			shape: shapeLayers,
			audio: audioLayers,
		},
		projectInfo: {
			width,
			height,
			fps,
			aspectRatio,
		},
	};
}
