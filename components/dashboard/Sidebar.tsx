"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo, LogoMark } from "@/components/common/Logo";
import { ChevronLeftIcon, NAV_ICONS, type NavIconName } from "@/components/ui/icons";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface lg:flex print:hidden",
        "transition-[width] duration-200",
        collapsed ? "w-[4.5rem]" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-line",
          collapsed ? "justify-center px-3" : "justify-between px-5",
        )}
      >
        {collapsed ? (
          <LogoMark />
        ) : (
          <>
            <Link href="/dashboard" aria-label="forlivf home">
              <Logo size="md" />
            </Link>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const NavIcon = NAV_ICONS[item.icon as NavIconName];
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                "text-[0.875rem] transition-colors duration-150",
                collapsed && "justify-center px-0",
                active
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-ink-soft hover:bg-surface-muted hover:text-ink",
              )}
            >
              {active && !collapsed && (
                <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-brand-600" />
              )}
              <NavIcon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-brand-600" : "text-ink-muted",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {collapsed && (
        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="flex h-9 w-full items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="m-3 rounded-2xl border border-line bg-surface-muted p-3.5">
          <p className="text-[0.8125rem] font-medium text-ink">
            Model refresh available
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Grading v2.4 improves blastocyst scoring consistency.
          </p>
        </div>
      )}
    </aside>
  );
}
