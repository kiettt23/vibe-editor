"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useSubscription } from "@/hooks/useSubscription";
import { AccountSwitcher } from "@/components/shared/account-switcher";

const menuItems = [
  { name: "Giới thiệu", href: "/" },
  { name: "Tính năng", href: "/features" },
  { name: "Pro", href: "/pricing" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const { isPro, isLoading } = useSubscription();

  // Only show badge if user is logged in AND isPro is true AND not loading
  const shouldShowBadge = React.useMemo(() => {
    return user !== null && isPro === true && !isLoading;
  }, [user, isPro, isLoading]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-50 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-4 py-2 sm:py-2.5 lg:gap-0 lg:py-3">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo showProBadge={shouldShowBadge} />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                    >
                      <span>{item.name}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-lg font-medium">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-primary block transition-colors duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth Buttons - Show only when NOT logged in */}
              {!user && (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className={cn(
                      "text-base font-medium",
                      isScrolled && "lg:hidden"
                    )}
                  >
                    <Link href="/login">
                      <span>Đăng nhập</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="default"
                    className={cn(
                      "text-base font-medium",
                      isScrolled && "lg:hidden"
                    )}
                  >
                    <Link href="/signup">
                      <span>Đăng ký</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="default"
                    className={cn(
                      "text-base font-medium",
                      isScrolled ? "lg:inline-flex" : "hidden"
                    )}
                  >
                    <Link href="/editor">
                      <span>Bắt đầu ngay</span>
                    </Link>
                  </Button>
                </div>
              )}

              {/* User Menu - Show only when logged in */}
              {user && (
                <div className="flex w-full items-center gap-3 sm:w-fit">
                  <Button
                    asChild
                    size="default"
                    variant="outline"
                    className="text-sm font-medium"
                  >
                    <Link href="/dashboard">
                      <span>Dashboard</span>
                    </Link>
                  </Button>

                  <AccountSwitcher
                    userEmail={user.email || undefined}
                    userName={user.user_metadata?.full_name}
                    avatarUrl={user.user_metadata?.avatar_url}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
