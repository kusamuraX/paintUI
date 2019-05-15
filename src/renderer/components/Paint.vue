<template>
 <div class="container">
    <canvas width="400" 
            height="400"
            class="canvas"
            ref="canvas"
            @click="onClick"
            @mousedown="onDown"
            @mouseup="onUp"
            @mousemove="onDrag" ></canvas>
    <br>
    <label for="postUrlInput">REST</label>
    <input id="postUrlInput" v-model="rest_url">
    <br>
    <b-btn @click="connect">Connect</b-btn>
    <b-btn @click="disconnect">Disconnect</b-btn>
    <br>
    {{ connectStatus }}
</div>
</template>
<script>
// import axios from 'axios'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
export default {
  data () {
    return {
      positionX: 0,
      positionY: 0,
      bf_posi_x: 0,
      bf_posi_y: 0,
      drag_flg: false,
      rest_url: 'http://localhost:8080/test',
      pointData: [],
      connectStatus: '未接続'
    }
  },
  mounted () {
    this.ctx = this.$refs.canvas.getContext('2d')
  },
  methods: {
    onClick: function (event) {
    },
    onDrag: function (event) {
      if (this.drag_flg) {
        var x = event.pageX - this.positionX
        var y = event.pageY - this.positionY
        this.ctx.beginPath()
        this.ctx.moveTo(this.bf_posi_x, this.bf_posi_y)
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
        this.ctx.closePath()
        this.bf_posi_x = x
        this.bf_posi_y = y
        this.pointData.push({point_x: this.bf_posi_x, point_y: this.bf_posi_y})
      }
    },
    onDown: function (event) {
      this.drag_flg = true
      if (this.positionX === 0 && this.positionY === 0) {
        var clientRect = this.$el.getBoundingClientRect()
        this.positionX = clientRect.left + window.pageXOffset + 15
        this.positionY = clientRect.top + window.pageYOffset
      }
      this.bf_posi_x = event.pageX - this.positionX
      this.bf_posi_y = event.pageY - this.positionY
      this.pointData.push({point_x: this.bf_posi_x, point_y: this.bf_posi_y})
    },
    onUp: function (event) {
      this.drag_flg = false
      this.sendData()
    },
    sendData: function () {
      var writeData = {pointArray: this.pointData}
      console.log(JSON.stringify(writeData))
      this.stompClient.send('/app/paint', JSON.stringify(writeData), {'Content-Type': 'application/json'})
      // REST用
      // axios.post(this.rest_url, JSON.stringify(writeData),
      //   {
      //     headers: {'Content-Type': 'application/json'}
      //   })
      this.pointData = []
    },
    connect: function (event) {
      console.log('connect websocket')
      this.socket = new SockJS('http://localhost:8080/paint')
      this.stompClient = Stomp.over(this.socket)
      this.stompClient.connect({}, frame => {
        console.log('Connected: ' + frame)
        this.connectStatus = '接続済み'
        this.stompClient.subscribe('/broadcast/writer', message => {
          console.log(message.body)
        })
      })
    },
    disconnect: function (event) {
      console.log('disconnect websocket')
      if (this.stompClient) {
        this.stompClient.disconnect()
        this.stompClient = null
        this.connectStatus = '未接続'
      }
    }
  }
}
</script>

<style scoped>
.canvas {
  border: 1px solid #000;
}
</style>