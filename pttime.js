/*
 作者：xuyan
 日期：2023-12-19
 网站：PTTIME https://www.pttime.org/
 功能：签到
 变量：PTTIME_COOKIE
 cookie获取方法:浏览器中登录网站后按F12 找到cookie全部复制出来, 多个cookie可以使用@或者\n分割
*/
Env = require('./env')
const $ = new Env('PTTime');
const notify = $.isNode() ? require('./sendNotify') : '';
const {log} = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1，默认关闭通知
//////////////////////
let ck = process.env.PTTIME_COOKIE;
let ckArr = [];
let msg = '';
const URL = 'https://www.pttime.org/attendance.php?type=list'

const REFERER = 'https://www.pttime.org/index.php'

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
    return new Promise((resolve) => {
        let url = {
            url: URL,
            headers: {"user-agent":USER_AGENT,"Cookie":`${data}`,"referer":REFERER},
        }

        $.get(url, async (err, response, data) => {
            try {
                if (err) {
                    $.log('签到失败');
                    console.log('签到失败失败！！\n');
                    console.log(err);
                } else {
                    //从返回的html页面数据中查询]:和:字符中间的内容
                    let regex = /]\:(.*?)\[/;
                    let match = data.match(regex);
                    if (match && match[1]) {
                        moli = match[1]
                    } else {
                        moli = '000'
                    }
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
                    msg+= `\n⭐最后签到时间：${time}\n⭐今日魔力值：${todayMoli}\n⭐连续签到天数：${day}天\n⭐总魔力值：${moli}`;
                    // 签到成功，返回提示信息
                }
            } catch (e) {
                $.log(e)
            } finally {
                resolve();
            }
        }, timeout)
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
            var notify = require('./sendNotify');
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        log(message);
    }
}



/**
 * 修改配置文件
 */
function modify() {

    fs.readFile('/ql/data/config/config.sh','utf8',function(err,dataStr){
        if(err){
            return log('读取文件失败！'+err)
        }
        else {
            var result = dataStr.replace(/regular/g,string);
            fs.writeFile('/ql/data/config/config.sh', result, 'utf8', function (err) {
                if (err) {return log(err);}
            });
        }
    })
}
