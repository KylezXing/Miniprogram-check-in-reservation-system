const cloud = require('wx-server-sdk');
// 明确初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const axios = require('axios')
const db = cloud.database();
// 获取并缓存微信公众号access_token
async function getAccessToken(appid, secret) {
    try {
        // 从环境变量中获取appid和secret
    const appid = process.env.appid;
    const secret = process.env.secret;
    
    if (!appid || !secret) {
      throw new Error('APP_ID或APP_SECRET环境变量未配置');
    }
      // 1. 检查数据库是否有有效token
      const { data } = await db.collection('accesstoken')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get()
      
      const now = Date.now()
      if (data.length && (now - data[0].timestamp < 7200 * 1000)) {
        return data[0].access_token
      }
      
      // 2. 获取新token
      

      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
      const res = await axios.get(url)
      
      if (res.data.errcode) {
        throw new Error(res.data.errmsg)
      }
      
      // 3. 存储新token
      await db.collection('accesstoken').add({
        data: {
          access_token: res.data.access_token,
          timestamp: now,
          expires_in: res.data.expires_in
        }
      })
      
      return res.data.access_token
    } catch (err) {
      console.error('获取token失败:', err)
      throw err
    }
  }
  
  exports.main = async (event, context) => {
    try {
      const token = await getAccessToken(event.appid, event.secret)
      return { code: 0, data: token }
    } catch (err) {
      return { code: -1, message: err.message }
    }
  }