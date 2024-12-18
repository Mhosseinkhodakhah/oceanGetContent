import { number } from "joi";
import contentModel from "../DB/models/content";
import lessonModel from "../DB/models/lesson";
import levelModel from "../DB/models/level";
import cacher from "../service/cach";
import { response } from "../service/responseService";


export default class interServiceController {

    async putPhoto(req: any, res: any, next: any) {
        const { photo, aPhoto, ePhoto } = req.body;
        const content = await contentModel.findById(req.params.contentId)
        await content?.updateOne({ $addToSet: { pictures: photo, aPictures: aPhoto, ePictures: ePhoto } })
        await content?.save()
        return next(new response(req, res, 'put content photos', 200, null, 'pictures successfulley puted'))
    }

    async resetCache(req: any, res: any, next: any) {
        console.log('its hereeeeeeeeee')
        await cacher.reset()
        return next(new response(req, res, 'reset cache for content service', 200, null, 'cache reseted successfull . . .'))
    }

    async getHeaderData(req: any, res: any, next: any) {
        const lessons = await lessonModel.find()
        const levels = await levelModel.find()
        let level: number[] = []
        let values: number[] = []
        levels.forEach(elem => {
            level.push(elem.number)
            values.push(elem.passedUsers.length)
        })

        const barChart = {
            levels: level,
            series: [
                { name: '2022', data: values },
                { name: '2023', data: values },
            ]
        }
        return next(new response(req, res, 'get header data interservice', 200, null, {lessons : lessons , levelData:barChart}))
    }


}