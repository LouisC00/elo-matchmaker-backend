// authController.ts
import { prisma } from "../lib/db";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const existing = await prisma.developer.findUnique({ where: { email } });
  if (existing) {
    res.status(400).json({ error: "Email already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const apiKeyPlain = `ak_live_${uuidv4()}`;

  const dev = await prisma.developer.create({
    data: {
      email,
      password: hashedPassword,
      apiKey: apiKeyPlain,
    },
    select: { id: true, apiKey: true },
  });

  res.status(201).json({
    message: "Registered successfully",
    apiKey: dev.apiKey,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const developer = await prisma.developer.findUnique({ where: { email } });
  if (!developer) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, developer.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    {
      sub: developer.id.toString(),
      role: "dev",
      iss: process.env.JWT_ISS,
      aud: process.env.JWT_AUD,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login successful", token });
};
