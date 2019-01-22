// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
const getUuid=require("uuid/v4")
const innerAudioContext=wx.createInnerAudioContext()

@pagify()
export default class extends MyPage {
  data = {
    groupId:"",
    groupMember:[],
    inputValue:"",
  }

  async onLoad(options: any) {
    
    console.log("groupChat onload")
    //console.log(JSON.parse(options.friendInfo))
    //渲染好友信息和消息
    await this.setDataSmart({
      groupId:JSON.parse(options.friendInfo).openId,
      groupMember:JSON.parse(options.friendInfo).member,
      conversations:this.store.conversations
    })
    //将这个好友列在联系人列表中
    this.store.contacts[this.data.groupId]=JSON.parse(options.friendInfo)
    this.setDataSmart({
      contacts:this.store.contacts
    })
    //创建callback，让receiver能进行页面渲染
    const that=this;
    this.store.groupChatPageCallback=function(){
      //页面渲染
      that.setDataSmart({
        conversations:this.conversations
      })
    }
    
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
    console.log("groupchat onshow")
  }
  async onHide(){
    console.log("groupchat onhide")
  }
  async onUnload(){
    console.log("groupchat onUnload")
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
          toUser:that.data.groupId,
          member:that.data.groupMember,
          msgType:"groupAudio",
          msgTime: msgTime,
          audioLength:audioLength.toFixed(1),
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
        if(this.store.conversations[this.data.groupId]){
          this.store.conversations[this.data.groupId][newSignal.uuid]=newSignal;
        }
        else{
          this.store.conversations[this.data.groupId]={}
          this.store.conversations[this.data.groupId][newSignal.uuid]=newSignal;
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
      toUser:this.data.groupId,
      member:this.data.groupMember,
      msgType:"groupText",
      msgTime: msgTime,
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
    if(this.store.conversations[this.data.groupId]){
      this.store.conversations[this.data.groupId][newSignal.uuid]=newSignal;
    }
    else{
      this.store.conversations[this.data.groupId]={}
      this.store.conversations[this.data.groupId][newSignal.uuid]=newSignal;
    }
    console.log(this.store.conversations[this.data.groupId])
    
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
