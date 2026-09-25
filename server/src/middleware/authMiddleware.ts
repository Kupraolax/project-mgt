import type { NextFunction, Request, Response } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import prisma from "../lib/prisma.js";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;

if (!userPoolId || !clientId) {
  throw new Error(
    "COGNITO_USER_POOL_ID and COGNITO_USER_POOL_CLIENT_ID must be configured"
  );
}

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "access",
  clientId,
});

export interface AuthenticatedRequest extends Request {
  authUser?: {
    cognitoId: string;
  };
  appSessionId?: string;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    res.status(401).json({
      message: "Authorization token is required",
    });
    return;
  }

  const token = authorizationHeader.substring(7);

  const appSessionId = req.headers["x-session-id"];

  if (typeof appSessionId === "string" && appSessionId.length > 0) {
    req.appSessionId = appSessionId;
  }

  try {
    const payload = await verifier.verify(token);

    if (!payload.sub) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    req.authUser = {
      cognitoId: payload.sub,
    };

    next();
  } catch (error) {
    console.error("Cognito token verification failed:", error);

    res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

export const enforceActiveSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cognitoId = req.authUser?.cognitoId;
    const appSessionId = req.appSessionId;

    if (!cognitoId) {
      res.status(401).json({
        message: "Authenticated user is required",
      });
      return;
    }

    if (!appSessionId) {
      res.status(401).json({
        code: "SESSION_REQUIRED",
        message: "Application session is required.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
      select: {
        activeSessionId: true,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    if (
      user.activeSessionId &&
      appSessionId !== user.activeSessionId
    ) {
      res.status(401).json({
        code: "SESSION_REPLACED",
        message: "This account has been signed in from another session.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Application session validation failed:", error);

    res.status(500).json({
      message: "Error validating application session",
    });
  }
};