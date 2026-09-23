import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  getUserTasks,
  createComment,
} from "../controllers/taskController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);

router.patch( "/:taskId/status", authenticateUser, updateTaskStatus);

router.get("/user/:userId", getUserTasks);
router.post("/:taskId/comments", authenticateUser, createComment);

export default router;