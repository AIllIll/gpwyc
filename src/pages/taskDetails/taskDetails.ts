// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

const getUuid=require("uuid/v4")
@pagify()
export default class extends MyPage {
  data = {
    task:{
      uuid:"",

    }
  }

  async onLoad(options: any) {
    const task=JSON.parse(options.task)
    console.log("task details of ",task)
    this.setDataSmart({
      task:task
    })
  }

  onClickConfirm(){
    this.setTaskStatus(this.data.task.uuid,"已确认")
  }

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
}
