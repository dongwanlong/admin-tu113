const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { clearDir, copy, rmDir } = require('../util');
const sql = require('../mysql');
const uuid = require('uuid/v1');
const moment = require('moment');
const tmpUpload = path.resolve(__dirname, "../public/upload");
const imgsPath = path.resolve(__dirname, "../public/imgs");
const MAXFILE = 2;

function getImgMap(){
    let files = fs.readdirSync(imgsPath);
    let dirs = files.filter(file=>!file.includes('.'));
    let map = "";

    if(dirs.length<=0){
        map = path.resolve(imgsPath, "./img1");
        fs.mkdirSync(map);
        return "img1";
    }
    
    map = path.resolve(imgsPath, "./img"+dirs.length);
    if(fs.existsSync(map)){
        let files = fs.readdirSync(map);
        if(files.length>MAXFILE){
            map = path.resolve(imgsPath, "./img"+(dirs.length+1));
            fs.mkdirSync(map);
            return `img${dirs.length+1}`;
        }

        return `img${dirs.length}`;
    }

    throw Error("文件路径异常");
}

//编辑图组
module.exports.editImg = function (req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let sourceId = req.body.sourceId;  
    let map = req.body.map;
    let type = req.body.type.join('-');
    let size = req.body.imgs.length;  
    let lastTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');  

    //图片入库
    let files = fs.readdirSync(tmpUpload);
    files = files.sort();
    let distDir = path.resolve(imgsPath, `./${map}/${id}`);
    clearDir(distDir);
    for(var i=1;i<=files.length;++i){
        let name = files[i-1].split('.')[0];
        let ext = files[i-1].split('.')[1];
        let src = path.resolve(tmpUpload, `./${files[i-1]}`);
        let dist = path.resolve(distDir, `./${i}.${ext}`);
        copy(src, dist);
    }
    clearDir(tmpUpload);

    sql.exec(`select * from sources where _id='${sourceId}'`).then(val=>{
        return val.vals[0]._name;
    }).then(sourceName=>{
        let sqls = `update imgs set 
        _name='${name}',
        _sourceId='${sourceId}',
        _sourceName='${sourceName}',
        _size='${size}',
        _type='${type}',
        _lastTime='${lastTime}'
        where _id='${id}'`;

        return sql.exec(sqls);

    }).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500,msg:err});
    });
}

//上传图组
module.exports.addImg = function (req, res) {
    var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    //数据入库
    let id = uuid();
    let name = req.body.name;  
    let map = getImgMap();
    let sourceId = req.body.sourceId;       
    let type = req.body.type.join('-');
    let size = req.body.imgs.length;  
    let createTime = time;
    let lastTime = time;  

    //图片入库
    let files = fs.readdirSync(tmpUpload);
    files = files.sort();
    let distDir = path.resolve(imgsPath, `./${map}/${id}`);
    fs.mkdirSync(distDir);
    for(var i=1;i<=files.length;++i){
        let name = files[i-1].split('.')[0];
        let ext = files[i-1].split('.')[1];
        let src = path.resolve(tmpUpload, `./${files[i-1]}`);
        let dist = path.resolve(distDir, `./${i}.${ext}`);
        copy(src, dist);
    }
    clearDir(tmpUpload);
    
    sql.exec(`select * from sources where _id='${sourceId}'`).then(val=>{
        return val.vals[0]._name;
    }).then(sourceName=>{
        let sqls = `insert into imgs values(
            '${id}',
            '${name}',
            '${map}',
            '${sourceId}',
            '${sourceName}',
            '${type}',
            ${size},
            '${createTime}',
            '${lastTime}'
        )`;

        return sql.exec(sqls);

    }).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500,msg:err});
    });

}

//删除单个作品
module.exports.rmImg = function (req, res) {
    let id = req.body.id;
    let map = req.body.map;
    let sqls = `delete from imgs where _id='${id}'`;

    //删除图片
    let distDir = path.resolve(imgsPath, `./${map}/${id}`);
    rmDir(distDir);

    sql.exec(sqls).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500, msg:err});
    });
}


//查询单个作品
module.exports.getImg = function (req, res) {
    let id = req.body.id;
    let map = req.body.map;
    let sqls = `select * from imgs where _id='${id}'`;

    
    //图片拷贝到临时缓存
    clearDir(tmpUpload);
    let srcDir = path.resolve(imgsPath, `./${map}/${id}`);

    let files = fs.readdirSync(srcDir);
    for(let file of files){
        let distPath = path.resolve(tmpUpload, `./${file}`);
        let srcPath = path.resolve(srcDir, `./${file}`);
        copy(srcPath, distPath);
    }

    sql.exec(sqls).then(val=>{
        let resObj = {
            ...val.vals[0],
            _imgs:files,
        }
        res.send({
            code:200,
            data:resObj,
        });
    }).catch(err=>{
        res.send({
            code:500,
            msg:err,
        });
    });
}

//查询作品列表
module.exports.getImgs = function (req, res) {
    let {
        srh,
        createTime,
        lastTime,
        type,
        curPage,
        pageSize,
    } = req.body;

    let sqlSrh = srh?` (_id='${srh}' or _name='${srh}' or _sourceId='${srh}' or _sourceName='${srh}') `:"";
    let sqlType = type?" _type like '%"+type.join("%")+"%' ":"";

    if(createTime){
        var createTimeStart = moment(createTime[0]).format('YYYY-MM-DD HH:mm:ss');
        var createTimeEnd = moment(createTime[1]).format('YYYY-MM-DD HH:mm:ss');
        var sqlCreateTime = ` _createTime between '${createTimeStart}' and '${createTimeEnd}}' `;
    }else{
         sqlCreateTime = "";
    }

    if(lastTime){
        var lastTimeStart = moment(lastTime[0]).format('YYYY-MM-DD HH:mm:ss');
        var lastTimeEnd = moment(lastTime[1]).format('YYYY-MM-DD HH:mm:ss');
        var sqllastTime = ` _lastTime between '${lastTimeStart}' and '${lastTimeEnd}}' `;
    }else{
        sqllastTime = "";
    }

    var sqlArr = [];
    if(sqlSrh)sqlArr.push(sqlSrh);
    if(sqlType)sqlArr.push(sqlType);
    if(sqlCreateTime)sqlArr.push(sqlCreateTime);
    if(sqllastTime)sqlArr.push(sqllastTime);


    if(sqlArr.length==0){
        var sqlWhere = "";
    }else{
        var sqlWhere = " where" + sqlArr.join(" and ");
    }

    let sqls = `
        select * from imgs ${sqlWhere} order by _createTime desc limit ${curPage*pageSize},${pageSize}
    `;  
    
    sql.exec(sqls).then(val=>{
        sql.exec(`select count(*) from imgs ${sqlWhere}`).then(all=>{
            res.send({
                code:200,
                data:val.vals,
                total:all.vals[0]['count(*)'],
            });
        });
    }).catch(err=>{
        res.send({
            code:500,
            msg:err,
        });
    });
}

