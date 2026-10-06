"use client";
import { LayoutDashboard, CalendarDays, Users, BedDouble, Building2, Settings, Bell, Search, Menu, ChevronDown, CircleDollarSign, ConciergeBell } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar, Badge, Input, Dropdown, Menu as AntMenu } from "antd";
import { useAuth } from "@/components/auth-provider";

const nav = [["Overview", LayoutDashboard], ["Reservations", CalendarDays], ["Front Desk", ConciergeBell], ["Guests", Users], ["Rooms", BedDouble], ["Rates", CircleDollarSign], ["Organization", Building2], ["Security", Settings]] as const;
const routes: Record<string, string> = { Overview: "/", Reservations: "/reservations", "Front Desk": "/front-desk", Guests: "/guests", Rooms: "/rooms", Rates: "/rates", Organization: "/organization", Security: "/security" };


export function PortalShell({ children, pageTitle }: { children: React.ReactNode; pageTitle?: string }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { ready, token, user, logout } = useAuth();
  const activeLabel = pathname.startsWith("/front-desk") ? "Front Desk"
    : pathname.startsWith("/reservations") ? "Reservations"
    : pathname.startsWith("/rooms") ? "Rooms"
    : pathname.startsWith("/guests") ? "Guests"
    : pathname.startsWith("/rates") ? "Rates"
    : pathname.startsWith("/organization") ? "Organization"
    : pathname.startsWith("/security") ? "Security" : "Overview";

  useEffect(() => {
    if (ready && (!token || !user || user.mustChangePassword)) {
      router.replace("/login?next=" + encodeURIComponent(pathname));
    }
  }, [ready, token, user, pathname, router]);

  if (!ready || !token || !user || user.mustChangePassword) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" /></main>;
  }

  const initials = String(user.name || user.username || "U").split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  return <div className="min-h-screen bg-[#f7f8fa]">
    <aside className={"fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-200 md:flex " + (!open ? "-translate-x-full" : "")}>
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-7"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">H</div><span className="text-xl font-semibold">HotelHex</span></div>
      <div className="portal-sidebar-menu-scroll min-h-0 flex-1 px-2 py-3">
        <AntMenu mode="inline" selectedKeys={[activeLabel]} items={[{ type: "group", label: "Workspace", children: nav.map(([label, Icon]) => ({ key: label, icon: <Icon size={18} />, label })) }, { type: "divider" }, { type: "group", label: "Manage", children: [{ key: "settings", icon: <Settings size={18} />, label: "Settings" }] }]} onClick={({ key }) => { const route = routes[key]; if (route) window.location.href = route; }} />
      </div>
    </aside>
    <main className={"transition-[margin] " + (open ? "md:ml-64" : "md:ml-0")}>
      <header className="flex h-20 items-center justify-between border-b border-slate-200/70 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.04)] px-5 md:px-9">
        <div className="flex items-center gap-3"><Button type="text" icon={<Menu size={20} />} onClick={() => setOpen(!open)} /><div className="hidden md:block"><p className="text-sm font-semibold">{pageTitle ?? "HotelHex"}</p><p className="text-xs text-slate-400">Hotel operations workspace</p></div></div>
        <div className="flex items-center gap-2 md:gap-5"><Input prefix={<Search size={16} />} placeholder="Search" className="hidden w-48 md:flex" /><Badge dot><Button type="text" shape="circle" icon={<Bell size={19} />} /></Badge><Dropdown menu={{ items: [{ key: "profile", label: user.name || user.username }, { key: "logout", label: "Sign out" }], onClick: ({ key }) => { if (key === "logout") void logout(); } }}><button className="flex items-center gap-2"><Avatar size={34} className="bg-blue-100 text-blue-700">{initials}</Avatar><span className="hidden text-left md:block"><span className="block text-sm font-semibold">{user.name || user.username}</span><span className="block text-xs text-slate-400">HotelHex user</span></span><ChevronDown size={15} /></button></Dropdown></div>
      </header>
      <div className="mx-auto max-w-[1440px] p-5 md:p-9">{children}</div>
    </main>
  </div>;
}

