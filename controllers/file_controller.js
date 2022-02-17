const uploadFile = require('../middlewares/upload_middleware');
const fileService = require('../Services/file_service');


const uploadController = {
    uploadFile: async (req, res) => {
        /* 
        檔案上傳：
        先將檔案上傳至 upload 資料夾，於上傳的同時過濾檔案類型，
        將 upload 中的檔案 "各別" 複製到 file_storage，複製完後即將該檔案由 upload 中刪除，並將該檔案與 file_storage 內其他檔案比對(使用 hash：sh1)

        若無重複：
            將此檔案基本資料暫存於 fileArr
            重新命名(以sh1後八碼命名)
            將該檔案轉為縮圖存於 thumbnail

        若重複
            刪除該檔案

        待所有檔案處理完畢，再將 fileArr 寫入 file_data.json
        */
        try {
            // 上傳至暫存資料夾
            await uploadFile(req, res);

            if (req.files === undefined) {
                return res.status(400).send({ data: 'Please upload a file!' });
            }

            // 將 upload 中的檔案個別移至 file_storage 並與資料夾內其他檔案比對，若無重複則重新命名(以sh1後八碼命名)並記錄於 file_data.json，若重複則刪除該檔案
            fileService.allOverFolder();

            res.status(201).send({
                data: 'Uploaded successfully',
            });
        } catch (err) {
            if (err.code == 'LIMIT_FILE_SIZE') {
                return res.status(413).send({
                    data: 'File size is too large.',
                });
            }

            res.status(406).send({
                data: `Could not upload the file: ${err} `
            });
        }
    },
    deleteFile: async (req, res) => {
        try {
            const files = req.body.files;

            fileService.deleteFile(files);

            res.status(200).send({
                data: 'Deleted successfully',
            });
        } catch (error) {
            res.status(406).send({
                data: 'File does not exist.'
            });
        }
    },
    downloadFile: (req, res) => {
        const fileFullName = req.params.fileFullName;
        const directoryPath = __basedir + '/file_storage/';

        res.download(directoryPath + fileFullName, fileFullName, (err) => {
            if (err) {
                console.log(err)
                res.status(500).send({
                    data: 'Could not download the file：' + fileFullName,
                });
            }
        });
    },
    getFilesList: (req, res) => {
        let filesInfo = fileService.getFilesList();
        res.status(200).send({
            data: filesInfo
        });
    },
    searchFile: (req, res) => {
        const files = fileService.getFilesList();

        const result = fileService.searchFile(files, req.params.tagName);

        res.status(200).send({
            data: result
        });
    },
    editDescription: (req, res) => {
        let fileName = req.body.fileName;
        let description = req.body.description;

        console.log(fileName, description)

        const files = fileService.getFilesList();

        fileService.editDescription(files, fileName, description);

        res.status(200).send({
            data: 'Edit success.'
        });
    },
}

module.exports = uploadController;
