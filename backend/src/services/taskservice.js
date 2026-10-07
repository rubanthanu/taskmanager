import { prisma } from "../prisma.js";

export async function createTask(userId, { title, description }) {
  if (typeof title !== "string" || !title.trim() || title.trim().length > 200) {
    const error = new Error("Title must contain 1–200 characters");
    error.status = 400;
    throw error;
  }

  if (description !== undefined && typeof description !== "string") {
    const error = new Error("Description must be a string");
    error.status = 400;
    throw error;
  }

  return prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      userId,
    },
  });
}


export async function getMyTasks(userId) {
  return prisma.task.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}



export async function updateTask(userId, taskId, body) {
  const fail = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    throw error;
  };

  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    fail("Invalid task ID");
  }

  // Build an object containing only allowed changes.
  const data = {};

  if (body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 200
    ) {
      fail("Title must contain 1–200 characters");
    }

    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      fail("Description must be a string or null");
    }

    data.description = body.description?.trim() || null;
  }

  if (body.status !== undefined) {
    if (!["TODO", "IN_PROGRESS", "DONE"].includes(body.status)) {
      fail("Status must be TODO, IN_PROGRESS, or DONE");
    }

    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    fail("Provide a title, description, or status to update");
  }

  try {
    return await prisma.task.update({
      where: {
        id: taskId,
        userId,
      },
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      fail("Task not found", 404);
    }

    throw error;
  }
}

export async function deleteTask(userId, taskId) {
  if (!Number.isSafeInteger(taskId) || taskId <= 0) {
    const error = new Error("Invalid task ID");
    error.status = 400;
    throw error;
  }

  try {
    return await prisma.task.delete({
      where: {
        id: taskId,
        userId,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      const notFound = new Error("Task not found");
      notFound.status = 404;
      throw notFound;
    }

    throw error;
  }
}