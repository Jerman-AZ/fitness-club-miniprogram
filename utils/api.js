const app = getApp()

// 请求封装
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.apiBaseUrl + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data)
        } else if (res.data.code === 401 || res.data.code === 403) {
          app.clearLoginState()
          reject('登录状态失效，请重新登录')
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          })
          reject(res.data.message)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 管理员接口
const adminApi = {
  getDashboardData: () => request('/api/admin/dashboard'),
  getMemberList: (params) => request('/api/admin/members', 'GET', params)
}

// 教练接口
const coachApi = {
  getTodayCourses: () => request('/api/coach/courses/today'),
  getSignQRCode: (scheduleId) => request(`/api/coach/courses/${scheduleId}/sign/qrcode`),
  getSignRecords: (scheduleId, params) => request(`/api/coach/courses/${scheduleId}/sign/records`, 'GET', params)
}

// 会员接口
const memberApi = {
  getHomeData: () => request('/api/member/home'),
  getCourseList: (params) => request('/api/member/courses', 'GET', params),
  bookCourse: (scheduleId, data) => request(`/api/member/courses/${scheduleId}/book`, 'POST', data),
  cancelBooking: (bookingId) => request(`/api/member/bookings/${bookingId}`, 'DELETE')
}

// 通用接口
const commonApi = {
  uploadFile: (filePath, type) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: app.globalData.apiBaseUrl + '/api/upload',
        filePath,
        name: 'file',
        formData: { type },
        header: {
          'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            reject(data.message)
          }
        },
        fail: reject
      })
    })
  }
}

module.exports = {
  adminApi,
  coachApi,
  memberApi,
  commonApi
}