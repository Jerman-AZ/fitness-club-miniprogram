// pages/admin/dashboard/index.js
const app = getApp()
const { adminApi } = require('../../../utils/api')

Page({
  data: {
    overview: {
      newMembers: 0,
      memberChange: 0,
      courseBookings: 0,
      bookingChange: 0,
      todayRevenue: 0,
      revenueChange: 0
    },
    todoList: [],
    trendTypes: ['营收趋势', '会员增长', '课程预约'],
    trendTypeIndex: 0,
    chartData: null
  },

  onLoad() {
    this.getDashboardData()
  },

  onShow() {
    if (app.globalData.token) {
      this.getDashboardData()
    }
  },

  getDashboardData() {
    wx.showLoading({
      title: '加载数据中',
      mask: true
    })

    adminApi.getDashboardData()
      .then(data => {
        wx.hideLoading()
        this.setData({
          overview: data.overview,
          todoList: data.todoList,
          chartData: data.chartData
        })
        this.initChart()
      })
      .catch(err => {
        wx.hideLoading()
        console.error('获取仪表盘数据失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  initChart() {
    const ctx = wx.createCanvasContext('trendChart', this)
    const chartData = this.data.chartData
    if (!chartData) return

    // 绘制坐标轴
    const width = wx.getSystemInfoSync().windowWidth - 40 // 减去padding
    const height = 300
    const padding = 40
    const xStep = (width - padding * 2) / (chartData.labels.length - 1)
    const yStep = (height - padding * 2) / 5

    // 绘制网格线
    ctx.setStrokeStyle('#f0f0f0')
    ctx.setLineWidth(1)
    
    // 水平线
    for (let i = 0; i <= 5; i++) {
      const y = padding + i * yStep
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
      
      // Y轴刻度
      ctx.setFontSize(20)
      ctx.setFillStyle('#999')
      const value = Math.round((chartData.maxValue / 5) * (5 - i))
      ctx.fillText(value, padding - 30, y + 5)
    }

    // 垂直线和X轴标签
    chartData.labels.forEach((label, index) => {
      const x = padding + index * xStep
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      
      // X轴标签
      ctx.setFontSize(20)
      ctx.setFillStyle('#666')
      ctx.fillText(label, x - 15, height - padding + 20)
    })

    // 绘制数据曲线
    ctx.setStrokeStyle('#1677ff')
    ctx.setLineWidth(3)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
    
    chartData.values.forEach((value, index) => {
      const x = padding + index * xStep
      const y = height - padding - (value / chartData.maxValue) * (height - padding * 2)
      
      if (index === 0) {
        ctx.beginPath()
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      // 绘制数据点
      ctx.setFillStyle('#1677ff')
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    ctx.stroke()
    ctx.draw()
  },

  changeTrendType(e) {
    this.setData({
      trendTypeIndex: e.detail.value
    }, () => {
      // 这里可以根据类型切换不同的图表数据
      this.getDashboardData() // 实际项目中可优化为只请求对应类型数据
    })
  },

  handleTodo(e) {
    const id = e.currentTarget.dataset.id
    // 处理待办事项逻辑
    wx.showModal({
      title: '处理事项',
      content: '确定已处理该事项？',
      success: (res) => {
        if (res.confirm) {
          // 调用接口标记为已处理
          adminApi.handleTodo(id)
            .then(() => {
              wx.showToast({
                title: '处理成功',
                icon: 'success'
              })
              this.getDashboardData()
            })
            .catch(err => {
              console.error('处理待办事项失败', err)
            })
        }
      }
    })
  },

  navToUserManage() {
    wx.navigateTo({
      url: '/pages/admin/userManage/memberList'
    })
  },

  navToCourseManage() {
    wx.navigateTo({
      url: '/pages/admin/courseManage/courseList'
    })
  },

  navToFinance() {
    wx.navigateTo({
      url: '/pages/admin/finance/revenue'
    })
  },

  navToSystem() {
    wx.navigateTo({
      url: '/pages/admin/system/baseInfo'
    })
  }
})