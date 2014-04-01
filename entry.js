var hammer = require('hammerjs')
var ui = require('getids')(document.body)
var closeness = require('closeness')
var released = true
var t0 = null
var h = window.innerHeight
var maxDelta = h * .76
var minTop = 0 - maxDelta
var maxTop = 0
var wasDragging = false
var dragged = 0;
var closeEnough = closeness(maxDelta, 5)
var closeEnoughD = closeness(0, 5)
var top = 0;

hammer(ui.top).on('swipeup', swipeup)
hammer(ui.top).on('swipedown',swipedown)
hammer(ui.top).on('release', function(){
  if(!wasDragging) return
  wasDragging = false
  var el = this
  this.classList.add('swipe')
  this.addEventListener('transitionend', function(evt){
    this.classList.remove('swipe')
    top = parseFloat(getCSS(this, 'top'))
  }) 
  
  if(parseFloat(getCSS(el, 'top')) < minTop / 2) el.style.top = minTop + 'px'  
  else el.style.top = '0px'
  top = parseFloat(getCSS(el, 'top'))
})
hammer(ui.top).on('dragup', dragup)
hammer(ui.top).on('dragdown',dragdown)

function dragdown(evt){
  wasDragging = true
  var el = this, t = 0
  if(closeEnoughD(t = parseFloat(getCSS(this, 'top')))) return
  else{
    var delta = evt.gesture.deltaY
    if(Math.abs(delta) > maxDelta) return
    else{
      this.style.top = top + delta + 'px' 
    }
  }
}
function dragup(evt){
  wasDragging = true
  var el = this;
  if(closeEnough(Math.abs(parseFloat(getCSS(this, 'top'))))) return
  var delta = evt.gesture.deltaY
  if(Math.abs(delta) > maxDelta) return
  else{
    this.style.top = delta + 'px'
  }
}

function swipedown(evt){
  wasDragging = false
  this.classList.add('swipe')
  this.style.top = '0'
  top = 0
  this.addEventListener('transitionend', function(evt){
    this.classList.remove('swipe')
    top = parseFloat(getCSS(this, 'top'))
  }) 
}

function swipeup(evt){
  wasDragging = false
  this.classList.add('swipe')
  this.style.top = 0 - maxDelta + 'px' 
  this.addEventListener('transitionend', function(evt){
    this.classList.remove('swipe')
    top = parseFloat(getCSS(this, 'top'))
  }) 
}

function getCSS(el, prop){
  return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}
