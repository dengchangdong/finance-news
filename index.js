const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const { url } = require('./source.js');
const Feed = require('feed').Feed;
const fs = require('fs/promises');
const process = require('process');

const controller = new AbortController();

const timeout = setTimeout(
  () => { controller.abort(); },
  30000, // 30 秒后取消请求
);

const feed = new Feed({
  title: '新浪财经新闻',
  description: '新浪最新财经新闻100条',
  link: 'https://news.dengchangdong.com/',
  language: 'zh-CN',
  generator: 'Sina news feed generator',
  feedLinks: {
    json: 'https://news.dengchangdong.com/rss.json',
    rss: 'https://news.dengchangdong.com/rss.xml'
  },
});


const filterArr = [
  //'莱特币',
  //'瑞波币',
];

async function main() {

    const response = await fetch(url, {
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10130'},
      signal: controller.signal
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('wrong status code');
    }

    const json = await response.json();
    console.log(`Successfully fetch the feed.`);

    const result = json.result || {};
    if (!result.status || result.status.code !== 0) return;
    const items = result.data.feed.list;
    console.log(`Successfully parse the feed.`);

    items.forEach(item => {
      if (!item.rich_text) return;

      for (let i = 0; i < filterArr.length; i++) {
        if (item.rich_text.includes(filterArr[i])) return;
      }

      feed.addItem({
        title: item.rich_text,
        id: item.id,
        link: item.docurl,
        content: '',
        date: new Date(item.create_time + '+08:00'),
      });
    });
    console.log(`Successfully generating new feed.`);

    await fs.rmdir('./dist', { recursive: true });
    console.log(`Successfully deleted ./dist`);

    await fs.mkdir('./dist');
    console.log(`Successfully create ./dist`);

    await fs.writeFile('./dist/rss.json', feed.json1());
    console.log(`Successfully write rss.json`);

    await fs.writeFile('./dist/rss.xml', feed.rss2());
    console.log(`Successfully write rss.xml`);

    await fs.copyFile('./template/index.html', `./dist/index.html`);
    await fs.copyFile('./template/page.js', `./dist/page.js`);
    console.log(`Successfully copy asset files`);

}

main()
.catch(err => {
  console.log(err);
  process.exit(1);
})
.finally(() => {
  clearTimeout(timeout);
});


