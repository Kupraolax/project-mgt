import { Router } from "express";

import {
  getUser,
  getUsers,
  postUser,
  updateUser,
  registerSession,
  replaceSession,
} from "../controllers/userController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.post("/session", authenticateUser, registerSession);
router.post("/session/replace", authenticateUser, replaceSession);
router.get("/:cognitoId", getUser);
router.patch("/:cognitoId", updateUser);

export default router;
