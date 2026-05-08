"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Users, Target, Settings, Radar } from "lucide-react";

const navItems = [
  { href: "/search", label: "Find Contacts", icon: Search },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/early-adopters", label: "Early Adopters", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function AppShell({ children, title, subtitle, action }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 dark:bg-[#0A0A0A] dark:text-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-100 bg-white/80 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-[#0d0d0d]/90 lg:flex lg:flex-col">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900">
            <Radar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Prospect
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              by Antigravity
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/search" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-[15px] w-[15px] flex-shrink-0 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 dark:border-white/5">
          <p className="px-3 text-[10px] text-slate-400 leading-relaxed">
            Only real public data.
            <br />
            No fake contacts.
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-white/5 dark:bg-[#0A0A0A]/70 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="hidden items-center gap-3 md:flex flex-shrink-0">{action}</div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
