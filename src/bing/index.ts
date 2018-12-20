/**
 *
 * 爬取来自https://bing.ioliu.cn 的bing壁纸
 */
import fs from 'fs';
import * as R from 'ramda';
import { clearSpace, downloadFileTask } from 'src/utils';
import axios from 'axios';
import cheerio from 'cheerio';
import mkdirp from 'mkdirp-promise';
import config from './config';

// 配置请求函数
const ajax = axios.create({
  baseURL: config.url,
  timeout: 1000 * 10, // 请求限时
});

// 获取 html 选择器
async function getHtmlSelector(url: string): Promise<CheerioSelector> {
  const response = await ajax.get(url);
  // fs.writeFileSync(config.output + 'index.html', response.data);
  return cheerio.load(response.data, {
    normalizeWhitespace: true,
    decodeEntities: false,
  });
}

// 将页面的中的图片数据整合成 JSON
const getTaskJson = ($: CheerioSelector) => {
  const data: any[] = [];
  $('.item').each(function(index, element) {
    // @ts-ignore
    const $this = $(element);
    let title = $this.find('.description h3').text() || '';
    title = title.replace(/\(.*\)/g, '');
    title = clearSpace(title);
    const date = $this.find('.calendar').text();
    const item = {
      save: `${config.output}${date} ${title}.jpg`,
      download: $this.find('.options .download').attr('href'),
    };
    data.push(item);
  });
  return data;
};

// 下载视频分页的所有视频
async function spider() {
  await mkdirp(config.output);
  // 任务页面
  const pageList = Array.from(
    { length: config.maxPageNum },
    (item, index) => `${config.url}?p=${index + 1}`,
  );
  let taskList: any[] = [];
  // 页面中查找任务
  for (const url of pageList) {
    const $ = await getHtmlSelector(url);
    // 获取页面的列表
    taskList = taskList.concat(getTaskJson($));
  }
  const errorList = await downloadFileTask({ taskList, ajax });
  if (!R.isEmpty(errorList)) {
    fs.writeFileSync(`${config.errorFile}`, JSON.stringify(errorList));
    console.log('%d 条任务出错,请见 %s', errorList.length, config.errorFile);
  }
}
spider();
