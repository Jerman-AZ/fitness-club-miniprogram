const app = getApp()
const { memberApi } = require('../../../../utils/api')

Page({
  data: {
    courseTypes: ['全部课程', '瑜伽', '动感单车', '力量训练', '普拉提'],
    typeIndex: 0,
    today: '',
    maxDate: '',
    selectedDate: '',
    searchKey: '',
    groupedCourses: []
  },

  onLoad() {
    // 初始化日期
    const today = this.formatDate(new Date())
    const maxDate = this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30天后
    
    this.setData({
      today,
      maxDate,
      selectedDate: today
    })
    
    this.getCourseList()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  handleTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    }, () => {
      this.getCourseList()
    })
  },

  handleDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    }, () => {
      this.getCourseList()
    })
  },

  handleSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    })
  },

  handleSearch() {
    this.getCourseList()
  },

  getCourseList() {
    wx.showLoading({
      title: '加载课程中',
      mask: true
    })

    const params = {
      type: this.data.typeIndex > 0 ? this.data.courseTypes[this.data.typeIndex] : '',
      date: this.data.selectedDate,
      keyword: this.data.searchKey
    }

    memberApi.getCourseList(params)
      .then(data => {
        wx.hideLoading()
        // 按时间段分组
        const grouped = this.groupCoursesByTime(data.courses)
        this.setData({
          groupedCourses: grouped
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('获取课程列表失败', err)
        wx.showToast({
          title: '课程加载失败',
          icon: 'none'
        })
      })
  },

  groupCoursesByTime(courses) {
    const timeGroups = {
      '06:00-12:00': { timeSlot: '上午', courses: [] },
      '12:00-18:00': { timeSlot: '下午', courses: [] },
      '18:00-22:00': { timeSlot: '晚上', courses: [] }
    }

    courses.forEach(course => {
      const hour = parseInt(course.startTime.split(':')[0])
      
      if (hour >= 6 && hour < 12) {
        timeGroups['06:00-12:00'].courses.push(course)
      } else if (hour >= 12 && hour < 18) {
        timeGroups['12:00-18:00'].courses.push(course)
      } else {
        timeGroups['18:00-22:00'].courses.push(course)
      }
    })

    // 过滤空组并排序
    return Object.values(timeGroups)
      .filter(group => group.courses.length > 0)
      .sort((a, b) => {
        const order = { '上午': 0, '下午': 1, '晚上': 2 }
        return order[a.timeSlot] - order[b.timeSlot]
      })
  }
})