// Site configuration from Product Specification §3 Site Map

export const siteConfig = {
  name: "PresetHub",
  description: "Discover, share, and track FL Studio presets",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  routes: [
    { path: "/", label: "Home" },
    { path: "/search", label: "Search" },
    { path: "/creators", label: "Creators" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/upload", label: "Upload" },
    { path: "/profile/[username]", label: "Profile" },
    { path: "/preset/[id]", label: "Preset Detail" },
    { path: "/auth/login", label: "Login" },
    { path: "/auth/register", label: "Register" },
  ] as const,
  socialLinks: {
    twitter: "https://twitter.com/presethub",
    github: "https://github.com/presethub",
    discord: "https://discord.gg/presethub",
  },
} as const;

export type RoutePath = (typeof siteConfig.routes)[number]["path"];
