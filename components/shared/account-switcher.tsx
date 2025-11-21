"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Plus, LogOut, User } from "lucide-react";
import { useMultiSession } from "@/hooks/useMultiSession";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AccountSwitcherProps {
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
}

export function AccountSwitcher({
  userEmail,
  userName,
  avatarUrl,
}: AccountSwitcherProps) {
  const {
    sessions,
    activeSession,
    saveCurrentSession,
    switchSession,
    removeSession,
  } = useMultiSession();

  // Save current session on mount if user is logged in
  useEffect(() => {
    if (userEmail) {
      saveCurrentSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={userName || userEmail} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(userName, userEmail)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* List of all sessions */}
        {sessions.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Tài khoản ({sessions.length})
            </DropdownMenuLabel>
            {sessions.map((session) => {
              const isActive = activeSession?.id === session.id;
              return (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => {
                    if (!isActive) {
                      switchSession(session.id);
                    }
                  }}
                  className={cn("cursor-pointer", isActive && "bg-accent")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(session.fullName, session.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.fullName || session.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.email}
                      </p>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Add Account */}
        <DropdownMenuItem asChild>
          <Link href="/login?multi=true" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Account Settings */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {/* Logout current account */}
        <DropdownMenuItem
          onClick={() => {
            if (activeSession) {
              removeSession(activeSession.id);
            }
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
