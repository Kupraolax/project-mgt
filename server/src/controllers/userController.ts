import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

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
  const cognitoIdParam = req.params.cognitoId;

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
      res.status(400).json({
        message: "Invalid or missing cognitoId",
      });
      return;
    }

    if (typeof username !== "string" || username.length === 0) {
      res.status(400).json({
        message: "Invalid or missing username",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (existingUser) {
      res.status(200).json({
        message: "User already exists",
        newUser: existingUser,
      });
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

    res.status(201).json({
      message: "User Created Successfully",
      newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cognitoIdParam = req.params.cognitoId;

  if (typeof cognitoIdParam !== "string" || cognitoIdParam.length === 0) {
    res.status(400).json({
      message: "Invalid or missing cognitoId",
    });
    return;
  }

  try {
    const { username, profilePictureUrl } = req.body;

    if (typeof username !== "string" || username.trim().length === 0) {
      res.status(400).json({
        message: "Username is required",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        cognitoId: cognitoIdParam,
      },
      data: {
        username: username.trim(),
        profilePictureUrl:
          typeof profilePictureUrl === "string"
            ? profilePictureUrl.trim()
            : undefined,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Username is already in use",
      });
      return;
    }

    res.status(500).json({
      message: `Error updating user: ${error.message}`,
    });
  }
};

export const registerSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const cognitoId = req.authUser?.cognitoId;
    const sessionId = req.appSessionId;

    if (!cognitoId) {
      res.status(401).json({
        message: "Authenticated user is required",
      });
      return;
    }

    if (!sessionId) {
      res.status(400).json({
        message: "Session ID is required",
      });
      return;
    }

    const user = await prisma.user.update({
      where: {
        cognitoId,
      },
      data: {
        activeSessionId: sessionId,
      },
    });

    res.status(200).json({
      message: "Session registered successfully",
      userId: user.userId,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(500).json({
      message: `Error registering session: ${error.message}`,
    });
  }
};