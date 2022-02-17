const fs = require('fs');

const commonService = {
    loadFile: (fileResource) => {
        let fileBuffer = fs.readFileSync(fileResource);

        let data = fileBuffer.toString();

        return JSON.parse(data);
    },
    /* 
    將 json 寫入 .json 檔 

    fileResource：欲寫入的檔案
    dataWrite：寫入內容
    */
    writeJson: (fileResource, dataWrite) => {
        fs.writeFile(fileResource, dataWrite, function (err) {
            if (err) {
                throw err;
            }
        });
    }
}

module.exports = commonService;