// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    date: '',
    time: '',
    title: '测试标题',
    detail: '内容内容内容',
    userList: new Array,
    subordinate: new Array, //接收者
  }

  async onLoad(options: any) {
    const userList = await this.getUserList();
    this.setDataSmart({
      userList: userList
    })
    console.log('userList', userList)
  }


  //网络函数
  async getUserList(){
    return await new Promise((resolve,reject)=>{
      wx.request({
        url:this.store.config.host+"/user/getUserList",
        success:res=>{
          if(res.data.status==="success"){
            resolve(res.data.data.userList)
          }else{
            reject()
          }
        }
      })
    })
  }
  async addTask(task:any){
    return await new Promise((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/task/add",
        method: "POST",
        data: {
          task:task
        },
        success:res=>{
          if(res.data.status==="success"){
            console.log(res.data.data.taskId)
            resolve(res.data.data)
          }else{
            reject()
          }
        }
      })
    }) 
  }


  //组件函数
  bindDateChange(e:any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  }
  bindTimeChange(e:any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  }
  bindTitleChange(e:any) {
    console.log('Title改变，携带值为', e.detail.detail.value)
    this.setDataSmart({
      title:e.detail.detail.value
    })
    
  }
  bindDetailChange(e:any) {
    console.log('Detail改变，携带值为', e.detail.detail.value)
    this.setDataSmart({
      detail:e.detail.detail.value
    })
  }
  handleSubordinateChange({ detail = {value:''} }) {
    const index = this.data.subordinate.indexOf(detail.value);
    index === -1 ? this.data.subordinate.push(detail.value) : this.data.subordinate.splice(index, 1);
    this.setDataSmart({
      subordinate: this.data.subordinate
    });
  }
  onClickConfirm(){
    if(this.data.subordinate.length==0){
      wx.showToast({
        title:'请至少选择一个成员',
        icon:'none'
      })
    }else{
      const openId = this.store.openId;
      const task = {
        leader: openId,
        subordinate: this.data.subordinate,
        title: this.data.title,
        detail: this.data.detail
      }
      this.addTask(task).then(res=>{
        wx.navigateBack({delta:1});
      });
    }
  }
}
