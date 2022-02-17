const commonService = require('../Services/common_service');

const tagService = {
    newTag: (fileFullName, tagName) => {
        let fileData = commonService.loadFile(process.env.fileRecord);
        let tagData = commonService.loadFile(process.env.tagRecord);
        let fileName = fileFullName.split('.')[0];

        fileData.forEach(element => {
            if (element.fileName === fileName) {
                const found = element.tag.find(data => data === tagName);

                if (!found) {
                    element.tag.push(tagName);
                    tagData.push(tagName);

                    // 刪除陣列重複值
                    tagData = Array.from(new Set(tagData));
                }
            }
        });

        commonService.writeJson(process.env.fileRecord, JSON.stringify(fileData));
        commonService.writeJson(process.env.tagRecord, JSON.stringify(tagData));

    },
    deleteTag: (fileFullName, tagName) => {
        let fileList = commonService.loadFile(process.env.fileRecord);
        let fileName = fileFullName.split('.')[0];

        // 取得檔案Index
        const fileIndex = fileList.findIndex(element => element.fileName === fileName);

        // 確認檔案存在於紀錄中
        if (fileIndex !== -1) {
            // 將欲刪除的標籤過濾
            const newTagArr = fileList[fileIndex].tag.filter(element => element !== tagName)

            // 將原本標籤陣列替換為過濾後的陣列
            fileList[fileIndex].tag = newTagArr

            commonService.writeJson(process.env.fileRecord, JSON.stringify(fileList));
        }
    }
}



module.exports = tagService;