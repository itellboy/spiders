/**
 * 爬取学堂在线免费课程数据（静态页面抓取）
 * created by itellboy on 2018-4-25
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 学堂在线域名
const rootHost = 'http://www.xuetangx.com';
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
  fs.writeFile('mock/xuetangx.json', JSON.stringify(lesson, null, 2), (err) => {
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
  return axios.get(rootHost + '/courses?page=' + page).then((resp) => {
    let $ = cheerio.load(resp.data);
    let lessonDomArr = Array.from($('.courses_list_mode .list_mode_wrap .list_style').children());
    if (lessonDomArr.length == 0) {
      console.log('到最后一页')
      flag = false;
    }
    lessonDomArr.forEach(item => {
      lessonData.push({
        title: $(item).find('.coursetitle').text().trim(),
        href: rootHost + $(item).find('.img a').attr('href'),
        teacher: $(item).find('.teacher .name ul li span').first().text().trim(),
        university: $(item).find('.teacher .name ul li span').first().next().text().trim(),
        desc: $(item).find('.txt_all .txt').text().trim().replace(/简介|\n\t/gi, '') || $(item).find('.coursetitle').text().trim(),
        source: 'xuetangx',
      });
      console.log('课程标题： ' + $(item).find('.coursetitle').text().trim());
    });
    console.log('第' + page + '页数据获取完毕');
    console.log('--')
  }).catch((e) => {
    console.log(e)
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