import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import prisma from "../lib/prisma.js";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: { include: { user: true, }, },
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        projectId,
        authorUserId,
        assignedUserId,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  const taskIdNumber = Number(taskId);

  if (!Number.isInteger(taskIdNumber)) {
    res.status(400).json({
      message: "Invalid taskId",
    });
    return;
  }

  if (typeof status !== "string" || status.trim().length === 0) {
    res.status(400).json({
      message: "Status is required",
    });
    return;
  }

  const cognitoId = req.authUser?.cognitoId;

  if (!cognitoId) {
    res.status(401).json({
      message: "Authenticated user not found",
    });
    return;
  }

  try {
    // Find the signed-in user in our database.
    const currentUser = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
    });

    if (!currentUser) {
      res.status(403).json({
        message: "Authenticated user is not registered",
      });
      return;
    }

    // Load the task before allowing any update.
    const task = await prisma.task.findUnique({
      where: {
        id: taskIdNumber,
      },
    });

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isAuthor = task.authorUserId === currentUser.userId;
    const isAssignee = task.assignedUserId === currentUser.userId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      res.status(403).json({
        message:
          "You are not authorized to change the status of this task",
      });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskIdNumber,
      },
      data: {
        status: status.trim(),
      },
    });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({
      message: `Error updating task: ${error.message}`,
    });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userIdParam = req.params.userId;

  if (typeof userIdParam !== "string") {
    res.status(400).json({ message: "Invalid userId" });
    return;
  }

  const userId = Number(userIdParam);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "userId must be a number" });
    return;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: userId },
          { assignedUserId: userId },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving user's tasks: ${error.message}`,
    });
  }
};

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const taskId = Number(req.params.taskId);
  const { text } = req.body;
  const cognitoId = req.authUser?.cognitoId;

  if (!Number.isInteger(taskId)) {
    res.status(400).json({
      message: "Invalid taskId",
    });
    return;
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({
      message: "Comment text is required",
    });
    return;
  }

  if (!cognitoId) {
    res.status(401).json({
      message: "Authenticated user not found",
    });
    return;
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
    });

    if (!currentUser) {
      res.status(403).json({
        message: "Authenticated user is not registered",
      });
      return;
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isAuthor = task.authorUserId === currentUser.userId;
    const isAssignee = task.assignedUserId === currentUser.userId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      res.status(403).json({
        message: "You are not authorized to comment on this task",
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        taskId,
        userId: currentUser.userId,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating comment: ${error.message}`,
    });
  }
};
