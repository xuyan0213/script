# 青龙 PTTime每日签到

#### 介绍
PTTime 每日签到

#### 使用说明
1. 使用`ql repo https://github.com/xuyan0213/script.git "pttime"`命令拉取任务,任务执行时间默认`2 0/6 * * *`如不合适请自行修改。
2. 环境变量中增加PTTIME_COOKIE变量，cookie自行获取，不会的话百度。
3. 多个cookie可以使用使用@或者\n分割。
4. 增加PTTIME_UID变量，就是你账号的UID。

#### 更新日志
2024-07-15
add：增加首次签到、总签到等级、连续签到等级信息展示。
update：优化请求PTTime签到接口方式，增加每日签到判断，如果已经签到，只会请求签到详情接口，不再重复签到。

问一下有需要自动补签功能的吗


#### 联系方式

![qrcode](https://github.com/user-attachments/assets/a1a9d618-290e-4608-9a93-c26034f1eab4)

