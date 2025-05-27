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
        onFinalConfirm() {
            Toast.success(`预约已确认：${this.data.finalDateTime}`);
            this.setData({ confirmShow: false });
            // 显示加载状态
            wx.showLoading({
                title: '提交中...',
            })

            // 获取用户OpenID
            const that = this;
            wx.showLoading({
                title: '处理中...',
                mask: true
            });

            wx.cloud.callFunction({
                name: 'quickstartFunctions',
                data: { type: 'getOpenId' }
            }).then(res => {
                // 获取用户唯一标识
                const openid = res.result.openid;

                // 构建预约数据对象
                const appointmentData = {
                    date: that.data.date,
                    time: that.data.selectedTime,
                    openid: openid,
                    createdAt: db.serverDate(),
                    bookStatus: 0     //0为已预约，1为已上课，2为已过期
                };

                // 检查是否存在重复预约
                return wx.cloud.callFunction({
                    name: 'quickstartFunctions',
                    data: {
                        type: 'selectRecord',
                        collection: 'appointments',
                        condition: {
                            openid: openid,
                            date: that.data.date,
                            time: that .data.selectedTime
                        }
                    }
                }).then(checkRes => {
                    // 如果存在已有预约，抛出特殊错误
                    if (checkRes.result.data.length > 0) {
                        throw { code: 'DUPLICATE', message: '该时段已有预约' };
                    }
                    return db.collection('appointments').add({
                        data: appointmentData
                    });
                });
            }).then(res => {
                wx.hideLoading();
                wx.showToast({
                    title: '预约成功',
                    icon: 'success'
                });
                that.setData({ confirmShow: false });
                console.log('写入成功，记录ID：', res._id);
            }).catch(err => {
                wx.hideLoading();

                if (err.code === 'DUPLICATE') {
                    // 处理重复预约的情况
                    wx.showToast({
                        title: err.message,
                        icon: 'none'
                    });
                } else {
                    // 其他错误处理
                    wx.showToast({
                        title: '提交失败',
                        icon: 'none'
                    });
                    console.error('操作失败：', err);
                }
            });
        },
        // 新增取消确认方法
        onCancelConfirm() {
            this.setData({
                confirmShow: false,
                showTimePicker: true // 返回时间选择器
            });
        },

        // 带星期的日期格式化
        formatDateWithWeekday(date) {
            const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
            return `${date.getMonth() + 1}/${date.getDate()} 周${weekdays[date.getDay()]}`;
        },

        // 关闭时间选择
        onPickerClose() {
            this.setData({ showTimePicker: false });
        },

        // // cloudfunctions/getOpenId/index.js(云函数)
        // getOpenId() {
        // exports.main = async (event, context) => {
        //   const wxContext = cloud.getWXContext()

        //   return {
        //     OPENID: wxContext.OPENID, // 官方文档指定的大写字段名
        //     APPID: wxContext.APPID,
        //     UNIONID: wxContext.UNIONID
        //   }
        // }
        // },
        // 点击预约记录按钮
        jumpToAppointment() {
            wx.navigateTo({
                url: '/pages/appointment/index'
            })
        },
        // // 加载预约数据
        // loadAppointments() {
        //     const that = this;

        //     // 显示加载状态
        //     this.setData({ isLoading: true });

        //     // 获取用户 openid
        //     wx.cloud.callFunction({
        //       name: 'quickstartFunctions',
        //       data: {
        //         type: 'getOpenId'
        //       }
        //     }).then(openidRes => {
        //       const openid = openidRes.result.openid;

        //       // 调用查询预约记录的云函数
        //       return wx.cloud.callFunction({
        //         name: 'quickstartFunctions',
        //         data: {
        //           type: 'selectRecord',
        //           collection: 'appointments',
        //           condition: { _openid: openid }
        //         }
        //       });
        //     }).then(res => {
        //       console.log('云函数返回数据:', res.result.data);

        //       // 筛选有效预约（带容错处理）
        //       const filteredData = res.result.data.filter(item => {
        //         try {
        //           // 解析日期字符串（例如："5/9 周五"）
        //           const [monthDay] = item.date.split(' ');
        //           const [month, day] = monthDay.split('/').map(Number);

        //           // 解析时间字符串（例如："16:00"）
        //           const [hours, minutes] = item.time.split(':').map(Number);

        //           // 构建预约时间（假设为当前年）
        //           const appointmentDate = new Date();
        //           appointmentDate.setFullYear(new Date().getFullYear(), month - 1, day);
        //           appointmentDate.setHours(hours, minutes, 0, 0);

        //           // 获取当前时间（含用户时区）
        //           const now = new Date();

        //           // 比较时间（预约时间在当前之后）
        //           return appointmentDate > now;
        //         } catch (e) {
        //           console.error('时间解析失败:', item.date, item.time);
        //           return false;
        //         }
        //       });

        //       this.setData({
        //         appointments: filteredData,
        //         isLoading: false
        //       });
        //     }).catch(err => {  // 补全 catch 逻辑
        //       console.error('加载失败:', err);
        //       this.setData({ isLoading: false });
        //       wx.showToast({ title: '数据加载失败', icon: 'none' });
        //     });
        //   },  
    });
