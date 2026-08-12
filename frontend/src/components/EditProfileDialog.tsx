"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
} from "@mui/material";

import StatusSnackbar from "@/components/StatusSnackbar";
import {
  useDeleteMyAccountMutation,
  useGetMeQuery,
  useUpdateMyProfileMutation,
} from "@/services/api";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileDialog({
  open,
  onClose,
}: EditProfileDialogProps) {
  const { data: me } =
    useGetMeQuery(undefined);

  const [updateMyProfile] =
    useUpdateMyProfileMutation();

  const [deleteMyAccount] =
    useDeleteMyAccountMutation();

  const [activeTab, setActiveTab] =
    useState<
      "account" | "security" | "delete"
    >("account");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    confirmationText,
    setConfirmationText,
  ] = useState("");
 const [snackbar, setSnackbar] =
  useState({
    open: false,
    message: "",
    severity: "success" as
      | "success"
      | "error"
      | "info"
      | "warning",
  });

  useEffect(() => {
    if (me && open) {
      setUsername(me.username || "");
      setEmail(me.email || "");

      setPassword("");
      setConfirmPassword("");
      setConfirmationText("");

      setActiveTab("account");
    }
  }, [me, open]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleAccountSave =
  async () => {
    try {
      await updateMyProfile({
        username,
        email,
      }).unwrap();

      setSnackbar({
        open: true,
        message:
          "Profile updated successfully",
        severity: "success",
      });

      setTimeout(() => {
        localStorage.clear();

        window.location.href =
          "/login";
      }, 3000);
    } catch {
      setSnackbar({
        open: true,
        message:
          "Failed to update profile",
        severity: "error",
      });
    }
  };

  const handlePasswordSave =
    async () => {
      if (!password || !confirmPassword) {
        showSnackbar(
          "Please enter password",
          "error"
        );
        return;
      }

      if (
        password !== confirmPassword
      ) {
        showSnackbar(
          "Passwords do not match",
          "error"
        );
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

      if (
        !passwordRegex.test(password)
      ) {
        showSnackbar(
          "Password does not meet requirements",
          "error"
        );
        return;
      }

      try {
        await updateMyProfile({
          password,
        }).unwrap();

        showSnackbar(
          "Password updated successfully",
          "success"
        );

        setTimeout(() => {
          localStorage.clear();
          window.location.href =
            "/login";
        }, 3000);
      } catch {
        showSnackbar(
          "Failed to update password",
          "error"
        );
      }
    };

  const handleDeleteAccount =
    async () => {
      try {
        await deleteMyAccount().unwrap();

        showSnackbar(
          "Account deleted successfully",
          "success"
        );

        setTimeout(() => {
          localStorage.clear();

          window.location.href =
            "/login?deleted=1";
        }, 3000);
      } catch {
        showSnackbar(
          "Failed to delete account",
          "error"
        );
      }
    };

  const textFieldStyles = {
    mb: 2,

    "& .MuiInputLabel-root": {
      color:
        "rgba(255,255,255,.65)",
    },

    "& .MuiInputLabel-root.Mui-focused":
      {
        color: "#93C5FD",
      },

    "& .MuiOutlinedInput-root": {
      color: "#fff",

      background:
        "rgba(255,255,255,.03)",

      borderRadius: "16px",

      "& fieldset": {
        borderColor:
          "rgba(255,255,255,.08)",
      },

      "&:hover fieldset": {
        borderColor:
          "rgba(96,165,250,.25)",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#60A5FA",
      },
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
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
            borderRadius: "28px",

            background:
              "linear-gradient(180deg,#112244 0%,#0f172a 100%)",

            border:
              "1px solid rgba(96,165,250,.18)",

            color: "white",
          },
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              width: 70,
              height: 4,
              borderRadius: "999px",
              background:
                "linear-gradient(90deg,#3B82F6,#8B5CF6)",
              mb: 3,
            }}
          />

          <Typography
            sx={{
              fontSize: "40px",
              fontWeight: 800,
              mb: 3,

              background:
                "linear-gradient(90deg,#FFFFFF,#93C5FD)",

              WebkitBackgroundClip:
                "text",

              WebkitTextFillColor:
                "transparent",
            }}
          >
            Edit Profile
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant={
                activeTab === "account"
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                setActiveTab(
                  "account"
                )
              }
              sx={{
                textTransform: "none",
              }}
            >
              Account Info
            </Button>

            <Button
              variant={
                activeTab === "security"
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                setActiveTab(
                  "security"
                )
              }
              sx={{
                textTransform: "none",
              }}
            >
              Security
            </Button>

          </Box>

          {activeTab === "account" && (
            <>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                sx={textFieldStyles}
              />

              <Button
                variant="contained"
                onClick={
                  handleAccountSave
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Save Changes
              </Button>
            </>
          )}

          {activeTab === "security" && (
            <>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                sx={textFieldStyles}
              />

              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius:
                    "14px",
                  background:
                    "rgba(255,255,255,.03)",
                  border:
                    "1px solid rgba(255,255,255,.08)",
                }}
              >
                <Typography
                  sx={{
                    color:
                      "#93C5FD",
                    fontWeight: 700,
                    fontSize:
                      "14px",
                    mb: 1,
                  }}
                >
                  Password Requirements
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      "13px",
                    lineHeight: 1.8,
                  }}
                >
                  ✓ At least 8 characters
                  <br />
                  ✓ One uppercase
                  letter (A-Z)
                  <br />
                  ✓ One lowercase
                  letter (a-z)
                  <br />
                  ✓ One number (0-9)
                  <br />
                  ✓ One special
                  character
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={
                  handlePasswordSave
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Update Password
              </Button>
            </>
          )}

          {activeTab === "delete" && (
            <>
              <Typography
                sx={{
                  color:
                    "#F87171",
                  mb: 2,
                }}
              >
                This action cannot
                be undone.
              </Typography>

              <TextField
                fullWidth
                label="Type DELETE"
                value={
                  confirmationText
                }
                onChange={(e) =>
                  setConfirmationText(
                    e.target.value
                  )
                }
                sx={textFieldStyles}
              />

              <Button
                color="error"
                variant="contained"
                disabled={
                  confirmationText !==
                  "DELETE"
                }
                onClick={
                  handleDeleteAccount
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Delete Account
              </Button>
            </>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              mt: 3,
            }}
          >
            <Button
              onClick={onClose}
              sx={{
                textTransform:
                  "none",
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      <StatusSnackbar
  open={snackbar.open}
  message={snackbar.message}
  severity={snackbar.severity}
  onClose={() =>
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }))
  }
/>
    </>
  );
}