import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    isLoading: true,
    appointments: [],
    deletingId: null,
    confirmShow: false
  },

  // 生命周期加载数据
  onLoad() {
    this.loadAppointments();
  },

  // 加载预约记录
  async loadAppointments() {
    const that = this;
    
    // 显示加载状态
    this.setData({ isLoading: true });
  
    // 获取用户 openid
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then(openidRes => {
      const openid = openidRes.result.openid;
      
      // 调用查询预约记录的云函数
      return wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'selectRecord',
          collection: 'appointments',
          condition: { _openid: openid }
        }
      });
    }).then(res => {
      console.log('云函数返回数据:', res.result.data);
   // 筛选有效预约（带容错处理）
   const filteredData = res.result.data.filter(item => {
    try {
      // 解析日期字符串（例如："5/9 周五"）
      const [monthDay] = item.date.split(' ');
      const [month, day] = monthDay.split('/').map(Number);
      
      // 解析时间字符串（例如："16:00"）
      const [hours, minutes] = item.time.split(':').map(Number);
  
      // 构建预约时间（假设为当前年）
      const appointmentDate = new Date();
      appointmentDate.setFullYear(new Date().getFullYear(), month - 1, day);
      appointmentDate.setHours(hours, minutes, 0, 0);
  
      // 获取当前时间（含用户时区）
      const now = new Date();
  
      // 比较时间（预约时间在当前之后）
      return appointmentDate;
    } catch (e) {
      console.error('时间解析失败:', item.date, item.time);
      return false;
    }
  });

    this.setData({
        appointments: filteredData,
        isLoading: false
    });
    }).catch(err => {  // 补全 catch 逻辑
    console.error('加载失败:', err);
    this.setData({ isLoading: false });
    wx.showToast({ title: '数据加载失败', icon: 'none' });
    });
    },

  // 删除点击事件
  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ deletingId: id,
        confirmShow : true});
    
  },

  // 确认删除
  async onDeleteConfirm() {
    console.log('[DEBUG] 准备删除的ID:', this.data.deletingId)
    if (!this.data.deletingId) return;

    try {
      await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'deleteRecord',
          collection: 'appointments',
          id: this.data.deletingId
        }
      });

      // 前端即时更新
      const newData = this.data.appointments.filter(
        item => item._id !== this.data.deletingId
      );

      this.setData({ 
        appointments: newData,
        deletingId: null 
      });

      Toast.success('删除成功');
    } catch (error) {
      Toast.fail('删除失败');
      console.error('删除记录失败:', error);
    }
  }
});
