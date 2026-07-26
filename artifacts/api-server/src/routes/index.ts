import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import galleriesRouter from "./galleries.js";
import publicGalleryRouter from "./publicGallery.js";
import uploadRouter from "./upload.js";
import storageRouter from "./storage.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(galleriesRouter);
router.use(publicGalleryRouter);
router.use(uploadRouter);
router.use(storageRouter);

export default router;
