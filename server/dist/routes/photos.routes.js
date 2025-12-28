"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = config_1.config.uploadDir;
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId_timestamp_random.ext
        const userId = req.userId;
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const ext = path_1.default.extname(file.originalname);
        const filename = `${userId}_${timestamp}_${random}${ext}`;
        cb(null, filename);
    }
});
// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});
// Upload multiple photos
router.post('/upload', auth_1.authenticateToken, upload.array('photos', 6), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const files = req.files;
        const photoUrls = files.map(file => `/uploads/${file.filename}`);
        res.json({
            success: true,
            photos: photoUrls
        });
    }
    catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload photos' });
    }
});
// Delete a photo
router.delete('/:filename', auth_1.authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const userId = req.userId;
        // Security: Ensure filename starts with userId to prevent unauthorized deletion
        if (!filename.startsWith(`${userId}_`)) {
            return res.status(403).json({ error: 'Unauthorized to delete this file' });
        }
        const filePath = path_1.default.join(config_1.config.uploadDir, filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            res.json({ success: true });
        }
        else {
            res.status(404).json({ error: 'File not found' });
        }
    }
    catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});
exports.default = router;
//# sourceMappingURL=photos.routes.js.map