const app = getApp()
const { memberApi } = require('../../../../utils/api')

Page({
  data: {
    userInfo: {},
    today: ''
  },

  onLoad() {
    this.setData({
      today: this.formatDate(new Date())
    })
    this.getUserInfo()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo
      })
    } else {
      // 从接口获取最新信息
      memberApi.getMemberInfo()
        .then(data => {
          this.setData({
            userInfo: data
          })
          wx.setStorageSync('userInfo', data)
        })
        .catch(err => {
          console.error('获取用户信息失败', err)
        })
    }
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        // 上传头像
        memberApi.uploadAvatar(tempFilePath)
          .then(data => {
            const updatedUser = { ...this.data.userInfo, avatar: data.url }
            this.setData({ userInfo: updatedUser })
            wx.setStorageSync('userInfo', updatedUser)
            wx.showToast({
              title: '头像更新成功',
              icon: 'success'
            })
          })
          .catch(err => {
            console.error('上传头像失败', err)
            wx.showToast({
              title: '头像更新失败',
              icon: 'none'
            })
          })
      }
    })
  },

  updateName(e) {
    this.setData({
      'userInfo.name': e.detail.value
    })
  },

  updateGender(e) {
    this.setData({
      'userInfo.gender': e.detail.value
    })
  },

  updateBirthday(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    })
  },

  updateEmergencyContact(e) {
    this.setData({
      'userInfo.emergencyContact': e.detail.value
    })
  },

  updateEmergencyPhone(e) {
    this.setData({
      'userInfo.emergencyPhone': e.detail.value
    })
  },

  goToChangePhone() {
    wx.navigateTo({
      url: '/pages/member/personal/changePhone'
    })
  },

  saveInfo() {
    const { name, gender, birthday, emergencyContact, emergencyPhone } = this.data.userInfo
    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中',
      mask: true
    })

    memberApi.updateMemberInfo({
      name,
      gender,
      birthday,
      emergencyContact,
      emergencyPhone
    })
      .then(() => {
        wx.hideLoading()
        wx.setStorageSync('userInfo', this.data.userInfo)
        wx.showToast({
          title: '信息保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      })
      .catch(err => {
        wx.hideLoading()
        console.error('保存信息失败', err)
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      })
  },

  confirmLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginState()
        }
      }
    })
  }
})