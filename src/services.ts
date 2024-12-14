import contentModel from "./DB/models/content";
import lessonModel from "./DB/models/lesson";
import levelModel from "./DB/models/level";
import questionModel from "./DB/models/questions";
import subLessonModel from "./DB/models/subLesson";
import interConnection from "./interservice/connection";

const connection = new interConnection()


export default class contentService {

    async checkSeen(id: string, userId: string) {
        const contents = await contentModel.find({ subLesson: id })
        const seenContents = await contentModel.find({ $and: [{ subLesson: id }, { seen: { $in: userId } }] })
        console.log(contents.length, seenContents.length)

        const sublesson = await subLessonModel.findById(id)
        let lessonId = sublesson?.lesson

        if (contents.length == seenContents.length) {

            await subLessonModel.findByIdAndUpdate(id, { $addToSet: { seen: userId } })
            const sublessons = await subLessonModel.find({ lesson: lessonId })
            const seenSubLessons = await subLessonModel.find({ $and: [{ lesson: lessonId }, { seen: { $in: userId } }] })
            if (sublessons.length == seenSubLessons.length) {
                console.log('here passed . . .')
                const seenLesson = await lessonModel.findByIdAndUpdate(lessonId, { $addToSet: { seen: userId } })
                const rewardResponse = await connection.putReward(userId, seenLesson?.reward, `finished ${seenLesson?.name} Lesson`)
                if (rewardResponse.success) {
                    await lessonModel.findByIdAndUpdate(lessonId, { rewarded: true })
                }
            }
        }
    }


    /**
     * this module seprate a languages for caching all lessons data
     */
    async makeReadyData() {
        let allLessons;

        allLessons = await lessonModel.find().populate({
            path: 'sublessons',
            populate: {
                path: 'subLessons',
            }
        })

        let english: {}[] = [];
        let arabic: {}[] = []
        let persian: {}[] = []


        for (let i = 0; i < allLessons.length; i++) {
            let lesson = allLessons[i].toObject()
            lesson.name = lesson.eName
            if (lesson.sublessons) {
                let newSubLessons = lesson.sublessons.map((elem: any) => {
                    elem.name = elem.eName;
                    if (elem.subLessons) {
                        let newSub2 = elem.subLessons.map((element: any) => {
                            element.name = element.eName;
                            return element
                        })
                        elem.subLessons = newSub2
                    }
                    return elem
                })
                lesson.sublessons = newSubLessons
            }
            english.push(lesson)
        }


        for (let i = 0; i < allLessons.length; i++) {
            let lesson = allLessons[i].toObject()
            lesson.name = lesson.aName
            if (lesson.sublessons) {
                let newSubLessons = lesson.sublessons.map((elem: any) => {
                    elem.name = elem.aName;
                    if (elem.subLessons) {
                        let newSub2 = elem.subLessons.map((element: any) => {
                            element.name = element.aName;
                            return element
                        })
                        elem.subLessons = newSub2
                    }
                    return elem
                })
                lesson.sublessons = newSubLessons
            }
            arabic.push(lesson)
        }


        for (let i = 0; i < allLessons.length; i++) {
            let lesson = allLessons[i].toObject()

            persian.push(lesson)
        }

        return { persian: persian, arabic: arabic, english: english }
    }



    async makeContentReady(id: string) {
        const contents = await contentModel.findById(id)
        // let english : {} = 
        // let arabic : {} = 
        // let persian : {} = 
        console.log('in the services')
        if (!contents) {
            return false
        }
        const englishInternalContent = {
            title: contents?.internalContent?.eTitle,
            describtion: contents?.internalContent?.eDescribtion
        }
        const arabicInternalContent = {
            title: contents?.internalContent?.aTitle,
            describtion: contents?.internalContent?.aDescribtion
        }
        const persianInternalContent = {
            title: contents?.internalContent?.title,
            describtion: contents?.internalContent?.describtion
        }

        const englishPicture = contents?.ePictures
        const arabichPicture = contents?.aPictures
        const persianPicture = contents?.pictures

        console.log('passed here . . .')

        let english = { ...contents?.toObject(), internalContent: englishInternalContent, pictures: englishPicture }
        let arabic = { ...contents?.toObject(), internalContent: arabicInternalContent, pictures: arabichPicture }
        let persian = { ...contents?.toObject(), internalContent: persianInternalContent, pictures: persianPicture }


        return { persian: persian, english: english, arabic: arabic }
    }




    /**
     * this mudule seprate data based on the languages for caching just sublessons data
     */
    async readySubLessonsData(id: any) {
        const asub = await subLessonModel.findById(id).populate('contents').select(['-eName', '-name'])
        const esub = await subLessonModel.findById(id).populate('contents').select(['-aName', '-name'])
        const sub = await subLessonModel.findById(id).populate('contents').select(['-aName', '-eName'])
        return { persian: sub, english: esub, arabic: asub }
    }



    /**
     * this mudule seprate data based on the languages for caching just sublessons data
     */
    async readyLevelsData(id: any) {
        const all = await levelModel.find().populate('lesson')
        let allLevels = [];
        for (let i = 0; i < all.length; i++) {
            const level = all[i].toObject()
            console.log(level.lesson.paasedQuize)
            let newData;
            if (level.lesson.paasedQuize.includes(id)) {
                newData = { ...level, mode: 2 }        // passed the quize

            } else if (level.lesson.seen.includes(id)) {
                newData = { ...level, mode: 1 }        // open but didnt passed the quize
            } else {
                newData = { ...level, mode: 0 }        // open but didnt passed the quize
            }
            allLevels.push(newData)
        }
        return allLevels
    }




    async getLessonForAdmin() {
        const lessons = await lessonModel.find().populate({
            path: 'sublessons',
        })

        let data: {}[] = []

        lessons.forEach((element: any) => {                                     // layer 1
            let objectElement = element.toObject()
            if (objectElement.sublessons.length) {
                objectElement.sublessons.forEach((element1: any) => {                                                    // layer 2
                    let objectElement1 = element1
                    if (objectElement1.subLessons.length) {
                        objectElement1.subLessons.forEach((element3: any) => {                         // layer 3
                            element3['id'] = `${objectElement.name}-${objectElement1.name}-${element3.name}`
                            element3['label'] = element3.name
                            element3['state'] = 2
                        })
                    }
                    element1['id'] = `${objectElement.name}-${objectElement1.name}`
                    element1['label'] = element1.name
                    element1['state'] = 1
                    element1['children'] = element1.subLessons
                })
            }
            objectElement['id'] = `${objectElement.name}`
            objectElement['label'] = objectElement.name
            objectElement['state'] = 0
            objectElement['children'] = objectElement.sublessons
            data.push(objectElement)
        })
        return data;
    }


    async getLevelsForAdmin() {
        // const lessons = await levelModel.find().populate({path : 'lesson' })
        const lessons = await lessonModel.find().populate({
            path: 'levels'
        })
        
        console.log('data cached ' , lessons)
        let data: {}[] = []
        lessons.forEach((element: any) => {              // layer 1
            let objectElement = element.toObject()
            if (objectElement.levels.length) {
                objectElement.levels.forEach((element2: any) => {        // layer 2
                    // if (element2.questions.length) {
                    //     element2.questions.forEach((element3: any) => {      // layer 3
                    //         element3['id'] = `${objectElement.name}-${element2.number}-${element3.questionForm}`
                    //         element3['label'] = element3.questionForm
                    //         element3['state'] = 2
                    //     })
                    // }
                    element2['id'] = `${objectElement.name}-${element2.number}`
                    element2['label'] = element2.number
                    element2['state'] = 1
                    element2['children'] = element2.questions
                })
            }
            objectElement['id'] = `${objectElement.name}`
            objectElement['label'] = objectElement.name
            objectElement['state'] = 0
            objectElement['children'] = objectElement.levels
            data.push(objectElement)
        })
        return data;
    }





    //////////!last line
}