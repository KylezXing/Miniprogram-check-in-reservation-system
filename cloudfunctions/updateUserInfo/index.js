const cloud = require('wx-server-sdk');
// 明确初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const { name, phone } = event;
    console.log(OPENID)
    return await db.collection('userinfo').
      where ({  // 正确参数名
        openid: OPENID
      }).update({
        data: {
          name: event.name,
          phone: event.phone
        }
      });
  } catch (err) {
    console.error(err);
    return { code: 500, msg: "更新失败", error: err }
  }
};

