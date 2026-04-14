import { Router } from "express";
import { createApplication } from "../controllers/applicationController.js";
import { receiptUpload } from "../middleware/upload.js";

const applicationRouter = Router();

applicationRouter.post("/apply", receiptUpload.single("paymentScreenshot"), createApplication);

export default applicationRouter;
