// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
const wafer=require("wafer-client-sdk/index")
const getUuid=require("uuid/v4")

@pagify()
export default class extends MyPage {
  data = {
    friendInfo:{
      avatarUrl:"",
      nickName:"",
      openId:"",
    },
    inputValue:"",
    history:new Array
  }
  socketOpen = false;

  async onLoad(options: any) {
    //console.log(JSON.parse(options.friendInfo))
    this.setDataSmart({
      friendInfo:JSON.parse(options.friendInfo)
    })
    //this.connect()
  }

  async onUnload(){
    if (this.socketOpen){
      await this.close();
    }
  }

  onInputChange(e:any){
    console.log("capture trigger inputChange",e.detail)
    this.data.inputValue=e.detail.value
  }
  
  onCancel(){
    console.log("capture trigger cancel")
  }
  onFinish(){
    console.log("capture trigger finish")
  }
  
  async onSend(){
    //信号生成
    const uuid:String=getUuid();
    console.log("uuid",uuid)
    const newSignal={
      uuid:uuid,
      fromUser:this.store.openId,
      toUser:this.data.friendInfo.openId,
      msgType:"text",
      msgTime: "24:00",
      msgContent:this.data.inputValue
    }
    
    //发送部分
    
    if(this.socketOpen){
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      });
    }
    else{
      await this.connect();
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      });
    }
    

    //渲染部分
    var newHistory=this.data.history;
    newHistory.unshift(newSignal)
    //console.log(newHistory)
    this.setDataSmart({
      history:newHistory
    })
  }
  onExtra(){

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
      this.socketOpen = true;
      console.info('WebSocket 已连接');
    });

    wxp.onSocketMessage((message) => {
      console.log("WebSocket收到",message)
    });

    wxp.onSocketClose(() => {
      this.socketOpen=false;
      console.info('WebSocket 已关闭');
    });
    
    wxp.onSocketError(() => {
      this.socketOpen=false;
      console.error('WebSocket 错误');
    });
  }
  
  close(){
    this.socketOpen = false;
    wxp.closeSocket();
  }


}
