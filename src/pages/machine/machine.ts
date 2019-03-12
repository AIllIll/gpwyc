// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
@pagify()
export default class extends MyPage {
  data = {
    current:"notice",
    QRcode:''
  }

  async onLoad(options: any) {
    console.log(await wxp.getUserInfo())
  }
  
  async deleteUser(){
    return await new Promise((resolve, reject) => {
      wx.request({
        url:this.store.config.host+"/user/clear",
        data:{
          openId: this.store.openId,
        },
        success: res=>{
          console.log(res.data.status)
          if(res.data.status==="success"){
            wx.showToast({
              title:'删除成功'
            })
            resolve();
          }else{
            wx.showToast({
              title:'想死？',
              icon:"none"
            })
            reject();
          }
        }
      })
    })
  }

  async deleteTask(){
    return await new Promise((resolve, reject) => {
      wx.request({
        url:this.store.config.host+"/task/clear",
        data:{
          openId: this.store.openId,
        },
        success: res=>{
          console.log(res.data.status)
          if(res.data.status==="success"){
            wx.showToast({
              title:'删除成功'
            })
            resolve();
          }else{
            wx.showToast({
              title:'想死？',
              icon:"none"
            })
            reject();
          }
        }
      })
    })
  }
}
