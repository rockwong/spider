// 配置文件
export default {
  url: 'https://bing.ioliu.cn', // 目标 url
  maxPageNum: 1, // 抓取页码的数量
  output: './build/bing/', // 输出目录
  overwrite: false, // 是否覆盖已存在的文件
  errorFile: './build/.bingErrorLog.json', // 任务出错列表
};
