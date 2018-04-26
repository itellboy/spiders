/**
 * 慕课网免费课程数据
 * created by itellboy on 2018-4-25
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 慕课网域名
const rootHost = 'https://www.imooc.com/';
let $ = {};

let lessonData = [];

/**
 * 
 * @param {页面url} url 
 */
function getHtml(url) {
  axios.get(url).then((resp) => {
    $ = cheerio.load(resp.data);

    Array.from($('.course-card-container')).forEach(item => {
      lessonData.push({
        title: $(item).find('h3').text(),
        href: rootHost + $(item).find('.course-card').attr('href')
      })
    })

    fs.writeFile('tmp/test.json', JSON.stringify(lessonData, null, 2), (err) => {
      if(err){
        throw err;
      }
      console.log('获取成功')
    })

    // Array.from($('.page a')).forEach((item) => {
    //   console.log($(item).text())
    // })
  }).catch((e) => {
    console.log(e);
  })
}

getHtml(rootHost + 'course/list');