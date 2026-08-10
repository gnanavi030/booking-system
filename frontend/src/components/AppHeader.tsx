"use client";

import { useRouter, usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { hasPermission } from "@/utils/permissions";
import { useGetMeQuery } from "@/services/api";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me } =
    useGetMeQuery(undefined);

  const navItems = [
  {
    label: "Dashboard",
    path: "/",
    visible: true,
  },
  {
    label: "Bookings",
    path: "/list",
    visible: hasPermission("booking:view"),
  },
  {
    label: "Calendar",
    path: "/calendar",
    visible: hasPermission("booking:view"),
  },
  {
    label: "Reserve Room",
    path: "/booking",
    visible: hasPermission("booking:create"),
  },
  {
    label: "Users",
    path: "/users",
    visible: hasPermission("user:view"),
  },
].filter((item) => item.visible);

  return (
    <div
      style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  position: "sticky",
  top: 10,
  zIndex: 9999,

padding: "10px 18px",
borderRadius: "16px",

  background:
  "rgba(15,23,42,.70)",

backdropFilter:
  "blur(30px)",

border:
  "1px solid rgba(255,255,255,.08)",



boxShadow:
  "0 20px 50px rgba(0,0,0,.35)",

}}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          overflowX: "auto",
          overflowY:"hidden",
          scrollbarWidth: "thin",
          maxWidth: "100%",
          paddingBottom:"4px",
        }}
      >
       <div
  onClick={() => router.push("/")}
  style={{
    cursor: "pointer",

    background:
      "linear-gradient(135deg,#60A5FA,#A855F7)",

    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",

    fontWeight: 900,
    fontSize: "22px",

    letterSpacing: "-1px",

    marginRight: "28px",

    textShadow:
      "0 0 30px rgba(99,102,241,.4)",
  }}
>
  ✨ Nova Spaces
</div>

        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() =>
              router.push(item.path)
            }
            style={{
              background:
                pathname === item.path
                  ? "linear-gradient(135deg,#3B82F6,#8B5CF6)"
                  : "transparent",

              border:
                "1px solid rgba(255,255,255,.12)",

              color: "white",

              padding: "10px 18px",

              borderRadius: "12px",

              cursor: "pointer",

              transition: ".3s",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

<UserMenu
  userEmail={me?.email || "User"}
/>

    </div>
  );
}