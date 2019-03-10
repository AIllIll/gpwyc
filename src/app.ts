/******************************************************************
MIT License http://www.opensource.org/licenses/mit-license.php
Author Mora <qiuzhongleiabc@126.com> (https://github.com/qiu8310)
*******************************************************************/

import {appify, wxp, MyApp, MyStore} from 'base/'
//const wafer = require('wafer-client-sdk/index');

@appify(new MyStore(), {pages: require('./app.cjson?pages'), tabBarList: require('./app.cjson?tabBar.list')})
export default class extends MyApp {
  async onLaunch() {
    //var date=new Date()
    console.log(new Date())
    //console.log(new Date(date.getTime()))
    //console.log(date.getFullYear(),date.getTime(),date.getDate(),date.getHours(),date.getMinutes())

    // 先获取用户信息
    let setting = await wxp.getSetting()
    if (setting.authSetting['scope.userInfo']) { // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
      // 可以将 getUserInfo 返回的对象发送给后台解码出 unionId（暂时不需要）
      let res = await wxp.getUserInfo()
      console.log('微信 userInfo %o', res.userInfo)
      this.store.userInfo = {
        avatarUrl: res.userInfo.avatarUrl,
        nickName: res.userInfo.nickName,
        gender: res.userInfo.gender
      }
      // 将用户信息存入 store 中
    } else { 
      console.log('没有授权过')
    }
    //窗口宽高
    const that=this;
    await new Promise((resolve,reject)=>{
      wxp.getSystemInfo({
        success: function(res:any){
          that.store.windowHeight = res.windowHeight;
          that.store.windowWidth = res.windowWidth;
          resolve({windowHeight:res.windowHeight,windowWidth:res.windowWidth});
        }
      })
    })
    console.log("窗口高度： ",this.store.windowHeight,"  窗口宽度： ",this.store.windowWidth)


    that.store.wsMessageHandler=function(message:any){
      if(message.event==="opend"){
        wx.switchTab({
          url:'../tasks/tasks'
        })
      }
    }
  }
  /*
  async onShow(){
    console.log("app show")
    if(this.store.needReconnect){
      await this.wsReconnect();
    }
  }
  async onHide(){
    console.log("app hide")
    this.store.socketOpen=false;
    wxp.closeSocket();
    this.store.needReconnect=true;

    wxp.setStorageSync("conversations"+this.store.openId, this.store.conversations);
    wxp.setStorageSync("contacts"+this.store.openId, this.store.contacts);
    //wxp.setStorageSync("notice"+this.store.openId, this.store.notice);
  }

  //websocket函数
  async wsReconnect(){
    const config=this.store.config;
    wafer.setLoginUrl(`https://${config.host}/login`);
    await wafer.login({
      success: () => {
        const header = wafer.buildSessionHeader();
        const query = Object.keys(header).map(key => `${key}=${encodeURIComponent(header[key])}`).join('&');
        wxp.connectSocket({
          // 小程序 wx.connectSocket() API header 参数无效，把会话信息附加在 URL 上
          url: `wss://${this.store.config.host}/ws?${query}`,
          header
        });
        console.log("onhide 重连成功")
        this.store.socketOpen=true;
        this.store.needReconnect=false;
      },
      fail: (err:any) => {
        console.log("wafer登录失败")
      }
    });
  }
  */
}

