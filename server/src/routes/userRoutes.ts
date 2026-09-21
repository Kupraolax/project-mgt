import { Router } from "express";

import { getUser, getUsers, postUser, updateUser } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.patch("/:cognitoId", updateUser);

export default router;
