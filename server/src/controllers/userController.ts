import "dotenv/config";
import type { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

export const getUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cognitoIdParam = req.query.cognitoId;

  if (typeof cognitoIdParam !== "string" || cognitoIdParam.length === 0) {
    res.status(400).json({ message: "Invalid or missing cognitoId" });
    return;
  }

  const cognitoId: string = cognitoIdParam;

  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
    });

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const postUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      cognitoId,
      profilePictureUrl = "i1.jpg",
      teamId = 1,
    } = req.body;

    if (typeof cognitoId !== "string" || cognitoId.length === 0) {
      res.status(400).json({ message: "Invalid or missing cognitoId" });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        profilePictureUrl,
        teamId,
      },
    });

    res.json({
      message: "User Created Successfully",
      newUser,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating user: ${error.message}` });
  }
};
