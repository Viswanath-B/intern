import { Router } from "express";
import { createApplication, testEmail } from "../controllers/applicationController.js";
import { receiptUpload } from "../middleware/upload.js";

const applicationRouter = Router();

applicationRouter.post("/apply", receiptUpload.single("paymentScreenshot"), createApplication);
applicationRouter.get("/test-email", testEmail);

export default applicationRouter;
