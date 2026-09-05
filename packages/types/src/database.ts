// Supabase database types aligned with the Database Foundation migration.

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

/**
 * Preset source discriminator stored on `presets.file_type`.
 *
 * - `xml` / `qr`     — uploaded assets; the storage reference lives in `file_url`.
 * - `link`           — legacy generic Alight Motion import link (kept for
 *                       backwards compatibility with existing presets/URLs).
 * - `google_drive`   — Google Drive URL; the original URL lives in `am_link`.
 * - `alight_creative`— https://alightcreative.com/am/share/... URL in `am_link`.
 *
 * Storage layout invariant: exactly one of `file_url` (xml/qr) or `am_link`
 * (link/google_drive/alight_creative) is set, enforced by the
 * `presets_file_location_check` DB constraint.
 */
export type PresetFileType =
	| "xml"
	| "qr"
	| "link"
	| "google_drive"
	| "alight_creative";
export type PresetDifficulty = "beginner" | "intermediate" | "advanced";
export type PresetStatus = "pending" | "published" | "rejected" | "removed";
export type DeviceSupport = "android" | "ios" | "both";
export type NotificationType =
	| "like"
	| "comment"
	| "follow"
	| "download"
	| "system"
	| "new_preset";
export type CreatorPermissionPlatform =
	| "tiktok"
	| "instagram"
	| "youtube"
	| "other";
export type CreatorPermissionStatus =
	| "pending"
	| "contacted"
	| "approved"
	| "rejected";

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
					role?: Nullable<string>;
					country_code: Nullable<string>;
					auth_provider: Nullable<string>;
					last_active_at: Nullable<string>;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
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
					role?: Nullable<string>;
					country_code?: Nullable<string>;
					auth_provider?: Nullable<string>;
					last_active_at?: Nullable<string>;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
				Relationships: [
					{
						foreignKeyName: "users_id_fkey";
						columns: ["id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			categories: {
				Row: {
					id: string;
					slug: string;
					label: string;
					description: Nullable<string>;
					color_token: Nullable<string>;
					sort_order: number;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					label: string;
					description?: Nullable<string>;
					color_token?: Nullable<string>;
					sort_order?: number;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
				Relationships: [];
			};
			tags: {
				Row: {
					id: string;
					slug: string;
					label: string;
					usage_count: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					label: string;
					usage_count?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
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
					unique_download_count: number;
					price: number;
					is_paid: boolean;
					currency: string;
					commercial_price: number;
					remixed_from_id: Nullable<string>;
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
					unique_download_count?: number;
					price?: number;
					is_paid?: boolean;
					currency?: string;
					commercial_price?: number;
					remixed_from_id?: Nullable<string>;
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
					{
						foreignKeyName: "presets_category_fkey";
						columns: ["category"];
						referencedRelation: "categories";
						referencedColumns: ["slug"];
					},
				];
			};
			preset_downloads: {
				Row: {
					id: string;
					preset_id: string;
					user_id: Nullable<string>;
					anonymous_token: Nullable<string>;
					ip_hash: string;
					user_agent_hash: Nullable<string>;
					created_at: string;
				};
				Insert: {
					id?: string;
					preset_id: string;
					user_id?: Nullable<string>;
					anonymous_token?: Nullable<string>;
					ip_hash: string;
					user_agent_hash?: Nullable<string>;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["preset_downloads"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "preset_downloads_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_downloads_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			preset_orders: {
				Row: {
					id: string;
					order_number: string;
					preset_id: string;
					buyer_id: string;
					seller_id: string;
					license_type: "personal" | "commercial";
					referrer_id: Nullable<string>;
					referrer_commission: number;
					gross_amount: number;
					currency: string;
					payment_provider: string;
					payment_reference: Nullable<string>;
					payment_status:
						| "pending"
						| "paid"
						| "failed"
						| "refunded"
						| "cancelled";
					processor_fee: number;
					net_amount: number;
					creator_payout_amount: number;
					platform_fee_amount: number;
					paid_at: Nullable<string>;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					order_number: string;
					preset_id: string;
					buyer_id: string;
					seller_id: string;
					license_type?: "personal" | "commercial";
					referrer_id?: Nullable<string>;
					referrer_commission?: number;
					gross_amount: number;
					currency?: string;
					payment_provider?: string;
					payment_reference?: Nullable<string>;
					payment_status?:
						| "pending"
						| "paid"
						| "failed"
						| "refunded"
						| "cancelled";
					processor_fee?: number;
					net_amount?: number;
					creator_payout_amount?: number;
					platform_fee_amount?: number;
					paid_at?: Nullable<string>;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["preset_orders"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "preset_orders_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_orders_buyer_id_fkey";
						columns: ["buyer_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_orders_seller_id_fkey";
						columns: ["seller_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_orders_referrer_id_fkey";
						columns: ["referrer_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			preset_tags: {
				Row: {
					preset_id: string;
					tag_id: string;
					created_at: string;
				};
				Insert: {
					preset_id: string;
					tag_id: string;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["preset_tags"]["Insert"]>;
				Relationships: [
					{
						foreignKeyName: "preset_tags_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_tags_tag_id_fkey";
						columns: ["tag_id"];
						referencedRelation: "tags";
						referencedColumns: ["id"];
					},
				];
			};
			challenges: {
				Row: {
					id: string;
					title: string;
					description: Nullable<string>;
					theme: Nullable<string>;
					cover_url: Nullable<string>;
					prize_text: Nullable<string>;
					starts_at: string;
					ends_at: string;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					title: string;
					description?: Nullable<string>;
					theme?: Nullable<string>;
					cover_url?: Nullable<string>;
					prize_text?: Nullable<string>;
					starts_at?: string;
					ends_at: string;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>;
				Relationships: [];
			};
			challenge_entries: {
				Row: {
					id: string;
					challenge_id: string;
					preset_id: string;
					creator_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					challenge_id: string;
					preset_id: string;
					creator_id: string;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["challenge_entries"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "challenge_entries_challenge_id_fkey";
						columns: ["challenge_id"];
						referencedRelation: "challenges";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "challenge_entries_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
				];
			};
			challenge_votes: {
				Row: {
					id: string;
					challenge_id: string;
					preset_id: string;
					voter_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					challenge_id: string;
					preset_id: string;
					voter_id: string;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["challenge_votes"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "challenge_votes_challenge_id_fkey";
						columns: ["challenge_id"];
						referencedRelation: "challenges";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "challenge_votes_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
				];
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
				Relationships: [
					{
						foreignKeyName: "collections_owner_id_fkey";
						columns: ["owner_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
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
				Relationships: [
					{
						foreignKeyName: "collection_items_collection_id_fkey";
						columns: ["collection_id"];
						referencedRelation: "collections";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "collection_items_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
				];
			};
			collection_collaborators: {
				Row: {
					collection_id: string;
					user_id: string;
					added_at: string;
				};
				Insert: {
					collection_id: string;
					user_id: string;
					added_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["collection_collaborators"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "collection_collaborators_collection_id_fkey";
						columns: ["collection_id"];
						referencedRelation: "collections";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "collection_collaborators_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			custom_requests: {
				Row: {
					id: string;
					requester_id: string;
					title: string;
					description: string;
					budget_min: number;
					budget_max: number;
					deadline_at: Nullable<string>;
					status: "open" | "in_progress" | "completed" | "cancelled";
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					requester_id: string;
					title: string;
					description: string;
					budget_min?: number;
					budget_max: number;
					deadline_at?: Nullable<string>;
					status?: "open" | "in_progress" | "completed" | "cancelled";
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["custom_requests"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "custom_requests_requester_id_fkey";
						columns: ["requester_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			request_offers: {
				Row: {
					id: string;
					request_id: string;
					creator_id: string;
					price: number;
					message: Nullable<string>;
					eta_days: Nullable<number>;
					status: "pending" | "accepted" | "rejected" | "withdrawn";
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					request_id: string;
					creator_id: string;
					price: number;
					message?: Nullable<string>;
					eta_days?: Nullable<number>;
					status?: "pending" | "accepted" | "rejected" | "withdrawn";
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["request_offers"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "request_offers_request_id_fkey";
						columns: ["request_id"];
						referencedRelation: "custom_requests";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "request_offers_creator_id_fkey";
						columns: ["creator_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			follows: {
				Row: {
					follower_id: string;
					following_id: string;
					created_at: string;
				};
				Insert: {
					follower_id: string;
					following_id: string;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
				Relationships: [
					{
						foreignKeyName: "follows_follower_id_fkey";
						columns: ["follower_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "follows_following_id_fkey";
						columns: ["following_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			preset_likes: {
				Row: {
					preset_id: string;
					user_id: string;
					created_at: string;
				};
				Insert: {
					preset_id: string;
					user_id: string;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["preset_likes"]["Insert"]>;
				Relationships: [
					{
						foreignKeyName: "preset_likes_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_likes_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
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
				Relationships: [
					{
						foreignKeyName: "preset_bookmarks_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_bookmarks_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "preset_bookmarks_collection_id_fkey";
						columns: ["collection_id"];
						referencedRelation: "collections";
						referencedColumns: ["id"];
					},
				];
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
				Relationships: [
					{
						foreignKeyName: "comments_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "comments_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "comments_parent_id_fkey";
						columns: ["parent_id"];
						referencedRelation: "comments";
						referencedColumns: ["id"];
					},
				];
			};
			notifications: {
				Row: {
					id: string;
					user_id: string;
					type: NotificationType;
					actor_id: Nullable<string>;
					preset_id: Nullable<string>;
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
					message?: Nullable<string>;
					is_read?: boolean;
					created_at?: string;
				};
				Update: Partial<
					Database["public"]["Tables"]["notifications"]["Insert"]
				>;
				Relationships: [
					{
						foreignKeyName: "notifications_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "notifications_actor_id_fkey";
						columns: ["actor_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "notifications_preset_id_fkey";
						columns: ["preset_id"];
						referencedRelation: "presets";
						referencedColumns: ["id"];
					},
				];
			};
			creator_permissions: {
				Row: CreatorPermissionRow;
				Insert: CreatorPermissionInsert;
				Update: CreatorPermissionUpdate;
				Relationships: [
					{
						foreignKeyName: "creator_permissions_created_by_fkey";
						columns: ["created_by"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			creator_withdrawals: {
				Row: CreatorWithdrawalRow;
				Insert: CreatorWithdrawalInsert;
				Update: CreatorWithdrawalUpdate;
				Relationships: [
					{
						foreignKeyName: "creator_withdrawals_creator_id_fkey";
						columns: ["creator_id"];
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: Record<string, never>;
		Functions: {
			is_staff: {
				Args: { user_id?: string };
				Returns: boolean;
			};
		};
		Enums: {
			PresetFileType: PresetFileType;
			PresetDifficulty: PresetDifficulty;
			PresetStatus: PresetStatus;
			DeviceSupport: DeviceSupport;
			NotificationType: NotificationType;
		};
		CompositeTypes: Record<string, never>;
	};
}

export interface CreatorPermissionRow {
	id: string;
	platform: CreatorPermissionPlatform;
	creator_username: string;
	creator_display_name: Nullable<string>;
	profile_url: string;
	avatar_url: Nullable<string>;
	status: CreatorPermissionStatus;
	drafted_message: Nullable<string>;
	contacted_at: Nullable<string>;
	responded_at: Nullable<string>;
	credit_display_name: Nullable<string>;
	max_allowed_presets: number;
	used_presets_count: number;
	notes_conditions: Nullable<string>;
	proof_image_url: Nullable<string>;
	created_by: Nullable<string>;
	created_at: string;
	updated_at: string;
}

export interface CreatorPermissionInsert {
	id?: string;
	platform?: CreatorPermissionPlatform;
	creator_username: string;
	creator_display_name?: Nullable<string>;
	profile_url: string;
	avatar_url?: Nullable<string>;
	status?: CreatorPermissionStatus;
	drafted_message?: Nullable<string>;
	contacted_at?: Nullable<string>;
	responded_at?: Nullable<string>;
	credit_display_name?: Nullable<string>;
	max_allowed_presets?: number;
	used_presets_count?: number;
	notes_conditions?: Nullable<string>;
	proof_image_url?: Nullable<string>;
	created_by?: Nullable<string>;
	created_at?: string;
	updated_at?: string;
}

export type CreatorPermissionUpdate = Partial<CreatorPermissionInsert>;

export type WithdrawalPaymentMethod =
	| "dana"
	| "gopay"
	| "ovo"
	| "bca"
	| "bri"
	| "mandiri";

export type WithdrawalStatus =
	| "pending"
	| "processing"
	| "completed"
	| "rejected";

export interface CreatorWithdrawalRow {
	id: string;
	creator_id: string;
	amount: number;
	payment_method: WithdrawalPaymentMethod;
	account_name: string;
	account_number: string;
	status: WithdrawalStatus;
	rejection_reason: Nullable<string>;
	payout_reference: Nullable<string>;
	created_at: string;
	processed_at: Nullable<string>;
}

export interface CreatorWithdrawalInsert {
	id?: string;
	creator_id: string;
	amount: number;
	payment_method: WithdrawalPaymentMethod;
	account_name: string;
	account_number: string;
	status?: WithdrawalStatus;
	rejection_reason?: Nullable<string>;
	payout_reference?: Nullable<string>;
	created_at?: string;
	processed_at?: Nullable<string>;
}

export type CreatorWithdrawalUpdate = Partial<CreatorWithdrawalInsert>;

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
export type Category = Tables<"categories">;
export type Tag = Tables<"tags">;
export type Preset = Tables<"presets">;
export type PresetDownload = Tables<"preset_downloads">;
export type PresetOrder = Tables<"preset_orders">;
export type PresetTag = Tables<"preset_tags">;
export type PresetLike = Tables<"preset_likes">;
export type Challenge = Tables<"challenges">;
export type ChallengeEntry = Tables<"challenge_entries">;
export type ChallengeVote = Tables<"challenge_votes">;
export type CustomRequest = Tables<"custom_requests">;
export type RequestOffer = Tables<"request_offers">;
export type Bookmark = Tables<"preset_bookmarks">;
export type Collection = Tables<"collections">;
export type CollectionItem = Tables<"collection_items">;
export type Comment = Tables<"comments">;
export type Notification = Tables<"notifications">;
export type Follower = Tables<"follows">;
export type CreatorPermission = Tables<"creator_permissions">;
export type CreatorWithdrawal = Tables<"creator_withdrawals">;
