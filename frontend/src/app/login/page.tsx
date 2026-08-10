"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import StatusSnackbar from "@/components/StatusSnackbar";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";


import {
  useLoginMutation,
  useRegisterMutation,
} from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] =
    useState(false);

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
    usernameError,
    setUsernameError,
  ] = useState("");

  const [emailError, setEmailError] =
    useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");

  const [openSnack, setOpenSnack] =
    useState(false);

  const [message, setMessage] =
    useState("");



  const [severity, setSeverity] =
    useState<"success" | "error">(
      "success"
    );

  const [
  loginUser,
  { isLoading: isLoginLoading },
] = useLoginMutation();
  
   const [
  registerUser,
  { isLoading: isRegisterLoading },
] = useRegisterMutation();




useEffect(() => {
  const params =
    new URLSearchParams(
      window.location.search
    );

  if (params.get("logout") === "1") {
    setMessage(
      "Logged out successfully ✅"
    );

    setSeverity("success");

    setOpenSnack(true);

    window.history.replaceState(
      {},
      "",
      "/login"
    );
  }
}, []);
  const validateForm = () => {
    let valid = true;

    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (
      isRegister &&
      username.trim().length < 3
    ) {
      setUsernameError(
        "Username must be at least 3 characters"
      );
      valid = false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError(
        "Enter a valid email"
      );
      valid = false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (
      !passwordRegex.test(password)
    ) {
      setPasswordError(
        "Min 8 chars, uppercase, lowercase, number & special character required"
      );

      valid = false;
    }

    if (
      isRegister &&
      password !==
        confirmPassword
    ) {
      setConfirmPasswordError(
        "Passwords do not match"
      );

      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const res =
        await loginUser({
          email,
          password,
        }).unwrap();

      localStorage.setItem(
        "access_token",
        res.access_token
      );

      localStorage.setItem(
        "refresh_token",
        res.refresh_token
      );

     const meResponse = await fetch(
      "http://127.0.0.1:8000/api/v1/auth/me",
      {
        headers: {
          Authorization: `Bearer ${res.access_token}`,
        },
      }
    );

    const me = await meResponse.json();

    localStorage.setItem(
  "user",
  me.email
);

localStorage.setItem(
  "roles",
  JSON.stringify(me.roles)
);

localStorage.setItem(
  "permissions",
  JSON.stringify(me.permissions)
);

if (me.roles?.includes("Viewer")) {
  router.push("/booking");
} else {
  router.push("/");
}


    
    } catch (err: any) {
      setMessage(
        err?.data?.detail ??
          "Login failed ❌"
      );

      setSeverity("error");
      setOpenSnack(true);
    }
  };

  const handleRegister =
    async () => {
      if (!validateForm()) return;

      try {
        await registerUser({
          username,
          email,
          password,
        }).unwrap();

        setMessage(
          "Registered successfully ✅"
        );

        setSeverity("success");
        setOpenSnack(true);

        /* Clear everything */
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        /* Go back to Login */
        setIsRegister(false);
      } catch (err: any) {
        setMessage(
          err?.data?.detail ??
            "Registration failed ❌"
        );

        setSeverity("error");
        setOpenSnack(true);
      }
    };
  
return (
  <>
    <AuthLayout>
      {isRegister ? (
        <RegisterForm
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          usernameError={usernameError}
          emailError={emailError}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          handleRegister={handleRegister}
          onSwitch={() =>
            setIsRegister(false)
          }
          isLoading={isRegisterLoading}
        />
      ) : (
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          emailError={emailError}
          passwordError={passwordError}
          handleLogin={handleLogin}
          onSwitch={() =>
            setIsRegister(true)
          }
          isLoading={isLoginLoading}
        />
      )}
    </AuthLayout>

    <StatusSnackbar
      open={openSnack}
      message={message}
      severity={severity}
      onClose={() =>
        setOpenSnack(false)
      }
    />
  </>
);
}