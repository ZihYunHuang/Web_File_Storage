const tagService = require('../Services/tag_service');
const commonService = require('../Services/common_service');

const tagController = {
    newTag: (req, res) => {
        tagService.newTag(req.params.fileFullName, req.params.tagName);

        res.status(201).send({
            data: 'Add success.'
        });
    },
    getTagList: (req, res) => {
        const tagList = commonService.loadFile(process.env.tagRecord);

        res.status(200).send({
            data: tagList
        });
    },
    deleteTag: (req, res) => {
        tagService.deleteTag(req.params.fileFullName, req.params.tagName);

        res.status(200).send({
            data: 'Delete success.'
        });
    }
}

module.exports = tagController;