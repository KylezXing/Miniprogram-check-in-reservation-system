Page({
    data: {
      isLoggedIn: false,
      phoneNumber: ''
    },
  
    onGetPhoneNumber(e) {
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        // 获取微信登录凭证 code
        wx.login({
          success: (res) => {
            const code = res.code;
            // 将 code、加密数据发送到服务器解密
            wx.request({
              url: 'https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=ACCESS_TOKEN',
              method: 'POST',
              data: {
                code: code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              success: (res) => {
                if (res.data.phone) {
                  this.setData({
                    isLoggedIn: true,
                    phoneNumber: res.data.phone
                  });
                }
              }
            });
          }
        });
      } else {
        // 用户拒绝授权
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    }
  });
  