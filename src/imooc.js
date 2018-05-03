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
// 爬取结束标志
let flag = true;

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
 */
function getHtml() {
  console.log('开始抓取第' + page + '页...');
  return axios.get(rootHost + '/course/list?page=' + page).then((resp) => {
    let $ = cheerio.load(resp.data);
    Array.from($('.course-card-container')).forEach(item => {
      let tags = [];
      Array.from($(item).find('.course-label label')).forEach((labelItem) => {
        tags.push($(labelItem).text());
      });
      lessonData.push({
        title: $(item).find('h3').text().trim(),
        desc: $(item).find('.course-card-desc').text().trim(),
        href: rootHost + $(item).find('.course-card').attr('href').trim(),
        tags: tags,
        level: $(item).find('.course-card-info span').first().text().trim(),
        number: $($(item).find('.course-card-info span').first()).next().text().trim(),
        source: 'imooc',
      })
    });
    console.log('第' + page + '页数据获取完毕');
    console.log('--')
  }).catch((e) => {
    flag = false;
  })
}

// 执行函数
(async function () {
  console.log('爬取开始...')
  let startTime = Date.now();
  while (flag) {
    await getHtml();
    page++;
  }
  await writeFile();
  console.log('爬取结束,用时: ' + (Date.now() - startTime) / 1000 + 's');
})()