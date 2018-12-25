// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
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

  async onLoad(options: any) {
    //console.log(JSON.parse(options.friendInfo))
    this.setDataSmart({
      friendInfo:JSON.parse(options.friendInfo)
    })
    //this.connect()
  }

  async onUnload(){
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
    
    if(this.store.socketOpen){
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      })
    }
    else{
      console.log("socketOpen: ",this.store.socketOpen)
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
  
  
  


}
