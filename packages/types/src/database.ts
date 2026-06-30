// Supabase database types aligned with Product Specification §4.

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type PresetFileType = "xml" | "qr" | "link";
export type PresetDifficulty = "beginner" | "intermediate" | "advanced";
export type PresetStatus = "pending" | "published" | "rejected" | "removed";
export type DeviceSupport = "android" | "ios" | "both";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type NotificationType =
	| "like"
	| "comment"
	| "follow"
	| "download"
	| "badge"
	| "challenge"
	| "system";
export type ChallengeStatus = "upcoming" | "active" | "judging" | "ended";
export type ReportReason = "spam" | "stolen" | "inappropriate" | "misleading";
export type ReportStatus = "open" | "reviewed" | "resolved";
export type AnalyticsEventName =
	| "page_view"
	| "preset_view"
	| "download"
	| "search";

type Nullable<T> = T | null;

export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					username: string;
					display_name: string;
					email: string;
					avatar_url: Nullable<string>;
					banner_url: Nullable<string>;
					bio: Nullable<string>;
					website_url: Nullable<string>;
					tiktok_handle: Nullable<string>;
					instagram_handle: Nullable<string>;
					discord_handle: Nullable<string>;
					youtube_url: Nullable<string>;
					xp: number;
					level: number;
					is_verified: boolean;
					is_staff: boolean;
					country_code: Nullable<string>;
					auth_provider: Nullable<string>;
					last_active_at: Nullable<string>;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					username: string;
					display_name: string;
					email: string;
					avatar_url?: Nullable<string>;
					banner_url?: Nullable<string>;
					bio?: Nullable<string>;
					website_url?: Nullable<string>;
					tiktok_handle?: Nullable<string>;
					instagram_handle?: Nullable<string>;
					discord_handle?: Nullable<string>;
					youtube_url?: Nullable<string>;
					xp?: number;
					level?: number;
					is_verified?: boolean;
					is_staff?: boolean;
					country_code?: Nullable<string>;
					auth_provider?: Nullable<string>;
					last_active_at?: Nullable<string>;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
				Relationships: [];
			};
			presets: {
				Row: {
					id: string;
					slug: string;
					creator_id: string;
					title: string;
					description: Nullable<string>;
					thumbnail_url: string;
					preview_video_url: Nullable<string>;
					file_type: PresetFileType;
					file_url: Nullable<string>;
					am_link: Nullable<string>;
					category: string;
					style: string[];
					tags: string[];
					difficulty: PresetDifficulty;
					am_version_min: Nullable<string>;
					am_version_max: Nullable<string>;
					device_support: DeviceSupport[];
					download_count: number;
					view_count: number;
					like_count: number;
					bookmark_count: number;
					comment_count: number;
					trending_score: number;
					quality_score: number;
					status: PresetStatus;
					is_featured: boolean;
					featured_at: Nullable<string>;
					rejection_reason: Nullable<string>;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					creator_id: string;
					title: string;
					description?: Nullable<string>;
					thumbnail_url: string;
					preview_video_url?: Nullable<string>;
					file_type: PresetFileType;
					file_url?: Nullable<string>;
					am_link?: Nullable<string>;
					category: string;
					style?: string[];
					tags?: string[];
					difficulty?: PresetDifficulty;
					am_version_min?: Nullable<string>;
					am_version_max?: Nullable<string>;
					device_support?: DeviceSupport[];
					download_count?: number;
					view_count?: number;
					like_count?: number;
					bookmark_count?: number;
					comment_count?: number;
					trending_score?: number;
					quality_score?: number;
					status?: PresetStatus;
					is_featured?: boolean;
					featured_at?: Nullable<string>;
					rejection_reason?: Nullable<string>;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["presets"]["Insert"]>;
				Relationships: [
					{
						foreignKeyName: "presets_creator_id_fkey";
						columns: ["creator_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			preset_likes: {
				Row: { preset_id: string; user_id: string; created_at: string };
				Insert: { preset_id: string; user_id: string; created_at?: string };
				Update: Partial<Database["public"]["Tables"]["preset_likes"]["Insert"]>;
				Relationships: [];
			};
			preset_bookmarks: {
				Row: {
					preset_id: string;
					user_id: string;
					collection_id: Nullable<string>;
					created_at: string;
				};
				Insert: {
					preset_id: string;
					user_id: string;
					collection_id?: Nullable<string>;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["preset_bookmarks"]["Insert"]
				>;
				Relationships: [];
			};
			preset_downloads: {
				Row: {
					id: string;
					preset_id: string;
					user_id: Nullable<string>;
					ip_hash: Nullable<string>;
					country: Nullable<string>;
					created_at: string;
				};
				Insert: {
					id?: string;
					preset_id: string;
					user_id?: Nullable<string>;
					ip_hash?: Nullable<string>;
					country?: Nullable<string>;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["preset_downloads"]["Insert"]
				>;
				Relationships: [];
			};
			comments: {
				Row: {
					id: string;
					preset_id: string;
					user_id: string;
					parent_id: Nullable<string>;
					body: string;
					like_count: number;
					is_pinned: boolean;
					is_removed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					preset_id: string;
					user_id: string;
					parent_id?: Nullable<string>;
					body: string;
					like_count?: number;
					is_pinned?: boolean;
					is_removed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
				Relationships: [];
			};
			comment_likes: {
				Row: { comment_id: string; user_id: string };
				Insert: { comment_id: string; user_id: string };
				Update: Partial<
					Database["public"]["Tables"]["comment_likes"]["Insert"]
				>;
				Relationships: [];
			};
			follows: {
				Row: { follower_id: string; following_id: string; created_at: string };
				Insert: {
					follower_id: string;
					following_id: string;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
				Relationships: [];
			};
			collections: {
				Row: {
					id: string;
					slug: string;
					owner_id: string;
					title: string;
					description: Nullable<string>;
					cover_url: Nullable<string>;
					is_public: boolean;
					preset_count: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					owner_id: string;
					title: string;
					description?: Nullable<string>;
					cover_url?: Nullable<string>;
					is_public?: boolean;
					preset_count?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
				Relationships: [];
			};
			collection_items: {
				Row: {
					collection_id: string;
					preset_id: string;
					added_at: string;
					sort_order: number;
				};
				Insert: {
					collection_id: string;
					preset_id: string;
					added_at?: string;
					sort_order?: number;
				};
				Update: Partial<
					Database["public"]["Tables"]["collection_items"]["Insert"]
				>;
				Relationships: [];
			};
			badges: {
				Row: {
					id: string;
					key: string;
					name: string;
					description: Nullable<string>;
					icon_url: Nullable<string>;
					rarity: BadgeRarity;
					xp_reward: number;
				};
				Insert: {
					id?: string;
					key: string;
					name: string;
					description?: Nullable<string>;
					icon_url?: Nullable<string>;
					rarity?: BadgeRarity;
					xp_reward?: number;
				};
				Update: Partial<Database["public"]["Tables"]["badges"]["Insert"]>;
				Relationships: [];
			};
			user_badges: {
				Row: { user_id: string; badge_id: string; earned_at: string };
				Insert: { user_id: string; badge_id: string; earned_at?: string };
				Update: Partial<Database["public"]["Tables"]["user_badges"]["Insert"]>;
				Relationships: [];
			};
			challenges: {
				Row: {
					id: string;
					slug: string;
					title: string;
					description: Nullable<string>;
					banner_url: Nullable<string>;
					theme: Nullable<string>;
					starts_at: string;
					ends_at: string;
					status: ChallengeStatus;
					prize_xp: number;
					entry_count: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					title: string;
					description?: Nullable<string>;
					banner_url?: Nullable<string>;
					theme?: Nullable<string>;
					starts_at: string;
					ends_at: string;
					status?: ChallengeStatus;
					prize_xp?: number;
					entry_count?: number;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>;
				Relationships: [];
			};
			challenge_entries: {
				Row: {
					challenge_id: string;
					preset_id: string;
					user_id: string;
					vote_count: number;
					rank: Nullable<number>;
					submitted_at: string;
				};
				Insert: {
					challenge_id: string;
					preset_id: string;
					user_id: string;
					vote_count?: number;
					rank?: Nullable<number>;
					submitted_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["challenge_entries"]["Insert"]
				>;
				Relationships: [];
			};
			notifications: {
				Row: {
					id: string;
					user_id: string;
					type: NotificationType;
					actor_id: Nullable<string>;
					preset_id: Nullable<string>;
					badge_id: Nullable<string>;
					message: Nullable<string>;
					is_read: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					type: NotificationType;
					actor_id?: Nullable<string>;
					preset_id?: Nullable<string>;
					badge_id?: Nullable<string>;
					message?: Nullable<string>;
					is_read?: boolean;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["notifications"]["Insert"]
				>;
				Relationships: [];
			};
			reports: {
				Row: {
					id: string;
					reporter_id: string;
					preset_id: string;
					comment_id: Nullable<string>;
					reason: ReportReason;
					details: Nullable<string>;
					status: ReportStatus;
					reviewed_by: Nullable<string>;
					created_at: string;
				};
				Insert: {
					id?: string;
					reporter_id: string;
					preset_id: string;
					comment_id?: Nullable<string>;
					reason: ReportReason;
					details?: Nullable<string>;
					status?: ReportStatus;
					reviewed_by?: Nullable<string>;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
				Relationships: [];
			};
			analytics_events: {
				Row: {
					id: string;
					event: AnalyticsEventName;
					user_id: Nullable<string>;
					preset_id: Nullable<string>;
					session_id: Nullable<string>;
					properties: Nullable<Json>;
					country: Nullable<string>;
					created_at: string;
				};
				Insert: {
					id?: string;
					event: AnalyticsEventName;
					user_id?: Nullable<string>;
					preset_id?: Nullable<string>;
					session_id?: Nullable<string>;
					properties?: Nullable<Json>;
					country?: Nullable<string>;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["analytics_events"]["Insert"]
				>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Update"];

export type User = Tables<"users">;
export type UserMini = {
	username: string;
	avatar_url?: string;
};
export type Preset = Tables<"presets">;
export type PresetDownload = Tables<"preset_downloads">;
export type PresetLike = Tables<"preset_likes">;
export type Bookmark = Tables<"preset_bookmarks">;
export type Notification = Tables<"notifications">;
export type Follower = Tables<"follows">;
export type Badge = Tables<"badges">;
export type UserBadge = Tables<"user_badges">;
