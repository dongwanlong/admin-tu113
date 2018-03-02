const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { clearDir, copy, rmDir } = require('../util');
const sql = require('../mysql');
const uuid = require('uuid/v1');
const moment = require('moment');
const tmpUpload = path.resolve(__dirname, "../public/upload");
const imgsPath = path.resolve(__dirname, "../public/imgs");
const sourcesPath = path.resolve(__dirname, "../public/sources");


//修改作品
module.exports.editSource = function (req, res) {

    //作品数据格式 
    let id = req.body.id;
    let name = req.body.name; 
    let author = req.body.author; 
    let startYear = req.body.startYear;
    let endYear = req.body.endYear;
    let type = req.body.type.join('-');
    let desc = req.body.desc;
    let oneWord = req.body.oneWord; 
    let lastTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');; 

    let sqls = `update sources set 
    _name='${name}',
    _author='${author}',
    _startYear=${startYear},
    _endYear=${endYear},
    _type='${type}',
    _oneWord='${oneWord}',
    _lastTime='${lastTime}',
    _desc='${desc}'
    where _id='${id}'`;

    //图片入库
    let files = fs.readdirSync(tmpUpload);
    let distDir = path.resolve(sourcesPath, `./${id}`);
    let src = path.resolve(tmpUpload, `./${files[0]}`);
    let dist = path.resolve(distDir, `./${files[0]}`);
    clearDir(distDir);
    copy(src, dist);

    clearDir(tmpUpload);

    sql.exec(sqls).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500, msg:err});
    });
}

//上传作品
module.exports.addSource = function (req, res) {
    var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    //作品数据格式 
    let id = uuid();
    let name = req.body.name; 
    let author = req.body.author; 
    let startYear = req.body.startYear;
    let endYear = req.body.endYear;
    let type = req.body.type.join('-');
    let desc = req.body.desc;
    let oneWord = req.body.oneWord; 
    let createTime = time;  
    let lastTime = time;  

    let sqls = `insert into sources values(
        '${id}',
        '${name}',
        '${author}',
        ${startYear},
        ${endYear},
        '${type}',
        '${desc}',
        '${oneWord}',
        '${createTime}',
        '${lastTime}'
    )`;

    //图片入库
    let files = fs.readdirSync(tmpUpload);
    let distDir = path.resolve(sourcesPath, `./${id}`);
    fs.mkdirSync(distDir);
    let src = path.resolve(tmpUpload, `./${files[0]}`);
    let dist = path.resolve(distDir, `./${files[0]}`);
    copy(src, dist);

    clearDir(tmpUpload);

    sql.exec(sqls).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500, msg:err});
    });
}

//删除单个作品
module.exports.rmSource = function (req, res) {
    let id = req.body.id;
    let sqls = `delete from sources where _id='${id}'`;

    let distDir = path.resolve(sourcesPath, `./${id}`);
    rmDir(distDir);

    sql.exec(sqls).then(()=>{
        res.send({code:200});
    })
    .catch(err=>{
        res.send({code:500, msg:err});
    });
}

//查询单个作品
module.exports.getSource = function (req, res) {
    let id = req.body.id;
    let sqls = `select * from sources where _id='${id}'`;

    
    //图片拷贝到临时缓存
    clearDir(tmpUpload);
    let distDir = path.resolve(sourcesPath, `./${id}`);
    let files = fs.readdirSync(distDir);
    let src = path.resolve(distDir, `./${files[0]}`);
    let dist = path.resolve(tmpUpload, `./${files[0]}`);
    copy(src, dist);


    sql.exec(sqls).then(val=>{
        let resObj = {
            ...val.vals[0],
            _faceImg:files[0],
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
module.exports.getSources = function (req, res) {
    let {
        srh,
        createTime,
        lastTime,
        type,
        curPage,
        pageSize,
    } = req.body;

    let sqlSrh = srh?` (_id='${srh}' or _name='${srh}' or _author='${srh}') `:"";
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
        select _id,_name,_author,_startYear,_endYear,_type,_createTime,_lastTime
        from sources ${sqlWhere} order by _createTime desc limit ${curPage*pageSize},${pageSize}
    `;    
    
    sql.exec(sqls).then(val=>{
        sql.exec(`select count(*) from sources ${sqlWhere}`).then(all=>{
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