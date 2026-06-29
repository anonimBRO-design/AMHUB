// Component props types aligned with Design System §17

import type { User, Preset, Badge } from "./database";

export interface AvatarProps {
  user: Pick<User, "avatar_url" | "username">;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "away" | "busy" | "offline";
  showLevelRing?: boolean;
  level?: number;
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface BadgeChipProps {
  badge: Badge;
  size?: "sm" | "md";
  showTooltip?: boolean;
}

export interface PresetCardProps {
  preset: Preset;
  variant?: "compact" | "standard" | "featured";
}

export interface CreatorCardProps {
  user: User & { followerCount: number; presetCount: number };
  isFollowing?: boolean;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export interface NotificationItemProps {
  notification: {
    id: string;
    type: "like" | "download" | "follow" | "system";
    message: string;
    timestamp: string;
    read: boolean;
    avatarUrl?: string;
  };
}

export interface LeaderboardRowProps {
  rank: number;
  user: Pick<User, "username" | "avatar_url">;
  score: number;
  trend?: "up" | "down" | "same";
}
