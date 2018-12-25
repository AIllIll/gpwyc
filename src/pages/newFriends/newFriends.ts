// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'


const wafer = require('wafer-client-sdk/index');
wafer.setLoginUrl('https://ttissoft.cn/login');

@pagify()
export default class extends MyPage {
  data = {
    searchResults:{}
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
    await wafer.request({
      login:true,
      url:"https://"+this.store.config.host+"/users",
      method:"GET",
      success:(res:any)=>{
        //console.log("获取全用户列表成功",res)
        this.setDataSmart({
          searchResults:res.data
        })
      },
      fail:(err:any)=>{
        console.log(err)
      }
    })
  }

  onClickCell(e:any){
    //console.log(e.currentTarget.dataset.item)
    const friendInfo=e.currentTarget.dataset.item;
    wxp.navigateTo({
      url:"../chat/chat?friendInfo="+JSON.stringify(friendInfo)
    })
  }
}
