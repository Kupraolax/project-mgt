import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  fetchAuthSession,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
  role?: "USER" | "ADMIN";
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  user?: User;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: async (headers) => {
    const session = await fetchAuthSession();
    const { accessToken } = session.tokens ?? {};

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const appSessionId = sessionStorage.getItem("appSessionId");

    if (appSessionId) {
      headers.set("x-session-id", appSessionId);
    }

    return headers;
  },
});

const baseQueryWithSessionHandling: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    typeof result.error.data === "object" &&
    result.error.data !== null &&
    "code" in result.error.data &&
    result.error.data.code === "SESSION_REPLACED"
  ) {
    sessionStorage.removeItem("appSessionId");

    await signOut();

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithSessionHandling,
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          if (!session) throw new Error("No session found");
          const { userSub } = session;
          const { accessToken } = session.tokens ?? {};

          const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
          const userDetails = userDetailsResponse.data as User;

          return { data: { user, userSub, userDetails } };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),

    updateUser: build.mutation<
      User,
      {
        cognitoId: string;
        username: string;
        profilePictureUrl?: string;
      }
    >({
      query: ({ cognitoId, ...body }) => ({
        url: `users/${cognitoId}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (response: {
        message: string;
        user: User;
      }) => response.user,

      invalidatesTags: ["Users"],
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    addComment: build.mutation<
      Comment,
      { taskId: number; text: string }
    >({
      query: ({ taskId, text }) => ({
        url: `tasks/${taskId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Tasks"],
    }),

    uploadAttachment: build.mutation<
      Attachment,
      { taskId: number; file: File }
    >({
      query: ({ taskId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `tasks/${taskId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Tasks"],
    }),

    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
  useUpdateUserMutation,
  useAddCommentMutation,
  useUploadAttachmentMutation,
} = api;
