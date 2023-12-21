/*
 作者：xuyan
 日期：2023-12-19
 网站：PTTIME https://www.pttime.org/
 功能：签到
 变量：PTTIME_COOKIE
 cookie获取方法:浏览器中登录网站后按F12 找到cookie全部复制出来, 多个cookie可以使用@或者\n分割
 cron "2 0/8 * * *" pttime.js
*/
Env = require('./env')
const axios = require('axios')

const $ = new Env('PTTime 每日签到');
const {log} = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1，默认关闭通知
//////////////////////
let ck = process.env.PTTIME_COOKIE;
let ckArr = [];
let msg = '';
// 签到地址
const URL = 'https://www.pttime.org/attendance.php?type=list'

// 伪造referer
const REFERER = 'https://www.pttime.org/index.php'

// 伪造user-agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'


!(async () => {

    if (!(await Envs()))
        return;
    else {

        log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
            new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
            8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);

        log(`\n=================== 共找到 ${ckArr.length} 个账号 ===================`)

        for (let index = 0; index < ckArr.length; index++) {

            let num = index + 1
            log(`\n========= 开始【第 ${num} 个账号】=========\n`)
            data = ckArr[index];
            msg += `\n第${num}个账号运行结果：`
            log('开始签到');
            await doSign();
            await $.wait(2 * 1000);
        }
        await SendMsg(msg);
    }
})()
    .catch((e) => log(e))
    .finally(() => $.done())


/**
 * 签到
 */
function doSign(timeout = 3 * 1000) {
    let moli = ''
    return axios(URL, {
        method: 'get',
        headers: {
            'User-Agent': USER_AGENT,
            'Cookie': data,
            'Referer': REFERER
        },
        responseType: 'document'
    }).then(function (response) {
        let data = response.data.replace(/[\r\n]/g, '')
        if (data.indexOf('class="main"') > 0) {
            
            let regex = /使用\&说明<\/a>\]\:(.*?)\[/;
            let match = data.match(regex);
            if (match && match[1]) {
                moli = match[1]
            }
            //去掉<a>标签,只保留浮点数
            moli = moli.replace(/<a.*?>(.*?)<\/a>/g, '')
            $.log('总魔力值:' + moli)
            //查询第一次"时间"出现的位置,并截取后面19个字符
            let timeIndex = data.indexOf('时间：')
            let time = data.substring(timeIndex + 3, timeIndex + 22)
            if (time) {
            } else {
                time = '0000-00-00 00:00:00'
            }
            $.log('今日签到时间：' + time);
            // 查询获得魔力值：出现的位置, 并截取后面<b>标签内的内容
            const todayMoliString = data.substring(data.indexOf('获得魔力值：') + 6, data.indexOf('获得魔力值：') + 20);
            let todayMoli = todayMoliString.substring(todayMoliString.indexOf('<b>') + 3, todayMoliString.indexOf('</b>'));
            if (todayMoli) {
            } else {
                todayMoli = '000'
            }
            $.log('今日魔力值：' + todayMoli);
            // 查询连续天数：出现的位置
            const dayString = data.substring(data.indexOf('连续天数：') + 5, data.indexOf('连续天数：') + 20);
            //获取连续天数
            let day = dayString.substring(dayString.indexOf('<b>') + 3, dayString.indexOf('</b>'));
            if (day) {
            } else {
                day = '000'
            }
            $.log('连续签到天数：' + day);
            if(data.indexOf('今日签到成功') > 0) {
                msg += '\n⭐今日签到成功'
                msg += `\n⭐最后签到时间：${time}\n⭐签到魔力值：${todayMoli}\n⭐连续签到天数：${day}天\n⭐总魔力值：${moli}`;
            } else if(data.indexOf('签到中止') > 0) {
                msg += '\n⭐今日签到中止'
            } else {
                msg += '\n⭐今日签到完成'
                msg += `\n⭐最后签到时间：${time}\n⭐签到魔力值：${todayMoli}\n⭐连续签到天数：${day}天\n⭐总魔力值：${moli}`;
            }
        } else {
            $.log('签到失败');
            console.log('签到失败失败！！\n');
            msg += '\n 签到失败!'
        }
    })
}


// ============================================变量检查============================================ \\
async function Envs() {
    if (ck) {
        if (ck.indexOf("@") != -1) {
            ck.split("@").forEach((item) => {
                ck.push(item);
            });
        } else if (ck.indexOf("\n") != -1) {
            ck.split("\n").forEach((item) => {
                ckArr.push(item);
            });
        } else {
            ckArr.push(ck);
        }
    } else {
        log(`\n 【${$.name}】：未填写变量`)
        return;
    }

    return true;
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message)
        return;
    if (Notify > 0) {
        if ($.isNode()) {
            const notify = require('./sendNotify');
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        log(message);
    }
}
