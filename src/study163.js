/**
 * 爬取网易云课堂课程数据（通过接口抓取）
 * created by itellboy on 2018-4-28
 */

const fs = require('fs');
const axios = require('axios');

// 课程数据
let lessonData = [];
// 网易云课堂域名
let rootHost = 'http://study.163.com/';

// 继续抓取标志
let flag = true;
// 请求参数
let data = {
  activityId: 0,
  frontCategoryId: -1,
  orderType: 90,
  pageIndex: 1,
  pageSize: 50,
  priceType: -1,
  relativeOffset: 0,
  searchTimeType: -1,
}
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
  fs.writeFile('mock/study163.json', JSON.stringify(lesson, null, 2), (err) => {
    if (err) {
      throw err;
    }
    console.log('写入文件成功');
  });
}


async function getData() {
  console.log('正在获取第' + data.pageIndex + '页数据');
  return axios.post(rootHost + '/p/search/studycourse.json', data).then((resp) => {
    if (resp.data.result.list.length !== 0) {
      lessonData = lessonData.concat(resp.data.result.list.map((item) => {
        let tempItem = {
          title: item.productName,
          desc: item.description,
          href: rootHost + '/course/introduction/' + item.courseId + '.htm',
          provider: item.provider,
          teacher: item.lectorName,
          learnerCount: item.learnerCount,
          source: 'study163',
        }
        return tempItem;
      }));
    } else {
      flag = false;
    }
    console.log('第' + data.pageIndex + '页数据获取完毕');
    console.log('---')
  }).catch((e) => {
    console.log(e)
  })
}


(async function () {
  console.log('爬取开始...');
  let startTime = Date.now();
  while (flag) {
    await getData();
    data.pageIndex++;
  }
  await writeFile();

  console.log('爬取结束,用时: ' + (Date.now() - startTime) / 1000 + 's');
})()



