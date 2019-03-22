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

    // ws的连接器和ws事件handler
    this.store.webSocketConnect = async function(){ 
      if(this.socketOpen){
        console.log("ws已开启,不要重复连接")
      }else{
        const ws1 = wx.connectSocket({
          // 小程序 wx.connectSocket() API header 参数无效，把会话信息附加在 URL 上
          url: `${this.config.host_wss}/ws`,
          header: {openId: this.openId}//似乎header只能小写，不知道是minapp的问题还是thinkjs，服务器收到的是openid
        });
        this.ws1 = ws1;
        const that = this
        ws1.onOpen(function() {
          console.log('WebSocket连接已打开！')
          that.socketOpen=true;
          if(that.hasLogin){
            wx.showToast({
              title:"已连接"
            })
          }else{
            wx.switchTab({
              url:'../tasks/tasks'
            })
            that.hasLogin = true
          }
        })
        ws1.onMessage(function(res) {
          console.log('WebSocket连接收到', res)
          const data = JSON.parse(String(res.data));
          // 转向message(event)的handler
          that.wsMessageHandler(data);
          //wsMessageHandler();
        })
        ws1.onClose(function() {
          console.log('WebSocket连接已关闭！')
          that.socketOpen=false;
        })
      }
    }

    // ws的event的handler
    this.store.wsMessageHandler = async function(message:any){
      if(message.event==="opend"){
        
      }
      else if ( message.event === 'notice') {
        await this.getNoticeList()
        /*
        await new Promise((resolve)=>{
          wx.request({
            url: this.config.host+"/notice/get",
            method: "GET",
            data: {
              openId:this.openId
            },
            success: (res:any) => {
              console.log("getNotice获得通知列表", res.data.data)
              if(res.data.status==="success"){
                this.noticeList=res.data.data.noticeList
                resolve()
              }
            }
          })
        })
        */
      }
    }
    // 网络请求获取notice，用于多个页面
    this.store.getNoticeList = async function(){
      await new Promise((resolve)=>{
        wx.request({
          url: this.config.host+"/notice/get",
          method: "GET",
          data: {
            openId:this.openId
          },
          success: (res:any) => {
            console.log("getNotice获得通知列表", res.data.data)
            if(res.data.status==="success"){
              this.noticeList=res.data.data.noticeList
              this.refreshNoticeList()
              resolve()
            }
          }
        })
      })
    }

    // 处理notice被点击之后的逻辑
    this.store.onNoticeTap = async function(notice:any){
      const noticeId = notice._id;
      await that.deleteNotice(noticeId);
      const command = notice.command
      if(command.goToTask){
        const taskId=command.goToTask;
        wxp.navigateTo({
          url:"../taskDetails/taskDetails?taskId="+taskId
        })
      } 
      else {
        console.log('command', command)
      }
    }
  }
  async deleteNotice(noticeId:string){
    return await new Promise((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/notice/delete",
        method: "GET",
        data: {
          noticeId: noticeId
        },
        success:res=>{
          if(res.data.status==="success"){
            let index = 0;
            this.store.noticeList.forEach((element:any,i:number) => {
              if(element._id === noticeId){
                index = i
              }
            });
            this.store.noticeList.splice(index,1);
            this.store.refreshNoticeList()
            console.log("删除notice成功")
            resolve(res.data.data)
          }else{
            reject()
          }
        }
      })
    }) 
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

