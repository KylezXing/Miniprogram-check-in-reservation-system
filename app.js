// app.js
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        // const cloud = require('wx-server-sdk')
        const { init } = require("@cloudbase/wx-cloud-client-sdk");

        // 指定云开发环境 ID
        wx.cloud.init({
            env: 'cloud1-3gp2mmdt4d6dbac7'
        })

        const client = init(wx.cloud)
        const models = client.models

        // const db = wx.cloud.database()
        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
    },
    globalData: {
        userInfo: null
    }
})

