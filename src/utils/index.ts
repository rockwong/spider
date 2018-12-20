import fs from 'fs';
import mkdirp from 'mkdirp-promise';
import path from 'path';
import { AxiosInstance } from 'axios';

/**
 * 去掉字符串头尾的空格，连续的多个空格变为一个空格
 * @param str
 * @returns {string}
 */
export const clearSpace = (str: string) =>
  str
    .replace(/&nbsp;/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*/, '')
    .replace(/\s*$/, '');

/**
 *
 * @param duration
 * @returns {Promise<any>}
 */
export function sleep(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export interface ITaskItem {
  save: string;
  download: string;
  error?: string;
}
interface DownloadFileTaskParams {
  taskList: ITaskItem[];
  ajax: AxiosInstance;
  overwriteExists?: boolean; // 是否覆盖文件
}

/**
 * 根据下载列表，批量下载
 * @param params
 */

export async function downloadFileTask(params: DownloadFileTaskParams) {
  const { taskList, overwriteExists = true, ajax } = params;
  // 获取章节主题和视频链接
  const errorList: any[] = [];
  for (const [index, item] of taskList.entries()) {
    const pathStr = item.save;
    // 是否覆盖文件
    if (!overwriteExists) {
      // 文件已存在，跳过任务
      if (fs.existsSync(pathStr)) {
        console.log(' "%s" 已存在，跳过本次任务', item.save);
        continue;
      } else {
        // 如果目录不存在则创建目录
        console.log('pathStr==', pathStr);
        const pathParams = path.parse(pathStr);
        if (!fs.existsSync(pathParams.dir)) await mkdirp(pathParams.dir);
      }
    }

    // 开始下载
    const encodeUrl = encodeURI(item.download);
    const res = await ajax
      .get(encodeUrl, { responseType: 'stream', timeout: 30 * 60 * 1000 }) // 下载限时 30 分钟
      .catch(error => {
        console.log(
          '%s 下载出错  %s %d',
          encodeUrl,
          error.response.statusText,
          error.response.status,
        );
        errorList.push({
          ...item,
          error: `${error.response.status} ${error.response.statusText} `,
        });
      });
    if (res && res.data) {
      res.data.pipe(fs.createWriteStream(pathStr));
      console.log(`${index + 1}/${taskList.length} "${pathStr} "下载中`);
    }
    // await sleep(3000);
  }
  console.log('所有任务下载完成');
  return errorList;
}
