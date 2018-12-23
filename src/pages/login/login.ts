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
    const store=this.store;
    if(this.store.userInfo){
      await wafer.request({
        login:true,
        url:"https://"+this.store.config.host+"/me",
        method:"GET",
        success:(res:any)=>{
          console.log(res)
          store.openId=res.data.openId;
          console.log("666")
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

}
