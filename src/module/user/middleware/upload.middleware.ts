import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/users";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },

    filename: (_req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}` +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter: multer.Options["fileFilter"] = ( _req, file, cb ) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const isValidMimeType =
        allowedMimeTypes.includes(file.mimetype);

    const isValidExtension =
        allowedExtensions.includes(extension);

    console.log("File:", file.originalname);
    console.log("MIME:", file.mimetype);
    console.log("Extension:", extension);

    if (isValidMimeType || isValidExtension) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});