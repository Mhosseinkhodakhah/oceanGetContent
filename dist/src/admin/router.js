"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = __importDefault(require("../middleware/middleware"));
const controller_1 = __importDefault(require("./controller"));
const adminRouter = (0, express_1.Router)();
const adminAuth = new middleware_1.default().adminAuth;
const controller = new controller_1.default();
adminRouter.get('/get-lessons', controller.getLessons);
adminRouter.get('/get-sublessons/:sublessonId', adminAuth, controller.getSubLesson);
adminRouter.get('/get-levels', controller.getLevels);
adminRouter.get('/get-content/:contentId', adminAuth, controller.getContent);
exports.default = adminRouter;
