const app = getApp()
const { memberApi } = require('../../../utils/api')

Page({
  data: {
    userInfo: {},
    recommendCourses: [],
    activities: []
  },

  onLoad() {
    this.getUserInfo()
    this.getHomeData()
  },

  onShow() {
    // 页面显示时刷新数据
    if (app.globalData.token) {
      const userInfo = wx.getStorageSync('userInfo');
      // 若未登录或角色不是admin，跳转到登录页
      if (!userInfo || userInfo.role !== 'member') {
        wx.redirectTo({ url: '/pages/login/index' });
        return;
      }
      this.getUserInfo()
      this.getHomeData()
    }
  },

  getUserInfo() {
    // 获取用户信息（从缓存或接口）
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },

  getHomeData() {
    // 显示加载中
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    // 获取首页数据
    memberApi.getHomeData()
      .then(data => {
        wx.hideLoading()
        this.setData({
          recommendCourses: data.recommendCourses || [],
          activities: data.activities || []
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('获取首页数据失败', err)
      })
  }
})