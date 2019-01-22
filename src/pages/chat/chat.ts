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
    console.log("chat onload")
    //console.log(JSON.parse(options.friendInfo))
    //渲染好友信息和消息
    await this.setDataSmart({
      friendInfo:JSON.parse(options.friendInfo),
      conversations:this.store.conversations
    })
    //将这个好友列在联系人列表中
    this.store.contacts[this.data.friendInfo.openId]=this.data.friendInfo
    this.setDataSmart({
      contacts:this.store.contacts
    })
    console.log("this.store.contacts[this.data.friendInfo.openId]",this.store.contacts[this.data.friendInfo.openId])
    //已收到的未读信号，在点开的时候进行反馈已读，并且标记当前聊天对象
    this.store.currentChat=this.data.friendInfo.openId;
    for(var key in this.store.conversations[this.data.friendInfo.openId]){
      const signal=this.store.conversations[this.data.friendInfo.openId][key];
      if(signal.msgStatus=="已发送"&&signal.fromUser==this.data.friendInfo.openId){
        console.log("刚打开页面 进行feedback")
        signal.msgStatus="已读"
        this.readFeedback(this.data.friendInfo.openId,this.store.conversations[this.data.friendInfo.openId][key].uuid)
      }
    }
    //创建callback，让receiver能进行页面渲染
    const that=this;
    this.store.chatPageCallback=function(fromUser:any="none"){
      console.log(fromUser)
      //页面渲染
      that.setDataSmart({
        conversations:this.conversations
      })
      //进行页面渲染说明接收到了信号，如果信号来源和当前对象一致，可以进行feedback
      if(that.store.currentChat==fromUser){
        for(var key in that.store.conversations[that.data.friendInfo.openId]){
          const signal=that.store.conversations[that.data.friendInfo.openId][key];
          if(signal.msgStatus=="已发送"&&signal.fromUser==that.data.friendInfo.openId){
            console.log("callback 信号来源和当前对象一致 进行feedback")
            signal.msgStatus="已读"
            that.readFeedback(that.data.friendInfo.openId,that.store.conversations[that.data.friendInfo.openId][key].uuid)
          }
        }
      }
    }
    /*
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
    */


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

  async onShow(){
    console.log("chat onshow")
  }
  async onHide(){
    console.log("chat onhide")
  }

  async onUnload(){
    console.log("chat onUnload")
    //清空当前聊天对象
    this.store.currentChat=null;
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

        const date=new Date();
        const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.toTimeString().slice(0,8)
        const audioLength=e.detail.audioLength;
        console.log("audioLength",audioLength)
        //信号生成
        const uuid=getUuid();
        console.log("uuid",uuid)
        const newSignal={
          uuid:uuid,
          fromUser:that.store.openId,
          toUser:that.data.friendInfo.openId,
          msgType:"audio",
          msgTime: msgTime,
          audioLength:audioLength.toFixed(1),
          msgStatus:'已发送',
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
    const date=new Date();
    const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.toTimeString().slice(0,8)
     //const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    const uuid=getUuid();
    console.log("uuid",uuid)
    const newSignal={
      uuid:uuid,
      fromUser:this.store.openId,
      toUser:this.data.friendInfo.openId,
      msgType:"text",
      msgTime: msgTime,
      msgStatus:'已发送', 
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
  

  //已读反馈
  readFeedback(toUser:string,feedbackUuid:string){
    //信号生成
    const date=new Date();
    const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.toTimeString().slice(0,8)
     //const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    const uuid=getUuid();
    console.log("uuid",uuid)
    const newSignal={
      uuid:uuid,
      fromUser:this.store.openId,
      toUser:toUser,
      feedbackUuid:feedbackUuid,
      msgType:"feedback",
      msgTime: msgTime,
      msgStatus:'已读'
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
  
  


}
