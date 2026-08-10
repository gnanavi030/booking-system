"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AppSkeleton from "./skeletons/AppSkeleton";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
export default function DashboardCards() {
 const router = useRouter();

const { hasPermission } = useAuth();

const loading = false;

if (loading) {
  return <AppSkeleton count={4} />;
}

  const cards = [
    {
      
      icon: <LibraryBooksIcon sx={{ fontSize: 26 }} />,
      title: "Bookings",
      description: "Manage room reservations",
      route: "/list",
      color: "#3B82F6",
      gradient:
        "linear-gradient(135deg,#60A5FA,#2563EB)",
      visible: hasPermission("booking:view"),
    },

    {
      icon: <CalendarMonthIcon sx={{ fontSize: 26 }} />,
      title: "Calendar",
      description: "View schedules",
      route: "/calendar",
      color: "#8B5CF6",
      gradient:
        "linear-gradient(135deg,#A78BFA,#7C3AED)",
      visible: hasPermission("booking:view"),
    },

    {
      icon: <MeetingRoomIcon sx={{ fontSize: 26 }} />,
      title: "Reserve",
      description: "Create a booking",
      route: "/booking",
      color: "#06B6D4",
      gradient:
        "linear-gradient(135deg,#22D3EE,#0891B2)",
      visible: hasPermission("booking:create"),
    },
  ].filter((card) => card.visible);
  if (loading) {
  return <AppSkeleton count={4} />;
}

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "950px",

        display: "grid",

        gridTemplateColumns:
          "repeat(auto-fit,minmax(260px,1fr))",

        gap: "20px",

        marginTop: "28px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          onClick={() =>
            router.push(card.route)
          }
          style={{
            cursor: "pointer",

            position: "relative",

            overflow: "hidden",

            padding: "22px",

            minHeight: "190px",

            borderRadius: "28px",

            background:
              "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))",

            backdropFilter: "blur(24px)",

            border:
              "1px solid rgba(255,255,255,.12)",

            transition:
              "all .35s ease",

            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-8px) scale(1.02)";

            e.currentTarget.style.boxShadow =
              `0 20px 50px ${card.color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";

            e.currentTarget.style.boxShadow =
              "none";
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",

              borderRadius: "50%",

              background: card.color,

              opacity: 0.12,

              filter: "blur(60px)",

              top: -60,
              right: -60,
            }}
          />

          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 18,

              padding: "6px 12px",

              borderRadius: "999px",

              fontSize: "11px",

              fontWeight: 600,

              color: "#93C5FD",

              background:
                "rgba(255,255,255,.08)",

              border:
                "1px solid rgba(255,255,255,.1)",
            }}
          >
            Quick Access
          </div>

          {/* Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",

              borderRadius: "20px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: "20px",

              background: card.gradient,

              boxShadow: `0 15px 30px ${card.color}40`,
            }}
          >
            {card.icon}
          </div>

          {/* Content */}
          <div
            style={{
              marginTop: "22px",
            }}
          >
            <h2
              style={{
                color: "white",

                margin: 0,

                fontSize: "24px",

                fontWeight: 700,
              }}
            >
              {card.title}
            </h2>

            <p
              style={{
                marginTop: "8px",

                color:
                  "rgba(255,255,255,.70)",

                fontSize: "14px",

                lineHeight: 1.6,
              }}
            >
              {card.description}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "auto",

              display: "flex",
              justifyContent:
                "space-between",

              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#60A5FA",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Open →
            </span>

            <span
              style={{
                color:
                  "rgba(255,255,255,.40)",

                fontSize: "12px",
              }}
            >
              Click to continue
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}