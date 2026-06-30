export const realtimeChannels = {
	presets: "public:presets",
	notifications: (userId: string) => `private:notifications:${userId}`,
	profile: (userId: string) => `public:profile:${userId}`,
	presetComments: (presetId: string) => `public:preset-comments:${presetId}`,
	creatorAnalytics: (userId: string) => `private:creator-analytics:${userId}`,
} as const;

export type RealtimeChannelName =
	| typeof realtimeChannels.presets
	| ReturnType<typeof realtimeChannels.notifications>
	| ReturnType<typeof realtimeChannels.profile>
	| ReturnType<typeof realtimeChannels.presetComments>
	| ReturnType<typeof realtimeChannels.creatorAnalytics>;
