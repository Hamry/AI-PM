import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  authSlot?: React.ReactNode;
  links?: NavLink[];
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
];

export function Navbar({ authSlot, links }: NavbarProps) {
  const navLinks = links ?? DEFAULT_LINKS;

  return (
    <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">account_tree</span>
        <span className="text-text-primary font-bold text-base">Fractalist</span>
      </div>

      <NavigationMenu.Root>
        <NavigationMenu.List className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavigationMenu.Item key={link.label}>
              <NavigationMenu.Link
                href={link.href}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors block ${
                  link.active
                    ? "text-text-primary bg-surface-muted font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                }`}
              >
                {link.label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div className="flex items-center gap-3">{authSlot}</div>
    </header>
  );
}
