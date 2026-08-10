"use client";

import {
  useGetBookingsQuery,
  useGetRoomsQuery,
} from "@/services/api";

import RoomUtilization from "./RoomUtilization";

export default function RoomList({
  selectedRoom,
  onSelectRoom,
  selectedDate,
}: any) {
  const { data: rooms } =
    useGetRoomsQuery(undefined);

  const { data: bookingsData } =
    useGetBookingsQuery({
      date: selectedDate,
      limit: 5000,
      offset: 0,
    });

  const bookings =
    bookingsData?.data || [];

  const dayOfWeek = new Date(
    selectedDate
  ).getDay();

  const isWeekend =
    dayOfWeek === 0 ||
    dayOfWeek === 6;

  const format = (name: string) =>
    name
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  const roomColors: Record<
    string,
    string
  > = {
    
 Ganga: "#A5C8FF",        // Pastel Blue
  Yamuna: "#A8E6CF",       // Mint
  Kaveri: "#D6BCFA",       // Lavender
  Narmada: "#FFD6A5",      // Peach
  Saraswathi: "#BDE0FE",   // Sky
  Brahmaputra: "#FFCAD4",  // Rose
  Godavari: "#C7CEEA",     // Periwinkle
  Krishna: "#B8F2E6",      // Aqua Mint
  Mahanadi: "#FAEDCD",     // Cream Gold
  Sabarmati: "#E0BBE4",    // Soft Orchid
  Tapti: "#D8F3DC",        // Sage
  Indus: "#CDE7FF",        // Ice Blue
  Saraswati: "#E9D5FF",    // Light Violet
};


  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "3px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "10px",
          marginBottom: "8px",
          borderRadius: "8px",
          background: "#1620330",
          border: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          Rooms
        </div>

        <div
          style={{
            color:
              "rgba(255,255,255,.65)",
            fontSize: "11px",
            marginTop: "2px",
          }}
        >
          Select a room
        </div>
      </div>

      {rooms?.map((room: any) => {
        const isSelected =
          selectedRoom === room.name;

        const roomColor =
          roomColors[room.name] ||
          "#3B82F6";

        return (
          <div
            key={room.id}
            onClick={() =>
              onSelectRoom(
                isSelected
                  ? null
                  : room.name
              )
            }
            style={{
              marginBottom: "2px",
              padding: "8px",
              cursor: "pointer",

              borderRadius: "8px",
              background: isSelected
              
              ? `${roomColor}15`
              
              : "#162033",

              borderLeft: `4px solid ${roomColor}`,

              border:
                isSelected
                  ? `1px solid ${roomColor}`
                  : "1px solid rgba(255,255,255,.08)",

              boxShadow:"none",


              transition:
                "all .2s ease",
            }}
           onMouseEnter={(e) => {
  e.currentTarget.style.background =
    "#1C2840";
}}
           onMouseLeave={(e) => {
  e.currentTarget.style.background =
    isSelected
      ? `${roomColor}15`
      : "#162033";
}}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  color: roomColor,
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {format(room.name)}
              </div>

              <div
                style={{
                  color:
                    "rgba(255,255,255,.80)",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                Capacity: {room.capacity}
              </div>
            </div>

            {!isWeekend && (
              <RoomUtilization
                roomName={room.name}
                bookings={bookings}
              />
            )}
          </div>
        );
      })}

      {rooms?.length === 0 && (
        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            textAlign: "center",
            background:
              "rgba(255,255,255,.06)",
            color: "white",
          }}
        >
          No rooms available
        </div>
      )}
    </div>
  );
}