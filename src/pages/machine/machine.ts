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
  
  async wsSendHandler(toId:any, signal:any){
    if(toId){
      if(this.store.socketOpen){
        const ws1=this.store.ws1;
        ws1.send({data:JSON.stringify({event:"deliver", data:{openId:this.store.openId, signal:signal}})})
      }
      else{
        wx.showToast({
          title:"重连中",
          icon:"loading"
        })
        await this.store.webSocketConnect();
        const ws1=this.store.ws1;
        ws1.send({data:JSON.stringify({event:"deliver", data:{openId:this.store.openId, signal:signal}})})
      }
    }
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

  async deleteNotice(){
    return await new Promise((resolve, reject) => {
      wx.request({
        url:this.store.config.host+"/notice/clear",
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

  async test(){
    const signal = this.store.userInfo;
    const toId = this.store.openId;
    this.wsSendHandler(toId,signal)
  }

  

  async closeSocket(){
    this.store.ws1.close()
  }

  async connectSocket1(){
    ws1= wx.connectSocket({
      // 小程序 wx.connectSocket() API header 参数无效，把会话信息附加在 URL 上
      url: `${this.store.config.host_wss}/ws`,
      header: {openId: 2333}//似乎header只能小写，不知道是minapp的问题还是thinkjs，服务器收到的是openid
    });
  }
  async connectSocket2(){
    ws2= wx.connectSocket({
      // 小程序 wx.connectSocket() API header 参数无效，把会话信息附加在 URL 上
      url: `${this.store.config.host_wss}/ws`,
      header: {openId: this.store.openId}//似乎header只能小写，不知道是minapp的问题还是thinkjs，服务器收到的是openid
    });
  }
  async closeSocket1(){
    ws1.close()
  }
  async test2(){
    ws2.send({data:JSON.stringify({event:"test", data:{openId:this.store.openId, signal:this.store.userInfo}})})
  }
  async test3(){
    const ws1 = this.store.ws1;
    const signal = {
      fromId: this.store.openId,
      toId: 'oP7yP4gjNnPbPgtCKkZtq9qeErqI',
  }
    ws1.send({data:JSON.stringify({event:"notice", data:signal})})
  }
}
var ws1:any;
var ws2:any;