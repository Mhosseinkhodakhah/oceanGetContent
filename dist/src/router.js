"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controler_1 = __importDefault(require("./controler"));
const middleware_1 = __importDefault(require("./middleware/middleware"));
const controller = new controler_1.default();
const auth = new middleware_1.default().auth;
const router = (0, express_1.Router)();
router.get('/get-lessons/:lang', controller.getLessons);
router.get('/get-sublesson-content/:contentId/:lang', controller.getSubLesson);
router.get('/get-content/:contentId/:lang', controller.getContent);
router.get('/get-contents', auth, controller.getAllContent);
exports.default = router;
