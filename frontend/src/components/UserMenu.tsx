"use client";

import { useState } from "react";

import {
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

import EditProfileDialog from "./EditProfileDialog";

export default function UserMenu({
  userEmail,
}: {
  userEmail: string | null;
}) {
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(
      null
    );

  const openMenu =
    Boolean(anchorEl);

  const [
    openDialog,
    setOpenDialog,
  ] = useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(
      event.currentTarget
    );
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    setOpenDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/login?logout=1";
  };

  return (
    <>
      <Box
        onClick={
          handleMenuClick
        }
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,

          px: 1.5,
          py: 0.8,

          cursor: "pointer",

          borderRadius:
            "999px",

          background:
            "rgba(255,255,255,.08)",

          backdropFilter:
            "blur(20px)",

          border:
            "1px solid rgba(255,255,255,.12)",

          transition: ".25s",

          "&:hover": {
            transform:
              "translateY(-2px)",

            background:
              "rgba(255,255,255,.12)",
          },
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,

            borderRadius:
              "50%",

            background:
              "linear-gradient(135deg,#3B82F6,#8B5CF6)",

            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",

            color: "white",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {userEmail &&
          userEmail !==
            "undefined"
            ? userEmail
                .charAt(0)
                .toUpperCase()
            : "U"}
        </Box>

        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "white",
          }}
        >
          {userEmail &&
          userEmail !==
            "undefined"
            ? userEmail.split(
                "@"
              )[0]
            : "User"}
        </Typography>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={
          handleCloseMenu
        }
        PaperProps={{
          sx: {
            mt: 1,

            borderRadius:
              "16px",

            background:
              "linear-gradient(180deg,#112244 0%,#0f172a 100%)",

            border:
              "1px solid rgba(255,255,255,.08)",

            color: "white",

            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setEditOpen(true);
          }}
          sx={{
            py: 1.3,
          }}
        >
          Edit Profile
        </MenuItem>

        <MenuItem
          onClick={
            handleLogoutClick
          }
          sx={{
            py: 1.3,
          }}
        >
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={() =>
          setOpenDialog(false)
        }
        BackdropProps={{
          sx: {
            backdropFilter:
              "blur(8px)",

            background:
              "rgba(2,6,23,.65)",
          },
        }}
        PaperProps={{
          sx: {
            borderRadius:
              "24px",

            minWidth:
              "420px",

            background:
              "linear-gradient(180deg,#112244 0%,#0f172a 100%)",

            border:
              "1px solid rgba(96,165,250,.25)",

            color: "white",

            boxShadow:
              "0 20px 60px rgba(0,0,0,.55)",
          },
        }}
      >
        <Box
          sx={{
            p: 4,
            textAlign:
              "center",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 4,

              borderRadius:
                "999px",

              background:
                "linear-gradient(90deg,#3B82F6,#8B5CF6)",

              mx: "auto",
              mb: 3,
            }}
          />

          <Typography
            sx={{
              fontSize:
                "26px",

              fontWeight: 700,

              mb: 1,
            }}
          >
            Sign Out
          </Typography>

          <Typography
            sx={{
              color:
                "rgba(255,255,255,.65)",
            }}
          >
            Are you sure you
            want to continue?
          </Typography>
        </Box>

        <DialogActions
          sx={{
            justifyContent:
              "center",

            gap: 2,

            px: 4,
            pb: 3,
          }}
        >
          <Button
            onClick={() =>
              setOpenDialog(
                false
              )
            }
              sx={{textTransform: "none",

              }}
            
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              confirmLogout
            }
            sx={{
              textTransform:
                "none",}}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <EditProfileDialog
        open={editOpen}
        onClose={() =>
          setEditOpen(false)
        }
      />
    </>
  );
}