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
        success:(res:any)=>{
          console.log("获取会话成功",res)
          store.openId=res.data.openId;
          that.connect();
          wxp.switchTab({
            url:"../conversations/conversations"
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
      //console.log(signal)
      //收到text
      if(signal.msgType=="text"||signal.msgType=="audio"){
        const fromUser=signal.fromUser;
        const uuid=signal.uuid;
        //console.log("this.store.conversations",this.store.conversations)
        //console.log("this.store.conversations[fromUser]原来",this.store.conversations[fromUser])
        if(this.store.conversations[fromUser]){
          this.store.conversations[fromUser][uuid]=signal;
        }else{
          this.store.conversations[fromUser]={}
          this.store.conversations[fromUser][uuid]=signal;
        }
        this.setDataSmart({
          conversations:this.store.conversations
        })
        console.log("this.store.conversations[fromUser]变成",this.store.conversations[fromUser])
        /*if(this.store.conversations[fromUser]){
          console.log("233",this.store.conversations[fromUser][signal.uuid])
          this.store.conversations[fromUser][signal.uuid]=signal;
        }else{
          const key=signal.uuid;
          this.store.conversations[fromUser]=new Object({key:signal})
        }
        */  
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

}
