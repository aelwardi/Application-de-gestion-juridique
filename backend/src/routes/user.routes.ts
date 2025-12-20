import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateCreateUser, validateUpdateUser, validateUserId } from "../validators/user.validator";

const router = Router();
const userController = new UserController();

router.post("/", validateCreateUser, (req, res) => userController.createUser(req, res));
router.get("/", (req, res) => userController.getAllUsers(req, res));
router.get("/:id", validateUserId, (req, res) => userController.getUserById(req, res));
router.put("/:id", validateUserId, validateUpdateUser, (req, res) => userController.updateUser(req, res));
router.delete("/:id", validateUserId, (req, res) => userController.deleteUser(req, res));

export default router;
