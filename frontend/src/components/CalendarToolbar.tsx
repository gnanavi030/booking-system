"use client";

import { Box, Button, Typography } from "@mui/material";

interface Props {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarToolbar({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,

        background: "rgba(255,255,255,.08)",
        backdropFilter: "blur(20px)",

        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: "24px",

        color: "white",
      }}
    >
      <Typography
        fontSize={14}
        fontWeight={700}
      >
        📅 Schedule Planner
      </Typography>

      <Box
        display="flex"
        gap={1}
      >
        <Button
          variant="outlined"
          onClick={onPrev}
          sx={{
  textTransform: "none",
}}
        >
          ◀ Prev
        </Button>

        <Button
          variant="contained"
          onClick={onToday}
          sx={{
  textTransform: "none",
}}
        >
          Today
        </Button>

        <Button
          variant="outlined"
          onClick={onNext}
          sx={{
  textTransform: "none",
}}
        >
          Next ▶
        </Button>
      </Box>

      <Typography
        fontWeight={600}
      >
        {currentDate.toDateString()}
      </Typography>
    </Box>
  );
}