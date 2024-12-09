import { validationResult } from "express-validator"
import { response } from "../service/responseService"
import lessonModel from "../DB/models/lesson"
import subLessonModel from "../DB/models/subLesson"
import contentModel from "../DB/models/content"
import levelModel from "../DB/models/level"
import questionModel from "../DB/models/questions"
import internalCache from "../service/cach"
import cacher from "../service/cach"
import contentService from "../services"


const service = new contentService()


export default class adminController {

    async getContent(req: any, res: any, next: any) {
        let cacheData = await cacher.getter(`admin-getContent-${req.params.contentId}`)
        let finalData;
        if (cacheData) {
            console.log('read throw cache . . .')
            finalData = cacheData
        } else {
            console.log('cache is empty . . .')
            finalData = await contentModel.findById(req.params.contentId).populate('subLesson')
            if (!finalData) {
                return next(new response(req, res, 'get specific content', 404, 'this content is not exist on database', null))
            }
            await cacher.setter(`admin-getContent-${req.params.contentId}`, finalData)
        }
        return next(new response(req, res, 'get specific content', 200, null, finalData))
    }


    async getSubLesson(req: any, res: any, next: any) {
        let cacheData = await cacher.getter(`admin-getSubLesson-${req.params.sublessonId}`)
        let subLesson;
        if (cacheData) {
            console.log('read throw cach . . .')
            subLesson = cacheData
        } else {
            console.log('cache is empty . . .')
            subLesson = await subLessonModel.findById(req.params.sublessonId).populate('contents').populate('lesson')
            if (!subLesson) {
                return next(new response(req, res, 'get specific subLesson', 404, 'this sublesson is not exist on database', null))
            }
            await cacher.setter(`admin-getSubLesson-${req.params.sublessonId}`, subLesson)

        }
        return next(new response(req, res, 'get specific subLesson', 200, null, subLesson))
    }


    async getLevels(req: any, res: any, next: any) {
        let cacheData = await cacher.getter('admin-getLevels')
        let finalData;
        if (cacheData) {
            finalData = cacheData
        } else {
            const levels = await service.getLevelsForAdmin();
            await cacher.setter('admin-getLevels', levels)
            finalData = levels
        }
        return next(new response(req, res, 'get levels by admin' , 200 , null , finalData))
    }


    async getLessons(req: any, res: any, next: any) {
        let cacheData = await cacher.getter('admin-getLessons')
        let finalData;
        if (cacheData) {
            finalData = cacheData;
        } else {
            const lessons = await service.getLessonForAdmin()
            await cacher.setter('admin-getLessons', lessons)
            finalData = lessons
        }
        return next(new response(req, res, 'get lessons', 200, null, finalData))
    }




}