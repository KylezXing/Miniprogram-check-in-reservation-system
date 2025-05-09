// pages/calendar/index.js
import Toast from '@vant/weapp/toast/toast';
const db = wx.cloud.database()
// const appointments = db.collection('appointments')
Page(
    {
    data: {
    date: "",        // 存储格式化后的日期（含星期）
    rawDate: null,   // 存储原始日期对象
    columns: [],     // 动态时间选项
    showCalendar: false,
    showTimePicker: false,
    confirmShow: false,      // 新增：控制确认弹窗
    finalDateTime: '',       // 新增：存储完整时间信息
    selectedTime: '',         // 新增：临时存储选择的时间
    // formatter: 'formatDay',
    showMondayAlert: false,
    minDate: new Date().getTime(), // 今天的时间戳
    maxDate: new Date().setDate(new Date().getDate() + 30), // 30天后时间戳
    showRecordPopup: false,  // 控制弹窗显示
    appointments: [],       // 预约数据
    isLoading: false,        // 加载状态
  },

  // 显示日历
  onDisplay() {
    this.setData({ showCalendar: true });
  },

  // 关闭日历
  onClose() {
    this.setData({ showCalendar: false });
  },

  // 日期确认
  onConfirm(event) {
    const rawDate = new Date(event.detail);
    const weekday = rawDate.getDay();
    
    // 周一判断逻辑
    if (weekday === 1) {
      this.setData({
        showCalendar: false,
        showMondayAlert: true  // 触发周一提示
      });
      return;  // 阻止后续执行
    }

    // 正常流程
    this.setData({
      rawDate: rawDate,
      date: this.formatDateWithWeekday(rawDate),
      showCalendar: false,
      showTimePicker: true
    });
    this.updateTimeOptions(rawDate);
  },

  // 新增周一提示确认方法
  onConfirmMonday() {
    this.setData({ showMondayAlert: false });
    // 自动重新打开日期选择
    setTimeout(() => {
      this.setData({ showCalendar: true });
    }, 300);
  },

  // 根据日期更新时间选项
  updateTimeOptions(date) {
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6; // 0=周日 6=周六
    const options = isWeekend 
      ? ["15:00", "16:00", "17:00"]
      : ["16:00", "17:00"];
    
    this.setData({ columns: options });
  },

  // 时间选择确认
  onTimeConfirm(event) {
    const selectedTime = event.detail.value;
    this.setData({
      selectedTime: selectedTime,
      showTimePicker: false, // 关闭时间选择器
      finalDateTime: `${this.data.date} ${selectedTime}`,
      confirmShow: true      // 显示二次确认弹窗
    });
  },
    // 新增最终确认方法
    // onFinalConfirm() {
    //     Toast.success(`预约已确认：${this.data.finalDateTime}`);
    //     this.setData({ confirmShow: false });
    //     },
    //     onFinalConfirm() {
    //         // 显示加载状态
    //         wx.showLoading({
    //           title: '提交中...',
    //         })
        
    //         // 获取用户OpenID
    //         const that = this;
    //         wx.cloud.callFunction({
    //           name: 'getOpenId'
    //         }).then(res => {
    //           // 构建数据对象
              
    //           const appointmentData = {
    //             date: that.data.date,          // 用户选择的日期
    //             time: that.data.selectedTime,  // 用户选择的时间
    //             openid: res.result.openid,     // 用户唯一标识
    //             createTime: db.serverDate()    // 服务器时间
    //           }
        
    //           // 写入数据库
    //           return db.collection('appointments').add({
    //             data: appointmentData
    //           })
    //         }).then(res => {
    //           wx.hideLoading()
    //           wx.showToast({
    //             title: '预约成功',
    //             icon: 'success'
    //           })
    //           that.setData({ confirmShow: false })
    //           console.log('写入成功，记录ID：', res._id)
    //         }).catch(err => {
    //           wx.hideLoading()
    //           wx.showToast({
    //             title: '提交失败',
    //             icon: 'none'
    //           })
    //           console.error('数据库写入失败：', err)
    //         })
    //       },
    //   // 新增取消确认方法
    //   onCancelConfirm() {
    //     this.setData({ 
    //       confirmShow: false,
    //       showTimePicker: true // 返回时间选择器
    //     });
    //   },

  // 带星期的日期格式化
  formatDateWithWeekday(date) {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getMonth() + 1}/${date.getDate()} 周${weekdays[date.getDay()]}`;
  },

  // 关闭时间选择
  onPickerClose() {
    this.setData({ showTimePicker: false });
  },
  
// cloudfunctions/getOpenId/index.js(云函数)
getOpenId() {
    const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 自动继承当前环境

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  return {
    OPENID: wxContext.OPENID, // 官方文档指定的大写字段名
    APPID: wxContext.APPID,
    UNIONID: wxContext.UNIONID
  }
}
},
  // 点击预约记录按钮
  onShowRecords() {
    this.setData({ showRecordPopup: true })
    this.loadAppointments()
  },
  // 加载预约数据
  async loadAppointments() {
    try {
      this.setData({ isLoading: true })
  
      // 调用云函数时显式指定环境
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId',
        config: { env: '你的环境ID' } // 替换实际环境ID
      }).catch(err => {
        console.error('[云函数] 调用失败详细日志:', {
          errCode: err.errCode,
          errMsg: err.errMsg,
          requestID: err.requestID
        })
        throw new Error('获取用户信息失败，请检查网络')
      })
  
      console.log('[调试] 云函数返回结果:', result)
  
      // 严格校验返回结构
      if (!result || typeof result !== 'object') {
        throw new Error('云函数返回格式异常')
      }
  
      const currentOpenid = result.OPENID // 注意大写
  
      if (!currentOpenid || currentOpenid.length !== 28) {
        console.error('[异常] 无效的OPENID:', currentOpenid)
        throw new Error('用户身份信息不合法')
      }
  
      // ...后续数据库查询代码...
  
    } catch (err) {
      console.error('[完整错误日志]', {
        message: err.message,
        stack: err.stack,
        time: new Date().toISOString()
      })
      wx.showToast({
        title: err.message,
        icon: 'none',
        duration: 3000
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },
});
