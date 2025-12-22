import { Router } from "express";
import { ClientExtendedController } from "../controllers/client-extended.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new ClientExtendedController();

router.use(authenticate);

router.post("/requests", (req, res) => controller.createClientRequest(req, res));
router.get("/requests/client/:clientId", (req, res) => controller.getClientRequestsByClientId(req, res));
router.get("/requests/lawyer/:lawyerId", (req, res) => controller.getClientRequestsByLawyerId(req, res));
router.put("/requests/:id", (req, res) => controller.updateClientRequest(req, res));
router.delete("/requests/:id", (req, res) => controller.deleteClientRequest(req, res));

router.post("/notes", (req, res) => controller.createClientNote(req, res));
router.get("/notes/:clientId", (req, res) => controller.getClientNotes(req, res));
router.get("/notes/reminders/:lawyerId", (req, res) => controller.getPendingReminders(req, res));
router.put("/notes/:id", (req, res) => controller.updateClientNote(req, res));
router.delete("/notes/:id", (req, res) => controller.deleteClientNote(req, res));

router.post("/payments", (req, res) => controller.createClientPayment(req, res));
router.get("/payments/:clientId", (req, res) => controller.getClientPayments(req, res));
router.get("/payments/:clientId/summary", (req, res) => controller.getClientFinancialSummary(req, res));
router.get("/payments/overdue/:lawyerId", (req, res) => controller.getOverduePayments(req, res));
router.put("/payments/:id", (req, res) => controller.updateClientPayment(req, res));
router.delete("/payments/:id", (req, res) => controller.deleteClientPayment(req, res));

router.post("/communications", (req, res) => controller.createClientCommunication(req, res));
router.get("/communications/:clientId", (req, res) => controller.getClientCommunications(req, res));
router.get("/communications/:clientId/summary", (req, res) => controller.getClientActivitySummary(req, res));
router.get("/communications/followups/:lawyerId", (req, res) => controller.getPendingFollowUps(req, res));
router.delete("/communications/:id", (req, res) => controller.deleteClientCommunication(req, res));

export default router;