// Database types from Product Specification §4

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface Preset {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  file_url: string;
  file_type: "flstudio" | "ableton" | "logic" | "studioone";
  tags: string[];
  downloads_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface PresetDownload {
  id: string;
  preset_id: string;
  user_id?: string; // null = guest download
  downloaded_at: string;
}

export interface PresetLike {
  id: string;
  preset_id: string;
  user_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  preset_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "like" | "download" | "follow" | "system";
  read: boolean;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  color: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}
