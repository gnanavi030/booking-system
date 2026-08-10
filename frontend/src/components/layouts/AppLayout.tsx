"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";
import AppHeader from "../AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
          <Box
      
  sx={{
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    overflowY: "hidden",


          background: `
radial-gradient(
circle at top left,
rgba(99,102,241,.20),
transparent 35%
),
radial-gradient(
circle at bottom right,
rgba(6,182,212,.15),
transparent 40%
),
radial-gradient(
circle at center,
rgba(139,92,246,.10),
transparent 45%
),
#020617
`,
        }}
      >

      {/* Floating Orb 1 */}

      <Box
        sx={{
         position: "absolute",
         width: 500,
          height: 500,
          borderRadius: "50%",
         background:
            "radial-gradient(circle, rgba(59,130,2*6,0.35), transparent)",
          filter: "blur(100px)",
          bottom: -100,
          left: -100,
          animation: "float1 18s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 2 */}

      <Box
      sx={{
        position: "absolute",
         width: 450,
          height: 450,
          borderRadius: "50%",
          background:
           "radial-gradient(circle, rgba(139*92,246,0.25), transparent)",
        filter: "blur(120px)",
          bottom: -120,
          right: -120,
          animation: "float2 22s ease-in-out infinite",
        }}
      />

      {/* Floating Orb 3 */}

      <Box
        sx={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.22), transparent)",
          filter: "blur(100px)",
          top: "35%",
          left: "40%",
          animation: "float3 16s ease-in-out infinite",
        }}
      />

      {/* Floating Particles */}

      {[...Array(40)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.45,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `star ${
              5 + Math.random() * 6
            }s linear infinite`,
          }}
        />
      ))}

      {/* Content */}

      <Box
  sx={{
    position: "relative",
    zIndex: 2,
    p: 2,
    minHeight: "100vh",

    overflowY: "hidden",
    overflowX: "hidden",

    "&::-webkit-scrollbar": {
      width: "8px",
    },

    "&::-webkit-scrollbar-thumb": {
      background:
        "rgba(255,255,255,.15)",
      borderRadius: "10px",
    },
  }}
>
        <>
          <AppHeader />
          {children}
        </>
        
      </Box>

      <style jsx global>{`
        @keyframes float1 {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(120px, 80px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes float2 {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-150px, -100px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes float3 {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(80px, -80px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes star {
          0% {
            opacity: 0;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(-35px);
          }
        }
      `}</style>
    </Box>
  );
}