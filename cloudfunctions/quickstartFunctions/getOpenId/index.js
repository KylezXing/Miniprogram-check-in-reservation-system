
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const unionid = wxContext.UNIONID
  
  // 检查用户是否已存在
  const res = await db.collection('userinfo').where({ openid }).get()
  
  if (res.data.length === 0) {
    // 新用户，创建记录
    await db.collection('userinfo').add({
      data: {
        openid,
        unionid,
        phone: '',
        name: '',
        remainClasses: 0,
        createTime: db.serverDate()
      }
    })
    return { openid, unionid, isNewUser: true }
  } else {
    // 老用户，返回现有数据
    return { 
      ...res.data[0],
      isNewUser: false 
    }
  }
}
