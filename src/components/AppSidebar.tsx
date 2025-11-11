"use client";
import { Book, FileText, Home, Target } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: Target,
  },
  {
    title: "Notebooks",
    url: "#",
    icon: Book,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent
        className={`shadow-2xl ${
          sidebarState === "collapsed" ? "flex items-center" : ""
        }`}
      >
          {sidebarState === "collapsed" ? (
            <SidebarTrigger className="hidden md:flex" />
          ) : (
            <div>
              <SidebarHeader className="hidden md:block">Andika</SidebarHeader>
              <SidebarTrigger className="absolute right-2 top-4 hidden md:flex" />
            </div>
          )}
        <SidebarHeader className="md:hidden">Andika</SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="text-muted-foreground active:font-medium"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
