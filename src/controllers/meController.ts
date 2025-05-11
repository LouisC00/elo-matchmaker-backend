import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const getDeveloperInfo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const developerId = req.developerId;

  const developer = await prisma.developer.findUnique({
    where: { id: developerId },
    select: {
      id: true,
      email: true,
      apiKey: true,
      createdAt: true,
    },
  });

  if (!developer) {
    res.status(404).json({ error: "Developer not found" });
    return;
  }

  res.json(developer);
};
