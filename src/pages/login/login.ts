// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

// const getUuid=require("uuid/v4")
// const wafer = require('wafer-client-sdk/index');
// wafer.setLoginUrl('https://ttissoft.cn/login');

@pagify()
export default class extends MyPage {
  data = {
    // isServerReady:false
  }
  
  async onLoad(options: any) {
    console.log('login onLoad')
  }
  
  // 点击微信快捷登录
  async wechatLogin(){
    // 登录
    await this.getOpenId();
    // 用户登录，更新信息
    await new Promise((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/user/login",
        method: "GET",
        data:{
          openId: this.store.openId,
          userInfo: this.store.userInfo
        },
        success: res=>{
          console.log("登录", res.data);
          resolve()
        }
      })
    })
    await this.webSocketConnect();
  }
  //连接
  async webSocketConnect(){ 
    if(this.store.socketOpen){
      console.log("ws已开启,不要重复连接")
    }else{
      const ws1 = wx.connectSocket({
        // 小程序 wx.connectSocket() API header 参数无效，把会话信息附加在 URL 上
        url: `${this.store.config.host_wss}/ws`,
        header: {openId: this.store.openId}//似乎header只能小写，不知道是minapp的问题还是thinkjs，服务器收到的是openid
      });
      const that = this
      ws1.onOpen(function() {
        console.log('WebSocket连接已打开！')
        that.store.socketOpen=true;
      })
      ws1.onMessage(function(res) {
        console.log('WebSocket连接收到', res)
        const message = JSON.parse(String(res.data));
        console.log(message)
        that.store.wsMessageHandler(message);
        //wsMessageHandler();
      })
      ws1.onClose(function() {
        console.log('WebSocket连接已关闭！')
        that.store.socketOpen=false;
      })
    }
  }

  async getUserInfo(){
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
  }

  async getOpenId(){
    let {code} = await wxp.login()
    console.log('微信 code %o', code) // 发送 code 到后台换取 openId, sessionKey, unionId
    return await new Promise((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/user/getOpenId",
        method: "GET",
        data:{
          code: code,
        },
        success: res=>{
          console.log(res.data);
          if(res.data.status==='success'){
            this.store.openId = res.data.openId;
            resolve()
          }
          reject()
        }
      })
    })
  }
  /*
  //websocket函数
  async connect(){
    this.listen();
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
      },
      fail: (err:any) => {
        console.log("wafer登录失败")
      }
    });
  }

  listen() {
    wxp.onSocketOpen(() => {
      this.store.socketOpen = true;
      console.info('WebSocket 已连接');
    });

    wxp.onSocketMessage((message) => {
      console.log("WebSocket收到",message)
      const signal=JSON.parse(String(message.data));
      const fromUser=signal.fromUser;
      const uuid=signal.uuid;
      if(signal.msgType=="text"||signal.msgType=="audio"){
        //console.log("this.store.conversations",this.store.conversations)
        //console.log("this.store.conversations[fromUser]原来",this.store.conversations[fromUser])
        if(this.store.conversations[fromUser]){
          this.store.conversations[fromUser][uuid]=signal;
        }else{
          this.store.conversations[fromUser]={}
          this.store.conversations[fromUser][uuid]=signal;
        }
        //console.log("this.store.conversations[fromUser]变成",this.store.conversations[fromUser])
        
        if(this.store.chatPageCallback){
          this.store.chatPageCallback(fromUser)
        }

      }else if(signal.msgType=="groupText"||signal.msgType=="groupAudio"){
        //console.log("this.store.conversations",this.store.conversations)
        //console.log("this.store.conversations[fromUser]原来",this.store.conversations[fromUser])
        if(this.store.conversations[fromUser]){
          this.store.conversations[fromUser][uuid]=signal;
        }else{
          this.store.conversations[fromUser]={}
          this.store.conversations[fromUser][uuid]=signal;
        }
        console.log("this.store.conversations[fromUser]变成",this.store.conversations[fromUser])
        
        if(this.store.groupChatPageCallback){
          this.store.groupChatPageCallback()
        }
      
      }else if(signal.msgType=="order"){
        this.orderHandler(signal.order)

      }else if(signal.msgType=="feedback"){
        console.log("feedback")
        const feedbackUuid=signal.feedbackUuid;
        if(this.store.conversations[fromUser]){
          for(var key in this.store.conversations[fromUser]){
            if(this.store.conversations[fromUser][key].uuid==feedbackUuid){
              this.store.conversations[fromUser][key].msgStatus="已读"
            }
          }
        }
        if(this.store.chatPageCallback){
          this.store.chatPageCallback()
        }
      }
    });

    wxp.onSocketClose(() => {
      this.store.socketOpen=false;
      console.info('WebSocket 已关闭');
    });
    
    wxp.onSocketError(() => {
      this.store.socketOpen=false;
      console.error('WebSocket 错误');
    });
  }
  
  heartbeat(){
    console.log("heartbeating")
    const heartbeatSignal={
      fromUser:this.store.openId,
      msgType:'heartbeat'
    }
    wxp.sendSocketMessage({data:JSON.stringify(heartbeatSignal)})
  }
  
  //历史记录函数
  async getHistory(){
    this.store.conversations=wxp.getStorageSync("conversations"+this.store.openId)||{};
    this.store.contacts=wxp.getStorageSync("contacts"+this.store.openId)||{};
    //this.store.notice=wxp.getStorageSync("notice"+this.store.openId)||{unread:{},read:{},mine:{}};
  }

  async getTasks(){
    wafer.request({
      login:true,
      url:"https://"+this.store.config.host+"/getTasks",
      method:"GET",
      success:(res:any)=>{
        this.store.myReceivedTasks=res.data.myReceivedTasks
        //反馈 已收到
        for(var i=0;i<res.data.myReceivedTasks.length;i++){
          const task=res.data.myReceivedTasks[i]
          const members=task.members;
          for(var j=0;j<members.length;j++){
            if(members[j].openId==this.store.openId&&members[j].status=="发送中"){
              this.setTaskStatus(task.uuid,"已接收")
              console.log("向任务"+task.title+"反馈了 已接收")
              break;
            }
          }
        }
        console.log("myReceivedTasks",this.store.myReceivedTasks)
        this.store.myReleasedTasks=res.data.myReleasedTasks
        console.log("myReleasedTasks",this.store.myReleasedTasks)
      },
      fail:(err:any)=>{
        console.log(err)
      }
    })
  }

  //发送任务反馈信号taskFeedback
  setTaskStatus(taskId:string,status:string){
    //信号生成
    const date=new Date();
    const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.toTimeString().slice(0,8)
     //const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    const uuid=getUuid();
    console.log("uuid",uuid)
    const newSignal={
      uuid:uuid,
      fromUser:this.store.openId,
      toGroup:taskId,
      msgType:"taskFeedback",
      msgTime: msgTime,
      msgContent:status
    }
    
    //发送部分
    if(this.store.socketOpen){
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      })
    }
    else{
      console.log("socketOpen: ",this.store.socketOpen)
    }
  }

  async orderHandler(order:any){
    if(order.orderType=="newTask"||order.orderType=="updateTask")
    this.getTasks()
    if(this.store.newsPageCallback){
      this.store.newsPageCallback()
    }
  }

  */
}
