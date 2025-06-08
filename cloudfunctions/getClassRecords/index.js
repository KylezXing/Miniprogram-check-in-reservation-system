const cloud = require('wx-server-sdk');
// 明确初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
    const { cardid } = event
    const db = cloud.database()
    
    try {
      // 查询userinfo集合
      const userRes = await db.collection('userinfo')
        .where({ cardid: cardid })
        .get()
      
      if (userRes.data.length === 0) {
        return { code: 404, message: '用户不存在' }
      }
      
      const user = userRes.data[0]
      if (user.remain_classes <= 0) {
        return { code: 400, message: '剩余课时不足' }
      }
      
      // 添加记录到class_records
      await db.collection('class_records').add({
        data: {
          openid: user.openid,
          cardid: cardid,
          create_time: db.serverDate()
        }
      })
      
      // 更新剩余课时
      await db.collection('userinfo')
        .doc(user._id)
        .update({
          data: {
            remain_classes: db.command.inc(-1)
          }
        })
      
      return { code: 200, message: '操作成功' }
      
    } catch (err) {
      return { code: 500, message: err.message }
    }
  }
  
