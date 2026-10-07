import { getUsersWithTasks } from "../services/adminservice.js";

export async function listUsers(req, res) {
  try {
    const users = await getUsersWithTasks();

    return res.json({ users });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}