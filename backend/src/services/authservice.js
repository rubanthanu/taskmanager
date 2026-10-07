import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import jwt from "jsonwebtoken";

export async function registerUser({ name, email, password }) {
  // Validate the input.
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    const error = new Error("Name, email, and password are required");
    error.status = 400;
    throw error;
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const error = new Error("Provide a name and a valid email");
    error.status = 400;
    throw error;
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    const error = new Error(
      "Password must be at least 8 characters and at most 72 bytes",
    );
    error.status = 400;
    throw error;
  }

  // Hash the password before saving it.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: "USER",
      },
      // Return only safe fields.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    // PostgreSQL's unique email constraint prevents duplicates.
    if (error.code === "P2002") {
      const conflict = new Error("Email is already registered");
      conflict.status = 409;
      throw conflict;
    }

    throw error;
  }
}

export async function loginUser({ email, password }) {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  const token = jwt.sign(
    { sub: String(user.id) },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}