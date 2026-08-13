"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppSkeleton from "./skeletons/AppSkeleton";
import { useSnackbar } from "notistack";


import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Pagination,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
 Alert,
} from "@mui/material";

import { useRouter } from "next/navigation";

import {
  useGetBookingsQuery,
  useGetRoomsQuery,
  useDeleteBookingMutation,
} from "@/services/api";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import BookingModal from "./BookingModal";
import FilterBar from "./FilterBar";

export default function BookingList({
  selectedRoom,
  selectedDate,
  setSelectedDate,
}: any) {
  const { hasPermission } = useAuth();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  const [searchUser, setSearchUser] =
    useState("");

  const [filterReason, setFilterReason] =
    useState("");

  const [filterRoom, setFilterRoom] =
    useState("");

  const [filterDate, setFilterDate] =
    useState("");

  const [selected, setSelected] =
    useState<any>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [confirmOpen, setConfirmOpen] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");

  const [
    bookingToDelete,
    setBookingToDelete,
  ] = useState<number | null>(null);

  const [currentDate, setCurrentDate] =
    useState(new Date(selectedDate));
  const { enqueueSnackbar } = useSnackbar();


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

  const handlePrevDay = () => {
    const d = new Date(selectedDate);

    d.setDate(d.getDate() - 1);

    setCurrentDate(d);

    setSelectedDate(
      d.toISOString().split("T")[0]
    );
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);

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

      const currentUsername =
      typeof window !== "undefined"
        ? localStorage
            .getItem("user")
            ?.split("@")[0]
        : null;

    const roles = JSON.parse(
      localStorage.getItem("roles") || "[]"
    );

    const isAdmin =
      roles.includes("Admin");

  const {
  data: bookingsData,
  isLoading,
} = useGetBookingsQuery({
      ...(searchUser && {
        user_name: searchUser,
      }),

      ...((filterRoom || selectedRoom) && {
        room_name:
          filterRoom || selectedRoom,
      }),

      ...(filterReason && {
        reason: filterReason,
      }),

      ...(filterDate && {
        date: filterDate,
      }),

      ...(!filterDate && {
        date: selectedDate,
      }),

      limit: itemsPerPage,

      offset:
        (page - 1) * itemsPerPage,
    });

  

 const bookings =
  bookingsData?.data || [];
const isWeekend =
  new Date(selectedDate).getDay() === 0 ||
  new Date(selectedDate).getDay() === 6;



const total =
  bookingsData?.total || 0;

const totalPages = Math.max(
  1,
  Math.ceil(total / itemsPerPage)
);

const { data: rooms = [] } =
  useGetRoomsQuery(undefined);

const [
  deleteBooking,
  { isLoading: isDeletingBooking },
] = useDeleteBookingMutation();

if (isLoading) {
  return (
    <Box sx={{ mt: 2 }}>
      <AppSkeleton count={6} />
    </Box>
  );
}
  
  const roomColors: any = {
  
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
    <Box>
      {/* HEADER */}

      <Paper
        sx={{
          p: 3,
          
          flexDirection: "column",

          borderRadius: "12px",

          background:
            "#162033",

          backdropFilter:
            "none",

          border:
            "1px solid rgba(255,255,255,.12)",

          boxShadow:
            "none",

          color: "white",
        }}
      >
        <Box

          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1.25}
        >
          <Typography
            fontSize={14}
            fontWeight={700}
          >
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
              ◀ Prev
            </Button>

            <Typography>
              {currentDate.toDateString()}
            </Typography>

            <TextField
              type="date"
              size="small"
              sx={{
  background: "rgba(255,255,255,.08)",
  borderRadius: "12px",

  "& input": {
    color: "#FFFFFF",
  },

  "& input::-webkit-calendar-picker-indicator": {
    filter: "invert(1)",
    cursor: "pointer",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.25)",
  },
}}

              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
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
              Next ▶
            </Button>

         

          </Box>
        </Box>
      </Paper>

      {/* FILTERS */}

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

      {/* TABLE */}

      

 <Paper
  sx={{
    p: 2,
    height: "calc(100vh - 280px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",

    background: "#162033",

    border: "1px solid rgba(255,255,255,.06)",

    borderRadius: "12px",

    boxShadow: "none",

    color: "white",
  }}
>
        <Box
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            width: "100%",

          }}
        >
          <Box
           sx={{
            minWidth: "1200px",
           }}
        ></Box>

        </Box>
       <Box
  sx={{
    display: "grid",
    gridTemplateColumns:
      "220px 220px 220px 180px 220px",
    alignItems: "center",

    p: 1.4,

    mb: 1,

    minHeight: "48px",

    borderRadius: "8px",

    background: "#202C44",

    border:
      "1px solid rgba(255,255,255,.05)",
  }}
>
          <Typography fontWeight={700}>
            Room
          </Typography>

          <Typography fontWeight={700}>
            User
          </Typography>

          <Typography fontWeight={700}>
            Time
          </Typography>

          <Typography fontWeight={700}>
            Reason
          </Typography>

          <Typography fontWeight={700}>
            Actions
          </Typography>
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
  {isWeekend && (
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
)}

      {!isWeekend &&
         bookings.map((b: any) => {
         console.log(
  "Has Delete Permission:",
  hasPermission("booking:delete")
);


     
          const canManageBooking =
  isAdmin ||
  b.user_name?.toLowerCase() ===
    currentUsername?.toLowerCase();

          return (
            <Box
  key={b.id}
  sx={{
    display: "grid",
    gridTemplateColumns:
      "220px 220px 220px 180px 220px",

    alignItems: "center",

    p: 1,

    mb: 0.75,

    minHeight: "52px",

    borderRadius: "8px",

    background: "#1A2438",

    border:
      "1px solid rgba(255,255,255,.04)",

    borderLeft: `4px solid ${
      roomColors[b.room_name] || "#ccc"
    }`,

    transition: "0.2s",

    "&:hover": {
      background: "#22304A",
    },
  }}
>
            
            <Typography
  fontWeight={700}
  fontSize="15px"
 sx={{
  color:
    roomColors[b.room_name],
  textShadow:
    "0 0 12px rgba(255,255,255,.15)",
}}
>
              {b.room_name}
            </Typography>

            <Typography>
              {b.user_name}
            </Typography>

            <Typography>
              {new Date(
                `2000-01-01T${b.start_time}`
              ).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
              {" - "}
              {new Date(
                `2000-01-01T${b.end_time}`
              ).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Typography>


            <Typography>
              {b.reason}
            </Typography>

           <Box display="flex" gap={1}>
              {hasPermission("booking:update") &&
                canManageBooking && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelected(b);
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

              {canManageBooking && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    setBookingToDelete(b.id);
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
            })}
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
  {/* Left Side */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      color: "white",
    }}
  >
    <Typography>
      Per page
    </Typography>

    <Select
      size="small"
      value={itemsPerPage}
      onChange={(e) =>
        setItemsPerPage(
          Number(e.target.value)
        )
      }
      sx={{
        minWidth: 80,
        color: "white",

        "& .MuiSvgIcon-root": {
          color: "white",
        },
      }}
    >
      <MenuItem value={10}>10</MenuItem>
      <MenuItem value={20}>20</MenuItem>
      <MenuItem value={50}>50</MenuItem>
    </Select>

    <Typography>
      {(page - 1) * itemsPerPage + 1}-
      {Math.min(
        page * itemsPerPage,
        total
      )}{" "}
      of {total}
    </Typography>
  </Box>

  {/* Right Side */}
  <Pagination
    page={page}
    count={totalPages}
    showFirstButton
    showLastButton
    onChange={(_, value) =>
      setPage(value)
    }
    sx={{
      "& .MuiPaginationItem-root": {
        color: "white",
      },

      "& .Mui-selected": {
        background:
          "#3B82F6 !important",
        color:
          "#fff !important",
      },
    }}
  />
</Box>
      </Paper>

      <BookingModal
        open={showModal}
        onClose={() =>
          setShowModal(false)
        }
        selected={selected}
      />

      <Dialog
  open={confirmOpen}
  onClose={() =>
    setConfirmOpen(false)
  }
  PaperProps={{
    sx: {
      background: "#162033",
      color: "#fff",
      borderRadius: "16px",
      border:
        "1px solid rgba(255,255,255,.08)",
    },
  }}
>
        <DialogTitle
  sx={{
    color: "#fff",
    fontWeight: 700,
  }}
>
  Delete Booking
</DialogTitle>

        <DialogContent
  sx={{
    color: "rgba(255,255,255,.75)",
  }}
>
  Are you sure you want to delete this booking?
</DialogContent>


        <DialogActions>
          <Button
  onClick={() =>
    setConfirmOpen(false)
  }
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
  onClick={async () => {
   if (bookingToDelete !== null) {
  await deleteBooking(
    bookingToDelete
  ).unwrap();

 enqueueSnackbar(
  "Booking deleted successfully ✅",
  {
    variant: "success",
  }
);
}

setConfirmOpen(false);
setBookingToDelete(null);
  }}
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
  {isDeletingBooking
    ? "Deleting..."
    : "Delete"}
</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
  }