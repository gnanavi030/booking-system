"use client";

import AppLayout from "@/components/layouts/AppLayout";
import BookingForm from "@/components/BookingForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BookingPage() {
  const permissions =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("permissions") || "[]"
        )
      : [];

  const canCreateBooking =
    permissions.includes("booking:create");

  return (
    <ProtectedRoute permission="booking:view">
      <AppLayout>
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            paddingBottom: "40px",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <h1
              style={{
                color: "white",
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              Reserve Workspace
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,.7)",
              }}
            >
              Book meeting rooms and manage availability
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            {canCreateBooking ? (
              <BookingForm />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "white",
                }}
              >
                <h2
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  Viewer Access
                </h2>

                <p
                  style={{
                    color:
                      "rgba(255,255,255,.7)",
                  }}
                >
                  You have view-only access.
                  Please contact an administrator
                  if you need booking privileges.
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}