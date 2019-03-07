// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    //分享二维码------------
    dx:"",
    dy:"",
    QRcodeFilePath:"",
    shown:false
    //分享二维码------------
  }

  async onLoad(options: any) {

  }

  async onShow(){
    //this.showQRcode();
  }
  showQRcode(){
    // 使用 wx.createContext 获取绘图上下文 context
    if(this.store.windowHeight&&this.store.windowWidth){
      const height=this.store.windowHeight;
      const width=this.store.windowWidth;
      //二维码
      const cx=(width-200)/2;//左上角C
      const cy=(height-200)/2;
      const cw=200;//宽高
      const ch=200;
      //整体的
      const ax=cx-30;//留出30的边-----左上角A
      const ay=cy-100;//留出100的边
      const aw=200+60;
      const ah=100+200+30;
      //文字的左上角B
      const bx=cx;
      const by=cy-21-21-15;//两行18的字一行12的字刚好到二维码，留点余量好看一点
      //按钮的左上角
      const dx=cx-15;
      const dy=cy+200+50;
      this.setDataSmart({
        dx:dx,
        dy:dy,
        shown:true
      })
      const context = wx.createCanvasContext('QRcode',this)
      //外边框和底色
      context.rect(ax, ay, aw, ah)
      context.setFillStyle("rgb(255, 230, 0)")
      context.fill()
      //文字
      context.setFillStyle("black")
      context.setFontSize(18)
      context.fillText('分享复盘,', bx, by, 200)
      context.fillText('获得阅读精华复盘权限', bx+30, by+21,170)
      context.setFontSize(12)
      context.fillText('(新用户扫码注册后才视为分享成功)', bx, by+42,200)
      context.drawImage("../../images/QR.png",cx,cy,cw,ch)
      
      const that=this;
      context.draw(false,function(){
        wx.canvasToTempFilePath({
          canvasId:"QRcode",
          success:res=>{
            console.log(res.tempFilePath)
            that.data.QRcodeFilePath=res.tempFilePath
          }
        })
        
        
      })
    }else{
      console.log("没有窗口尺寸数据")
    }
  }

  saveQRcode(){
    console.log(this.data.QRcodeFilePath)
    wx.previewImage({urls:[this.data.QRcodeFilePath]})
    this.setDataSmart({
      shown:false,
      QRcodeFilePath:"",
    })
  }

  hideQRcode(){
    this.setDataSmart({
      shown:false,
      QRcodeFilePath:"",
    })
  }
}
