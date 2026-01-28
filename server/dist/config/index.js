"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    databasePath: process.env.DATABASE_PATH || path_1.default.join(__dirname, '../../database.sqlite'),
    uploadDir: process.env.UPLOAD_DIR || path_1.default.join(__dirname, '../../uploads'),
};
//# sourceMappingURL=index.js.map