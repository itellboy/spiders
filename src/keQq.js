/**
 * 爬取腾讯课堂免费课程数据（静态页面抓取）
 * created by itellboy on 2018-4-25
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 腾讯课堂域名
const rootHost = 'https://ke.qq.com';
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
  fs.writeFile('mock/keQq.json', JSON.stringify(lesson, null, 2), (err) => {
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
    let lessonDomArr = Array.from($('.market-bd.market-bd-6.course-list.course-card-list-multi-wrap .course-card-item'));
    if (lessonDomArr.length == 0) {
      flag = false;
    }
    lessonDomArr.forEach(item => {
      lessonData.push({
        title: $(item).find('h4.item-tt a').text().trim(),
        href: rootHost + '/course/' + $(item).find('.item-img-link').attr('data-id'),
        desc: $(item).find('h4.item-tt a').text().trim(),
        status: $(item).find('.item-status .item-status-step').text().trim(),
        provider: $(item).find('.item-source a').text().trim(),
        price: $(item).find('.item-line.item-line--bottom .line-cell').text().trim(),
        number: parseInt($(item).find('.line-cell.item-user').text().trim()),
        source: 'keQq',
      })
      console.log('课程标题：' + $(item).find('h4.item-tt a').text().trim());
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