"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = __importDefault(require("./DB/models/content"));
const lesson_1 = __importDefault(require("./DB/models/lesson"));
const level_1 = __importDefault(require("./DB/models/level"));
const questions_1 = __importDefault(require("./DB/models/questions"));
const subLesson_1 = __importDefault(require("./DB/models/subLesson"));
const connection_1 = __importDefault(require("./interservice/connection"));
const connection = new connection_1.default();
class contentService {
    checkSeen(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const contents = yield content_1.default.find({ subLesson: id });
            const seenContents = yield content_1.default.find({ $and: [{ subLesson: id }, { seen: { $in: userId } }] });
            console.log(contents.length, seenContents.length);
            const sublesson = yield subLesson_1.default.findById(id);
            let lessonId = sublesson === null || sublesson === void 0 ? void 0 : sublesson.lesson;
            if (contents.length == seenContents.length) {
                yield subLesson_1.default.findByIdAndUpdate(id, { $addToSet: { seen: userId } });
                const sublessons = yield subLesson_1.default.find({ lesson: lessonId });
                const seenSubLessons = yield subLesson_1.default.find({ $and: [{ lesson: lessonId }, { seen: { $in: userId } }] });
                if (sublessons.length == seenSubLessons.length) {
                    console.log('here passed . . .');
                    const seenLesson = yield lesson_1.default.findByIdAndUpdate(lessonId, { $addToSet: { seen: userId } });
                    const rewardResponse = yield connection.putReward(userId, seenLesson === null || seenLesson === void 0 ? void 0 : seenLesson.reward, `finished ${seenLesson === null || seenLesson === void 0 ? void 0 : seenLesson.name} Lesson`);
                    if (rewardResponse.success) {
                        yield lesson_1.default.findByIdAndUpdate(lessonId, { rewarded: true });
                    }
                }
            }
        });
    }
    /**
     * this module seprate a languages for caching all lessons data
     */
    makeReadyData() {
        return __awaiter(this, void 0, void 0, function* () {
            let allLessons;
            allLessons = yield lesson_1.default.find().populate({
                path: 'sublessons',
                populate: {
                    path: 'subLessons',
                }
            });
            let english = [];
            let arabic = [];
            let persian = [];
            for (let i = 0; i < allLessons.length; i++) {
                let lesson = allLessons[i].toObject();
                lesson.name = lesson.eName;
                if (lesson.sublessons) {
                    let newSubLessons = lesson.sublessons.map((elem) => {
                        elem.name = elem.eName;
                        if (elem.subLessons) {
                            let newSub2 = elem.subLessons.map((element) => {
                                element.name = element.eName;
                                return element;
                            });
                            elem.subLessons = newSub2;
                        }
                        return elem;
                    });
                    lesson.sublessons = newSubLessons;
                }
                english.push(lesson);
            }
            for (let i = 0; i < allLessons.length; i++) {
                let lesson = allLessons[i].toObject();
                lesson.name = lesson.aName;
                if (lesson.sublessons) {
                    let newSubLessons = lesson.sublessons.map((elem) => {
                        elem.name = elem.aName;
                        if (elem.subLessons) {
                            let newSub2 = elem.subLessons.map((element) => {
                                element.name = element.aName;
                                return element;
                            });
                            elem.subLessons = newSub2;
                        }
                        return elem;
                    });
                    lesson.sublessons = newSubLessons;
                }
                arabic.push(lesson);
            }
            for (let i = 0; i < allLessons.length; i++) {
                let lesson = allLessons[i].toObject();
                persian.push(lesson);
            }
            return { persian: persian, arabic: arabic, english: english };
        });
    }
    makeContentReady(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const contents = yield content_1.default.findById(id);
            // let english : {} = 
            // let arabic : {} = 
            // let persian : {} = 
            console.log('in the services');
            if (!contents) {
                return false;
            }
            const englishInternalContent = {
                title: (_a = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _a === void 0 ? void 0 : _a.eTitle,
                describtion: (_b = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _b === void 0 ? void 0 : _b.eDescribtion
            };
            const arabicInternalContent = {
                title: (_c = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _c === void 0 ? void 0 : _c.aTitle,
                describtion: (_d = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _d === void 0 ? void 0 : _d.aDescribtion
            };
            const persianInternalContent = {
                title: (_e = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _e === void 0 ? void 0 : _e.title,
                describtion: (_f = contents === null || contents === void 0 ? void 0 : contents.internalContent) === null || _f === void 0 ? void 0 : _f.describtion
            };
            const englishPicture = contents === null || contents === void 0 ? void 0 : contents.ePictures;
            const arabichPicture = contents === null || contents === void 0 ? void 0 : contents.aPictures;
            const persianPicture = contents === null || contents === void 0 ? void 0 : contents.pictures;
            console.log('passed here . . .');
            let english = Object.assign(Object.assign({}, contents === null || contents === void 0 ? void 0 : contents.toObject()), { internalContent: englishInternalContent, pictures: englishPicture });
            let arabic = Object.assign(Object.assign({}, contents === null || contents === void 0 ? void 0 : contents.toObject()), { internalContent: arabicInternalContent, pictures: arabichPicture });
            let persian = Object.assign(Object.assign({}, contents === null || contents === void 0 ? void 0 : contents.toObject()), { internalContent: persianInternalContent, pictures: persianPicture });
            return { persian: persian, english: english, arabic: arabic };
        });
    }
    /**
     * this mudule seprate data based on the languages for caching just sublessons data
     */
    readySubLessonsData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const asub = yield subLesson_1.default.findById(id).populate('contents').select(['-eName', '-name']);
            const esub = yield subLesson_1.default.findById(id).populate('contents').select(['-aName', '-name']);
            const sub = yield subLesson_1.default.findById(id).populate('contents').select(['-aName', '-eName']);
            return { persian: sub, english: esub, arabic: asub };
        });
    }
    /**
     * this mudule seprate data based on the languages for caching just sublessons data
     */
    readyLevelsData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield level_1.default.find().populate('lesson');
            let allLevels = [];
            for (let i = 0; i < all.length; i++) {
                const level = all[i].toObject();
                console.log(level.lesson.paasedQuize);
                let newData;
                if (level.lesson.paasedQuize.includes(id)) {
                    newData = Object.assign(Object.assign({}, level), { mode: 2 }); // passed the quize
                }
                else if (level.lesson.seen.includes(id)) {
                    newData = Object.assign(Object.assign({}, level), { mode: 1 }); // open but didnt passed the quize
                }
                else {
                    newData = Object.assign(Object.assign({}, level), { mode: 0 }); // open but didnt passed the quize
                }
                allLevels.push(newData);
            }
            return allLevels;
        });
    }
    getLessonForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lessons = yield lesson_1.default.find().populate({
                path: 'sublessons',
            });
            let data = [];
            lessons.forEach((element) => {
                let objectElement = element.toObject();
                if (objectElement.sublessons.length) {
                    objectElement.sublessons.forEach((element1) => {
                        let objectElement1 = element1;
                        if (objectElement1.subLessons.length) {
                            objectElement1.subLessons.forEach((element3) => {
                                element3['id'] = `${objectElement.name}-${objectElement1.name}-${element3.eName}`;
                                element3['label'] = element3.eName;
                                element3['state'] = 2;
                            });
                        }
                        element1['id'] = `${objectElement.name}-${objectElement1.name}`;
                        element1['label'] = element1.name;
                        element1['state'] = 1;
                        element1['children'] = element1.subLessons;
                    });
                }
                objectElement['id'] = `${objectElement.name}`;
                objectElement['label'] = objectElement.name;
                objectElement['state'] = 0;
                objectElement['children'] = objectElement.sublessons;
                data.push(objectElement);
            });
            return data;
        });
    }
    getLevelsForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const lessons = yield lesson_1.default.find();
            const levels = yield level_1.default.find().populate('lesson');
            const questions = yield questions_1.default.find().populate({
                path: 'level',
                populate: { path: 'lesson' }
            });
            let data = [];
            let sub2Lessons = [];
            lessons.forEach((element) => {
                let objectLesson = element.toObject();
                data.push(Object.assign(Object.assign({}, objectLesson), { levels: [], path: [objectLesson.name], sublessons: [] }));
            });
            levels.forEach((elem) => {
                let objectData = elem.toObject();
                let innerSub = [];
                data.push(Object.assign(Object.assign({}, objectData), { lesson: [], path: [objectData.lesson.name, elem.number] }));
            });
            questions.forEach((elem3) => {
                var _a, _b, _c;
                let objectData = elem3.toObject();
                data.push(Object.assign(Object.assign({}, objectData), { path: [(_b = (_a = objectData === null || objectData === void 0 ? void 0 : objectData.level) === null || _a === void 0 ? void 0 : _a.lesson) === null || _b === void 0 ? void 0 : _b.name, (_c = objectData === null || objectData === void 0 ? void 0 : objectData.level) === null || _c === void 0 ? void 0 : _c.number, elem3 === null || elem3 === void 0 ? void 0 : elem3.questionForm], level: {} }));
            });
            return data;
        });
    }
}
exports.default = contentService;
