import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/customers";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

// Storage configuration
const storage = multer.diskStorage({

    destination: (
        req,
        file,
        cb
    ) => {
        cb(null, uploadDir);
    },

    filename: (
        req,
        file,
        cb
    ) => {

        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);
    }
});

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    cb
) => {

    const allowedExtensions = [
        ".xlsx",
        ".xls"
    ];

    const extension = path.extname(
        file.originalname
    ).toLowerCase();

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only Excel files (.xlsx, .xls) are allowed"
            )
        );
    }
};

export const uploadCustomerExcel = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});