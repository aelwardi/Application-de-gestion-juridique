import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateCreateUser, validateUpdateUser, validateUserId } from "../validators/user.validator";
import { authenticate } from "../middleware/auth.middleware";
import { pool } from "../config/database.config";

const router = Router();
const userController = new UserController();

router.post("/", validateCreateUser, (req, res) => userController.createUser(req, res));
router.get("/", (req, res) => userController.getAllUsers(req, res));

router.get("/search", authenticate, async (req, res) => {
  try {
    const { query, role, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    let searchQuery: string;
    let params: any[];
    const searchPattern = `%${query}%`;

    if (role) {
      searchQuery = `
        SELECT id, email, first_name, last_name, role, profile_picture_url
        FROM users
        WHERE is_active = true
        AND role = $2
        AND (
          LOWER(first_name) LIKE LOWER($1)
          OR LOWER(last_name) LIKE LOWER($1)
          OR LOWER(email) LIKE LOWER($1)
          OR LOWER(first_name || ' ' || last_name) LIKE LOWER($1)
        )
        ORDER BY first_name, last_name
        LIMIT $3
      `;
      params = [searchPattern, role, Number(limit)];
    } else {
      searchQuery = `
        SELECT id, email, first_name, last_name, role, profile_picture_url
        FROM users
        WHERE is_active = true
        AND (
          LOWER(first_name) LIKE LOWER($1)
          OR LOWER(last_name) LIKE LOWER($1)
          OR LOWER(email) LIKE LOWER($1)
          OR LOWER(first_name || ' ' || last_name) LIKE LOWER($1)
        )
        ORDER BY first_name, last_name
        LIMIT $2
      `;
      params = [searchPattern, Number(limit)];
    }

    const result = await pool.query(searchQuery, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/:id", authenticate, validateUserId, (req, res) => userController.getUserById(req, res));
router.put("/:id", authenticate, validateUserId, validateUpdateUser, (req, res) => userController.updateUser(req, res));
router.delete("/:id", authenticate, validateUserId, (req, res) => userController.deleteUser(req, res));

export default router;