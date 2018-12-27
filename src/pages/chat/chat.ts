// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
const getUuid=require("uuid/v4")
const innerAudioContext=wx.createInnerAudioContext()

@pagify()
export default class extends MyPage {
  data = {
    friendInfo:{
      avatarUrl:"",
      nickName:"",
      openId:"",
    },
    inputValue:"",
  }

  async onLoad(options: any) {
    //console.log(JSON.parse(options.friendInfo))
    this.setDataSmart({
      friendInfo:JSON.parse(options.friendInfo),
      conversations:this.store.conversations
    })
    //this.connect()

    console.log(this.store.conversations)

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
      }
    });


    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onEnded(() =>{
      console.log('播放自然结束')
      this.audioPlaying=false;
    })
    innerAudioContext.onStop(() =>{
      console.log('播放终止')
      this.audioPlaying=false;
    })
  }

  async onUnload(){
  }

  onInputChange(e:any){
    //console.log("capture trigger inputChange",e.detail)
    this.data.inputValue=e.detail.value
  }
  
  onCancel(){
    console.log("capture trigger cancel")
  }
  onFinish(e:any){
    //console.log("capture trigger finish",e.detail.tempAudioPath)
    var that=this;
    var audioPathOnServer;
    //比text多一步录音上传
    wx.uploadFile({
      url: 'https://ttissoft.cn/testfile0?toUser=123',
      filePath: e.detail.tempAudioPath,
      name: 'testfile0',
      success:res=>{
        const feedback = JSON.parse(res.data)
        
        audioPathOnServer='https://ttissoft.cn/testfile0?filename='+feedback.filename;
        console.log("audioPathOnServer",audioPathOnServer)

        //信号生成
        const uuid=getUuid();
        console.log("uuid",uuid)
        const newSignal={
          uuid:uuid,
          fromUser:that.store.openId,
          toUser:that.data.friendInfo.openId,
          msgType:"audio",
          msgTime: "24:00",
          msgContent:audioPathOnServer
        }

        console.log("newSignal",newSignal)
        //发送部分
        if(that.store.socketOpen){
          wxp.sendSocketMessage({
            data: JSON.stringify(newSignal) 
          })
        }
        else{
          console.log("socketOpen: ",that.store.socketOpen)
        }

        //渲染部分
        if(this.store.conversations[this.data.friendInfo.openId]){
          this.store.conversations[this.data.friendInfo.openId][newSignal.uuid]=newSignal;
        }
        else{
          this.store.conversations[this.data.friendInfo.openId]={}
          this.store.conversations[this.data.friendInfo.openId][newSignal.uuid]=newSignal;
        }
        this.setDataSmart({
          conversations:this.store.conversations
        })

      },
      fail:err=>{
        console.log(err)
      }
    })

    
  }
  
  onSend(){
    //信号生成
    const uuid=getUuid();
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
    
    if(this.store.socketOpen){
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      })
    }
    else{
      console.log("socketOpen: ",this.store.socketOpen)
    }
    
    //渲染部分
    if(this.store.conversations[this.data.friendInfo.openId]){
      this.store.conversations[this.data.friendInfo.openId][newSignal.uuid]=newSignal;
    }
    else{
      this.store.conversations[this.data.friendInfo.openId]={}
      this.store.conversations[this.data.friendInfo.openId][newSignal.uuid]=newSignal;
    }
    
    this.setDataSmart({
      conversations:this.store.conversations
    })
    //console.log(newHistory)
    /*this.setDataSmart({
      history:newHistory
    })*/
    /*
    var newHistory=this.data.history;
    newHistory.unshift(newSignal)
    //console.log(newHistory)
    this.setDataSmart({
      history:newHistory
    })
    */
  }
  onExtra(){

  }

  audioPlaying=false;
  onClickAudio(e:any){
    if(this.audioPlaying){
      innerAudioContext.stop()
      this.audioPlaying=false;
    }else{
      this.audioPlaying=true;
      console.log(e.currentTarget.dataset.audio)
      innerAudioContext.src=e.currentTarget.dataset.audio;
      innerAudioContext.play()
    }
    
  }
  
  
  


}
