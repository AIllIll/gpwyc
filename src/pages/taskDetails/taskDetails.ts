// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

interface taskInfo{
  leader:string,
  title:string,
  detail:string,
  subordinate:Array<string>
}

interface task{
  _id:string,
  taskInfo:taskInfo
}
// const getUuid=require("uuid/v4")
@pagify()
export default class extends MyPage {
  data = {
    task:{}
  }

  async onLoad(options: any) {
    const taskId=options.taskId;
    const task:task = await this.getTaskOne(taskId);
    console.log("task", task)
    const leader = await this.getUserOne(task.taskInfo.leader);
    this.setDataSmart({
      task:task,
      leader:leader
    })
  }

  // 网络函数
  async getTaskOne(taskId:string){
    return await new Promise<task>((resolve)=>{
      wx.request({
        url: this.store.config.host+"/task/find",
        method: "GET",
        data: {
          taskId:taskId
        },
        success: (res:any) => {
          console.log("getTaskOne", res.data.data)
          if(res.data.status==="success"){
            resolve(res.data.data.task)
          }
        }
      })
    })
  }
  // 网络函数
  async getUserOne(openId:string){
    return await new Promise((resolve)=>{
      wx.request({
        url: this.store.config.host+"/user/find",
        method: "GET",
        data: {
          openId:openId
        },
        success: (res:any) => {
          console.log("getUserOne", res.data.data)
          if(res.data.status==="success"){
            resolve(res.data.data.user)
          }
        }
      })
    })
  }

  

  onClickConfirm(){
    // this.setTaskStatus(this.data.task.uuid,"已确认")
  }

  /*setTaskStatus(taskId:string,status:string){
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
  }*/
}
