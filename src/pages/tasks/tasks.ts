// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

const getUuid=require("uuid/v4")
const wafer = require('wafer-client-sdk/index');
wafer.setLoginUrl('https://ttissoft.cn/login');
@pagify()
export default class extends MyPage {
  data = {
    tags: ["发起的任务", "收到的任务"],
    tagSelected: '0',//0or1 tags的下标
  }

  async onLoad(options: any) {

  }

  async onShow(){
    await this.getTasks(); 
  }

  onClickCell(e:any){
    //console.log(e.currentTarget.dataset.item)
    const task=e.currentTarget.dataset.item;
    wxp.navigateTo({
      url:"../taskDetails/taskDetails?task="+JSON.stringify(task)
    })
  }
  onClickTag(e:any) {
    this.setDataSmart({
      tagSelected: e.currentTarget.dataset.index
    })
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
        //已获得反馈
        console.log("myReceivedTasks",this.store.myReceivedTasks)
        this.store.myReleasedTasks=res.data.myReleasedTasks
        console.log("myReleasedTasks",this.store.myReleasedTasks)
      },
      fail:(err:any)=>{
        console.log(err)
      }
    })
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
