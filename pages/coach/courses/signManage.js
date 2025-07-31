const app = getApp()
const { coachApi } = require('../../../utils/api')

Page({
  data: {
    scheduleId: '',
    courseInfo: {},
    qrcodeUrl: '',
    validTime: {},
    signStats: {
      total: 0,
      preSigned: 0,
      postSigned: 0,
      bothSigned: 0
    },
    signRecords: [],
    statusOptions: ['全部', '已完成两次签到', '仅课前签到', '未签到'],
    statusIndex: 0,
    statusTextMap: {
      both: '已完成两次签到',
      pre_only: '仅课前签到',
      post_only: '仅课后签到',
      none: '未签到'
    },
    // 定时器
    refreshTimer: null
  },

  onLoad(options) {
    const { scheduleId } = options
    if (!scheduleId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      scheduleId
    })

    // 获取签到信息
    this.getSignQRCode()
    // 获取签到记录
    this.getSignRecords()

    // 设置自动刷新（每30秒）
    this.setData({
      refreshTimer: setInterval(() => {
        this.getSignRecords()
      }, 30000)
    })
  },

  onUnload() {
    // 清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer)
    }
  },

  // 获取签到二维码
  getSignQRCode() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    coachApi.getSignQRCode(this.data.scheduleId)
      .then(data => {
        wx.hideLoading()
        this.setData({
          qrcodeUrl: data.qrcodeUrl,
          validTime: data.validTime,
          signStats: data.signStats,
          courseInfo: data.courseInfo
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('获取签到二维码失败', err)
        wx.showToast({
          title: '获取签到信息失败',
          icon: 'none'
        })
      })
  },

  // 刷新二维码
  refreshQRCode() {
    wx.showLoading({
      title: '刷新二维码',
      mask: true
    })

    coachApi.getSignQRCode(this.data.scheduleId)
      .then(data => {
        wx.hideLoading()
        this.setData({
          qrcodeUrl: data.qrcodeUrl
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('刷新二维码失败', err)
      })
  },

  // 获取签到记录
  getSignRecords() {
    const { statusIndex } = this.data
    // 状态映射
    const statusMap = ['', 'both', 'pre_only', 'none']
    const status = statusMap[statusIndex]

    coachApi.getSignRecords(this.data.scheduleId, { status })
      .then(data => {
        this.setData({
          signRecords: data.list || [],
          signStats: data.stats || this.data.signStats
        })
      })
      .catch(err => {
        console.error('获取签到记录失败', err)
      })
  },

  // 切换筛选状态
  handleStatusChange(e) {
    this.setData({
      statusIndex: e.detail.value
    }, () => {
      this.getSignRecords()
    })
  },

  // 手动刷新签到数据
  refreshSignData() {
    wx.showLoading({
      title: '刷新中',
      mask: true
    })

    Promise.all([
      coachApi.getSignQRCode(this.data.scheduleId),
      coachApi.getSignRecords(this.data.scheduleId, { status: this.data.statusMap[this.data.statusIndex] })
    ])
      .then(([qrcodeData, recordsData]) => {
        wx.hideLoading()
        this.setData({
          qrcodeUrl: qrcodeData.qrcodeUrl,
          validTime: qrcodeData.validTime,
          signStats: recordsData.stats || this.data.signStats,
          signRecords: recordsData.list || []
        })
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('刷新失败', err)
        wx.showToast({
          title: '刷新失败',
          icon: 'none'
        })
      })
  }
})