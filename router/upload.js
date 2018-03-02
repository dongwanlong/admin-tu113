const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { clearDir } = require('../util');

const tmpUpload = path.resolve(__dirname, "../public/upload");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tmpUpload);
    },
    filename: function (req, file, cb) {
        let files = fs.readdirSync(tmpUpload);
        let time = new Date().getTime();
        let newName = `${time}.jpg`;
        cb(null, newName);
    }
});

const upload = multer({
    storage: storage,
});

const uploadFunc = upload.single('file');

//上传图片
module.exports.upload = function (req, res) {
    uploadFunc(req, res, function (err) {
        if(!err){
            res.send({
                code:200,
                name:req.file.filename,
            });
        }else{
            res.send({code:500});
        }
    });
}

//删除上传图片
module.exports.uploadRm = function (req, res) {
    const rmFile = path.resolve(tmpUpload, "./"+req.body.name);
    fs.unlinkSync(rmFile);
    res.send({code:200});
}

//清空上传图片缓存
module.exports.uploadClear = function (req, res) {
    clearDir(tmpUpload);
    res.send({code:200});
}
