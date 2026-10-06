export const portalNavigation = [
  { label: "Overview", href: "/" },
  { label: "Reservations", href: "/reservations" },
  { label: "Guests", href: "/guests" },
  { label: "Rooms", href: "/rooms" },
] as const;
export type UserRole = "ADMIN" | "MANAGER" | "STAFF";
