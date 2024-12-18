import { validationResult } from "express-validator";
import contentService from "./services";
import { lessonRole } from "./validators";
import { response } from "./service/responseService";
import lessonModel from "./DB/models/lesson";
import subLessonModel from "./DB/models/subLesson";
import { lessonDB } from "./interfaces";
import contentModel from "./DB/models/content";
import levelModel from "./DB/models/level";
import questionModel from "./DB/models/questions";
import { level } from "winston";
import interConnection from "./interservice/connection";
import internalCache from "./service/cach";
import cacher from "./service/cach";


const services = new contentService()

const connection = new interConnection()



export default class contentController {


    async getLessons(req: any, res: any, next: any) {
        const language = req.params.lang;
        let lessons;
        let allLessons = await cacher.getter('getLessons')
        if (!allLessons) {                                       // when cache was not exist . . .
            console.log('cache was empty . . .')
            const data = await services.makeReadyData()
            await cacher.setter('getLessons', data)
            switch (language) {
                case 'english':
                    lessons = data.english
                    break;
                case 'arabic':
                    lessons = data.arabic
                    break;
                case 'persian':
                    lessons = data.persian
                    break;

                default:
                    return next(new response(req, res, 'get lessons', 400, 'please select a language on params', null))
                    break;
            }
        } else {
            console.log('read throw cache . . .')                                      // when cache exist 
            switch (language) {
                case 'english':
                    lessons = allLessons.english
                    break;
                case 'arabic':
                    lessons = allLessons.arabic
                    break;
                case 'persian':
                    lessons = allLessons.persian
                    break;

                default:
                    return next(new response(req, res, 'get lessons', 400, 'please select a language on params', null))
                    break;
            }
        }
        return next(new response(req, res, 'get lessons', 200, null, lessons))
    }



    async getSubLesson(req: any, res: any, next: any) {
        const language = req.params.lang;
        let finalData : {} = {};
        const data = await services.makeContentReady(req.params.contentId)
        if (!data) {
            return next(new response(req, res, 'get specific content', 204, 'this content is not exist on database', null))
        }
        console.log('passed from cache heat', data)
        switch (language) {
            case 'persian':
                finalData = data?.persian
                break;
            case 'english':
                finalData = data?.english
                break;
            case 'arabic':
                finalData = data?.arabic
                break;

            default:
                return next(new response(req, res, 'get specific content', 400 , 'please first select the language on request . . .', null))
        }

        return next(new response(req, res, 'get specific subLesson', 200, null, finalData))
    }




    async getContent(req: any, res: any, next: any) {
        const content = await contentModel.findById(req.params.contentId).populate('subLesson')
        return next(new response(req, res, 'get specific content', 200, null, content))
    }


    async getAllContent(req: any, res: any, next: any) {
        const contents = await contentModel.find()
        return next(new response(req, res, 'get contents', 200, null, contents))
    }


}