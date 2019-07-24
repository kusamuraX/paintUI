<template>
  <canvas width="400" height="400" 
          class="canvas" 
          :id="'my_canvas_' + index " 
          :ref="'canvas_' + index" 
          :style="'z-index:' + z_index"
          @click="onClick" 
          @mousedown="onDown" 
          @mouseup="onUp" 
          @mousemove="onDrag"
          @drop="dropImg"></canvas>
</template>

<script>
export default {
  props: ['index', 'zIndex'],
  data () {
    return {
      z_index: this.zIndex,
      positionX: 0,
      positionY: 0,
      bf_posi_x: 0,
      bf_posi_y: 0,
      drag_flg: false,
      pointData: []
    }
  },
  mounted () {
    var canvasIndex = 'canvas_' + this.index
    this.ctx = this.$refs[canvasIndex].getContext('2d')
    document.ondragover = document.ondrop = function (e) {
      e.preventDefault()
      return false
    }
  },
  methods: {
    onClick: function (event) {},
    onDrag: function (event) {
      if (this.drag_flg) {
        var x = event.pageX - this.positionX
        var y = event.pageY - this.positionY
        this.ctx.beginPath()
        this.ctx.strokeStyle = this.$parent.write_color
        this.ctx.lineWidth = this.$parent.write_width
        this.ctx.moveTo(this.bf_posi_x, this.bf_posi_y)
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
        this.ctx.closePath()
        this.bf_posi_x = x
        this.bf_posi_y = y
        this.pointData.push({
          point_x: this.bf_posi_x,
          point_y: this.bf_posi_y
        })
      }
    },
    onDown: function (event) {
      this.drag_flg = true
      if (this.positionX === 0 && this.positionY === 0) {
        var clientRect = this.$el.getBoundingClientRect()
        this.positionX = clientRect.left + window.pageXOffset
        this.positionY = clientRect.top + window.pageYOffset
      }
      this.bf_posi_x = event.pageX - this.positionX
      this.bf_posi_y = event.pageY - this.positionY
      this.pointData.push({
        point_x: this.bf_posi_x,
        point_y: this.bf_posi_y
      })
    },
    onUp: function (event) {
      this.drag_flg = false
      this.sendData()
    },
    sendData: function () {
      if (this.$parent.stompClient) {
        var writeData = {
          pointArray: this.pointData,
          style: {
            color: this.$parent.write_color,
            width: this.$parent.write_width
          }
        }
        console.log(JSON.stringify(writeData))
        this.$parent.stompClient.send('/app/paint', JSON.stringify(writeData))
      }
      // REST用
      // axios.post(this.rest_url, JSON.stringify(writeData),
      //   {
      //     headers: {'Content-Type': 'application/json'}
      //   })
      this.pointData = []
    },
    draw: function (image) {
      var scale = 1.0
      if (image.height > image.width) {
        // 縦長
        if (image.height > 400) {
          scale = parseFloat(400.0 / image.height)
        }
      } else if (image.height < image.width) {
        // 横長
        if (image.width > 400) {
          scale = parseFloat(400.0 / image.width)
        }
      }
      this.ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale)
    },
    dropImg: function (event) {
      event.preventDefault()
      var file = event.dataTransfer.files[0]
      var image = new Image()
      image.onload = () => this.draw(image)
      var fileReader = new FileReader()
      fileReader.onload = function (e) {
        image.src = e.target.result
      }
      fileReader.readAsDataURL(file)
    },
    clearCanvas: function () {
      this.ctx.clearRect(0, 0, 400, 400)
    },
    changeZIndex: function (index) {
      this.z_index = index
    }
  }
}
</script>

