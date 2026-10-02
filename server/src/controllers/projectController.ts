import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("NEW getProjects WITH PROGRESS is running");
    
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const projectsWithProgress = projects.map((project) => {
      const totalTasks = project.tasks.length;

      const completedTasks = project.tasks.filter(
        (task) => task.status === "Completed"
      ).length;

      const progress =
        totalTasks === 0
          ? 0
          : Math.round((completedTasks / totalTasks) * 100);

      const { tasks, ...projectData } = project;

      return {
        ...projectData,
        totalTasks,
        completedTasks,
        progress,
      };
    });

    res.json(projectsWithProgress);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving projects: ${error.message}`,
    });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate,
        endDate,
      },
    });

    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating a project: ${error.message}`,
    });
  }
};