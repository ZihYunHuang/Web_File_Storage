let express = require('express');
let router = express.Router();
const fileController = require('../controllers/file_controller');
const tagController = require('../controllers/tag_controller');

// 上傳檔案
router.post('/file', fileController.uploadFile);

// 刪除檔案
router.delete('/file', fileController.deleteFile);

// 下載檔案
router.get('/download/:fileFullName', fileController.downloadFile);

// 編輯檔案描述
router.put('/file', fileController.editDescription);

// 取得檔案列表
router.get('/files', fileController.getFilesList);

// 新增標籤
router.post('/tag/:tagName/:fileFullName', tagController.newTag);

// 取得標籤列表
router.get('/tag/list', tagController.getTagList);

// 刪除標籤
router.delete('/tag/:tagName/:fileFullName', tagController.deleteTag);

// 搜尋 (搜尋貼有該標籤之檔案)
router.get('/file/search/:tagName', fileController.searchFile);

module.exports = router;
