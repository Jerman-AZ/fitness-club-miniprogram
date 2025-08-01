// pages/member/training/dataTrack/index.js
const app = getApp()
const { memberApi } = require('../../../../utils/api')
const dayjs = require('../../../../utils/date') // 假设引入了dayjs库处理日期

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 体重数据(近30天)
    weightData: [],
    // 体脂率数据(近30天)
    bodyFatData: [],
    // 日期标签
    dateLabels: [],
    // 累计训练时长
    totalTrainingTime: '12小时30分钟',
    // 本周训练统计
    weeklyReport: '本周训练 5 次，较上周增长 2 次',
    // 今日步数
    todaySteps: 6532,
    // 目标步数
    targetSteps: 8000,
    // 步数进度
    stepsProgress: 0,
    // 运动时长
    exerciseDuration: 25, // 分钟
    // 是否达标
    isGoalReached: false,
    // 训练记录列表
    trainingRecords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initData()
    this.checkExerciseGoal()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查是否需要发送运动提醒
    this.checkExerciseReminder()
  },

  /**
   * 初始化数据
   */
  initData() {
    // 生成近30天日期
    const labels = []
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('MM-DD')
      labels.push(date)
    }
    
    // 生成模拟体重数据(75kg降至72kg)
    const weightData = []
    const bodyFatData = []
    for (let i = 0; i < 30; i++) {
      // 体重从75kg逐渐降至72kg
      const weight = 75 - (i * 0.1)
      weightData.push(weight.toFixed(1))
      
      // 体脂率从28%降至26%
      const bodyFat = 28 - (i * 0.067)
      bodyFatData.push(bodyFat.toFixed(1))
    }
    
    // 计算步数进度
    const stepsProgress = Math.round((this.data.todaySteps / this.data.targetSteps) * 100)
    
    this.setData({
      dateLabels: labels,
      weightData,
      bodyFatData,
      stepsProgress
    })
    
    // 获取训练记录
    this.getTrainingRecords()
  },

  /**
   * 检查运动目标是否达成
   */
  checkExerciseGoal() {
    const isGoalReached = this.data.todaySteps >= this.data.targetSteps && 
                         this.data.exerciseDuration >= 30
    this.setData({ isGoalReached })
  },

  /**
   * 检查是否需要发送运动提醒
   */
  checkExerciseReminder() {
    const hour = new Date().getHours()
    // 晚上8点后如果未达标，发送提醒
    if (hour >= 20 && !this.data.isGoalReached) {
      wx.showModal({
        title: '运动提醒',
        content: '今日运动不足，建议完成30分钟快走',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  /**
   * 获取训练记录
   */
  getTrainingRecords() {
    memberApi.getTrainingRecords()
      .then(data => {
        this.setData({
          trainingRecords: data.list
        })
      })
      .catch(err => {
        console.error('获取训练记录失败', err)
      })
  },

  /**
   * 进入训练计划页面
   */
  goToTrainingPlan() {
    wx.navigateTo({
      url: '/pages/member/training/plan/index'
    })
  },

  /**
   * 绑定运动设备
   */
  bindDevice() {
    wx.showModal({
      title: '绑定设备',
      content: '是否允许绑定华为运动手环？',
      success: (res) => {
        if (res.confirm) {
          // 模拟绑定成功
          wx.showToast({
            title: '绑定成功',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.initData()
    wx.stopPullDownRefresh()
  }
})