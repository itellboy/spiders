/**
 * 爬取网易云课堂课程数据（通过接口抓取）
 * created by itellboy on 2018-4-28
 */

const fs = require('fs');
const axios = require('axios');

// 课程数据
let lessonData = [];

/**
 * 写入文件
 */
function writeFile() {
  let exists = fs.existsSync('mock');
  if (!exists) {
    fs.mkdirSync('mock');
  }
  fs.writeFile('mock/study163.json', JSON.stringify(lessonData, null, 2), (err) => {
    if (err) {
      throw err;
    }
    console.log('写入文件成功');
  });
}