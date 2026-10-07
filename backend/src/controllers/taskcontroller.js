import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../services/taskservice.js";

export async function create(req, res) {
  try {
    const task = await createTask(req.user.id, req.body ?? {});

    return res.status(201).json({
      message: "Task created",
      task,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function list(req, res) {
  try {
    const tasks = await getMyTasks(req.user.id);

    return res.json({ tasks });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function update(req, res) {
  try {
    const task = await updateTask(
      req.user.id,
      Number(req.params.id),
      req.body ?? {},
    );

    return res.json({
      message: "Task updated",
      task,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function remove(req, res) {
  try {
    await deleteTask(req.user.id, Number(req.params.id));

    return res.json({
      message: "Task deleted",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
