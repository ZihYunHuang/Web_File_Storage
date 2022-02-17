require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const hashType = 'sha1';
const commonService = require('../Services/common_service');
const sharp = require('sharp');
const thumbnailType = 'png';


const fileService = {
    allOverFolder: () => {
        fs.readdir(process.env.upload, function (err, files) {
            if (!err) {
                fileProcessing(files);
            } else {
                throw err;
            }
        });
    },
    deleteFile: (files) => {
        let deleteData = [];

        files.forEach(function (fileFullName) {
            fs.rmSync(`./file_storage/${fileFullName}`);

            // 若檔案為圖片，需刪除縮圖
            let fileName = fileFullName.split('.')[0];
            if (fs.existsSync(`./thumbnail/${fileName}.${thumbnailType}`)) {
                fs.rmSync(`./thumbnail/${fileName}.${thumbnailType}`);
            }

            deleteData.push(fileFullName);
        });

        deleteJson(deleteData);
    },
    getFilesList: () => {
        let filesInfo = commonService.loadFile(process.env.fileRecord);

        filesInfo.forEach(element => {
            element.url = `${process.env.host}/api/download/${element.fileName}.${element.fileType}`;
        });

        return filesInfo;
    },
    // 依標籤篩選檔案
    searchFile: (files, tagName) => {
        let searchArr = [];

        files.forEach(file => {
            if (file.tag.find(element => element === tagName)) {
                searchArr.push(file)
            }
        });

        return searchArr;
    },
    editDescription: (files, fileName, description) => {
        try {
            files.forEach(file => {
                if (file.fileName === fileName) {
                    file.description = description

                    throw error
                }
            });
        } catch (error) {
            console.log('修改完成')
        }

        commonService.writeJson(process.env.fileRecord, JSON.stringify(files));
    }
}

function fileProcessing(files) {
    // 檔案基本資料暫存陣列
    let fileArr = [];

    // 遍歷讀取到的檔案列表
    files.forEach(async function (fileFullName, index) {
        const uploadPath = `${process.env.upload}/${fileFullName}`;
        const storagePath = `${process.env.fileStorage}/${fileFullName}`;

        // 將檔案由 upload 複製到 file_storage)，並刪除 upload 中的檔案
        const readStreamResult = await readStreamFile(uploadPath, storagePath);
        if (readStreamResult === 'success_read_stream') {
            // 取得 hashcode
            const hashCode = getHash(storagePath);

            // 將 upload 中的檔案與 file_storage 比對，若無重複回傳檔案基本資料(寫入file_data.json的物件)，若重複傳回null
            let compareResult = fileCompare(hashCode, fileFullName);

            if (compareResult !== null) {
                // 檔案基本資料加上縮圖附檔名供前端使用
                compareResult['thumbnailType'] = thumbnailType;

                fileArr.push(compareResult);

                const newfilFulleName = `${compareResult.fileName}.${compareResult.fileType}`;

                // 重新命名
                renameFile(`${process.env.fileStorage}/${fileFullName}`, `${process.env.fileStorage}/${newfilFulleName}`);

                // 縮圖
                if (['jpg', 'png', 'jpeg', 'svg', 'gif'].find(element => element === compareResult.fileType)) {
                    diminishedImage(`${process.env.fileStorage}/${newfilFulleName}`, compareResult.fileName, thumbnailType);
                }
            } else {
                deleteFile(storagePath);
            }
        }

        if (index === files.length - 1) {
            addJson(fileArr);
        }
    });
}

// 建立縮圖
async function diminishedImage(resource, fileName, thumbnailType) {
    await sharp(resource)
        .resize(240, 240, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .png()
        .toFile(`${process.env.thumbnail}/${fileName}.${thumbnailType}`);
}

// 取得sh1
function getHash(resource) {
    let buffer = fs.readFileSync(resource);
    let fsHash = crypto.createHash(hashType);

    fsHash.update(buffer);
    let hashCode = fsHash.digest('hex');
    return hashCode;
}

// 檔案比較
function fileCompare(hashCode, fileFullName) {
    let allFileData = commonService.loadFile(process.env.fileRecord);

    // 判斷是否有重複的檔案
    let fileRepeat = checkFileRepeat(allFileData, hashCode);

    // 若無重複回傳檔案基本資料(寫入file_data.json的物件)，若重複傳回null
    if (!fileRepeat) {
        return ({
            fileName: hashCode.substr(-8),
            fileType: fileFullName.split('.')[1],
            description: fileFullName.split('.')[0],
            hashCode: hashCode,
            tag: []
        });
    } else {
        return null;
    }
}

// 讀取檔案 Stream
function readStreamFile(fileResource, fileDestination) {
    return new Promise((resolve, reject) => {
        let inputData = '';

        // 建立一個提供讀取的 Stream，從 fileResource 讀取
        const readerStream = fs.createReadStream(fileResource);

        // 使用 binary 編碼讀取數據
        readerStream.setEncoding('binary');

        // 處理 Stream 事件 --> data, end, error
        readerStream.on('data', function (chunk) {
            inputData += chunk;
        });

        readerStream.on('end', async function (chunk) {
            // 複製檔案
            const writeStreamResult = await writeStreamFile(fileDestination, inputData);

            if (writeStreamResult === 'success_write_stream') {
                // 確認複製完成後，刪除 upload 中的檔案
                deleteFile(fileResource);
                resolve('success_read_stream')
            } else {
                reject('fail');
            }
        });

        readerStream.on('error', function (err) {
            reject('fail');
        });
    })
}

// 寫入檔案 Stream (複製檔案)
function writeStreamFile(fileDestination, inputData) {
    return new Promise((resolve, reject) => {
        let outputdata = inputData;

        // 建立一個提供寫入的 Stream，寫入到 fileDestination 中
        let writerStream = fs.createWriteStream(fileDestination);

        // 使用 binary 編碼寫入數據
        writerStream.write(outputdata, 'binary');

        // 標記文件末尾
        writerStream.end();

        // 處理 Stream 事件 --> finish, error
        // 複製完成
        writerStream.on('finish', function () {
            resolve('success_write_stream')
        });

        writerStream.on('error', function (err) {
            reject('fail');
        });
    })
}

function addJson(fileObj) {
    fs.readFile(process.env.fileRecord, function (err, data) {
        // 將二進位制的資料轉換為字串
        let allFileData = data.toString();

        // 將字串轉換為json物件
        allFileData = JSON.parse(allFileData);

        // 將傳來的物件加進陣列物件中
        allFileData = allFileData.concat(fileObj);

        // 因為 node.js 的寫入檔案格式限制字串或者二進位制數，所以把json物件轉換成字串重新寫入json檔案中
        commonService.writeJson(process.env.fileRecord, JSON.stringify(allFileData));
    })
}

function checkFileRepeat(allFileData, hashCode) {
    const repeatData = allFileData.find((fileData) => {
        return fileData.hashCode === hashCode;
    });

    return repeatData;
}

function deleteJson(files) {
    let allFileData = commonService.loadFile(process.env.fileRecord);

    files.forEach(fileName => {
        allFileData = allFileData.filter((element) => {
            return element.fileName !== fileName.split('.')[0];
        });
    });

    commonService.writeJson(process.env.fileRecord, JSON.stringify(allFileData));
}

function deleteFile(filePath) {
    fs.rm(filePath, function (err) { });
}

function renameFile(oldName, newName) {
    fs.rename(oldName, newName, function (err) { });
}

module.exports = fileService
