"use client";

import { useState } from "react";

import {
  Paper,
  Typography,
  Button,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useSnackbar } from "notistack";

import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "@/services/api";

import AppSkeleton from "./skeletons/AppSkeleton";






export default function UserList() {
 const {
  data: users = [],
  isLoading,
} = useGetUsersQuery(undefined);


  const [search, setSearch] =
    useState("");
  
  const [selectedUser, setSelectedUser] =
    useState<any>(null);

  const [selectedRole, setSelectedRole] =
    useState("");

  const [updateUserRole] =
    useUpdateUserRoleMutation();
  if (isLoading) {
  return <AppSkeleton count={5} />;
}
  const { enqueueSnackbar } =
  useSnackbar();
  


  const filteredUsers = users.filter(
    (user: any) =>
      user.username
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  const roles = JSON.parse(
  localStorage.getItem("roles") || "[]"
);

const isAdmin =
  roles.includes("Admin");

const handleUpdateRole = async () => {
  try {
    await updateUserRole({
      userId: selectedUser.id,
      role: selectedRole,
    }).unwrap();

    enqueueSnackbar(
      "Role updated successfully ✅",
      {
        variant: "success",
      }
    );

    setSelectedUser(null);

  } catch (error) {
    enqueueSnackbar(
      "Failed to update role",
      {
        variant: "error",
      }
    );

    console.error(error);
  }
};




  return (
    <Paper
  sx={{
    p: 3,
    borderRadius: "24px",

    maxHeight: "calc(100vh - 170px)",
    overflowY: "auto",

    "&::-webkit-scrollbar": {
      width: "8px",
    },

    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255,255,255,.25)",
      borderRadius: "10px",
    },

    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },

    background:
      "linear-gradient(135deg,#243B73 0%,#1B2746 100%)",

    backdropFilter: "blur(20px)",
    border:
      "1px solid rgba(255,255,255,.08)",

    boxShadow:
      "0 10px 30px rgba(0,0,0,.15)",

    color: "white",
  }}
>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.5px",

              background:
                "linear-gradient(90deg,#FFFFFF,#93C5FD)",

              WebkitBackgroundClip:
                "text",

              WebkitTextFillColor:
                "transparent",
            }}
          >
            Users Management
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color:
                "rgba(255,255,255,.55)",
              mt: 0.5,
            }}
          >
            Manage users and reset passwords
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.2,

            minWidth: 130,

            borderRadius: "18px",

            background:
              "linear-gradient(135deg,rgba(59,130,246,.18),rgba(96,165,250,.08))",

            border:
              "1px solid rgba(96,165,250,.25)",

            boxShadow:
              "0 8px 20px rgba(59,130,246,.12)",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
          >
            <PeopleAltIcon
              sx={{
                fontSize: 18,
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                textTransform:
                  "uppercase",
                letterSpacing: 1,
                color:
                  "rgba(255,255,255,.65)",
              }}
            >
              Users
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {users.length}
          </Typography>
        </Box>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search username or email..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        sx={{
          mb: 2.5,

          "& .MuiOutlinedInput-root":
            {
              borderRadius: "12px",

              color: "white",

              background:
                "rgba(255,255,255,.03)",

              "& fieldset": {
                borderColor:
                  "rgba(255,255,255,.10)",
              },

              "&:hover fieldset":
                {
                  borderColor:
                    "rgba(96,165,250,.25)",
                },
            },

          "& .MuiInputBase-input::placeholder":
            {
              color:
                "rgba(255,255,255,.4)",
              opacity: 1,
            },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color:
                    "rgba(255,255,255,.4)",
                }}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* USER LIST */}
      <Box
        display="flex"
        flexDirection="column"
        gap={0.8}
      >
        {filteredUsers.map(
          (user: any) => (
            <Box
              key={user.id}
              sx={{
                px: 1.5,
                py: 1,

                borderRadius: "14px",

                background:
                  "linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.02))",

                border:
                  "1px solid rgba(255,255,255,.06)",

                display: "grid",

                gridTemplateColumns:
                  "1fr auto",

                alignItems: "center",

                transition:
                  "all .2s ease",

                "&:hover": {
                  background:
                    "rgba(255,255,255,.05)",

                  borderColor:
                    "rgba(96,165,250,.20)",

                  transform:
                    "translateY(-1px)",

                  boxShadow:
                    "0 4px 14px rgba(59,130,246,.12)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1.2}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,

                    fontSize: 14,

                    fontWeight: 700,

                    background:
                      "linear-gradient(135deg,#7DD3FC,#3B82F6)",

                    boxShadow:
                      "0 2px 8px rgba(59,130,246,.2)",
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {user.username}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        "rgba(255,255,255,.5)",
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
<Box
  display="flex"
  alignItems="center"
  gap={1}
>
  <Box
    sx={{
      px: 1.5,
      py: 0.6,
      borderRadius: "999px",
      background:
        "rgba(255,255,255,.04)",
      border:
        "1px solid rgba(255,255,255,.08)",
    }}
  >
    <Typography
      sx={{
        fontSize: 12,
        color:
          "rgba(255,255,255,.55)",
        fontWeight: 500,
      }}
    >
      {user.roles?.[0] || "Viewer"}
    </Typography>
  </Box>

<Button
  size="small"
  variant="contained"
  color="warning"
  sx={{
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 600,
    px: 2.2,
    background:
      "linear-gradient(135deg,#F97316,#EA580C)",

    "&:hover": {
      background:
        "linear-gradient(135deg,#EA580C,#C2410C)",
    },
  }}
  onClick={() => {
    setSelectedUser(user);
    setSelectedRole(
      user.roles?.[0] || "Viewer"
    );
  }}
>
  Edit Role
</Button>
  
</Box>

            </Box>
          )
        )}
      </Box>

<Dialog
  open={!!selectedUser}
  onClose={() => setSelectedUser(null)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      width: 400,
      maxWidth: "90%",
      borderRadius: "24px",
      background: "#1D1B34",
      border: "1px solid rgba(255,255,255,.06)",
      boxShadow:
        "0 20px 60px rgba(0,0,0,.55)",
      color: "white",
    },
  }}
>
  <DialogTitle
    sx={{
      textAlign: "center",
      pt: 4,
      pb: 1,
    }}
  >
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        mx: "auto",
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,#8B5CF6,#A855F7)",
        boxShadow:
          "0 0 25px rgba(168,85,247,.45)",
        fontSize: "15px",
      }}
    >
      ✏️
    </Box>

    <Typography
      sx={{
        fontSize: "24px",
        fontWeight: 700,
        color: "#fff",
      }}
    >
      Edit User
    </Typography>

    <Typography
      sx={{
        color: "rgba(255,255,255,.6)",
        mt: 1,
      }}
    >
      Update user details and role.
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ px: 5 }}>
    <Box mb={2}>
      <Typography
        sx={{
          color: "#BDBDD7",
          mb: 1,
          fontSize: 14,
        }}
      >
        User Name
      </Typography>

      <Box
        sx={{
          bgcolor: "#353553",
          borderRadius: "12px",
          p: 2,
          color: "white",
          fontSize: "16px",
        }}
      >
        {selectedUser?.username}
      </Box>
    </Box>

    <Box mb={3}>
      <Typography
        sx={{
          color: "#BDBDD7",
          mb: 1,
          fontSize: 14,
        }}
      >
        Email
      </Typography>

      <Box
        sx={{
          bgcolor: "#353553",
          borderRadius: "12px",
          p: 2,
          color: "white",
          fontSize: "16px",
        }}
      >
        {selectedUser?.email}
      </Box>
    </Box>

    <Typography
      sx={{
        color: "#BDBDD7",
        mb: 1,
        fontSize: 14,
      }}
    >
      Role
    </Typography>

    <Select
  fullWidth
  value={selectedRole}
  onChange={(e: any) =>
    setSelectedRole(e.target.value)
  }
  MenuProps={{
    PaperProps: {
      sx: {
        mt: 1,
        borderRadius: "14px",

        background:
          "linear-gradient(135deg,#252040,#1D1B34)",

        border:
          "1px solid rgba(168,85,247,.25)",

        boxShadow:
          "0 12px 30px rgba(0,0,0,.45)",

        "& .MuiMenuItem-root": {
          color: "white",
          fontSize: "15px",
          borderRadius: "10px",
          mx: 1,
          my: 0.5,
        },

        "& .MuiMenuItem-root:hover": {
          background:
            "rgba(168,85,247,.15)",
        },

        "& .Mui-selected": {
          background:
            "linear-gradient(135deg,#8B5CF6,#A855F7) !important",
          color: "white",
        },
      },
    },
  }}
  sx={{
    color: "white",
    borderRadius: "12px",

    "& .MuiSelect-select": {
      py: 1.5,
    },

    "& .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          "rgba(168,85,247,.6)",
      },

    "&:hover .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          "#A855F7",
      },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
      {
        borderColor:
          "#C084FC",
      },

    "& .MuiSvgIcon-root": {
      color: "#A855F7",
    },
  }}
>
  <MenuItem value="Viewer">
    Viewer
  </MenuItem>

  <MenuItem value="Employee">
    Employee
  </MenuItem>

  <MenuItem value="Admin">
    Admin
  </MenuItem>
</Select>

  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: "center",
      gap: 2,
      pb: 4,
      px: 4,
    }}
  >
    <Button
      onClick={() =>
        setSelectedUser(null)
      }
      sx={{
        border:
          "1px solid rgba(255,255,255,.25)",
        color: "white",
        borderRadius: "12px",
        px: 3,
        textTransform: "none",
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleUpdateRole}
      sx={{
        borderRadius: "12px",
        px: 4,
        textTransform: "none",
        background:
          "linear-gradient(135deg,#8B5CF6,#A855F7)",
        boxShadow:
          "0 10px 25px rgba(168,85,247,.35)",

        "&:hover": {
          background:
            "linear-gradient(135deg,#7C3AED,#9333EA)",
        },
      }}
    >
      Save Changes
    </Button>
  </DialogActions>
</Dialog>

    </Paper>
  );
}