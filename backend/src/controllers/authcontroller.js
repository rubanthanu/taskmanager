import { registerUser } from "../services/authservice.js";
import {loginUser,} from "../services/authservice.js";


export async function register(req, res) {
  try {
    const user = await registerUser(req.body ?? {});

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.body ?? {});

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    message: "Logout successful",
  });
}