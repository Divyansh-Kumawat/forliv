"use client";

import { useEffect, useRef, useState } from "react";

import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { cn, initials } from "@/lib/utils";

export function Topbar() {
  const { session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  if (!session) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6 print:hidden">
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Search patients, cycles, embryos…"
          aria-label="Search"
          className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted/80 transition-colors hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="mr-1 hidden rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink-soft md:inline-block">
          {session.centerId}
        </span>

        <button
          type="button"
          aria-label="Notifications, 3 unread"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface hover:text-ink"
        >
          <BellIcon className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-canvas" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={cn(
              "flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors",
              menuOpen ? "bg-surface" : "hover:bg-surface",
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-semibold text-white">
              {initials(session.displayName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[0.8125rem] font-medium leading-tight text-ink">
                {session.displayName}
              </span>
              <span className="block text-[0.6875rem] leading-tight text-ink-muted">
                {session.roleLabel}
              </span>
            </span>
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-ink-muted transition-transform",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+0.5rem)] w-56 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-[0_8px_28px_rgba(22,21,28,0.10)]"
            >
              <div className="border-b border-line px-3.5 pb-2.5 pt-1.5">
                <p className="text-[0.8125rem] font-medium text-ink">
                  {session.displayName}
                </p>
                <p className="text-xs text-ink-muted">@{session.username}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[0.8125rem] text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <UserIcon className="h-4 w-4" />
                Profile & preferences
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[0.8125rem] text-critical transition-colors hover:bg-critical/5"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
