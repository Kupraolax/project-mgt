import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  getUserTasks,
  createComment,
  createAttachment,
} from "../controllers/taskController.js";

import {
  authenticateUser,
  enforceActiveSession,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import type { NextFunction, Request, Response } from "express";
import multer from "multer";

const router = Router();

const handleAttachmentUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single("file")(req, res, (error: any) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          message: "File is too large. Maximum size is 10 MB.",
        });
        return;
      }

      res.status(400).json({
        message: `File upload error: ${error.message}`,
      });
      return;
    }

    res.status(400).json({
      message: error.message || "Invalid file upload",
    });
  });
};

router.get("/", getTasks);
router.post("/", createTask);

router.patch(
  "/:taskId/status",
  authenticateUser,
  enforceActiveSession,
  updateTaskStatus
);

router.get("/user/:userId", getUserTasks);
router.post(
  "/:taskId/comments",
  authenticateUser,
  enforceActiveSession,
  createComment
);

router.post(
  "/:taskId/attachments",
  authenticateUser,
  enforceActiveSession,
  handleAttachmentUpload,
  createAttachment
);

export default router;
