import { Router } from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorize } from "../middleware/rolemiddleware.js";

import { create, list, update, remove } from "../controllers/taskcontroller.js";
const router = Router();

router.use(authenticate);
router.use(authorize("USER"));

router.post("/", create);
router.get("/", list);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
