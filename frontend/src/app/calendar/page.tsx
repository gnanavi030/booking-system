"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import AppLayout from "@/components/layouts/AppLayout";
import RoomList from "@/components/RoomList";
import ScheduleGrid from "@/components/ScheduleGrid";
import CalendarToolbar from "@/components/CalendarToolbar";
import BookingModal from "@/components/BookingModal";
import {
  useDeleteBookingMutation,
  useGetBookingsQuery,
  useGetRoomsQuery,
} from "@/services/api";

type Room = {
  id: number;
  name: string;
  capacity?: number;
};

type Booking = {
  id: number;
  user_name?: string;
  room_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
};

const TIMES = Array.from({ length: 10 }, (_, i) => i + 8);

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function isWeekend(dateStr: string) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

export default function CalendarPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [deleteBooking] = useDeleteBookingMutation();

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const selectedDate = toDateKey(currentDate);

  const { data: rooms = [] } = useGetRoomsQuery(undefined);
  const { data: bookingsData } = useGetBookingsQuery({
    date: selectedDate,
    limit: 5000,
    offset: 0,
  });

  const bookings: Booking[] = isWeekend(selectedDate)
    ? []
    : bookingsData?.data || [];

  const filteredRooms = selectedRoom
    ? (rooms as Room[]).filter((room) => room.name === selectedRoom)
    : (rooms as Room[]);

  const shiftDay = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const handlePrevDay = () => shiftDay(-1);
  const handleNextDay = () => shiftDay(1);
  const handleToday = () => setCurrentDate(new Date());

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmId(null);
  };

  const handleDelete = async () => {
    try {
      if (confirmId !== null) {
        await deleteBooking(confirmId).unwrap();
      }

      closeConfirm();
      enqueueSnackbar("Booking deleted successfully", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar("Failed to delete booking", {
        variant: "error",
      });
    }
  };

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
            times={TIMES}
            currentDateStr={selectedDate}
            onEdit={(booking: Booking) => {
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
        onClose={closeConfirm}
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
          <Button onClick={closeConfirm} sx={{ textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
            }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
