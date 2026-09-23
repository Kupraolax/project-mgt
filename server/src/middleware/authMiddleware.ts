import type { NextFunction, Request, Response } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

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