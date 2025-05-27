Page({
    data: {
        // 功能页参数配置
        functionalPageParams: {
            type: 'userInfo', // 指定功能页类型
            direct: true      // 直接跳转不弹窗
        }
    },
    loginin() {
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: { type: 'getOpenId' }
        }).then(res => {
          console.log('云函数返回结果:', res.result); // 正确打印返回结果
          return res.result; // 如果需要继续链式调用可以返回
        }).catch(err => {
          console.error('调用云函数失败:', err); // 错误处理
        });
      },
})