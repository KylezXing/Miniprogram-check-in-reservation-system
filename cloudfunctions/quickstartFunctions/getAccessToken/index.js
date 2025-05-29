const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  // 直接调用，无需关心缓存和续期
  const { access_token } = await cloud.openapi.getAccessToken(
    grant_type = "client_credential",
    appid = "wx322f2bce426c7ad2",
    secret = "1cc26202dae34ceba6fc0ab5877d4a01"
  )
  return { access_token }
}