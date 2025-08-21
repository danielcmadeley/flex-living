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
      <Sidebar
        variant="inset"
        className="border-r border-gray-200/50 bg-white/95 backdrop-blur-sm"
      >
        <SidebarHeader className="border-b border-gray-200/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
              <Building className="h-4 w-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold text-gray-900">
                Flex Living
              </span>
              <span className="truncate text-xs text-gray-500 font-medium">
                Property Management Dashboard
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
                      className="group hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className={`w-full rounded-lg transition-all duration-200 ${
                          isCurrentPath(item.url)
                            ? "bg-blue-50 text-blue-700 shadow-sm border-blue-200"
                            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isCurrentPath(item.url)
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
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
                      className="group hover:bg-orange-50 hover:border-orange-200 transition-all duration-200"
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className={`w-full rounded-lg transition-all duration-200 ${
                          isCurrentPath(item.url)
                            ? "bg-orange-50 text-orange-700 shadow-sm border-orange-200"
                            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isCurrentPath(item.url)
                              ? "text-orange-600"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
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
                    className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-900 hover:bg-gray-50 transition-all duration-200 rounded-lg border border-transparent hover:border-gray-200"
                  >
                    <Avatar className="h-8 w-8 rounded-lg ring-2 ring-gray-200">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.email || "User"}
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                        {getUserInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-gray-900">
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0] ||
                          "User"}
                      </span>
                      <span className="truncate text-xs text-gray-500 font-medium">
                        {user.email}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4 text-gray-400" />
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
          <div className="flex items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-gray-100 rounded-md transition-colors" />
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-800">
                {pathname === "/dashboard" && "Dashboard Overview"}
                {pathname === "/dashboard/properties" && "Properties"}
                {pathname.startsWith("/dashboard/properties/") &&
                  "Property Details"}
                {pathname === "/dashboard/reviews" && "Reviews"}
                {pathname === "/dashboard/seed" && "Database Seeding"}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 px-4">
            <GlobalSearchCommand reviews={reviews} />
            <NotificationCenter reviews={reviews} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50/30">
          <div className="container mx-auto p-6 max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
