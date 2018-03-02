
const fs = require('fs');


//清空目录
function clearDir(dir){
    let files = fs.readdirSync(dir);
    for(let file of files){
        let name = dir + "/" + file;
        if(!file.includes(".")){
            rmFiles(name);
        }else{
            fs.unlinkSync(name);
        }
    }
}

//删除目录
function rmDir(dir){
    clearDir(dir);
    fs.rmdirSync(dir);
}

//文件拷贝 (适用于小文件)
function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

module.exports.clearDir = clearDir;
module.exports.rmDir = rmDir;
module.exports.copy = copy;