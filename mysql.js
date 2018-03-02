"use strict";
var mysql=require("mysql");
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.json'));


var pool = mysql.createPool({
    host     : config.mysql.ip,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.db
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