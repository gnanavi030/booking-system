"use client";

import {
  Box,
  Typography,
  Paper,
  Modal,
  Button,
} from "@mui/material";
import { useState } from "react";

export default function ScheduleGrid({
  rooms = [],
  bookings = [],
  times = [],
  currentDateStr,
  onEdit,
  onDelete,
}: any) {
  console.log("onEdit =", onEdit);
  console.log("onDelete =", onDelete);

  const [open, setOpen] =
    useState(false);
  const currentUser =
    typeof window !== "undefined"
      ? localStorage
          .getItem("user")
          ?.split("@")[0]
      : "";

  const permissions =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("permissions") || "[]"
        )
      : [];

  const isAdmin =
    permissions.includes("booking:update") &&
    permissions.includes("booking:delete");

  const [selectedBooking, setSelectedBooking] =
    useState<any>(null);

  const toMinutes = (t?: string) => {
    if (!t) return 0;

    const [h, m] = t
      .split(":")
      .map(Number);

    return h * 60 + (m || 0);
  };

  const formatTime12 = (
    time: string
  ) => {
    const [h, m] = time
      .split(":")
      .map(Number);

    const ampm =
      h >= 12 ? "PM" : "AM";

    const hour = h % 12 || 12;

    return `${hour}:${String(
      m
    ).padStart(2, "0")} ${ampm}`;
  };

  const formatHeaderTime = (
    hour: number
  ) => {
    const ampm =
      hour >= 12 ? "PM" : "AM";

    const h = hour % 12 || 12;

    return `${h}:00 ${ampm}`;
  };

  const formatRoomName = (
    name: string
  ) =>
    name
      .split(" ")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const handleBookingClick = (
  booking: any
) => {
  setSelectedBooking(booking);
  setOpen(true);
};

const isWeekend =
  new Date(currentDateStr).getDay() === 0 ||
  new Date(currentDateStr).getDay() === 6;

if (isWeekend) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        background: "rgba(255,255,255,.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: "24px",
      }}
    >
      No bookings available on weekends
    </Paper>
  );
}
const canModifyBooking =
  selectedBooking &&
  (
    isAdmin ||
    selectedBooking.user_name?.toLowerCase() ===
      currentUser?.toLowerCase()
  );

return (
  <>
   <Paper
        sx={{
          p: 3,
          height: "100%",
          overflow:"auto",
          boxSizing: "border-box",
         
        

          background:
            "rgba(255,255,255,.08)",

          backdropFilter:
            "blur(20px)",

          border:
            "1px solid rgba(255,255,255,.12)",

          borderRadius: "24px",

          color: "white",
        }}
      >
              {/* HEADER */}

        <Box
          display="grid"
          gridTemplateColumns={`140px repeat(${times.length},1fr)`}
          mb={2}
        >
          <Box />

          {times.map((t: number) => (
            <Typography
              key={t}
              align="center"
              fontSize={12}
              fontWeight={700}
              sx={{
                color: "#93C5FD",
              }}
            >
              {formatHeaderTime(t)}
            </Typography>
          ))}
        </Box>

        {/* BODY */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            minHeight: 0,
            
          }}
        >
          {rooms.map((room: any) => {
            const roomBookings =
              bookings.filter(
                (b: any) =>
                  b.room_name ===
                    room.name &&
                  (!currentDateStr ||
                    b.date?.slice(
                      0,
                      10
                    ) ===
                      currentDateStr)
              );
            const isWeekend =
              new Date(currentDateStr).getDay() === 0 ||
              new Date(currentDateStr).getDay() === 6;

            return (
             <Box
              key={room.id}
              display="grid"
              gridTemplateColumns={`140px repeat(${times.length},1fr)`}
              mb={2}
            >
                
              
              
                {/* ROOM */}

                <Box
                  display="flex"
                  alignItems="center"
                  pl={1}
                >
                  <Typography
                    fontSize={14}
                    fontWeight={700}
                    color="white"
                  >
                    {formatRoomName(
                      room.name
                    )}
                  </Typography>
                </Box>

                {/* SLOTS */}

                {times.map(
                  (h: number) => {
                    const booking =
                      roomBookings.find(
                        (b: any) => {
                          const bookingHour =
                            Math.floor(
                              toMinutes(
                                b.start_time
                              ) / 60
                            );

                          return (
                            bookingHour ===
                            h
                          );
                        }
                      );

                    if (!booking) {
                      return (
                        <Paper
                          key={`${room.id}-${h}`}
                          sx={{
                            height: 80,

                            background:
                              "rgba(255,255,255,.03)",

                            borderRadius:
                              "16px",

                            m: 0.5,

                            border:
                              "1px solid rgba(255,255,255,.08)",

                            transition:
                              ".3s",

                            "&:hover":
                              {
                                background:
                                  "rgba(255,255,255,.06)",
                              },
                          }}
                        />
                      );
                    }

                    return (
                      <Paper
                        key={`${room.id}-${booking.id}`}
                        onClick={() =>
                          handleBookingClick(
                            booking
                          )
                        }
                        sx={{
                          height: 80,

                          background:
                            "linear-gradient(135deg,#3B82F6,#8B5CF6)",

                          color:
                            "white",

                          borderRadius:
                            "16px",

                          m: 0.5,

                          cursor:
                            "pointer",

                          display:
                            "flex",

                          flexDirection:
                            "column",

                          justifyContent:
                            "center",

                          alignItems:
                            "center",

                          border:
                            "1px solid rgba(255,255,255,.15)",

                          boxShadow:
                            "0 10px 25px rgba(59,130,246,.3)",

                          transition:
                            ".3s",

                          "&:hover":
                            {
                              transform:
                                "translateY(-4px) scale(1.03)",

                              boxShadow:
                                "0 18px 35px rgba(59,130,246,.45)",
                            },
                        }}
                      >
                        <Typography
                          fontSize={11}
                          fontWeight={700}
                          align="center"
                        >
                          {booking.reason}
                        </Typography>

                        <Typography
                          fontSize={10}
                          align="center"
                        >
                          {
                            booking.user_name
                          }
                        </Typography>

                        <Typography
                          fontSize={9}
                          sx={{
                            color:
                              "rgba(255,255,255,.75)",
                          }}
                        >
                          {formatTime12(
                            booking.start_time
                          )}
                        </Typography>
                      </Paper>
                    );
                  }
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* MODAL */}

      <Modal
        open={open}
        onClose={() =>
          setOpen(false)
        }
      >
        <Box
          sx={{
            position:
              "absolute",

            top: "50%",
            left: "50%",

            transform:
              "translate(-50%, -50%)",

            width: 420,

            background:
              "rgba(15,23,42,.96)",

            backdropFilter:
              "blur(20px)",

            border:
              "1px solid rgba(255,255,255,.12)",

            borderRadius: 4,

            p: 3,

            color: "white",

            boxShadow: 24,
          }}
        >
          {selectedBooking && (
            <>
              <Typography
                fontWeight="bold"
                mb={2}
                color="white"
                fontSize={18}
              >
                📅 Booking Details
              </Typography>

              <Typography mb={1}>
                Room:{" "}
                {
                  selectedBooking.room_name
                }
              </Typography>

              <Typography mb={1}>
                User:{" "}
                {
                  selectedBooking.user_name
                }
              </Typography>

              <Typography mb={1}>
                Start:{" "}
                {formatTime12(
                  selectedBooking.start_time
                )}
                <br />
                End:{" "}
                {formatTime12(
                  selectedBooking.end_time
                )}
              </Typography>

              <Typography mb={2}>
                Reason:{" "}
                {
                  selectedBooking.reason
                }
              </Typography>

              {canModifyBooking && (
                <Box
                  display="flex"
                  gap={2}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      background:
                        "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                      textTransform: "none",
                    }}
                    onClick={() => {
                      onEdit?.(selectedBooking);
                      setOpen(false);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    sx={{
                      textTransform: "none",
                    }}
                    onClick={() => {
                      onDelete?.(selectedBooking.id);
                      setOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              )}

            </>
          )}
        </Box>
      </Modal>
    </>
  );
}