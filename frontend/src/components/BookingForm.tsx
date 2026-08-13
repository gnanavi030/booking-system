"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";

import {
  useCreateBookingMutation,
  useGetAvailabilityQuery,
  useGetBookingsQuery,
  useGetRoomsQuery,
} from "@/services/api";

const schema = z
  .object({
    userName: z.string().min(1, "User name is required"),
    roomName: z.string().min(1, "Room is required"),
    capacity: z.string().min(1, "Capacity is required"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be greater than start time",
    path: ["endTime"],
  });

type BookingFormValues = z.infer<typeof schema>;

type PrefillSelected = {
  prefill?: boolean;
  room_name?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
};

type BookingFormProps = {
  selected?: PrefillSelected;
};

type Room = {
  id: number;
  name: string;
  capacity: number;
};

type Booking = {
  room_name: string;
  user_name: string;
  date: string;
  start_time: string;
  end_time: string;
};

const glassField = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255,255,255,.08)",
    backdropFilter: "blur(20px)",
    borderRadius: "14px",
    color: "white",
    minHeight: "42px",
    "& fieldset": {
      borderColor: "rgba(255,255,255,.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#4F8CFF",
    },
  },
  "& input": {
    color: "white",
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(255,255,255,.65)",
  },
  "& .MuiFormHelperText-root": {
    color: "#FCA5A5",
  },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      background: "#1A2238",
      color: "white",
      borderRadius: "12px",
      "& .MuiMenuItem-root:hover": {
        background: "rgba(255,255,255,.08)",
      },
      "& .Mui-selected": {
        background: "rgba(91,140,255,.25) !important",
      },
    },
  },
};

const selectSx = {
  background: "rgba(255,255,255,.08)",
  borderRadius: "12px",
  color: "white",
  "& .MuiSelect-select": {
    py: 1,
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(255,255,255,.7)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.12)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.25)",
  },
};

function getTodayDate() {
  const d = new Date();

  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function toAmPm(time: string) {
  return new Date(`1970-01-01T${time}:00`).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

function getLoggedInUser() {
  return localStorage.getItem("user") || "";
}

function getLoggedInUsername() {
  return getLoggedInUser().split("@")[0] || "";
}

export default function BookingForm({ selected }: BookingFormProps) {
  const { data: rooms = [] } = useGetRoomsQuery(undefined);
  const { data: bookingsData } = useGetBookingsQuery({
    limit: 5000,
    offset: 0,
  });
  const bookings: Booking[] = bookingsData?.data || [];

  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [conflictBooking, setConflictBooking] = useState<Booking | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      roomName: "",
      capacity: "",
      date: getTodayDate(),
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const capacity = useWatch({ control, name: "capacity" });
  const roomName = useWatch({ control, name: "roomName" });

  const { data: availabilityData } = useGetAvailabilityQuery(
    {
      start_time: startTime ? toAmPm(startTime) : "",
      end_time: endTime ? toAmPm(endTime) : "",
      required_capacity: Number(capacity),
    },
    {
      skip: !startTime || !endTime || !capacity,
    }
  );

  useEffect(() => {
    if (selected?.prefill) {
      setValue("roomName", selected.room_name || "");
      setValue("date", selected.date?.split("T")[0] || "");
      setValue("startTime", selected.start_time?.slice(0, 5) || "");
      setValue("endTime", selected.end_time?.slice(0, 5) || "");
    }
  }, [selected, setValue]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
      setValue("userName", loggedInUser.split("@")[0]);
    }
  }, [setValue]);

  useEffect(() => {
    if (!roomName) return;

    const room = (rooms as Room[]).find((r) => r.name === roomName);

    if (room) {
      setValue("capacity", String(room.capacity));
    }
  }, [roomName, rooms, setValue]);

  const onSubmit = async (data: BookingFormValues) => {
    const day = new Date(data.date).getDay();

    if (day === 0 || day === 6) {
      enqueueSnackbar("Bookings are not allowed on weekends", {
        variant: "error",
      });
      return;
    }

    const enteredCapacity = Number(data.capacity);
    const selectedRoom = (rooms as Room[]).find(
      (r) => r.name === data.roomName
    );
    const roomCapacity = Number(selectedRoom?.capacity);

    if (enteredCapacity > roomCapacity) {
      enqueueSnackbar(
        `❌ ${data.roomName} supports only ${roomCapacity}`,
        {
          variant: "error",
        }
      );
      return;
    }

    try {
      await createBooking({
        user_name: data.userName,
        room_name: data.roomName,
        required_capacity: enteredCapacity,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        reason: data.reason,
      }).unwrap();

      enqueueSnackbar("Room booked successfully", {
        variant: "success",
      });
      setConflictBooking(null);
      reset();
      window.location.href = "/list";
    } catch (error: any) {
      console.log("FULL CONFLICT RESPONSE", error);
      console.error("Booking Error:", error);

      let message = "Booking Failed";

      const conflict = bookings.find(
        (b) =>
          b.room_name === data.roomName &&
          b.date === data.date &&
          data.startTime < b.end_time &&
          data.endTime > b.start_time
      );

      if (error?.data?.detail) {
        if (typeof error.data.detail === "string") {
          message = error.data.detail;
        } else if (typeof error.data.detail === "object") {
          message =
            error.data.detail.message ||
            JSON.stringify(error.data.detail);
        }
      }

      if (conflict) {
        setConflictBooking(conflict);
      }

      enqueueSnackbar(message, {
        variant: "error",
      });
    }
  };

  const availableRooms =
    availabilityData?.available_rooms?.map(
      (r: { room_name: string }) => r.room_name
    ) || [];

  const roomsToShow =
    availableRooms.length > 0
      ? (rooms as Room[]).filter((r) => availableRooms.includes(r.name))
      : (rooms as Room[]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: 3,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: "0",
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(15,23,42,.97)",
          backdropFilter: "blur(24px)",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,.25)",
            borderRadius: "10px",
          },
        }}
      >
        <Typography
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: "28px",
            mb: 3,
          }}
        >
          Reserve Workspace
        </Typography>

        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: "12px",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <Typography
            sx={{
              color: "#93C5FD",
              fontSize: "12px",
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            User Name
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={getLoggedInUsername()}
            InputProps={{ readOnly: true }}
            sx={glassField}
          />

          <Typography
            sx={{
              color: "#93C5FD",
              fontSize: "12px",
              fontWeight: 700,
              mt: 2,
              mb: 0.5,
            }}
          >
            User ID
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={getLoggedInUser()}
            InputProps={{ readOnly: true }}
            sx={glassField}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
            mt: 1,
            pb: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#FFFFFF",
              mb: 0.25,
            }}
          >
            Room *
          </Typography>

          <Controller
            name="roomName"
            control={control}
            render={({ field }) => (
              <Select
                size="small"
                {...field}
                error={!!errors.roomName}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {roomsToShow.map((r) => (
                  <MenuItem key={r.id} value={r.name}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          <Typography
            sx={{
              color: "rgba(255,255,255,.85)",
              fontWeight: 500,
              mt: 1,
              mb: 0.5,
            }}
          >
            Capacity *
          </Typography>

          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                type="number"
                sx={glassField}
                {...field}
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
              />
            )}
          />

          <Typography fontSize="13px" fontWeight={600} color="white">
            Date *
          </Typography>

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                type="date"
                size="small"
                sx={glassField}
                {...field}
              />
            )}
          />

          <Typography fontSize="13px" fontWeight={600} color="white">
            Start Time *
          </Typography>

          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TextField
                type="time"
                size="small"
                sx={glassField}
                {...field}
              />
            )}
          />

          <Typography fontSize="13px" fontWeight={600} color="white">
            End Time *
          </Typography>

          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <TextField
                type="time"
                size="small"
                sx={glassField}
                {...field}
                helperText={errors.endTime?.message}
              />
            )}
          />

          <Typography fontSize="13px" fontWeight={600} color="white">
            Reason *
          </Typography>

          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <Select
                size="small"
                {...field}
                error={!!errors.roomName}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                <MenuItem value="">Select Reason</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Interview">Interview</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Presentation">Presentation</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            )}
          />

          <Box
            sx={{
              mt: 4,
              pt: 3,
              pb: 0,
              display: "flex",
              gap: 2,
              background: "linear-gradient(135deg,#1A1F3A,#132A40)",
              borderTop: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isCreatingBooking}
              sx={{
                flex: 1,
                textTransform: "none",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#3B82F6,#2563EB)",
              }}
            >
              {isCreatingBooking ? (
                <>
                  <CircularProgress
                    size={18}
                    color="inherit"
                    sx={{ mr: 1 }}
                  />
                  Creating Booking...
                </>
              ) : (
                "Reserve Room"
              )}
            </Button>

            <Button
              onClick={() => {
                window.history.back();
              }}
              variant="outlined"
              sx={{
                textTransform: "none",
                color: "white",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={!!conflictBooking}
        onClose={() => setConflictBooking(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg,#162033,#1E293B)",
            color: "white",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,.08)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#FCA5A5",
            fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          ⚠️ Booking Conflict
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            color: "white",
          }}
        >
          {conflictBooking && (
            <>
              <Typography sx={{ mb: 1 }}>
                <strong>Room:</strong> {conflictBooking.room_name}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <strong>Booked By:</strong> {conflictBooking.user_name}
              </Typography>

              <Typography sx={{ mb: 2 }}>
                <strong>Time:</strong> {conflictBooking.start_time}
                {" - "}
                {conflictBooking.end_time}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  background: "rgba(239,68,68,.15)",
                  border: "1px solid rgba(239,68,68,.35)",
                  color: "#FCA5A5",
                }}
              >
                This room is already reserved for the selected time
                slot.
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => setConflictBooking(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
