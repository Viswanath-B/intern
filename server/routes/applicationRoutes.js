import { Router } from "express";
import { createApplication, exportApplications, listApplications, testEmail } from "../controllers/applicationController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { receiptUpload } from "../middleware/upload.js";

const applicationRouter = Router();

applicationRouter.post("/apply", receiptUpload.single("paymentScreenshot"), createApplication);
applicationRouter.get("/applications", requireAdminAccess, listApplications);
applicationRouter.get("/applications/export", requireAdminAccess, exportApplications);
applicationRouter.get("/test-email", requireAdminAccess, testEmail);

export default applicationRouter;
