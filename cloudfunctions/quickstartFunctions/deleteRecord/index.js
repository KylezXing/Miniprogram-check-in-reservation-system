const cloud = require('wx-server-sdk');
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  const db = cloud.database();
// 云函数应执行物理删除（确保云函数是这样的完整代码）
exports.main = async (event) => {
    console.log('[CF] 收到删除请求:', event)
    const _ = db.command
  
    // 安全验证（确保只能删除自己的记录）
    const { OPENID } = cloud.getWXContext()
    const record = await db.collection('appointments')
      .doc(event.id)
      .field({ _openid: 1 })
      .get()
  
    if (!record.data || record.data._openid !== OPENID) {
      throw new Error('无权操作')
    }
  
    // 执行物理删除
    return db.collection('appointments').doc(event.id).remove()
  }
  