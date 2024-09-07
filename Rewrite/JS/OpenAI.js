/**

Thanks to & modified from https://gist.githubusercontent.com/Hyseen/b06e911a41036ebc36acf04ddebe7b9a/raw/nf_check.js

For Quantumult-X 598+

[task-local]

event-interaction https://path-to-your-js, tag=OpenAI 查询, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png, enabled=true

GitHub: @tsosunchia
Copyright: MIT

**/
const policy_name = "OpenAI"
const STATUS_API_URL = 'https://ios.chat.openai.com/public-api/mobile/server_status/v1';
const TIMEOUT_MS = 3000;  // 设置超时时间，例如5000毫秒（5秒）

var output = "";
var opts = {
  policy: $environment.params
};

!(async () => {
  let result = {
    title: 'OpenAI API 状态检测',
    subtitle: output,
    content: '检测失败，请重试',
  }

  await Promise.race([test(), timeOut(TIMEOUT_MS)])
  .then((status) => {
    switch (status) {
      case 'normal':
        result['content'] = 'API 状态：正常 ✅';
        break;
      case 'unsupported_country':
      case 'cf_details':
        result['content'] = 'API 状态：异常 🚫';
        break;
      case 'timeout':
        result['content'] = '请求超时 ⏱️';
        break;
      default:
        result['content'] = '未知错误 ❓';
    }

    let content = "------------------------------" + "</br></br>" + result["content"]
    content = content + "</br></br>------------------------------</br>";
    content =`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + content + `</p>`
    $done({"title":"OpenAI API 状态检测","htmlMessage":content})
  })
})()
.finally(() => $done());

function test() {
  return new Promise((resolve, reject) => {
    let option = {
      url: STATUS_API_URL,
      opts: opts,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $task.fetch(option).then(response => {
      let data = JSON.parse(response.body);
      if (data.status === 'normal') {
        resolve('normal');
      } else if (data.error && data.error.error_type === 'unsupported_country') {
        resolve('unsupported_country');
      } else if (data.cf_details) {
        resolve('cf_details');
      } else {
        reject('Error');
      }
    }, () => {
      reject('Network Error');
    })
  })
}

function timeOut(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('timeout');
    }, ms);
  });
}