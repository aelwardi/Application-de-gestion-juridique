import { Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const clientController = new ClientController();
router.use(authenticate);

router.post("/", (req, res) => clientController.createClient(req, res));
router.get("/", (req, res) => clientController.getAllClients(req, res));
router.get("/search", (req, res) => clientController.searchClients(req, res));
router.get("/:id", (req, res) => clientController.getClientById(req, res));
router.put("/:id", (req, res) => clientController.updateClient(req, res));
router.delete("/:id", (req, res) => clientController.deleteClient(req, res));

router.get("/user/:userId", (req, res) => clientController.getClientByUserId(req, res));
router.put("/user/:userId", (req, res) => clientController.updateClientByUserId(req, res));

router.get("/user/:userId/stats", (req, res) => clientController.getClientStats(req, res));
router.get("/user/:userId/cases", (req, res) => clientController.getClientCases(req, res));
router.get("/user/:userId/appointments", (req, res) => clientController.getClientAppointments(req, res));
router.get("/user/:userId/documents", (req, res) => clientController.getClientDocuments(req, res));

router.get("/lawyer/:lawyerId", (req, res) => clientController.getClientsByLawyer(req, res));

export default router;