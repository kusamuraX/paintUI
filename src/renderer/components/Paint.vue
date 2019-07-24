<template>
<div class="container">
  <div class="flex-container">
    <div class="flex-item1">
      <div class="layer">
        <div v-for="(layer,index) in layer_option" :key="index">
          <canvasComponent 
            :index="layer.value" 
            :zIndex="layer.zIndex"
            :ref="'canvas_' + layer.value"   ></canvasComponent>
        </div>
      </div>
    </div>
    <div class="flex-item2">
      <div class="flex-item2-0">
        <label for="postUrlInput">接続先：</label>
        <input id="postUrlInput" v-model="connect_url" />
      </div>
      <div class="flex-item2-1">
        color : <input type="color" v-model="write_color" />
      </div>
      <div class="flex-item2-2">
        <label for="width-slider">width({{ write_width }}) : </label>
        <input type="range" id="width-slider" min="1" max="10" v-model="write_width" />
      </div>
      <div class="flex-item2-3">
        <b-form-checkbox v-model="connectStatus" name="check-button" @input="connect" switch>
          接続状態 <b>{{ connectStatus ? '接続中' : '未接続' }}</b>
        </b-form-checkbox>
      </div>
      <div class="flex-item2-4">
        <b-form-select v-model="select_layer" :options="layer_option" @change="changeLayer"></b-form-select>
        <b-button @click="addLayer">追加</b-button>
        <b-button @click="deleteLayer">削除</b-button>
        <b-button @click="clearCurrentCanvas">クリア</b-button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
// import axios from 'axios'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import CanvasComponent from './canvasComponent'
export default {
  components: { 'canvasComponent': CanvasComponent },
  data () {
    return {
      connect_url: 'http://localhost:8080/paint',
      connectStatus: false,
      write_color: '#000000',
      write_width: 1,
      select_layer: 1,
      layer_option: [ {value: 1, zIndex: 1, text: 'Layer1'} ]
    }
  },
  methods: {
    connect: function (event) {
      if (this.connectStatus) {
        // 接続する
        console.log('connect websocket')
        this.socket = new SockJS(this.connect_url)
        this.stompClient = Stomp.over(this.socket)
        this.stompClient.connect({}, frame => {
          console.log('Connected: ' + frame)
          this.connectStatus = true
          this.stompClient.subscribe('/broadcast/writer', message => {
            console.log(message.body)
          })
        }, errorCallback => {
          this.connectStatus = false
          console.log(errorCallback)
        })
      } else {
        // 切断する
        console.log('disconnect websocket')
        if (this.stompClient) {
          this.stompClient.disconnect()
          this.stompClient = null
          this.connectStatus = false
        }
      }
    },
    addLayer: function () {
      var currentSize = this.layer_option.length + 1
      this.layer_option.push({value: currentSize, zIndex: currentSize, text: 'Layer' + currentSize})
      this.select_layer = this.layer_option[currentSize - 1].value
      this.changeLayer()
    },
    deleteLayer: function () {
      if (this.layer_option.length > 1) {
        let index = 0
        for (; index < this.layer_option.length; index++) {
          if (this.layer_option[index].value === this.select_layer) {
            break
          }
        }
        this.layer_option.splice(index, 1)
        this.select_layer = this.layer_option[index - 1].value
        this.changeLayer()
      } else {
        alert('すべてのレイヤーを削除することはしないでほしいので禁止しておきます。')
      }
    },
    clearCurrentCanvas: function () {
      var canvasIndex = 'canvas_' + this.select_layer
      this.$refs[canvasIndex][0].clearCanvas()
    },
    changeLayer: function () {
      for (let i = 1; i <= this.layer_option.length; i++) {
        var canvasIndex = 'canvas_' + i
        if (i === this.select_layer) {
          this.$refs[canvasIndex][0].changeZIndex(this.layer_option.length + 1)
        } else {
          this.$refs[canvasIndex][0].changeZIndex(i)
        }
      }
    }
  }
}
</script>

<style scoped>
canvas {
  border: 1px solid #000;
}

.flex-container {
  padding: 5px;
  display: flex;
}

.layer {
  position: relative;
  height: 430px;
  width: 410px;
}

canvas {
  position: absolute;
  top: 0px;
  left: 0px;
}

.flex-item2 {
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.flex-item2-1 {
  padding: 5px;
}
.flex-item2-2 {
  display: table-cell;
  padding: 5px;
}
.flex-item2-4 {
  padding-top: 15px;
}
.flex-item2-4 > button{
  margin-top: 5px;
}
#width-slider{
  vertical-align:middle;
}
</style>
