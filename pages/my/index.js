Page({
    data: {
        phone: '',
        name: '',
        remainClasses: 0,
        changecontent: ''
    },

    onLoad() {
        this.getUserInfo();
    },

    getUserInfo() {
        const app = getApp();
        if (app.globalData.userInfo) {
            this.setData({
                phone: app.globalData.userInfo.phone,
                name: app.globalData.userInfo.name,
                remainClasses: app.globalData.userInfo.remainClasses
            });
        }
    },

    getPhoneNumber(e) {
        // 已绑定则直接返回
        if (this.data.phone) {
            wx.showToast({
                title: '已绑定手机号',
                icon: 'none'
            });
            return;
        }
        console.log(e.detail.code); // 动态令牌
        console.log(e.detail.errMsg); // 回调信息（成功失败都会返回）
        console.log(e.detail.errno); // 错误码（失败时返回）
    
        wx.cloud.callFunction({
            name: 'getPhoneNumber',
            data: {
                code: e.detail.code // 从获取手机号按钮事件中获取
            }
        })
        .then(res => {
            console.log('手机号信息：', res.result);
            const app = getApp();
            app.globalData.userInfo.phone = res.result.phoneInfo.phoneNumber;
            console.log('手机号信息：', res.result.phoneInfo.phoneNumber);
            
            // 更新 userinfo 的 phone 字段
            return wx.cloud.callFunction({
                name: 'updateUserInfo',
                data: {
                    name: this.data.name,
                    phone: res.result.phoneInfo.phoneNumber
                }
            });
        })
        .then(res => {
            console.log('更新成功：', res);
            wx.showToast({
                title: '绑定成功',
                icon: 'success'
            });
            this.onLoad();
        })
        .catch(err => {
            console.error('更新失败：', err);
        });
    },    
    
    editName() {
    wx.showModal({
        title: '修改姓名',
        content: '',
        editable: true,
        success: (res) => {
            if (res.confirm && res.content) {
                wx.cloud.callFunction({
                    name: 'updateUserInfo',
                    data: {
                        name: res.content,
                        phone: this.data.phone
                    },
                    success: (res) => {
                        // console.log(getApp().globalData.userInfo);
                        // console.log('更新结果:', res);
                        const app = getApp();
                        app.globalData.userInfo.name = res.content
                        this.onLoad();
                    },
                    fail: (err) => {
                        console.error('更新失败:', err);
                    }
                });
            }
        }
    });
}
  });
