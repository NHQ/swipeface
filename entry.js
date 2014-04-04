var hammer = require('hammerjs')
var ui = require('getids')(document.body)
var closeness = require('closeness')
var released = true
var t0 = null
var h = window.innerHeight
var maxDelta = h * .86
var minTop = 0 - maxDelta
var maxTop = 0
var wasDragging = false
var dragged = 0;
var closeEnough = closeness(-maxDelta, 5)
var closeEnoughD = closeness(0, 5)
var top = 0;
var updown = false;

hammer(document.body).on('dragup dragdown swipeup swipedown', function(evt){
  evt.gesture.preventDefault()
})

ui.top.classList.add('swipe')
hammer(ui.top).on('swipeup', swipeup)
hammer(ui.top).on('swipedown',swipedown)
hammer(ui.top).on('release', function(evt){
  if(!wasDragging) return
  var d = evt.gesture.direction
  if(d == 'up' && updown) return
  if(d == 'down' && !updown) return
  wasDragging = false
  var el = this
  if(evt.gesture.direction == 'down') xxx = top
  else xxx = -top
  if(xxx < minTop / 2) {
    el.style['-webkit-transform'] = 'translate3D(0,'+(minTop)+'px,0)'
    top = -maxDelta
    updown = true
  }
  else {
    el.style['-webkit-transform'] = 'translate3D(0,'+(0)+'px,0)'
    top = 0
    updown = false 
  }
})
hammer(ui.top).on('dragup', dragup)
hammer(ui.top).on('dragdown',dragdown)

function dragdown(evt){
  wasDragging = true
  var el = this, t = 0
  if(!updown) return
  if(closeEnoughD(-top)) return
  else{
    var delta = evt.gesture.deltaY
    if(delta > maxDelta) {
      return
    }
    else{
      top = -maxDelta+delta
      this.style['-webkit-transform'] = 'translate3D(0,'+(-maxDelta+delta)+'px,0)'
    }
  }
}
function dragup(evt){
  wasDragging = true
  var el = this;
  if(updown) return 
  if(closeEnough(-top)) return
  var delta = evt.gesture.deltaY
  if(Math.abs(delta) > maxDelta) return
  else{
    top = -delta
    this.style['-webkit-transform'] = 'translate3D(0,'+(delta)+'px,0)'
  }
}

function swipedown(evt){
  wasDragging = false
  this.style['-webkit-transform'] = 'translate3D(0,'+(0)+'px,0)'
  updown = false
  top = 0
}

function swipeup(evt){
  wasDragging = false
  this.style['-webkit-transform'] = 'translate3D(0,'+(-maxDelta)+'px,0)'
  top = -maxDelta
  updown = true
}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}
