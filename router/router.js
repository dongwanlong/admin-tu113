const express = require('express');
const router = express.Router();
const { addImg, getImgs, getImg, rmImg, editImg } = require('./img');
const { addSource, getSources, getSource, editSource, rmSource } = require('./source');
const { upload, uploadRm, uploadClear } = require('./upload');

router.post("/upload-clear", uploadClear);      //清除上传图片缓存
router.post("/upload", upload);                 //上传单个上传图片
router.post("/upload-rm", uploadRm);            //删除单个上传图片
router.post("/add-img", addImg);                //添加图组
router.post("/edit-img", editImg);              //编辑单个图组
router.post("/add-source", addSource);          //添加作品
router.post("/edit-source", editSource);        //编辑作品
router.post("/sources", getSources);            //获取作品列表
router.post("/source", getSource);              //获取单个作品列表
router.post("/source-rm", rmSource);            //删除单个作品
router.post("/imgs", getImgs);                  //获取图组列表
router.post("/img", getImg);                    //获取单个图组
router.post("/img-rm", rmImg);                  //删除单个图组




module.exports = router;