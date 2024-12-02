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
const content_1 = __importDefault(require("../DB/models/content"));
const lesson_1 = __importDefault(require("../DB/models/lesson"));
const level_1 = __importDefault(require("../DB/models/level"));
const cach_1 = __importDefault(require("../service/cach"));
const responseService_1 = require("../service/responseService");
class interServiceController {
    putPhoto(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { photo, aPhoto, ePhoto } = req.body;
            const content = yield content_1.default.findById(req.params.contentId);
            yield (content === null || content === void 0 ? void 0 : content.updateOne({ $addToSet: { pictures: photo, aPictures: aPhoto, ePictures: ePhoto } }));
            yield (content === null || content === void 0 ? void 0 : content.save());
            return next(new responseService_1.response(req, res, 'put content photos', 200, null, 'pictures successfulley puted'));
        });
    }
    resetCache(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('its hereeeeeeeeee');
            yield cach_1.default.reset();
            return next(new responseService_1.response(req, res, 'reset cache for content service', 200, null, 'cache reseted successfull . . .'));
        });
    }
    getHeaderData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const lessons = yield lesson_1.default.find();
            const levels = yield level_1.default.find();
            let level = [];
            let values = [];
            levels.forEach(elem => {
                level.push(elem.number);
                values.push(elem.passedUsers.length);
            });
            const barChart = {
                levels: level,
                series: [
                    { name: '2022', data: values },
                    { name: '2023', data: values },
                ]
            };
            return next(new responseService_1.response(req, res, 'get header data interservice', 200, null, { lessons: lessons, levelData: barChart }));
        });
    }
}
exports.default = interServiceController;
