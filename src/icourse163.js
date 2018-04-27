/**
 * 爬取中国大学MOOC课程数据
 * created by itellboy on 2018-4-27
 */

const fs = require('fs');
const phantom = require('phantom');
const cheerio = require('cheerio');

let instance = {};
let page = {};

// 课程数据
let lessonData = [];
// 是否可以点击下一页
let flag = true;
let currentPage = 1;

/**
 * 初始化phantom
 */
async function phantomInit() {
  instance = await phantom.create();
  page = await instance.createPage();
  let status = await page.open('https://www.icourse163.org/category/all');
}

/**
 * 分析页面数据
 * @param {页面内容} content
 */
function analyzePage(content) {
  console.log('正在分析第' + currentPage + '页数据');
  let $ = cheerio.load(content);
  Array.from($('.m-course-list .u-clist')).forEach((item) => {
    lessonData.push({
      title: $(item).find('.u-course-name').text().trim(),
      desc: $(item).find('.p5.brief.f-ib.f-f0.f-cb').text().trim(),
      university: $(item).find('.t21.f-fc9').text().trim(),
      hot: $(item).find('.hot').text().trim(),
      time: $(item).find('.over .txt').text().trim(),
      person: $(item).find('.t21.f-fc9').next().text().trim(),
    })
  })
  console.log('第' + currentPage + '页数据分析完毕');
  console.log('---')
}

/**
 * 点击下一页
 */
async function goNextPage() {
  console.log('前往下一页');
  await page.evaluate(function () {
    var nextPageButton = document.querySelector('.ux-pager_btn.ux-pager_btn__next a');
    nextPageButton.click();
    return nextPageButton.classList.contains('z-dis');
  }).then(function (isClick) {
    flag = !isClick;
    currentPage++;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    })
  });
}

/**
 * 获取页面html
 */
async function getHtml() {
  while (flag) {
    let content = await page.property('content');
    await analyzePage(content);
    await goNextPage();
  }
  // 写入文件
  await writeFile();
}

/**
 * 将获取json数据写入文件
 */
function writeFile() {
  fs.writeFile('mock/icourse163.json', JSON.stringify(lessonData, null, 2), (err) => {
    if (err) {
      console.log('存储文件错误');
    }
    console.log('获取成功')
  });
}

/**
 * 自动执行
 */
(async function () {
  console.log('初始化..')
  await phantomInit();
  console.log('初始化完毕!')
  await getHtml();

  await instance.exit();
  console.log('程序结束')
}());