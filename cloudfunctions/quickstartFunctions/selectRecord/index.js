const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  // 返回数据库查询结果
  console.log('[CF] 收到查询请求:', event)
  const result = await db.collection('appointments').get()
  console.log('数据库查询结果:', result.data)
  return await db.collection('appointments').get();
};
