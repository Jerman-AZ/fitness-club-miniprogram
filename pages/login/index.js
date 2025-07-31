const app = getApp()
const { commonApi } = require('../../utils/api')

Page({
  data: {
    phone: '',
    verifyCode: '',
    role: 'member',// 默认选中会员角色
    selectedRole: 'member', // 用于单选框绑定
    countdown: 0
  },

  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  handleVerifyCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },

  handleRoleChange(e) {
    this.setData({
      role: e.detail.value
    })
  },

  getVerifyCode() {
    // 简单验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    // 调用获取验证码接口
    commonApi.getVerifyCode(this.data.phone, this.data.role)
      .then(() => {
        wx.showToast({
          title: '验证码已发送',
          icon: 'none'
        })
        // 开始倒计时
        this.startCountdown()
      })
      .catch(err => {
        console.error('获取验证码失败', err)
      })
  },

  startCountdown() {
    this.setData({
      countdown: 60
    })
    
    const timer = setInterval(() => {
      this.setData({
        countdown: this.data.countdown - 1
      })
      
      if (this.data.countdown <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  },

  /*handleLogin() {
    // 调用登录接口
    commonApi.login({
      phone: this.data.phone,
      verifyCode: this.data.verifyCode,
      role: this.data.role
    })
      .then(data => {
        // 保存登录状态
        wx.setStorageSync('token', data.token)
        wx.setStorageSync('userInfo', data.userInfo)
        app.globalData.token = data.token
        app.globalData.userInfo = data.userInfo
        
        // 根据角色跳转到对应首页
        let url = ''
        switch (this.data.selectedRole) {
          case 'member':
            url = '/pages/member/home/index'
            break
          case 'coach':
            url = '/pages/coach/home/index'
            break
          case 'admin':
            url = '/pages/admin/dashboard/index'
            break
        }
        
        wx.reLaunch({ url })
      })
      .catch(err => {
        console.error('登录失败', err)
        wx.showToast({
          title: err || '登录失败',
          icon: 'none'
        })
      })
  } ,*/
  handleLogin() {
    // 从数据中获取选择的角色（member/coach/admin）
    const selectedRole = this.data.role; 
    
    // 模拟用户信息（包含角色标识）
    const mockUserInfo = {
      role: selectedRole,
      name: selectedRole === 'member' ? '普通会员' : 
            selectedRole === 'coach' ? '张教练' : '系统管理员'
    };
    
    // 存储角色信息到本地缓存
    wx.setStorageSync('userRole', selectedRole);
    wx.setStorageSync('userInfo', mockUserInfo);
    
    // 跳转到对应角色的首页
    this.navigateToHome(selectedRole);
  },
  // 跳转首页方法
   navigateToHome(role) {
    const homePage = {
      member: '/pages/member/home/index',
      coach: '/pages/coach/home/index',
      admin: '/pages/admin/dashboard/index'
    };
    wx.redirectTo({ url: homePage[role] });
  }
})