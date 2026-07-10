// Central site configuration. Rename the brand, tagline, and nav here once
// and it updates everywhere. The logo renders as `logoLeft.logoRight` with a
// highlighted dot, in the pwn.college style.

export const SITE = {
  name: "Hacky Stacky",
  logoLeft: "Hacky",
  logoRight: "Stacky",
  mascot: "Sudo", // the node-creature tutor's name
  tagline: "Learn data structures through the lens of cybersecurity.",
  description:
    "An interactive playground that teaches data structures by hacking, defending, and exploiting them.",
};

export type NavItem = { label: string; href: string };

// Primary navigation (left side of the header).
export const NAV: NavItem[] = [
  { label: "Modules", href: "/modules" },
  { label: "Workspace", href: "/workspace" },
  { label: "Help", href: "/help" },
  { label: "Chat", href: "/chat" },
  { label: "Search", href: "/search" },
];

// Account navigation (right side of the header).
export const AUTH_NAV: NavItem[] = [
  { label: "Register", href: "/register" },
  { label: "Login", href: "/login" },
];
