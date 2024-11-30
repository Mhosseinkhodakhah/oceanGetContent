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
const services_1 = __importDefault(require("./services"));
const responseService_1 = require("./service/responseService");
const content_1 = __importDefault(require("./DB/models/content"));
const connection_1 = __importDefault(require("./interservice/connection"));
const cach_1 = __importDefault(require("./service/cach"));
const services = new services_1.default();
const connection = new connection_1.default();
class contentController {
    getLessons(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const language = req.params.lang;
            let lessons;
            let allLessons = yield cach_1.default.getter('getLessons');
            if (!allLessons) { // when cache was not exist . . .
                console.log('cache was empty . . .');
                const data = yield services.makeReadyData();
                yield cach_1.default.setter('getLessons', data);
                switch (language) {
                    case 'english':
                        lessons = data.english;
                        break;
                    case 'arabic':
                        lessons = data.arabic;
                        break;
                    case 'persian':
                        lessons = data.persian;
                        break;
                    default:
                        return next(new responseService_1.response(req, res, 'get lessons', 400, 'please select a language on params', null));
                        break;
                }
            }
            else {
                console.log('read throw cache . . .'); // when cache exist 
                switch (language) {
                    case 'english':
                        lessons = allLessons.english;
                        break;
                    case 'arabic':
                        lessons = allLessons.arabic;
                        break;
                    case 'persian':
                        lessons = allLessons.persian;
                        break;
                    default:
                        return next(new responseService_1.response(req, res, 'get lessons', 400, 'please select a language on params', null));
                        break;
                }
            }
            return next(new responseService_1.response(req, res, 'get lessons', 200, null, lessons));
        });
    }
    getSubLesson(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const language = req.params.lang;
            let sublessonContent;
            sublessonContent = yield content_1.default.findById(req.params.contentId);
            if (!sublessonContent) {
                return next(new responseService_1.response(req, res, 'get specific subLesson', 400, 'this content is not exist', null));
            }
            return next(new responseService_1.response(req, res, 'get specific subLesson', 200, null, sublessonContent));
        });
    }
    getContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield content_1.default.findById(req.params.contentId).populate('subLesson');
            return next(new responseService_1.response(req, res, 'get specific content', 200, null, content));
        });
    }
    getAllContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const contents = yield content_1.default.find();
            return next(new responseService_1.response(req, res, 'get contents', 200, null, contents));
        });
    }
}
exports.default = contentController;
