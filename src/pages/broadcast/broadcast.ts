// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    current: "notice",
  }

  async onLoad(options: any) {
    console.log(await wxp.getUserInfo())
  }

  
  handleChange (e:any) {
    this.setDataSmart({
        current: e.detail.key
    });
    console.log("switch to tag: ",this.data.current)
  }

  onClickSearch(){
    console.log("click search")
  }
}
