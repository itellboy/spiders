/**
 * 爬取中国大学MOOC课程数据（动态页面抓取）
 * created by itellboy on 2018-4-27
 */

const fs = require('fs');
const phantom = require('phantom');
const cheerio = require('cheerio');

// phantom 全局变量
let instance = {};
let page = {};

// 抓取网址
let rootHost = 'https://www.icourse163.org'

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
  let status = await page.open(rootHost + '/category/all');
}

/**
 * 分析页面数据
 * @param {页面内容} content
 */
function analyzePage(content) {
  let $ = cheerio.load(content);
  console.log('正在分析第' + currentPage + '页数据');
  Array.from($('.m-course-list .u-clist')).forEach((item) => {
    lessonData.push({
      title: $(item).find('.u-course-name').text().trim(),
      desc: $(item).find('.p5.brief.f-ib.f-f0.f-cb').text().trim() || $(item).find('.u-course-name').text().trim(),
      href: rootHost + $(item).attr('data-href'),
      university: $(item).find('.t21.f-fc9').text().trim(),
      hot: $(item).find('.hot').text().trim(),
      time: $(item).find('.over .txt').text().trim(),
      person: $(item).find('.t21.f-fc9').next().text().trim(),
      source: 'icourse163',
    })
  });
  console.log('第' + currentPage + '页数据分析完毕');
  console.log('---')

  // 如果当前页等于最后一页，终止爬取
  if ($('.ux-pager_itm a').last().text().trim() == $('.ux-pager_itm.z-crt').text().trim()) {
    flag = false;
    console.log('已到达最后一页')
  }
}

/**
 * 点击下一页
 */
async function goNextPage() {
  console.log('前往第 ' + (currentPage + 1) + '页');
  await page.evaluate(function () {
    var nextPageButton = document.querySelector('.ux-pager_btn.ux-pager_btn__next a');
    nextPageButton.click();
  }).then(() => {
    currentPage++;
    // 等数据加载完继续往下执行，暂定5秒
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
  let lesson = {
    length: lessonData.length,
    data: lessonData
  }
  let exists = fs.existsSync('mock');
  if (!exists) {
    fs.mkdirSync('mock');
  }
  fs.writeFile('mock/icourse163.json', JSON.stringify(lesson, null, 2), (err) => {
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
  let startTime = Date.now();
  console.log('初始化..')
  await phantomInit();
  console.log('初始化完毕!')
  await getHtml();

  await instance.exit();
  console.log('程序结束');
  console.log('爬取结束,用时: ' + (Date.now() - startTime) / 1000 + 's');
}());