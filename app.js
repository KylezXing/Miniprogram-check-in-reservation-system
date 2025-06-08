// app.js
App({
    
  //配置全局变量（多页面使用）
  globalData: {
    // 登录信息
    userInfo: null,
    accesstoken: null
  },
    onLaunch: function () {
      if (!wx.cloud) {
        console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      } else {
        wx.cloud.init({
          // env 参数说明：
          //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
          //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
          //   如不填则使用默认环境（第一个创建的环境）
          env: "cloud1-8gld17xx486ff381",
          traceUser: true,
        });
      }
  
      this.globalData = {};
      this.getUserOpenId();
    //   this.getAccessToken()
    },

    // 示例：发送模板消息的云函数
    getUserOpenId() {
        wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'getOpenId' },
          success: res => {
            this.globalData.userInfo = res.result
            // 如果是老用户，直接使用返回的数据
            if (!res.result.isNewUser) {
              return
            }
            // 新用户初始化数据
            this.globalData.userInfo = {
              ...res.result,
              phone: '',
              name: '',
              remainClasses: 0
            }
          }
        })
      },
    //   getAccessToken() {
    //     wx.cloud.callFunction({
    //         name: 'getAccessToken',
    //       success: res => {
    //         console.log("获取成功")
    //         return
    //         }
    //     })
    //   }
  });
