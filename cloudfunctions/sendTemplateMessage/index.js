const cloud = require('wx-server-sdk');
// 明确初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });


exports.main = async (event, context) => {
  try {
    const { openid, templateId, data, page } = event
    
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: templateId,
      page: page,
      data: data,
    })
    
    return result
  } catch (err) {
    console.error(err)
    return err
  }
}