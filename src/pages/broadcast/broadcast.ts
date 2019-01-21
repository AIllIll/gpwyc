// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    current: "notice"
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
    this.setDataSmart({
      newsList_focus:[
        { newsType: 'oneImg', title: '北京公交纵火案嫌犯被拘 3人参与处置获奖金 ', img: ['../../images/2.jpg', '../../images/2.jpg',  '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'threeImg', title: '北京公交纵火案嫌犯被拘 3人参与处置获奖金', img: ['../../images/2.jpg', '../../images/2.jpg', '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'noImg', title: '北京公交纵火案嫌犯被拘 3人参与处置获奖金', img: ['../../images/2.jpg', '../../images/2.jpg', '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'bigImg', title: '北京公交纵火案嫌犯被拘 3人参与处置获奖金', img: ['../../images/2.jpg', '../../images/2.jpg', '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        //{ newsType: 'oneVideo', title: '北京公交纵火案嫌犯被拘 3人参与处置获奖金', img: ['../../images/2.jpg', '../../images/2.jpg', '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
      ],
      newsList_sports:[
        { newsType: 'oneImg', title: '周琦空接扣篮+连续投中三分 他有望进入火箭轮换吗 ', img: ['../../images/1.jpg', '../../images/1.jpg', '../../images/2.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'threeImg', title: '周琦空接扣篮+连续投中三分 他有望进入火箭轮换吗 ', img: ['../../images/1.jpg', '../../images/1.jpg', '../../images/2.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'noImg', title: '周琦空接扣篮+连续投中三分 他有望进入火箭轮换吗 ', img: ['../../images/1.jpg', '../../images/1.jpg', '../../images/2.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        { newsType: 'bigImg', title: '周琦空接扣篮+连续投中三分 他有望进入火箭轮换吗 ', img: ['../../images/1.jpg', '../../images/1.jpg', '../../images/2.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
        //{ newsType: 'oneVideo', title: '周琦空接扣篮+连续投中三分 他有望进入火箭轮换吗 ', img: ['../../images/1.jpg', '../../images/1.jpg', '../../images/1.jpg'], newsTime: new Date, content: '', vid: 'cloud://gpwyc-9125.6770-gpwyc-9125/m2.mp4' },
      ],
    }) 


    //创建callback，让receiver能进行页面渲染
    const that=this;
    this.store.newsPageCallback=function(){
      that.setDataSmart({
        notice:this.notice
      })
    }
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

  onClickAdd(){
    wxp.navigateTo({
      url:"../publish/publish"
    })
  }
}
