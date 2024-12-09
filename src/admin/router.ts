import { Router } from "express";
import middleWare from "../middleware/middleware";
import { lessonRole, subLessonRole } from "../validators";
import adminController from "./controller";


const adminRouter = Router()
const adminAuth = new middleWare().adminAuth
const controller = new adminController()


adminRouter.get('/get-lessons'  , controller.getLessons)

adminRouter.get('/get-sublessons/:sublessonId' , adminAuth , controller.getSubLesson)

adminRouter.get('/get-content/:contentId' , adminAuth , controller.getContent)


export default adminRouter;