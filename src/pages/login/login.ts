// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
  }

  getUserInfo(e:any) {
    console.log(e)
    this.store.userInfo = e.detail.userInfo
    this.setDataSmart({
      userInfo: e.detail.userInfo
    })
  }

  wechatLogin(){
    if(this.store.userInfo){
      wxp.switchTab({
        url:"../conversations/conversations"
      })
    }else{
      wxp.showToast({
        title:"请先获取微信授权",
        icon:"none"
      })
    }
  }
}
