App({
  onLaunch() {
    // 初始化登录状态
    //const token = wx.getStorageSync('token')
    //const userInfo = wx.getStorageSync('userInfo')
    //this.globalData.token = token
    //this.globalData.userInfo = userInfo

    // 登录状态检测
   // if (token) {
     // this.checkTokenValid()
   // }
   this.checkLoginStatus();

  },
  checkTokenValid() {
    // 调用接口验证token有效性
    wx.request({
      url: 'https://api.example.com/api/auth/verify',
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.data.code !== 200) {
          this.clearLoginState()
        }
      },
      fail: () => {
        this.clearLoginState()
      }
    })
  },
  clearLoginState() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.redirectTo({ url: '/pages/login/index' })
  },
    // 检查登录状态和角色
    checkLoginStatus() {
      const userInfo = wx.getStorageSync('userInfo');
      const currentPage = getCurrentPages()[0].route;
      
      // 未登录且不在登录页时跳转登录
      if (!userInfo && currentPage !== 'pages/login/index') {
        wx.redirectTo({ url: '/pages/login/index' });
        return false;
      }
      
      // 已登录但访问了错误角色的页面（可选增强）
      if (userInfo) {
        const role = userInfo.role;
        const rolePages = {
          member: /^pages\/member\//,
          coach: /^pages\/coach\//,
          admin: /^pages\/admin\//
        };
        
        // 检查当前页面是否属于该角色
        if (!rolePages[role].test(currentPage) && currentPage !== 'pages/login/index') {
          this.navigateToHome(role); // 跳转到对应角色首页
        }
      }
      
      return true;
    },
      // 角色首页跳转封装
  navigateToHome(role) {
    const homePage = {
      member: '/pages/member/home/index',
      coach: '/pages/coach/home/index',
      admin: '/pages/admin/dashboard/index'
    };
    wx.reLaunch({ url: homePage[role] });
  },
  globalData: {
    token: null,
    userInfo: null,
    apiBaseUrl: 'https://api.example.com'
  }
})