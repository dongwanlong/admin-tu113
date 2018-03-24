"use strict";
var mysql=require("mysql");
var fs = require('fs');
var os = require('os');
var config = JSON.parse(fs.readFileSync('./config.json'));
var mysqlConfig = {};

if(os.platform().indexOf("win")==-1){
    mysqlConfig = config.mysql;
}else{
    mysqlConfig = config.mysqlTest;
}

var pool = mysql.createPool({
    host     : mysqlConfig.ip,
    user     : mysqlConfig.user,
    password : mysqlConfig.password,
    database : mysqlConfig.db
});

module.exports.exec = function(sql){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                conn.query(sql,function(qerr,vals,fields){
                    conn.release();
                    if(qerr)console.log("MYSQL查询错误", qerr);
                    resolve({resolve, reject,qerr,vals,fields});
                });
            }
        });
    });
};