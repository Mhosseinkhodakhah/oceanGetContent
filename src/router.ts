import { Router } from 'express'
import contentController from './controler'
import middleWare from './middleware/middleware'
import { lessonRole, subLessonRole } from './validators'

const controller = new contentController()
const auth = new middleWare().auth

const router = Router()

router.get('/get-lessons/:lang' , controller.getLessons)

router.get('/get-sublesson/:contentId/:lang' , controller.getSubLesson)

router.get('/get-content/:contentId/:lang' , controller.getContent)

router.get('/get-contents' , auth , controller.getAllContent)

export default router;