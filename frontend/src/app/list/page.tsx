"use client";

import { useState } from "react";

import AppLayout from "@/components/layouts/AppLayout";
import RoomList from "@/components/RoomList";
import BookingList from "@/components/BookingList";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ListPage() {
  const [selectedRoom, setSelectedRoom] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  return (
    <ProtectedRoute permission="booking:view">
      <AppLayout>
       <div
  style={{
    marginTop: "8px",
    marginBottom: "12px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: "12px",
    }}
  >
    <h1
  style={{
    color: "#fff",
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-1px",
  }}
>
  Reservations
</h1>

<p
  style={{
    color: "rgba(255,255,255,.65)",
    marginTop: "6px",
    fontSize: "15px",
  }}
>
  Monitor reservations, availability and
  workspace utilization
</p>

    </div>
  </div>

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "20px",
    height: "calc(100vh - 170px)",
    overflow:"hidden",
  }}
>
          {/* ROOM LIST */}
          <div
  style={{
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "8px",
  }}
>
            <RoomList
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              selectedDate={selectedDate}
            />
          </div>

          {/* BOOKING LIST */}
         <div
  style={{
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    minWidth: 0,
    paddingRight: "8px",
  }}
>
            <BookingList
              selectedRoom={selectedRoom}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}