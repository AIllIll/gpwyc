// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

const wafer = require('wafer-client-sdk/index');
wafer.setLoginUrl('https://ttissoft.cn/login');

@pagify()
export default class extends MyPage {
  data = {
    isServerReady:false
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
    await this.tryServer();
  }

  getUserInfo(e:any) {
    console.log(e)
    this.store.userInfo = e.detail.userInfo
    this.setDataSmart({
      userInfo: e.detail.userInfo
    })
  }

  async tryServer(){
    console.log(this.store.config.host)
    await wx.request({
      url:"https://"+this.store.config.host+"/hello",
      method:"GET",
      success:(res)=>{
        if(res.statusCode==200){
          this.setDataSmart({
            isServerReady:true
          })
        }
        else{
          console.log(res)
          wx.showToast({
            title:"服务器故障",
            icon:"none"
          })
        }
      },
      fail:(err)=>{
        wx.showToast({
          title:"请检查服务器",
          icon:"none"
        })
      }
    })
  }

  async wechatLogin(){
    const that=this;
    const store=this.store;
    if(this.store.userInfo){
      //先建立ws，并且保持心跳
      this.store.Timer1=setInterval(this.heartbeat,50000)
      //获取openId
      await wafer.request({
        login:true,
        url:"https://"+this.store.config.host+"/me",
        method:"GET",
        success: async (res:any)=>{
          console.log("获取会话成功",res)
          store.openId=res.data.openId;
          that.connect();
          that.getHistory();
          await wafer.request({
            login:true,
            url:"https://"+this.store.config.host+"/users",
            method:"GET",
            success:(res:any)=>{
              //console.log("获取全用户列表成功",res)
              this.store.allUsers=res.data
              console.log("allUsers",this.store.allUsers)
              wxp.switchTab({
                url:"../contacts/contacts"
              })
            },
            fail:(err:any)=>{
              console.log(err)
            }
          })
        },
        fail:(err:any)=>{
          console.log(err)
        }
      })
      
    }else{
      wxp.showToast({
        title:"请先获取微信授权",
        icon:"none"
      })
    }
  }

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
      
      }else if(signal.msgType=="notice"){
        this.store.notice.unread[uuid]=signal;
        if(this.store.newsPageCallback){
          this.store.newsPageCallback()
        }

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
    this.store.notice=wxp.getStorageSync("notice"+this.store.openId)||{unread:{},read:{},mine:{}};
  }

}
