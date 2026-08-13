"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { useAuth } from "@/hooks/useAuth";
import {
  useDeleteBookingMutation,
  useGetBookingsQuery,
  useGetRoomsQuery,
} from "@/services/api";
import AppSkeleton from "./skeletons/AppSkeleton";
import BookingModal from "./BookingModal";
import FilterBar from "./FilterBar";

type Booking = {
  id: number;
  user_name: string;
  room_name: string;
  required_capacity?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
};

type BookingListProps = {
  selectedRoom: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

const ROOM_COLORS: Record<string, string> = {
  Ganga: "#A5C8FF",
  Yamuna: "#A8E6CF",
  Kaveri: "#D6BCFA",
  Narmada: "#FFD6A5",
  Saraswathi: "#BDE0FE",
  Brahmaputra: "#FFCAD4",
  Godavari: "#C7CEEA",
  Krishna: "#B8F2E6",
  Mahanadi: "#FAEDCD",
  Sabarmati: "#E0BBE4",
  Tapti: "#D8F3DC",
  Indus: "#CDE7FF",
  Saraswati: "#E9D5FF",
};

const GRID_COLUMNS = "220px 220px 220px 180px 220px";

const panelSx = {
  background: "#162033",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "12px",
  boxShadow: "none",
  color: "white",
} as const;

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number) {
  const next = new Date(dateStr);
  next.setDate(next.getDate() + days);
  return toDateInputValue(next);
}

function formatTime(time?: string) {
  if (!time) return "-";

  return new Date(`2000-01-01T${time}`).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}

function isWeekend(dateStr: string) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

function getCurrentUsername() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");
  return user?.split("@")[0] ?? null;
}

function getIsAdmin() {
  if (typeof window === "undefined") return false;

  const roles = JSON.parse(
    localStorage.getItem("roles") || "[]"
  ) as string[];

  return roles.includes("Admin");
}

export default function BookingList({
  selectedRoom,
  selectedDate,
  setSelectedDate,
}: BookingListProps) {
  const { hasPermission } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchUser, setSearchUser] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(
    null
  );

  const currentUsername = useMemo(() => getCurrentUsername(), []);
  const isAdmin = useMemo(() => getIsAdmin(), []);
  const weekend = isWeekend(selectedDate);

  useEffect(() => {
    setPage(1);
  }, [
    searchUser,
    filterReason,
    filterRoom,
    filterDate,
    selectedRoom,
    itemsPerPage,
  ]);

  const {
    data: bookingsData,
    isLoading,
  } = useGetBookingsQuery({
    ...(searchUser && { user_name: searchUser }),
    ...((filterRoom || selectedRoom) && {
      room_name: filterRoom || selectedRoom,
    }),
    ...(filterReason && { reason: filterReason }),
    date: filterDate || selectedDate,
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
  });

  const { data: rooms = [] } = useGetRoomsQuery(undefined);
  const [deleteBooking, { isLoading: isDeletingBooking }] =
    useDeleteBookingMutation();

  const bookings: Booking[] = bookingsData?.data || [];
  const total = bookingsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const handlePrevDay = () => {
    setSelectedDate(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(shiftDate(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(toDateInputValue(new Date()));
  };

  const handleDelete = async () => {
    if (bookingToDelete === null) return;

    try {
      await deleteBooking(bookingToDelete).unwrap();
      enqueueSnackbar("Booking deleted successfully", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar("Failed to delete booking", {
        variant: "error",
      });
    } finally {
      setConfirmOpen(false);
      setBookingToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <AppSkeleton count={6} />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, ...panelSx }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1.25}
        >
          <Typography fontSize={14} fontWeight={700}>
            {selectedRoom
              ? `${selectedRoom} Room Bookings`
              : "All Bookings"}
          </Typography>

          <Box
            display="flex"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              onClick={handlePrevDay}
              sx={{ textTransform: "none" }}
            >
              Prev
            </Button>

            <Typography>
              {new Date(selectedDate).toDateString()}
            </Typography>

            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                background: "rgba(255,255,255,.08)",
                borderRadius: "12px",
                "& input": { color: "#FFFFFF" },
                "& input::-webkit-calendar-picker-indicator": {
                  filter: "invert(1)",
                  cursor: "pointer",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,.25)",
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleToday}
              sx={{ textTransform: "none" }}
            >
              Today
            </Button>

            <Button
              variant="outlined"
              onClick={handleNextDay}
              sx={{ textTransform: "none" }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      <FilterBar
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        filterRoom={filterRoom}
        setFilterRoom={setFilterRoom}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        reason={filterReason}
        setReason={setFilterReason}
        rooms={rooms}
      />

      <Paper
        sx={{
          p: 2,
          height: "calc(100vh - 280px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...panelSx,
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: GRID_COLUMNS,
            alignItems: "center",
            p: 1.4,
            mb: 1,
            minHeight: "48px",
            borderRadius: "8px",
            background: "#202C44",
            border: "1px solid rgba(255,255,255,.05)",
          }}
        >
          <Typography fontWeight={700}>Room</Typography>
          <Typography fontWeight={700}>User</Typography>
          <Typography fontWeight={700}>Time</Typography>
          <Typography fontWeight={700}>Reason</Typography>
          <Typography fontWeight={700}>Actions</Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 1,
            minHeight: 0,
          }}
        >
          {weekend ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "rgba(255,255,255,.7)",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              No bookings available on weekends
            </Box>
          ) : (
            bookings.map((booking) => {
              const canManageBooking =
                isAdmin ||
                booking.user_name?.toLowerCase() ===
                  currentUsername?.toLowerCase();

              const roomColor =
                ROOM_COLORS[booking.room_name] || "#ccc";

              return (
                <Box
                  key={booking.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: GRID_COLUMNS,
                    alignItems: "center",
                    p: 1,
                    mb: 0.75,
                    minHeight: "52px",
                    borderRadius: "8px",
                    background: "#1A2438",
                    border: "1px solid rgba(255,255,255,.04)",
                    borderLeft: `4px solid ${roomColor}`,
                    transition: "0.2s",
                    "&:hover": { background: "#22304A" },
                  }}
                >
                  <Typography
                    fontWeight={700}
                    fontSize="15px"
                    sx={{
                      color: roomColor,
                      textShadow: "0 0 12px rgba(255,255,255,.15)",
                    }}
                  >
                    {booking.room_name}
                  </Typography>

                  <Typography>{booking.user_name}</Typography>

                  <Typography>
                    {formatTime(booking.start_time)} -{" "}
                    {formatTime(booking.end_time)}
                  </Typography>

                  <Typography>{booking.reason || "-"}</Typography>

                  <Box display="flex" gap={1}>
                    {hasPermission("booking:update") &&
                      canManageBooking && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            setSelected(booking);
                            setShowModal(true);
                          }}
                          sx={{
                            textTransform: "none",
                            minWidth: "78px",
                            height: "34px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            background:
                              "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                            color: "#fff",
                            boxShadow:
                              "0 4px 14px rgba(59,130,246,0.35)",
                            transition: "all .2s ease",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                              transform: "translateY(-1px)",
                              boxShadow:
                                "0 8px 20px rgba(59,130,246,0.45)",
                            },
                          }}
                        >
                          Edit
                        </Button>
                      )}

                    {hasPermission("booking:delete") &&
                      canManageBooking && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setBookingToDelete(booking.id);
                            setConfirmOpen(true);
                          }}
                          sx={{
                            textTransform: "none",
                            minWidth: "80px",
                            height: "32px",
                            borderRadius: "8px",
                            fontSize: "13px",
                          }}
                        >
                          Delete
                        </Button>
                      )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "white",
            }}
          >
            <Typography>Per page</Typography>

            <Select
              size="small"
              value={itemsPerPage}
              onChange={(e) =>
                setItemsPerPage(Number(e.target.value))
              }
              sx={{
                minWidth: 80,
                color: "white",
                "& .MuiSvgIcon-root": { color: "white" },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>

            <Typography>
              {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, total)} of {total}
            </Typography>
          </Box>

          <Pagination
            page={page}
            count={totalPages}
            showFirstButton
            showLastButton
            onChange={(_, value) => setPage(value)}
            sx={{
              "& .MuiPaginationItem-root": { color: "white" },
              "& .Mui-selected": {
                background: "#3B82F6 !important",
                color: "#fff !important",
              },
            }}
          />
        </Box>
      </Paper>

      <BookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        selected={selected}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            background: "#162033",
            color: "#fff",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,.08)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 700 }}>
          Delete Booking
        </DialogTitle>

        <DialogContent sx={{ color: "rgba(255,255,255,.75)" }}>
          Are you sure you want to delete this booking?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              color: "#2196F3",
              background: "transparent",
              "&:hover": {
                background: "transparent",
                color: "#42A5F5",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            disabled={isDeletingBooking}
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FF3B30",
              background: "transparent",
              "&:hover": {
                background: "transparent",
                color: "#FF6259",
              },
            }}
          >
            {isDeletingBooking ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
