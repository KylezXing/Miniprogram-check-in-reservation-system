cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  try {
    const db = cloud.database()
    const result = await db.collection('rfid_records').add({
      data: {
        card_id: event.card_id,
        card_data: event.card_data,
        device_id: event.device_id,
        scan_time: new Date(event.scan_time * 1000),
        created_at: db.serverDate()
      }
    })
    
    return {
      code: 0,
      data: result,
      message: '写入成功'
    }
  } catch (err) {
    return {
      code: -1,
      error: err,
      message: '写入数据库失败'
    }
  }
}
