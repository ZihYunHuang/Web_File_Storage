const util = require('util');
const multer = require('multer');
const acceptType = require('../accept_file_type.json').type;
const fileMaxNum = 10;
const limit = 10 * 1024 * 1024;

// 設定"上傳位置"及"上傳名稱"
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.upload);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// 上傳
let uploadFile = multer({
    storage: storage,
    limits: { fileSize: limit },

    // 檔案過濾 (過濾可上傳類型，存於 accept_file_type.json)
    fileFilter: (req, file, cb) => {
        let fileNameArr = file.originalname.split('.');
        let fileType = fileNameArr[1];

        let accept = acceptType.find((type) => {
            return type === fileType;
        });

        if (accept === undefined) {
            cb(file.originalname, false);
        } else {
            cb(null, true);
        }
    }
}).array('files', fileMaxNum);

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;