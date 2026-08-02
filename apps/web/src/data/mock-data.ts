import type { PresetWithCreator } from "./presets";

export interface MockCreator {
	id: string;
	username: string;
	display_name: string;
	email: string;
	avatar_url: string;
	banner_url: string;
	bio: string;
	website_url: string;
	tiktok_handle: string;
	instagram_handle: string;
	discord_handle: string;
	youtube_url: string;
	xp: number;
	level: number;
	level_name: string;
	is_verified: boolean;
	is_staff: boolean;
	country_code: string;
	follower_count: number;
	following_count: number;
	total_downloads: number;
	total_likes: number;
	preset_count: number;
	created_at: string;
	updated_at: string;
	achievements: {
		id: string;
		title: string;
		icon: string;
		description: string;
	}[];
	badges: string[];
	favorite_categories: string[];
}

export interface MockComment {
	id: string;
	preset_id: string;
	user_id: string;
	parent_id: string | null;
	body: string;
	like_count: number;
	reply_count: number;
	is_pinned: boolean;
	is_removed: boolean;
	created_at: string;
	user: {
		id: string;
		username: string;
		display_name: string;
		avatar_url: string;
		is_verified: boolean;
	};
}

export interface MockNotification {
	id: string;
	user_id: string;
	type:
		| "like"
		| "comment"
		| "follow"
		| "download"
		| "system"
		| "approval"
		| "moderation";
	actor_id: string | null;
	preset_id: string | null;
	message: string;
	is_read: boolean;
	created_at: string;
	actor?: {
		username: string;
		display_name: string;
		avatar_url: string;
	};
	preset?: {
		slug: string;
		title: string;
	};
}

// ---------------------------------------------------------------------------
// 30 REALISTIC CREATORS
// ---------------------------------------------------------------------------
export const MOCK_CREATORS: MockCreator[] = [
	{
		id: "usr-01",
		username: "vfx_master",
		display_name: "Alexey 'VFX Master' Romanov",
		email: "alexey@vfxmaster.design",
		avatar_url:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
		bio: "Senior Motion Designer & VFX Artist. Creating production-grade Alight Motion velocity ramps, 3D camera shakes, and RGB split effects for 6+ years.",
		website_url: "https://vfxmaster.design",
		tiktok_handle: "vfx_master_official",
		instagram_handle: "vfxmaster_edits",
		discord_handle: "VFXMaster#0001",
		youtube_url: "https://youtube.com/@vfxmaster_official",
		xp: 28400,
		level: 5,
		level_name: "Master Creator",
		is_verified: true,
		is_staff: true,
		country_code: "US",
		follower_count: 48500,
		following_count: 142,
		total_downloads: 382000,
		total_likes: 54200,
		preset_count: 24,
		created_at: "2024-01-15T08:00:00.000Z",
		updated_at: "2026-07-28T12:00:00.000Z",
		achievements: [
			{
				id: "top-1-percent",
				title: "Top 1% Creator",
				icon: "🏆",
				description: "Over 300K total downloads across presets",
			},
			{
				id: "verified-pro",
				title: "Verified Pro Editor",
				icon: "⚡",
				description: "Official AMHUB verified motion artist",
			},
			{
				id: "community-legend",
				title: "Community Legend",
				icon: "👑",
				description: "Consistently featured in monthly editor spotlights",
			},
		],
		badges: [
			"Verified Editor",
			"300K Downloads Club",
			"Trending Star",
			"VFX Staff",
		],
		favorite_categories: ["velocity", "3d", "transition"],
	},
	{
		id: "usr-02",
		username: "motion_pro",
		display_name: "Elena Rostova",
		email: "elena@motionpro.io",
		avatar_url:
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
		bio: "Anime AMV Editor & Motion Graphics Specialist. Making ultra-smooth 60fps transitions and cinematic color grades.",
		website_url: "https://elena-motion.com",
		tiktok_handle: "elena_amv",
		instagram_handle: "elena_edits_am",
		discord_handle: "ElenaAMV#1337",
		youtube_url: "https://youtube.com/@elena_motion",
		xp: 21500,
		level: 4,
		level_name: "Senior Editor",
		is_verified: true,
		is_staff: false,
		country_code: "JP",
		follower_count: 31200,
		following_count: 89,
		total_downloads: 245000,
		total_likes: 38900,
		preset_count: 18,
		created_at: "2024-02-10T10:30:00.000Z",
		updated_at: "2026-07-29T14:20:00.000Z",
		achievements: [
			{
				id: "amv-master",
				title: "AMV Master",
				icon: "🌸",
				description: "Top anime editor on the platform",
			},
			{
				id: "smooth-operator",
				title: "Smooth Interpolation",
				icon: "💫",
				description: "Famous for 60fps bezier curve presets",
			},
		],
		badges: ["Verified Editor", "200K Club", "Anime AMV Pro"],
		favorite_categories: ["anime", "color", "lyric"],
	},
	{
		id: "usr-03",
		username: "alight_god",
		display_name: "Kenji Takahashi",
		email: "kenji@alightgod.net",
		avatar_url:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
		bio: "Gaming Montage Specialist & Speed Ramping Wizard. 100% free XML & Alight import links.",
		website_url: "https://alightgod.net",
		tiktok_handle: "kenji_edits",
		instagram_handle: "kenji_alight",
		discord_handle: "Kenji#7777",
		youtube_url: "https://youtube.com/@kenjigaming",
		xp: 19800,
		level: 4,
		level_name: "Senior Editor",
		is_verified: true,
		is_staff: false,
		country_code: "KR",
		follower_count: 27800,
		following_count: 64,
		total_downloads: 198000,
		total_likes: 29400,
		preset_count: 15,
		created_at: "2024-03-01T12:00:00.000Z",
		updated_at: "2026-07-30T09:15:00.000Z",
		achievements: [
			{
				id: "gaming-king",
				title: "Gaming Montage King",
				icon: "🎮",
				description: "Most downloaded gaming preset creator",
			},
		],
		badges: ["Verified Editor", "100K Club", "Gaming Specialist"],
		favorite_categories: ["gaming", "velocity", "3d"],
	},
	{
		id: "usr-04",
		username: "glow_fx",
		display_name: "Maya 'GlowFX' Lin",
		email: "maya@glowfx.app",
		avatar_url:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
		bio: "Neon Lighting & Saber Effect Designer. Creator of the viral Neon Outline & Soft Glow presets.",
		website_url: "https://glowfx.app",
		tiktok_handle: "glowfx_maya",
		instagram_handle: "glowfx_creations",
		discord_handle: "MayaGlow#0404",
		youtube_url: "https://youtube.com/@glowfx_maya",
		xp: 16500,
		level: 4,
		level_name: "Senior Editor",
		is_verified: true,
		is_staff: false,
		country_code: "CA",
		follower_count: 22400,
		following_count: 110,
		total_downloads: 162000,
		total_likes: 24800,
		preset_count: 14,
		created_at: "2024-03-15T15:45:00.000Z",
		updated_at: "2026-07-27T18:00:00.000Z",
		achievements: [
			{
				id: "viral-creator",
				title: "Viral Sensation",
				icon: "✨",
				description: "Neon Glow preset hit 100k downloads in 30 days",
			},
		],
		badges: ["Verified Editor", "100K Club", "Glow Specialist"],
		favorite_categories: ["color", "anime", "transition"],
	},
	{
		id: "usr-05",
		username: "velocity_queen",
		display_name: "Sophia 'VelocityQueen' Rossi",
		email: "sophia@velocityqueen.com",
		avatar_url:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
		bio: "TikTok trend velocity creator. Fast edits, tight audio syncing, zero lag XMLs.",
		website_url: "https://velocityqueen.com",
		tiktok_handle: "velocity_queen_real",
		instagram_handle: "sophia_velocity",
		discord_handle: "SophiaVR#9999",
		youtube_url: "https://youtube.com/@velocityqueen",
		xp: 15200,
		level: 3,
		level_name: "Expert Editor",
		is_verified: true,
		is_staff: false,
		country_code: "IT",
		follower_count: 19800,
		following_count: 75,
		total_downloads: 141000,
		total_likes: 21500,
		preset_count: 12,
		created_at: "2024-04-01T09:20:00.000Z",
		updated_at: "2026-07-25T11:10:00.000Z",
		achievements: [],
		badges: ["Verified Editor", "100K Club"],
		favorite_categories: ["velocity", "lyric"],
	},
	{
		id: "usr-06",
		username: "anime_edits_99",
		display_name: "Lucas Silva",
		email: "lucas@animeedits.br",
		avatar_url:
			"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
		bio: "Brazilian AMV Creator & Colorist. Bringing high impact shakes and custom LUTS to Alight Motion.",
		website_url: "https://animeedits.br",
		tiktok_handle: "lucas_amv_br",
		instagram_handle: "lucas_edits_br",
		discord_handle: "LucasBR#1234",
		youtube_url: "https://youtube.com/@lucas_anime_edits",
		xp: 12800,
		level: 3,
		level_name: "Expert Editor",
		is_verified: false,
		is_staff: false,
		country_code: "BR",
		follower_count: 15400,
		following_count: 120,
		total_downloads: 98000,
		total_likes: 16200,
		preset_count: 11,
		created_at: "2024-04-12T14:00:00.000Z",
		updated_at: "2026-07-26T16:30:00.000Z",
		achievements: [],
		badges: ["Rising Star", "Anime Specialist"],
		favorite_categories: ["anime", "color"],
	},
	{
		id: "usr-07",
		username: "hyper_transition",
		display_name: "David Chen",
		email: "david@hypertransition.com",
		avatar_url:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
		bio: "Seamless 3D Whip, Spin & Tile Transition designer. Clean XML files for Alight Motion v4.0+.",
		website_url: "https://hypertransition.com",
		tiktok_handle: "david_hyper",
		instagram_handle: "david_transitions",
		discord_handle: "DavidHyper#2024",
		youtube_url: "https://youtube.com/@hyper_transitions",
		xp: 11400,
		level: 3,
		level_name: "Expert Editor",
		is_verified: true,
		is_staff: false,
		country_code: "SG",
		follower_count: 13900,
		following_count: 55,
		total_downloads: 88500,
		total_likes: 14200,
		preset_count: 10,
		created_at: "2024-04-20T11:15:00.000Z",
		updated_at: "2026-07-24T19:40:00.000Z",
		achievements: [],
		badges: ["Verified Editor", "Transition Expert"],
		favorite_categories: ["transition", "3d"],
	},
	{
		id: "usr-08",
		username: "neon_visuals",
		display_name: "Zara Patel",
		email: "zara@neonvisuals.co",
		avatar_url:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
		bio: "Cyberpunk aesthetics, neon stroke animations & liquid distort effects.",
		website_url: "https://neonvisuals.co",
		tiktok_handle: "zara_neon",
		instagram_handle: "zara_visuals",
		discord_handle: "ZaraNeon#8080",
		youtube_url: "https://youtube.com/@neon_visuals",
		xp: 9800,
		level: 3,
		level_name: "Expert Editor",
		is_verified: false,
		is_staff: false,
		country_code: "GB",
		follower_count: 11800,
		following_count: 92,
		total_downloads: 72000,
		total_likes: 11500,
		preset_count: 9,
		created_at: "2024-05-02T16:30:00.000Z",
		updated_at: "2026-07-22T08:15:00.000Z",
		achievements: [],
		badges: ["Cyberpunk Creator"],
		favorite_categories: ["color", "3d"],
	},
	{
		id: "usr-09",
		username: "shake_king",
		display_name: "Marcus Vance",
		email: "marcus@shakeking.org",
		avatar_url:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
		bio: "Heavy Bass Shakes, Hard Hit Flashes & Kinetic Typography presets.",
		website_url: "https://shakeking.org",
		tiktok_handle: "shake_king_fx",
		instagram_handle: "marcus_shake_king",
		discord_handle: "ShakeKing#1111",
		youtube_url: "https://youtube.com/@shake_king",
		xp: 8900,
		level: 2,
		level_name: "Pro Editor",
		is_verified: true,
		is_staff: false,
		country_code: "US",
		follower_count: 9800,
		following_count: 40,
		total_downloads: 65000,
		total_likes: 9800,
		preset_count: 8,
		created_at: "2024-05-15T13:20:00.000Z",
		updated_at: "2026-07-21T17:50:00.000Z",
		achievements: [],
		badges: ["Verified Editor", "Shake Master"],
		favorite_categories: ["velocity", "gaming"],
	},
	{
		id: "usr-10",
		username: "cyber_fx",
		display_name: "Viktor Morozov",
		email: "viktor@cyberfx.dev",
		avatar_url:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
		banner_url:
			"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
		bio: "Futuristic HUDs, Glitch FX, Sci-Fi UI elements & digital distortion packs.",
		website_url: "https://cyberfx.dev",
		tiktok_handle: "viktor_cyber",
		instagram_handle: "cyberfx_dev",
		discord_handle: "ViktorCyber#2077",
		youtube_url: "https://youtube.com/@cyberfx_dev",
		xp: 7600,
		level: 2,
		level_name: "Pro Editor",
		is_verified: false,
		is_staff: false,
		country_code: "DE",
		follower_count: 8400,
		following_count: 68,
		total_downloads: 54000,
		total_likes: 8200,
		preset_count: 7,
		created_at: "2024-06-01T10:00:00.000Z",
		updated_at: "2026-07-20T12:00:00.000Z",
		achievements: [],
		badges: ["Glitch Specialist"],
		favorite_categories: ["3d", "gaming"],
	},
	// 20 additional creators to reach 30 creators
	...Array.from({ length: 20 }, (_, i) => {
		const index = i + 11;
		const usernames = [
			"aesthetic_vibe",
			"retro_motion",
			"glitch_god",
			"luma_keyer",
			"pixel_motion",
			"vector_artisan",
			"ultra_fx",
			"speed_ramp_pro",
			"dark_aesthetic",
			"light_room_am",
			"motion_designer_x",
			"alight_creator_id",
			"subtle_edits",
			"chroma_master",
			"cinematic_am",
			"frame_by_frame",
			"render_god",
			"smooth_operator",
			"fx_wizard",
			"am_hub_official",
		];
		const displayNames = [
			"Aesthetic Vibe Studio",
			"Retro Motion FX",
			"GlitchGod Edits",
			"LumaKeyer Pro",
			"Pixel Motion Lab",
			"Vector Artisan",
			"UltraFX Media",
			"SpeedRamp Pro",
			"Dark Aesthetic Studio",
			"LightRoom AM",
			"Motion Designer X",
			"Alight Creator ID",
			"Subtle Edits",
			"Chroma Master",
			"Cinematic AM Studio",
			"Frame By Frame",
			"Render God FX",
			"Smooth Operator",
			"FX Wizard",
			"AMHUB Official",
		];
		const countries = [
			"US",
			"ID",
			"IN",
			"MX",
			"PH",
			"VN",
			"TH",
			"FR",
			"ES",
			"DE",
			"KR",
			"JP",
			"BR",
			"CA",
			"GB",
			"AU",
			"NL",
			"PL",
			"SE",
			"IT",
		];
		const avatars = [
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
			"https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80",
		];
		const username = usernames[i] || `creator_${index}`;
		const displayName = displayNames[i] || `Creator ${index}`;

		return {
			id: `usr-${index < 10 ? `0${index}` : index}`,
			username,
			display_name: displayName,
			email: `${username}@amhub.dev`,
			avatar_url: avatars[i % avatars.length],
			banner_url:
				"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
			bio: `Official creator profile for ${displayName}. Creating high quality Alight Motion presets, templates, and tutorial XMLs.`,
			website_url: `https://${username}.amhub.dev`,
			tiktok_handle: `${username}_tiktok`,
			instagram_handle: `${username}_ig`,
			discord_handle: `${displayName}#${1000 + index}`,
			youtube_url: `https://youtube.com/@${username}`,
			xp: Math.floor(15000 - index * 400),
			level: index % 2 === 0 ? 3 : 2,
			level_name: index % 2 === 0 ? "Expert Editor" : "Pro Editor",
			is_verified: index % 3 === 0,
			is_staff: false,
			country_code: countries[i % countries.length],
			follower_count: Math.floor(25000 - index * 700),
			following_count: 45 + index * 3,
			total_downloads: Math.floor(180000 - index * 5000),
			total_likes: Math.floor(28000 - index * 800),
			preset_count: Math.floor(20 - (index % 10)),
			created_at: `2024-0${(index % 6) + 1}-10T12:00:00.000Z`,
			updated_at: "2026-07-28T12:00:00.000Z",
			achievements: [
				{
					id: `ach-${index}`,
					title: "Verified Community Member",
					icon: "⭐",
					description: "Active contributor to Alight Motion community",
				},
			],
			badges:
				index % 3 === 0
					? ["Verified Editor", "Featured Creator"]
					: ["Pro Creator"],
			favorite_categories: ["velocity", "transition", "color"],
		};
	}),
];

// ---------------------------------------------------------------------------
// 60 REALISTIC PRESETS (Categorized to fulfill 40+ featured, 12 trending, 20 recommended, 10 editor picks)
// ---------------------------------------------------------------------------
const PRESET_TITLES = [
	"4K Smooth Velocity Transition Pack",
	"3D Camera Shake + RGB Flash",
	"Anime AMV Glow & Color Grade",
	"Cyberpunk Neon Text Effects",
	"Retro VHS Glitch & CRT Filter",
	"Hyper Smooth Zoom Blur Pack",
	"Mega Light Leaks & Overlay Pack",
	"Seamless Whip Transition V2",
	"Bass Boosted Shake Effect",
	"Clean Typography Motion Graphics",
	"Ultra Fast Speed Ramp Ramp",
	"Cinematic Teal & Orange LUT",
	"Soft Pastel Dream Color Grade",
	"Impact Warp Distort & Flash",
	"Floating 3D Tile Transition",
	"Neon Stroke Outline Effect",
	"4K 60fps Smooth Beat Sync",
	"Cyber Glitch Distortion FX",
	"Luma Fade Smooth Dissolve",
	"Vector Shape Burst Animation",
	"Dark Moody Cinematic Grade",
	"Vintage 8mm Film Grain & Scratch",
	"Electric Plasma Lighting Shake",
	"Jutting Camera Bump Effect",
	"Smooth Spin Blur Transition",
	"RGB Split Glitch Overlay",
	"Neon Glow Text Intro",
	"Valorant Gaming Kill Montage Shake",
	"Fortnite Fast Velocity Edit",
	"Jujutsu Kaisen Anime AMV Shakes",
	"Demon Slayer Flame Aura Glow",
	"Pop Music Lyric Video Motion",
	"3D Cube Rotation Transition",
	"Liquid Warp Melt Effect",
	"Gradient Map Color Shift",
	"Extreme Camera Motion Blur",
	"Soft Bokeh Light Leaks",
	"Kinetic Title Animation Pack",
	"Fast Zoom In/Out Beats",
	"Holographic Glitch Interface",
	"Smooth Slide Whip Transition",
	"Deep Blue Night Color Grade",
	"Retro Vaporwave Aesthetic",
	"High Contrast Action Shake",
	"Clean Lower Thirds Graphic",
	"Speed Ramp Velocity V3",
	"Sparkle Particles Overlay",
	"Optical Flare Flash Preset",
	"Seamless Page Flip 3D",
	"Comic Book Halftone Effect",
	"Dark Fantasy Color Grading",
	"Hyper-Speed Warp Transition",
	"Neon Pulse Beat Detector",
	"Smooth Pan & Zoom Preset",
	"Glitch Text Typewriter FX",
	"Ultra Smooth Slow Mo 120fps",
	"Vibrant Sunset Color Grade",
	"Bass Shake Pulse Effect",
	"3D Sphere Rotate Intro",
	"Cinematic Film Letterbox Pack",
];

const PRESET_THUMBNAILS = [
	"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80",
];

const CATEGORIES_LIST = [
	"velocity",
	"transition",
	"color",
	"anime",
	"gaming",
	"lyric",
	"3d",
];
const DIFFICULTIES: ("beginner" | "intermediate" | "advanced")[] = [
	"beginner",
	"intermediate",
	"advanced",
];
const FILE_TYPES: ("xml" | "qr" | "link")[] = ["xml", "qr", "link"];

export const MOCK_PRESETS: (PresetWithCreator & {
	is_trending: boolean;
	is_recommended: boolean;
	is_editor_pick: boolean;
	style: string[];
	tags: string[];
	requirements: string[];
	compatibility: string[];
	installation_guide: string;
	version_history: { version: string; date: string; changes: string }[];
	license: string;
	file_size: string;
})[] = PRESET_TITLES.map((title, idx) => {
	const idNum = idx + 1;
	const creator = MOCK_CREATORS[idx % MOCK_CREATORS.length];
	const category = CATEGORIES_LIST[idx % CATEGORIES_LIST.length];
	const difficulty = DIFFICULTIES[idx % DIFFICULTIES.length];
	const fileType = FILE_TYPES[idx % FILE_TYPES.length];
	const slug = `${title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")}-${idNum}`;

	// Numbers setup
	const downloadCount = Math.floor(145000 - idx * 2100 + Math.random() * 500);
	const likeCount = Math.floor(downloadCount * 0.22);
	const viewCount = downloadCount * 14;
	const bookmarkCount = Math.floor(downloadCount * 0.15);
	const commentCount = 25 + (idx % 15);

	// Badges & Placement
	const isFeatured = idx < 42; // 40+ featured presets
	const isTrending = idx < 12; // 12 trending
	const isRecommended = idx >= 10 && idx < 30; // 20 recommended
	const isEditorPick = idx >= 5 && idx < 15; // 10 editor picks

	return {
		id: `preset-${idNum < 10 ? `0${idNum}` : idNum}`,
		slug,
		title,
		description: `Professional-grade ${title} designed specifically for Alight Motion editors. Features smooth cubic bezier curves, customizable keyframes, and 60fps playback compatibility. Instant import via XML file or Alight Motion project link.`,
		thumbnail_url: PRESET_THUMBNAILS[idx % PRESET_THUMBNAILS.length],
		preview_video_url:
			idx % 2 === 0
				? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
				: null,
		file_type: fileType,
		file_url: `https://amhub.dev/files/preset-${idNum}.xml`,
		am_link: `https://alight.link/preset-${idNum}`,
		file_size:
			fileType === "xml"
				? `${(1.2 + (idx % 3) * 0.5).toFixed(1)} MB`
				: "1.0 MB",
		category,
		difficulty,
		download_count: downloadCount,
		view_count: viewCount,
		like_count: likeCount,
		bookmark_count: bookmarkCount,
		comment_count: commentCount,
		is_featured: isFeatured,
		is_trending: isTrending,
		is_recommended: isRecommended,
		is_editor_pick: isEditorPick,
		style: ["Smooth", "Fast", "Clean"],
		tags: [
			category,
			difficulty,
			"alight motion",
			"preset",
			"xml",
			"60fps",
			"editing",
		],
		requirements: [
			"Alight Motion v4.2 or higher",
			"Android 8.0+ or iOS 14.0+",
			"Recommended 4GB RAM minimum for smooth 60fps preview",
		],
		compatibility: ["v4.0", "v4.2", "v4.5", "v5.0", "v5.2+"],
		installation_guide:
			"1. Click the Download Preset button to save the .xml file or open the Alight Link.\n2. In Alight Motion, navigate to Project Manager and tap Import XML.\n3. Drag and adjust keyframes to fit your video timeline aspect ratio.",
		version_history: [
			{
				version: "v2.0",
				date: "2026-07-15",
				changes:
					"Added 60fps bezier curve smoothing and fixed aspect ratio scaling bug.",
			},
			{
				version: "v1.0",
				date: "2026-04-10",
				changes: "Initial community release on AMHUB.",
			},
		],
		license: "Free for Personal & Commercial Use",
		created_at: new Date(Date.now() - idx * 86400000 * 3).toISOString(),
		creator_id: creator.id,
		creator: {
			id: creator.id,
			username: creator.username,
			display_name: creator.display_name,
			avatar_url: creator.avatar_url,
			is_verified: creator.is_verified,
		},
	};
});

// ---------------------------------------------------------------------------
// 220+ REALISTIC COMMENTS (With varied writing styles, short/long, avatars)
// ---------------------------------------------------------------------------
const COMMENT_TEXTS = [
	"Bro this velocity graph is literally the cleanest I've ever seen on Alight Motion! 🚀",
	"Works perfectly on Alight Motion v5.2! Thanks so much for making it an XML format instead of QR.",
	"Can you drop a tutorial on how you created those 3D camera bezier curves? Absolutely insane quality.",
	"Instant download! Adding this straight to my AMV edit for TikTok tonight.",
	"10/10 recommendation, saved me at least 2 hours of keyframing manually.",
	"Does this preset work on iOS version of Alight Motion?",
	"Yes bro, just import via Alight link or open in Files app and share to AM!",
	"Best preset on AMHUB by far! Keep cooking 🔥🔥",
	"The RGB split effect on this hit is so crisp. Doesn't lag my phone at all.",
	"Simple, clean, and effective. Beginner friendly as advertised!",
	"Finally a creator that actually organizes layers properly in the project timeline.",
	"Holy smooth interpolation! What frame rate did you export this at?",
	"This color grading preset made my Valorant clips look like a cinematic movie.",
	"Downloaded, liked, and bookmarked! Please make more anime AMV shake packs!",
	"Subbed to your YouTube channel after seeing this preset. Outstanding work man.",
	"The shake timing on the bass drop is 100% pixel perfect. Respect!",
	"Pro tip for anyone downloading: set keyframe easing to cubic out for even smoother transition!",
	"Awesome work as always! Looking forward to your next upload.",
	"This is top tier content. Thank you AMHUB community!",
	"Cleanest Alight Motion XML I've found this month. Very well structured.",
];

export const MOCK_COMMENTS: MockComment[] = Array.from(
	{ length: 220 },
	(_, idx) => {
		const creator = MOCK_CREATORS[idx % MOCK_CREATORS.length];
		const preset = MOCK_PRESETS[idx % MOCK_PRESETS.length];
		const text = COMMENT_TEXTS[idx % COMMENT_TEXTS.length];

		return {
			id: `comment-${idx + 1}`,
			preset_id: preset.id,
			user_id: creator.id,
			parent_id: idx % 7 === 0 ? `comment-${Math.max(1, idx - 2)}` : null,
			body: `${text}${idx % 3 === 0 ? " Highly recommend downloading if you're working on Alight Motion." : ""}`,
			like_count: Math.floor(Math.random() * 45) + 1,
			reply_count: idx % 5 === 0 ? 2 : 0,
			is_pinned: idx === 0 || idx === 1,
			is_removed: false,
			created_at: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
			user: {
				id: creator.id,
				username: creator.username,
				display_name: creator.display_name,
				avatar_url: creator.avatar_url,
				is_verified: creator.is_verified,
			},
		};
	},
);

// ---------------------------------------------------------------------------
// 50 REALISTIC NOTIFICATIONS
// ---------------------------------------------------------------------------
export const MOCK_NOTIFICATIONS: MockNotification[] = Array.from(
	{ length: 50 },
	(_, idx) => {
		const actor = MOCK_CREATORS[(idx + 1) % MOCK_CREATORS.length];
		const preset = MOCK_PRESETS[idx % MOCK_PRESETS.length];
		const types: MockNotification["type"][] = [
			"like",
			"comment",
			"follow",
			"download",
			"system",
			"approval",
			"moderation",
		];
		const type = types[idx % types.length];

		let message = "";
		if (type === "follow") {
			message = `${actor.display_name} started following your creator profile.`;
		} else if (type === "like") {
			message = `${actor.display_name} liked your preset "${preset.title}".`;
		} else if (type === "comment") {
			message = `${actor.display_name} left a comment on "${preset.title}".`;
		} else if (type === "download") {
			message = `Your preset "${preset.title}" reached ${1000 + idx * 250} downloads!`;
		} else if (type === "approval") {
			message = `Your preset "${preset.title}" has been approved and published to Featured!`;
		} else if (type === "moderation") {
			message =
				"Moderator Notice: Your preset tags were updated for optimal discoverability.";
		} else {
			message =
				"System Update: AMHUB v1.0 engine update is now live with faster XML imports.";
		}

		return {
			id: `notif-${idx + 1}`,
			user_id: "usr-01",
			type,
			actor_id: actor.id,
			preset_id: preset.id,
			message,
			is_read: idx > 8,
			created_at: new Date(Date.now() - idx * 3600000 * 2).toISOString(),
			actor: {
				username: actor.username,
				display_name: actor.display_name,
				avatar_url: actor.avatar_url,
			},
			preset: {
				slug: preset.slug,
				title: preset.title,
			},
		};
	},
);

// ---------------------------------------------------------------------------
// 40 BOOKMARKED PRESETS & 50 LIKED PRESETS
// ---------------------------------------------------------------------------
export const MOCK_BOOKMARKS = MOCK_PRESETS.slice(0, 40);
export const MOCK_LIKES = MOCK_PRESETS.slice(0, 50);

// ---------------------------------------------------------------------------
// DASHBOARD ANALYTICS & STATS
// ---------------------------------------------------------------------------
export const MOCK_DASHBOARD_DATA = {
	stats: {
		totalDownloads: 148500,
		totalViews: 1250000,
		followerCount: 48500,
		totalLikes: 38200,
		presetCount: 24,
		revenue: "$2,450.00",
	},
	analytics: Array.from({ length: 30 }, (_, i) => ({
		date: `Jul ${i + 1}`,
		downloads: 1200 + Math.floor(Math.sin(i) * 400 + Math.random() * 300),
		views: 8500 + Math.floor(Math.sin(i) * 2000 + Math.random() * 1500),
		revenue: 45 + Math.floor(Math.random() * 35),
	})),
	recentUploads: MOCK_PRESETS.slice(0, 8),
	pendingPresets: MOCK_PRESETS.slice(8, 11).map((p) => ({
		...p,
		status: "pending" as const,
	})),
};

// ---------------------------------------------------------------------------
// QUERY & FILTER HELPER FUNCTIONS FOR DAL FALLBACKS
// ---------------------------------------------------------------------------
export function filterAndSortMockPresets(params: {
	search?: string;
	category?: string;
	fileType?: string;
	sort?: string;
	order?: "asc" | "desc";
	page?: number;
	limit?: number;
}) {
	let list = [...MOCK_PRESETS];

	if (params.search?.trim()) {
		const q = params.search.toLowerCase().trim();
		list = list.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.description?.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q) ||
				p.creator.display_name.toLowerCase().includes(q) ||
				p.creator.username.toLowerCase().includes(q) ||
				p.tags.some((t) => t.toLowerCase().includes(q)),
		);
	}

	if (params.category && params.category !== "all") {
		list = list.filter(
			(p) => p.category.toLowerCase() === params.category?.toLowerCase(),
		);
	}

	if (params.fileType) {
		list = list.filter((p) => p.file_type === params.fileType);
	}

	const sort = params.sort ?? "created_at";
	const isAsc = params.order === "asc";

	list.sort((a, b) => {
		if (sort === "download_count")
			return isAsc
				? a.download_count - b.download_count
				: b.download_count - a.download_count;
		if (sort === "like_count")
			return isAsc ? a.like_count - b.like_count : b.like_count - a.like_count;
		if (sort === "view_count")
			return isAsc ? a.view_count - b.view_count : b.view_count - a.view_count;
		if (sort === "title")
			return isAsc
				? a.title.localeCompare(b.title)
				: b.title.localeCompare(a.title);
		return isAsc
			? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
			: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	const limit = params.limit ?? 24;
	const page = params.page ?? 1;
	const from = (page - 1) * limit;
	return list.slice(from, from + limit);
}
