/**
 * 爬取慕课网免费课程数据
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
let page = 35;
/**
 * 抓取html页面
 * @param {页面url} url 
 */
function getHtml(url) {
  console.log('开始抓取第' + page + '页...');
  axios.get(url).then((resp) => {
    let $ = cheerio.load(resp.data);

    Array.from($('.course-card-container')).forEach(item => {
      lessonData.push({
        title: $(item).find('h3').text(),
        desc: $(item).find('.course-card-desc').text(),
        href: rootHost + $(item).find('.course-card').attr('href')
      })
    })

    getHtml(rootHost + '/course/list?page=' + (++page));
  }).catch((e) => {
    fs.exists('tmp', (exists) => {
      exists ? '' : fs.mkdirSync('tmp');
      fs.writeFile('tmp/imooc.json', JSON.stringify(lessonData, null, 2), (err) => {
        if (err) {
          throw err;
        }
        console.log('获取成功')
      });
    })
  })
}

getHtml(rootHost + '/course/list?page=' + page);