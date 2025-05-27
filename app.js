// app.js
App({
    
  //配置全局变量（多页面使用）
  globalData: {
    // 登录信息
    token: ''
  },

  checkLogin() {
 
    //全局变量或缓存中存在token，直接赋值，否则重新登录
    var token = this.globalData.token
    if (!token) {
      token = wx.getStorageSync('token')
      if (token) {
        this.globalData.token = token;
   
      } else {
        wx.showToast({
          title: '请先登录后再进行预约操作哦',
          icon: 'none'
        })
   
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }, 2000);
      }
    }
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
      this.checkLogin()
    },
  });
  