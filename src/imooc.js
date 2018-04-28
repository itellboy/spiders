/**
 * 爬取慕课网免费课程数据（静态页面抓取）
 * created by itellboy on 2018-4-25
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 慕课网域名
const rootHost = 'https://www.imooc.com';
// 课程数据
let lessonData = [];
// 页数
let page = 1;

/**
 * 写入文件
 */
function writeFile() {
  let lesson = {
    length: lessonData.length,
    data: lessonData
  }
  let exists = fs.existsSync('mock');
  if (!exists) {
    fs.mkdirSync('mock');
  }
  fs.writeFile('mock/imooc.json', JSON.stringify(lesson, null, 2), (err) => {
    if (err) {
      throw err;
    }
    console.log('写入文件成功');
  });
}

/**
 * 抓取页面
 * @param {待抓取url} url 
 */
function getHtml(url) {
  console.log('开始抓取第' + page + '页...');
  axios.get(url).then((resp) => {
    let $ = cheerio.load(resp.data);

    Array.from($('.course-card-container')).forEach(item => {
      let tags = [];
      Array.from($(item).find('.course-label label')).forEach((labelItem) => {
        tags.push($(labelItem).text());
      });
      lessonData.push({
        title: $(item).find('h3').text(),
        desc: $(item).find('.course-card-desc').text(),
        href: rootHost + $(item).find('.course-card').attr('href'),
        tags: tags,
        level: $(item).find('.course-card-info span').first().text(),
        number: $($(item).find('.course-card-info span').first()).next().text()
      })
    })
    getHtml(rootHost + '/course/list?page=' + (++page));
  }).catch((e) => {
    console.log('爬取结束');
    writeFile();
  })
}

// 执行函数
getHtml(rootHost + '/course/list?page=' + page);