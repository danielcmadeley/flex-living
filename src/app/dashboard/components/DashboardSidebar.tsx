"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Building,
  Database,
  LogOut,
  User as UserIcon,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { GlobalSearchCommand } from "./GlobalSearchCommand";
import { createClientBrowser } from "@/lib/supabase";
import { NormalizedReview } from "@/lib/schemas";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface DashboardSidebarProps {
  user: User;
  children: React.ReactNode;
  reviews?: NormalizedReview[];
}

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
    description: "Overview of all listings performance",
  },
  {
    title: "Properties",
    url: "/dashboard/properties",
    icon: Building,
    description: "Individual property analytics",
  },
  {
    title: "Reviews",
    url: "/dashboard/reviews",
    icon: MessageSquare,
    description: "Review management and insights",
  },
];

const managementItems: NavigationItem[] = [
  {
    title: "Seed Database",
    url: "/dashboard/seed",
    icon: Database,
    description: "Manage and seed database",
  },
];

export function DashboardSidebar({
  user,
  children,
  reviews = [],
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClientBrowser();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      logger.error("Failed to log out", error, { module: "DashboardSidebar" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const isCurrentPath = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    if (url === "/dashboard/properties") {
      return (
        pathname === "/dashboard/properties" ||
        pathname.startsWith("/dashboard/properties/")
      );
    }
    return pathname === url || pathname.startsWith(url + "/");
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-border/40">
        <SidebarHeader className="border-b border-border/40">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Flex Living</span>
              <span className="truncate text-xs text-muted-foreground">
                Property Management
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentPath(item.url)}
                      tooltip={item.description}
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Management Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentPath(item.url)}
                      tooltip={item.description}
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.email || "User"}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0] ||
                          "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email || "User"}
                        />
                        <AvatarFallback className="rounded-lg">
                          {getUserInitials(user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user.user_metadata?.full_name ||
                            user.email?.split("@")[0] ||
                            "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">
                {pathname === "/dashboard" && "Dashboard Overview"}
                {pathname === "/dashboard/properties" && "Properties"}
                {pathname.startsWith("/dashboard/properties/") &&
                  "Property Details"}
                {pathname === "/dashboard/reviews" && "Reviews"}
                {pathname === "/dashboard/seed" && "Database Seeding"}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <GlobalSearchCommand reviews={reviews} />
            <NotificationCenter reviews={reviews} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
