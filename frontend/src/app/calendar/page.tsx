"use client";

import { useState } from "react";

import AppLayout from "@/components/layouts/AppLayout";
import RoomList from "@/components/RoomList";
import ScheduleGrid from "@/components/ScheduleGrid";
import CalendarToolbar from "@/components/CalendarToolbar";
import BookingModal from "@/components/BookingModal";
import { useSnackbar } from "notistack";
import {
  useDeleteBookingMutation,
} from "@/services/api";
import {
  useGetRoomsQuery,
  useGetBookingsQuery,
} from "@/services/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function CalendarPage() {
  const [selectedRoom, setSelectedRoom] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedBooking, setSelectedBooking] =
    useState<any>(null);
  const [showModal, setShowModal] =
    useState(false);
  const [bookingToDelete, setBookingToDelete] =
    useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] =
    useState(false);
  const [confirmId, setConfirmId] =
   useState<number | null>(null);
 

  const handlePrevDay = () => {
    const d = new Date(currentDate);

    d.setDate(d.getDate() - 1);

    setCurrentDate(d);

    setSelectedDate(
      d.toISOString().split("T")[0]
    );
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);

    d.setDate(d.getDate() + 1);

    setCurrentDate(d);

    setSelectedDate(
      d.toISOString().split("T")[0]
    );
  };

  const handleToday = () => {
    const today = new Date();

    setCurrentDate(today);

    setSelectedDate(
      today.toISOString().split("T")[0]
    );
  };

  const { data: rooms = [] } =
    useGetRoomsQuery(undefined);

  const { data: bookingsData } =
    useGetBookingsQuery({
      date: selectedDate,
      limit: 5000,
      offset: 0,
    });

  const isWeekend =
  new Date(selectedDate).getDay() === 0 ||
  new Date(selectedDate).getDay() === 6;

const bookings = isWeekend
  ? []
  : bookingsData?.data || [];


  const filteredRooms = selectedRoom
    ? rooms.filter(
        (room: any) =>
          room.name === selectedRoom
      )
    : rooms;

  const [deleteBooking] =
    useDeleteBookingMutation();
  const { enqueueSnackbar } = useSnackbar();

  const times = Array.from(
    { length: 10 },
    (_, i) => i + 8
  );

  return (
    <AppLayout>
      <CalendarToolbar
        currentDate={currentDate}
        onPrev={handlePrevDay}
        onToday={handleToday}
        onNext={handleNextDay}
      />

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "20px",

    height: "calc(100vh - 210px)",

    overflow: "hidden",
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


       {/* CALENDAR GRID */}

    <div
  style={{
    height: "100%",

    overflowY: "auto",
    overflowX: "auto",

    minWidth: 0,
  }}
>
        <ScheduleGrid
          rooms={filteredRooms}
          bookings={bookings}
          times={times}
          currentDateStr={selectedDate}
          onEdit={(booking: any) => {
            console.log("EDIT", booking);

            setSelectedBooking(booking);

          

            setShowModal(true);
          }}
          onDelete={(id: number) => {
            setConfirmId(id);
            setConfirmOpen(true);
          }}
        />

            </div>
      </div>

      <BookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        selected={selectedBooking}
      />
      <Dialog
  open={confirmOpen}
  onClose={() => {
    setConfirmOpen(false);
    setConfirmId(null);
  }}
  PaperProps={{
    sx: {
      borderRadius: "20px",
      background: "rgba(15,23,42,.97)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "white",
      minWidth: 420,
    },
  }}
>
  <DialogTitle
    sx={{
      color: "#F87171",
      fontWeight: 700,
      fontSize: "20px",
    }}
  >
     Delete Booking
  </DialogTitle>

  <DialogContent>
    <Typography>
      Are you sure you want to delete this booking?
      <br />
      This action cannot be undone.
    </Typography>
  </DialogContent>

  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={() => {
        setConfirmOpen(false);
        setConfirmId(null);
      }}
      sx={{ textTransform: "none" }}
    >
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      sx={{
        textTransform: "none",
        borderRadius: "10px",
      }}
      onClick={async () => {
        try {
          if (confirmId !== null) {
            await deleteBooking(confirmId).unwrap();
          }

          setConfirmOpen(false);
          setConfirmId(null);

          enqueueSnackbar(
          "Booking deleted successfully",
          {
          variant: "success",
          }
          );
        } catch (error) {
          enqueueSnackbar(
          "Failed to delete booking",
          {
            variant: "error",
          }
        );
        }
      }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
      
    </AppLayout>
  );
}