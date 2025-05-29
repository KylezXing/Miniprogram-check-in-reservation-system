const cloud = require('wx-server-sdk')
cloud.init()

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