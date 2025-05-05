// authController.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

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
  const apiKey = uuidv4();

  const dev = await prisma.developer.create({
    data: {
      email,
      password: hashedPassword,
      apiKey,
    },
  });

  res.json({ message: "Registered successfully", apiKey: dev.apiKey });
};
