(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"closeness":2,"getids":3,"hammerjs":4}],2:[function(require,module,exports){
module.exports = function(num, dist){
	return function(val){
		return (Math.abs(num - val) < dist)
	}
};
},{}],3:[function(require,module,exports){
module.exports = function(el){

    var ids = {};

    if('string' == typeof el) el = document.getElementById(el);

    if(!el) el = document;

    var children = el.getElementsByTagName('*');

    Array.prototype.forEach.call(children, function(e){

	if(e.id.length > 0){

	    ids[e.id] = e

	}

    })

    return ids

}

},{}],4:[function(require,module,exports){
/*! Hammer.JS - v1.0.10 - 2014-03-28
 * http://eightmedia.github.io/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
  'use strict';

/**
 * Hammer
 * use this to create instances
 * @param   {HTMLElement}   element
 * @param   {Object}        options
 * @returns {Hammer.Instance}
 * @constructor
 */
var Hammer = function(element, options) {
  return new Hammer.Instance(element, options || {});
};

Hammer.VERSION = '1.0.10';

// default settings
Hammer.defaults = {
  // add styles and attributes to the element to prevent the browser from doing
  // its native behavior. this doesnt prevent the scrolling, but cancels
  // the contextmenu, tap highlighting etc
  // set to false to disable this
  stop_browser_behavior: {
    // this also triggers onselectstart=false for IE
    userSelect       : 'none',
    // this makes the element blocking in IE10>, you could experiment with the value
    // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
    touchAction      : 'none',
    touchCallout     : 'none',
    contentZooming   : 'none',
    userDrag         : 'none',
    tapHighlightColor: 'rgba(0,0,0,0)'
  }

  //
  // more settings are defined per gesture at /gestures
  //
};


// detect touchevents
Hammer.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

// dont use mouseevents on mobile devices
Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;
Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && window.navigator.userAgent.match(Hammer.MOBILE_REGEX);

// eventtypes per touchevent (start, move, end)
// are filled by Event.determineEventTypes on setup
Hammer.EVENT_TYPES = {};

// interval in which Hammer recalculates current velocity in ms
Hammer.UPDATE_VELOCITY_INTERVAL = 16;

// hammer document where the base events are added at
Hammer.DOCUMENT = window.document;

// define these also as vars, for better minification
// direction defines
var DIRECTION_DOWN = Hammer.DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = Hammer.DIRECTION_LEFT = 'left';
var DIRECTION_UP = Hammer.DIRECTION_UP = 'up';
var DIRECTION_RIGHT = Hammer.DIRECTION_RIGHT = 'right';

// pointer type
var POINTER_MOUSE = Hammer.POINTER_MOUSE = 'mouse';
var POINTER_TOUCH = Hammer.POINTER_TOUCH = 'touch';
var POINTER_PEN = Hammer.POINTER_PEN = 'pen';

// touch event defines
var EVENT_START = Hammer.EVENT_START = 'start';
var EVENT_MOVE = Hammer.EVENT_MOVE = 'move';
var EVENT_END = Hammer.EVENT_END = 'end';


// plugins and gestures namespaces
Hammer.plugins = Hammer.plugins || {};
Hammer.gestures = Hammer.gestures || {};


// if the window events are set...
Hammer.READY = false;


/**
 * setup events to detect gestures on the document
 */
function setup() {
  if(Hammer.READY) {
    return;
  }

  // find what eventtypes we add listeners to
  Event.determineEventTypes();

  // Register all gestures inside Hammer.gestures
  Utils.each(Hammer.gestures, function(gesture){
    Detection.register(gesture);
  });

  // Add touch events on the document
  Event.onTouch(Hammer.DOCUMENT, EVENT_MOVE, Detection.detect);
  Event.onTouch(Hammer.DOCUMENT, EVENT_END, Detection.detect);

  // Hammer is ready...!
  Hammer.READY = true;
}

var Utils = Hammer.utils = {
  /**
   * extend method,
   * also used for cloning when dest is an empty object
   * @param   {Object}    dest
   * @param   {Object}    src
   * @parm  {Boolean}  merge    do a merge
   * @returns {Object}    dest
   */
  extend: function extend(dest, src, merge) {
    for(var key in src) {
      if(dest[key] !== undefined && merge) {
        continue;
      }
      dest[key] = src[key];
    }
    return dest;
  },


  /**
   * for each
   * @param obj
   * @param iterator
   */
  each: function each(obj, iterator, context) {
    var i, o;
    // native forEach on arrays
    if ('forEach' in obj) {
      obj.forEach(iterator, context);
    }
    // arrays
    else if(obj.length !== undefined) {
      for(i=-1; (o=obj[++i]);) {
        if (iterator.call(context, o, i, obj) === false) {
          return;
        }
      }
    }
    // objects
    else {
      for(i in obj) {
        if(obj.hasOwnProperty(i) &&
            iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    }
  },


  /**
   * find if a string contains the needle
   * @param   {String}  src
   * @param   {String}  needle
   * @returns {Boolean} found
   */
  inStr: function inStr(src, needle) {
    return src.indexOf(needle) > -1;
  },


  /**
   * find if a node is in the given parent
   * used for event delegation tricks
   * @param   {HTMLElement}   node
   * @param   {HTMLElement}   parent
   * @returns {boolean}       has_parent
   */
  hasParent: function hasParent(node, parent) {
    while(node) {
      if(node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },


  /**
   * get the center of all the touches
   * @param   {Array}     touches
   * @returns {Object}    center pageXY clientXY
   */
  getCenter: function getCenter(touches) {
    var pageX = []
      , pageY = []
      , clientX = []
      , clientY = []
      , min = Math.min
      , max = Math.max;

    // no need to loop when only one touch
    if(touches.length === 1) {
      return {
        pageX: touches[0].pageX,
        pageY: touches[0].pageY,
        clientX: touches[0].clientX,
        clientY: touches[0].clientY
      };
    }

    Utils.each(touches, function(touch) {
      pageX.push(touch.pageX);
      pageY.push(touch.pageY);
      clientX.push(touch.clientX);
      clientY.push(touch.clientY);
    });

    return {
      pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
      pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
      clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
      clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
    };
  },


  /**
   * calculate the velocity between two points
   * @param   {Number}    delta_time
   * @param   {Number}    delta_x
   * @param   {Number}    delta_y
   * @returns {Object}    velocity
   */
  getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
    return {
      x: Math.abs(delta_x / delta_time) || 0,
      y: Math.abs(delta_y / delta_time) || 0
    };
  },


  /**
   * calculate the angle between two coordinates
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {Number}    angle
   */
  getAngle: function getAngle(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX
      , y = touch2.clientY - touch1.clientY;
    return Math.atan2(y, x) * 180 / Math.PI;
  },


  /**
   * angle to direction define
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {String}    direction constant, like DIRECTION_LEFT
   */
  getDirection: function getDirection(touch1, touch2) {
    var x = Math.abs(touch1.clientX - touch2.clientX)
      , y = Math.abs(touch1.clientY - touch2.clientY);
    if(x >= y) {
      return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  },


  /**
   * calculate the distance between two touches
   * @param   {Touch}     touch1
   * @param   {Touch}     touch2
   * @returns {Number}    distance
   */
  getDistance: function getDistance(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX
      , y = touch2.clientY - touch1.clientY;
    return Math.sqrt((x * x) + (y * y));
  },


  /**
   * calculate the scale factor between two touchLists (fingers)
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param   {Array}     start
   * @param   {Array}     end
   * @returns {Number}    scale
   */
  getScale: function getScale(start, end) {
    // need two fingers...
    if(start.length >= 2 && end.length >= 2) {
      return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
    }
    return 1;
  },


  /**
   * calculate the rotation degrees between two touchLists (fingers)
   * @param   {Array}     start
   * @param   {Array}     end
   * @returns {Number}    rotation
   */
  getRotation: function getRotation(start, end) {
    // need two fingers
    if(start.length >= 2 && end.length >= 2) {
      return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
    }
    return 0;
  },


  /**
   * boolean if the direction is vertical
   * @param    {String}    direction
   * @returns  {Boolean}   is_vertical
   */
  isVertical: function isVertical(direction) {
    return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
  },


  /**
   * toggle browser default behavior with css props
   * @param   {HtmlElement}   element
   * @param   {Object}        css_props
   * @param   {Boolean}       toggle
   */
  toggleDefaultBehavior: function toggleDefaultBehavior(element, css_props, toggle) {
    if(!css_props || !element || !element.style) {
      return;
    }

    // with css properties for modern browsers
    Utils.each(['webkit', 'moz', 'Moz', 'ms', 'o', ''], function setStyle(vendor) {
      Utils.each(css_props, function(value, prop) {
          // vender prefix at the property
          if(vendor) {
            prop = vendor + prop.substring(0, 1).toUpperCase() + prop.substring(1);
          }
          // set the style
          if(prop in element.style) {
            element.style[prop] = !toggle && value;
          }
      });
    });

    var false_fn = function(){ return false; };

    // also the disable onselectstart
    if(css_props.userSelect == 'none') {
      element.onselectstart = !toggle && false_fn;
    }
    // and disable ondragstart
    if(css_props.userDrag == 'none') {
      element.ondragstart = !toggle && false_fn;
    }
  }
};


/**
 * create new hammer instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @param   {Object}            [options={}]
 * @returns {Hammer.Instance}
 * @constructor
 */
Hammer.Instance = function(element, options) {
  var self = this;

  // setup HammerJS window events and register all gestures
  // this also sets up the default options
  setup();

  this.element = element;

  // start/stop detection option
  this.enabled = true;

  // merge options
  this.options = Utils.extend(
    Utils.extend({}, Hammer.defaults),
    options || {});

  // add some css to the element to prevent the browser from doing its native behavoir
  if(this.options.stop_browser_behavior) {
    Utils.toggleDefaultBehavior(this.element, this.options.stop_browser_behavior, false);
  }

  // start detection on touchstart
  this.eventStartHandler = Event.onTouch(element, EVENT_START, function(ev) {
    if(self.enabled) {
      Detection.startDetect(self, ev);
    }
  });

  // keep a list of user event handlers which needs to be removed when calling 'dispose'
  this.eventHandlers = [];

  // return instance
  return this;
};


Hammer.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {String}      gesture
   * @param   {Function}    handler
   * @returns {Hammer.Instance}
   */
  on: function onEvent(gesture, handler) {
    var gestures = gesture.split(' ');
    Utils.each(gestures, function(gesture) {
      this.element.addEventListener(gesture, handler, false);
      this.eventHandlers.push({ gesture: gesture, handler: handler });
    }, this);
    return this;
  },


  /**
   * unbind events to the instance
   * @param   {String}      gesture
   * @param   {Function}    handler
   * @returns {Hammer.Instance}
   */
  off: function offEvent(gesture, handler) {
    var gestures = gesture.split(' ')
      , i, eh;
    Utils.each(gestures, function(gesture) {
      this.element.removeEventListener(gesture, handler, false);

      // remove the event handler from the internal list
      for(i=-1; (eh=this.eventHandlers[++i]);) {
        if(eh.gesture === gesture && eh.handler === handler) {
          this.eventHandlers.splice(i, 1);
        }
      }
    }, this);
    return this;
  },


  /**
   * trigger gesture event
   * @param   {String}      gesture
   * @param   {Object}      [eventData]
   * @returns {Hammer.Instance}
   */
  trigger: function triggerEvent(gesture, eventData) {
    // optional
    if(!eventData) {
      eventData = {};
    }

    // create DOM event
    var event = Hammer.DOCUMENT.createEvent('Event');
    event.initEvent(gesture, true, true);
    event.gesture = eventData;

    // trigger on the target if it is in the instance element,
    // this is for event delegation tricks
    var element = this.element;
    if(Utils.hasParent(eventData.target, element)) {
      element = eventData.target;
    }

    element.dispatchEvent(event);
    return this;
  },


  /**
   * enable of disable hammer.js detection
   * @param   {Boolean}   state
   * @returns {Hammer.Instance}
   */
  enable: function enable(state) {
    this.enabled = state;
    return this;
  },


  /**
   * dispose this hammer instance
   * @returns {Hammer.Instance}
   */
  dispose: function dispose() {
    var i, eh;

    // undo all changes made by stop_browser_behavior
    if(this.options.stop_browser_behavior) {
      Utils.toggleDefaultBehavior(this.element, this.options.stop_browser_behavior, true);
    }

    // unbind all custom event handlers
    for(i=-1; (eh=this.eventHandlers[++i]);) {
      this.element.removeEventListener(eh.gesture, eh.handler, false);
    }
    this.eventHandlers = [];

    // unbind the start event listener
    Event.unbindDom(this.element, Hammer.EVENT_TYPES[EVENT_START], this.eventStartHandler);

    return null;
  }
};


/**
 * this holds the last move event,
 * used to fix empty touchend issue
 * see the onTouch event for an explanation
 * @type {Object}
 */
var last_move_event = null;

/**
 * when the mouse is hold down, this is true
 * @type {Boolean}
 */
var should_detect = false;

/**
 * when touch events have been fired, this is true
 * @type {Boolean}
 */
var touch_triggered = false;


var Event = Hammer.event = {
  /**
   * simple addEventListener
   * @param   {HTMLElement}   element
   * @param   {String}        type
   * @param   {Function}      handler
   */
  bindDom: function(element, type, handler) {
    var types = type.split(' ');
    Utils.each(types, function(type){
      element.addEventListener(type, handler, false);
    });
  },


  /**
   * simple removeEventListener
   * @param   {HTMLElement}   element
   * @param   {String}        type
   * @param   {Function}      handler
   */
  unbindDom: function(element, type, handler) {
    var types = type.split(' ');
    Utils.each(types, function(type){
      element.removeEventListener(type, handler, false);
    });
  },


  /**
   * touch events with mouse fallback
   * @param   {HTMLElement}   element
   * @param   {String}        eventType        like EVENT_MOVE
   * @param   {Function}      handler
   */
  onTouch: function onTouch(element, eventType, handler) {
    var self = this;


    var bindDomOnTouch = function bindDomOnTouch(ev) {
      var srcEventType = ev.type.toLowerCase();

      // onmouseup, but when touchend has been fired we do nothing.
      // this is for touchdevices which also fire a mouseup on touchend
      if(Utils.inStr(srcEventType, 'mouse') && touch_triggered) {
        return;
      }

      // mousebutton must be down or a touch event
      else if(Utils.inStr(srcEventType, 'touch') ||   // touch events are always on screen
        Utils.inStr(srcEventType, 'pointerdown') || // pointerevents touch
        (Utils.inStr(srcEventType, 'mouse') && ev.which === 1)   // mouse is pressed
        ) {
        should_detect = true;
      }

      // mouse isn't pressed
      else if(Utils.inStr(srcEventType, 'mouse') && !ev.which) {
        should_detect = false;
      }


      // we are in a touch event, set the touch triggered bool to true,
      // this for the conflicts that may occur on ios and android
      if(Utils.inStr(srcEventType, 'touch') || Utils.inStr(srcEventType, 'pointer')) {
        touch_triggered = true;
      }

      // count the total touches on the screen
      var count_touches = 0;

      // when touch has been triggered in this detection session
      // and we are now handling a mouse event, we stop that to prevent conflicts
      if(should_detect) {
        // update pointerevent
        if(Hammer.HAS_POINTEREVENTS && eventType != EVENT_END) {
          count_touches = PointerEvent.updatePointer(eventType, ev);
        }
        // touch
        else if(Utils.inStr(srcEventType, 'touch')) {
          count_touches = ev.touches.length;
        }
        // mouse
        else if(!touch_triggered) {
          count_touches = Utils.inStr(srcEventType, 'up') ? 0 : 1;
        }


        // if we are in a end event, but when we remove one touch and
        // we still have enough, set eventType to move
        if(count_touches > 0 && eventType == EVENT_END) {
          eventType = EVENT_MOVE;
        }
        // no touches, force the end event
        else if(!count_touches) {
          eventType = EVENT_END;
        }

        // store the last move event
        if(count_touches || last_move_event === null) {
          last_move_event = ev;
        }


        // trigger the handler
        handler.call(Detection, self.collectEventData(element, eventType,
                                  self.getTouchList(last_move_event, eventType),
                                  ev) );

        // remove pointerevent from list
        if(Hammer.HAS_POINTEREVENTS && eventType == EVENT_END) {
          count_touches = PointerEvent.updatePointer(eventType, ev);
        }
      }

      // on the end we reset everything
      if(!count_touches) {
        last_move_event = null;
        should_detect = false;
        touch_triggered = false;
        PointerEvent.reset();
      }
    };

    this.bindDom(element, Hammer.EVENT_TYPES[eventType], bindDomOnTouch);

    // return the bound function to be able to unbind it later
    return bindDomOnTouch;
  },


  /**
   * we have different events for each device/browser
   * determine what we need and set them in the Hammer.EVENT_TYPES constant
   */
  determineEventTypes: function determineEventTypes() {
    // determine the eventtype we want to set
    var types;

    // pointerEvents magic
    if(Hammer.HAS_POINTEREVENTS) {
      types = PointerEvent.getEvents();
    }
    // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
    else if(Hammer.NO_MOUSEEVENTS) {
      types = [
        'touchstart',
        'touchmove',
        'touchend touchcancel'];
    }
    // for non pointer events browsers and mixed browsers,
    // like chrome on windows8 touch laptop
    else {
      types = [
        'touchstart mousedown',
        'touchmove mousemove',
        'touchend touchcancel mouseup'];
    }

    Hammer.EVENT_TYPES[EVENT_START] = types[0];
    Hammer.EVENT_TYPES[EVENT_MOVE] = types[1];
    Hammer.EVENT_TYPES[EVENT_END] = types[2];
  },


  /**
   * create touchlist depending on the event
   * @param   {Object}    ev
   * @param   {String}    eventType   used by the fakemultitouch plugin
   */
  getTouchList: function getTouchList(ev/*, eventType*/) {
    // get the fake pointerEvent touchlist
    if(Hammer.HAS_POINTEREVENTS) {
      return PointerEvent.getTouchList();
    }

    // get the touchlist
    if(ev.touches) {
      return ev.touches;
    }

    // make fake touchlist from mouse position
    ev.identifier = 1;
    return [ev];
  },


  /**
   * collect event data for Hammer js
   * @param   {HTMLElement}   element
   * @param   {String}        eventType        like EVENT_MOVE
   * @param   {Object}        eventData
   */
  collectEventData: function collectEventData(element, eventType, touches, ev) {
    // find out pointerType
    var pointerType = POINTER_TOUCH;
    if(Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
      pointerType = POINTER_MOUSE;
    }

    return {
      center     : Utils.getCenter(touches),
      timeStamp  : Date.now(),
      target     : ev.target,
      touches    : touches,
      eventType  : eventType,
      pointerType: pointerType,
      srcEvent   : ev,

      /**
       * prevent the browser default actions
       * mostly used to disable scrolling of the browser
       */
      preventDefault: function() {
        var srcEvent = this.srcEvent;
        srcEvent.preventManipulation && srcEvent.preventManipulation();
        srcEvent.preventDefault && srcEvent.preventDefault();
      },

      /**
       * stop bubbling the event up to its parents
       */
      stopPropagation: function() {
        this.srcEvent.stopPropagation();
      },

      /**
       * immediately stop gesture detection
       * might be useful after a swipe was detected
       * @return {*}
       */
      stopDetect: function() {
        return Detection.stopDetect();
      }
    };
  }
};

var PointerEvent = Hammer.PointerEvent = {
  /**
   * holds all pointers
   * @type {Object}
   */
  pointers: {},

  /**
   * get a list of pointers
   * @returns {Array}     touchlist
   */
  getTouchList: function getTouchList() {
    var touchlist = [];
    // we can use forEach since pointerEvents only is in IE10
    Utils.each(this.pointers, function(pointer){
      touchlist.push(pointer);
    });

    return touchlist;
  },

  /**
   * update the position of a pointer
   * @param   {String}   type             EVENT_END
   * @param   {Object}   pointerEvent
   */
  updatePointer: function updatePointer(type, pointerEvent) {
    if(type == EVENT_END) {
      delete this.pointers[pointerEvent.pointerId];
    }
    else {
      pointerEvent.identifier = pointerEvent.pointerId;
      this.pointers[pointerEvent.pointerId] = pointerEvent;
    }

    // it's save to use Object.keys, since pointerEvents are only in newer browsers
    return Object.keys(this.pointers).length;
  },

  /**
   * check if ev matches pointertype
   * @param   {String}        pointerType     POINTER_MOUSE
   * @param   {PointerEvent}  ev
   */
  matchType: function matchType(pointerType, ev) {
    if(!ev.pointerType) {
      return false;
    }

    var pt = ev.pointerType
      , types = {};

    types[POINTER_MOUSE] = (pt === POINTER_MOUSE);
    types[POINTER_TOUCH] = (pt === POINTER_TOUCH);
    types[POINTER_PEN] = (pt === POINTER_PEN);
    return types[pointerType];
  },


  /**
   * get events
   */
  getEvents: function getEvents() {
    return [
      'pointerdown MSPointerDown',
      'pointermove MSPointerMove',
      'pointerup pointercancel MSPointerUp MSPointerCancel'
    ];
  },

  /**
   * reset the list
   */
  reset: function resetList() {
    this.pointers = {};
  }
};


var Detection = Hammer.detection = {
  // contains all registred Hammer.gestures in the correct order
  gestures: [],

  // data of the current Hammer.gesture detection session
  current : null,

  // the previous Hammer.gesture session data
  // is a full clone of the previous gesture.current object
  previous: null,

  // when this becomes true, no gestures are fired
  stopped : false,


  /**
   * start Hammer.gesture detection
   * @param   {Hammer.Instance}   inst
   * @param   {Object}            eventData
   */
  startDetect: function startDetect(inst, eventData) {
    // already busy with a Hammer.gesture detection on an element
    if(this.current) {
      return;
    }

    this.stopped = false;

    // holds current session
    this.current = {
      inst              : inst, // reference to HammerInstance we're working for
      startEvent        : Utils.extend({}, eventData), // start eventData for distances, timing etc
      lastEvent         : false, // last eventData
      lastVelocityEvent : false, // last eventData for velocity.
      velocity          : false, // current velocity
      name              : '' // current gesture we're in/detected, can be 'tap', 'hold' etc
    };

    this.detect(eventData);
  },


  /**
   * Hammer.gesture detection
   * @param   {Object}    eventData
   */
  detect: function detect(eventData) {
    if(!this.current || this.stopped) {
      return;
    }

    // extend event data with calculations about scale, distance etc
    eventData = this.extendEventData(eventData);

    // hammer instance and instance options
    var inst = this.current.inst,
        inst_options = inst.options;

    // call Hammer.gesture handlers
    Utils.each(this.gestures, function triggerGesture(gesture) {
      // only when the instance options have enabled this gesture
      if(!this.stopped && inst_options[gesture.name] !== false && inst.enabled !== false ) {
        // if a handler returns false, we stop with the detection
        if(gesture.handler.call(gesture, eventData, inst) === false) {
          this.stopDetect();
          return false;
        }
      }
    }, this);

    // store as previous event event
    if(this.current) {
      this.current.lastEvent = eventData;
    }

    // end event, but not the last touch, so dont stop
    if(eventData.eventType == EVENT_END && !eventData.touches.length - 1) {
      this.stopDetect();
    }

    return eventData;
  },


  /**
   * clear the Hammer.gesture vars
   * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
   * to stop other Hammer.gestures from being fired
   */
  stopDetect: function stopDetect() {
    // clone current data to the store as the previous gesture
    // used for the double tap gesture, since this is an other gesture detect session
    this.previous = Utils.extend({}, this.current);

    // reset the current
    this.current = null;

    // stopped!
    this.stopped = true;
  },


  /**
   * calculate velocity
   * @param   {Object}  ev
   * @param   {Number}  delta_time
   * @param   {Number}  delta_x
   * @param   {Number}  delta_y
   */
  getVelocityData: function getVelocityData(ev, delta_time, delta_x, delta_y) {
    var cur = this.current
      , velocityEv = cur.lastVelocityEvent
      , velocity = cur.velocity;

    // calculate velocity every x ms
    if (velocityEv && ev.timeStamp - velocityEv.timeStamp > Hammer.UPDATE_VELOCITY_INTERVAL) {
      velocity = Utils.getVelocity(ev.timeStamp - velocityEv.timeStamp,
                                   ev.center.clientX - velocityEv.center.clientX,
                                  ev.center.clientY - velocityEv.center.clientY);
      cur.lastVelocityEvent = ev;
    }
    else if(!cur.velocity) {
      velocity = Utils.getVelocity(delta_time, delta_x, delta_y);
      cur.lastVelocityEvent = ev;
    }

    cur.velocity = velocity;

    ev.velocityX = velocity.x;
    ev.velocityY = velocity.y;
  },


  /**
   * calculate interim angle and direction
   * @param   {Object}  ev
   */
  getInterimData: function getInterimData(ev) {
    var lastEvent = this.current.lastEvent
      , angle
      , direction;

    // end events (e.g. dragend) don't have useful values for interimDirection & interimAngle
    // because the previous event has exactly the same coordinates
    // so for end events, take the previous values of interimDirection & interimAngle
    // instead of recalculating them and getting a spurious '0'
    if(ev.eventType == EVENT_END) {
      angle = lastEvent && lastEvent.interimAngle;
      direction = lastEvent && lastEvent.interimDirection;
    }
    else {
      angle = lastEvent && Utils.getAngle(lastEvent.center, ev.center);
      direction = lastEvent && Utils.getDirection(lastEvent.center, ev.center);
    }

    ev.interimAngle = angle;
    ev.interimDirection = direction;
  },


  /**
   * extend eventData for Hammer.gestures
   * @param   {Object}   evData
   * @returns {Object}   evData
   */
  extendEventData: function extendEventData(ev) {
    var cur = this.current
      , startEv = cur.startEvent;

    // if the touches change, set the new touches over the startEvent touches
    // this because touchevents don't have all the touches on touchstart, or the
    // user must place his fingers at the EXACT same time on the screen, which is not realistic
    // but, sometimes it happens that both fingers are touching at the EXACT same time
    if(ev.touches.length != startEv.touches.length || ev.touches === startEv.touches) {
      // extend 1 level deep to get the touchlist with the touch objects
      startEv.touches = [];
      Utils.each(ev.touches, function(touch) {
        startEv.touches.push(Utils.extend({}, touch));
      });
    }

    var delta_time = ev.timeStamp - startEv.timeStamp
      , delta_x = ev.center.clientX - startEv.center.clientX
      , delta_y = ev.center.clientY - startEv.center.clientY;

    this.getVelocityData(ev, delta_time, delta_x, delta_y);
    this.getInterimData(ev);

    Utils.extend(ev, {
      startEvent: startEv,

      deltaTime : delta_time,
      deltaX    : delta_x,
      deltaY    : delta_y,

      distance  : Utils.getDistance(startEv.center, ev.center),
      angle     : Utils.getAngle(startEv.center, ev.center),
      direction : Utils.getDirection(startEv.center, ev.center),

      scale     : Utils.getScale(startEv.touches, ev.touches),
      rotation  : Utils.getRotation(startEv.touches, ev.touches)
    });

    return ev;
  },


  /**
   * register new gesture
   * @param   {Object}    gesture object, see gestures.js for documentation
   * @returns {Array}     gestures
   */
  register: function register(gesture) {
    // add an enable gesture options if there is no given
    var options = gesture.defaults || {};
    if(options[gesture.name] === undefined) {
      options[gesture.name] = true;
    }

    // extend Hammer default options with the Hammer.gesture options
    Utils.extend(Hammer.defaults, options, true);

    // set its index
    gesture.index = gesture.index || 1000;

    // add Hammer.gesture to the list
    this.gestures.push(gesture);

    // sort the list by index
    this.gestures.sort(function(a, b) {
      if(a.index < b.index) { return -1; }
      if(a.index > b.index) { return 1; }
      return 0;
    });

    return this.gestures;
  }
};


/**
 * Drag
 * Move with x fingers (default 1) around on the page. Blocking the scrolling when
 * moving left and right is a good practice. When all the drag events are blocking
 * you disable scrolling on that area.
 * @events  drag, drapleft, dragright, dragup, dragdown
 */
Hammer.gestures.Drag = {
  name     : 'drag',
  index    : 50,
  defaults : {
    drag_min_distance            : 10,

    // Set correct_for_drag_min_distance to true to make the starting point of the drag
    // be calculated from where the drag was triggered, not from where the touch started.
    // Useful to avoid a jerk-starting drag, which can make fine-adjustments
    // through dragging difficult, and be visually unappealing.
    correct_for_drag_min_distance: true,

    // set 0 for unlimited, but this can conflict with transform
    drag_max_touches             : 1,

    // prevent default browser behavior when dragging occurs
    // be careful with it, it makes the element a blocking element
    // when you are using the drag gesture, it is a good practice to set this true
    drag_block_horizontal        : false,
    drag_block_vertical          : false,

    // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
    // It disallows vertical directions if the initial direction was horizontal, and vice versa.
    drag_lock_to_axis            : false,

    // drag lock only kicks in when distance > drag_lock_min_distance
    // This way, locking occurs only when the distance has become large enough to reliably determine the direction
    drag_lock_min_distance       : 25
  },

  triggered: false,
  handler  : function dragGesture(ev, inst) {
    var cur = Detection.current;

    // current gesture isnt drag, but dragged is true
    // this means an other gesture is busy. now call dragend
    if(cur.name != this.name && this.triggered) {
      inst.trigger(this.name + 'end', ev);
      this.triggered = false;
      return;
    }

    // max touches
    if(inst.options.drag_max_touches > 0 &&
      ev.touches.length > inst.options.drag_max_touches) {
      return;
    }

    switch(ev.eventType) {
      case EVENT_START:
        this.triggered = false;
        break;

      case EVENT_MOVE:
        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(ev.distance < inst.options.drag_min_distance &&
          cur.name != this.name) {
          return;
        }

        var startCenter = cur.startEvent.center;

        // we are dragging!
        if(cur.name != this.name) {
          cur.name = this.name;
          if(inst.options.correct_for_drag_min_distance && ev.distance > 0) {
            // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.
            // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.
            // It might be useful to save the original start point somewhere
            var factor = Math.abs(inst.options.drag_min_distance / ev.distance);
            startCenter.pageX += ev.deltaX * factor;
            startCenter.pageY += ev.deltaY * factor;
            startCenter.clientX += ev.deltaX * factor;
            startCenter.clientY += ev.deltaY * factor;

            // recalculate event data using new start point
            ev = Detection.extendEventData(ev);
          }
        }

        // lock drag to axis?
        if(cur.lastEvent.drag_locked_to_axis ||
            ( inst.options.drag_lock_to_axis &&
              inst.options.drag_lock_min_distance <= ev.distance
            )) {
          ev.drag_locked_to_axis = true;
        }
        var last_direction = cur.lastEvent.direction;
        if(ev.drag_locked_to_axis && last_direction !== ev.direction) {
          // keep direction on the axis that the drag gesture started on
          if(Utils.isVertical(last_direction)) {
            ev.direction = (ev.deltaY < 0) ? DIRECTION_UP : DIRECTION_DOWN;
          }
          else {
            ev.direction = (ev.deltaX < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
          }
        }

        // first time, trigger dragstart event
        if(!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }

        // trigger events
        inst.trigger(this.name, ev);
        inst.trigger(this.name + ev.direction, ev);

        var is_vertical = Utils.isVertical(ev.direction);

        // block the browser events
        if((inst.options.drag_block_vertical && is_vertical) ||
          (inst.options.drag_block_horizontal && !is_vertical)) {
          ev.preventDefault();
        }
        break;

      case EVENT_END:
        // trigger dragend
        if(this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }

        this.triggered = false;
        break;
    }
  }
};

/**
 * Hold
 * Touch stays at the same place for x time
 * @events  hold
 */
Hammer.gestures.Hold = {
  name    : 'hold',
  index   : 10,
  defaults: {
    hold_timeout  : 500,
    hold_threshold: 2
  },
  timer   : null,

  handler : function holdGesture(ev, inst) {
    switch(ev.eventType) {
      case EVENT_START:
        // clear any running timers
        clearTimeout(this.timer);

        // set the gesture so we can check in the timeout if it still is
        Detection.current.name = this.name;

        // set timer and if after the timeout it still is hold,
        // we trigger the hold event
        this.timer = setTimeout(function() {
          if(Detection.current.name == 'hold') {
            inst.trigger('hold', ev);
          }
        }, inst.options.hold_timeout);
        break;

      // when you move or end we clear the timer
      case EVENT_MOVE:
        if(ev.distance > inst.options.hold_threshold) {
          clearTimeout(this.timer);
        }
        break;

      case EVENT_END:
        clearTimeout(this.timer);
        break;
    }
  }
};

/**
 * Release
 * Called as last, tells the user has released the screen
 * @events  release
 */
Hammer.gestures.Release = {
  name   : 'release',
  index  : Infinity,
  handler: function releaseGesture(ev, inst) {
    if(ev.eventType == EVENT_END) {
      inst.trigger(this.name, ev);
    }
  }
};

/**
 * Swipe
 * triggers swipe events when the end velocity is above the threshold
 * for best usage, set prevent_default (on the drag gesture) to true
 * @events  swipe, swipeleft, swiperight, swipeup, swipedown
 */
Hammer.gestures.Swipe = {
  name    : 'swipe',
  index   : 40,
  defaults: {
    swipe_min_touches: 1,
    swipe_max_touches: 1,
    swipe_velocity   : 0.7
  },
  handler : function swipeGesture(ev, inst) {
    if(ev.eventType == EVENT_END) {
      // max touches
      if(ev.touches.length < inst.options.swipe_min_touches ||
        ev.touches.length > inst.options.swipe_max_touches) {
        return;
      }

      // when the distance we moved is too small we skip this gesture
      // or we can be already in dragging
      if(ev.velocityX > inst.options.swipe_velocity ||
        ev.velocityY > inst.options.swipe_velocity) {
        // trigger swipe events
        inst.trigger(this.name, ev);
        inst.trigger(this.name + ev.direction, ev);
      }
    }
  }
};

/**
 * Tap/DoubleTap
 * Quick touch at a place or double at the same place
 * @events  tap, doubletap
 */
Hammer.gestures.Tap = {
  name    : 'tap',
  index   : 100,
  defaults: {
    tap_max_touchtime : 250,
    tap_max_distance  : 10,
    tap_always        : true,
    doubletap_distance: 20,
    doubletap_interval: 300
  },

  has_moved: false,

  handler : function tapGesture(ev, inst) {
    var prev, since_prev, did_doubletap;

    // reset moved state
    if(ev.eventType == EVENT_START) {
      this.has_moved = false;
    }

    // Track the distance we've moved. If it's above the max ONCE, remember that (fixes #406).
    else if(ev.eventType == EVENT_MOVE && !this.moved) {
      this.has_moved = (ev.distance > inst.options.tap_max_distance);
    }

    else if(ev.eventType == EVENT_END &&
        ev.srcEvent.type != 'touchcancel' &&
        ev.deltaTime < inst.options.tap_max_touchtime && !this.has_moved) {

      // previous gesture, for the double tap since these are two different gesture detections
      prev = Detection.previous;
      since_prev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
      did_doubletap = false;

      // check if double tap
      if(prev && prev.name == 'tap' &&
          (since_prev && since_prev < inst.options.doubletap_interval) &&
          ev.distance < inst.options.doubletap_distance) {
        inst.trigger('doubletap', ev);
        did_doubletap = true;
      }

      // do a single tap
      if(!did_doubletap || inst.options.tap_always) {
        Detection.current.name = 'tap';
        inst.trigger(Detection.current.name, ev);
      }
    }
  }
};

/**
 * Touch
 * Called as first, tells the user has touched the screen
 * @events  touch
 */
Hammer.gestures.Touch = {
  name    : 'touch',
  index   : -Infinity,
  defaults: {
    // call preventDefault at touchstart, and makes the element blocking by
    // disabling the scrolling of the page, but it improves gestures like
    // transforming and dragging.
    // be careful with using this, it can be very annoying for users to be stuck
    // on the page
    prevent_default    : false,

    // disable mouse events, so only touch (or pen!) input triggers events
    prevent_mouseevents: false
  },
  handler : function touchGesture(ev, inst) {
    if(inst.options.prevent_mouseevents &&
        ev.pointerType == POINTER_MOUSE) {
      ev.stopDetect();
      return;
    }

    if(inst.options.prevent_default) {
      ev.preventDefault();
    }

    if(ev.eventType == EVENT_START) {
      inst.trigger(this.name, ev);
    }
  }
};


/**
 * Transform
 * User want to scale or rotate with 2 fingers
 * @events  transform, pinch, pinchin, pinchout, rotate
 */
Hammer.gestures.Transform = {
  name     : 'transform',
  index    : 45,
  defaults : {
    // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
    transform_min_scale      : 0.01,
    // rotation in degrees
    transform_min_rotation   : 1,
    // prevent default browser behavior when two touches are on the screen
    // but it makes the element a blocking element
    // when you are using the transform gesture, it is a good practice to set this true
    transform_always_block   : false,
    // ensures that all touches occurred within the instance element
    transform_within_instance: false
  },

  triggered: false,

  handler  : function transformGesture(ev, inst) {
    // current gesture isnt drag, but dragged is true
    // this means an other gesture is busy. now call dragend
    if(Detection.current.name != this.name && this.triggered) {
      inst.trigger(this.name + 'end', ev);
      this.triggered = false;
      return;
    }

    // at least multitouch
    if(ev.touches.length < 2) {
      return;
    }

    // prevent default when two fingers are on the screen
    if(inst.options.transform_always_block) {
      ev.preventDefault();
    }

    // check if all touches occurred within the instance element
    if(inst.options.transform_within_instance) {
      for(var i=-1; ev.touches[++i];) {
        if(!Utils.hasParent(ev.touches[i].target, inst.element)) {
          return;
        }
      }
    }

    switch(ev.eventType) {
      case EVENT_START:
        this.triggered = false;
        break;

      case EVENT_MOVE:
        var scale_threshold = Math.abs(1 - ev.scale);
        var rotation_threshold = Math.abs(ev.rotation);

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(scale_threshold < inst.options.transform_min_scale &&
          rotation_threshold < inst.options.transform_min_rotation) {
          return;
        }

        // we are transforming!
        Detection.current.name = this.name;

        // first time, trigger dragstart event
        if(!this.triggered) {
          inst.trigger(this.name + 'start', ev);
          this.triggered = true;
        }

        inst.trigger(this.name, ev); // basic transform event

        // trigger rotate event
        if(rotation_threshold > inst.options.transform_min_rotation) {
          inst.trigger('rotate', ev);
        }

        // trigger pinch event
        if(scale_threshold > inst.options.transform_min_scale) {
          inst.trigger('pinch', ev);
          inst.trigger('pinch' + (ev.scale<1 ? 'in' : 'out'), ev);
        }
        break;

      case EVENT_END:
        // trigger dragend
        if(this.triggered) {
          inst.trigger(this.name + 'end', ev);
        }

        this.triggered = false;
        break;
    }
  }
};

// AMD export
if(typeof define == 'function' && define.amd) {
  define(function(){
    return Hammer;
  });
}
// commonjs export
else if(typeof module == 'object' && module.exports) {
  module.exports = Hammer;
}
// browser export
else {
  window.Hammer = Hammer;
}

})(window);
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9meG1vYmlsZTE2L3N3aXBlL2VudHJ5LmpzIiwiL1VzZXJzL2Z4bW9iaWxlMTYvc3dpcGUvbm9kZV9tb2R1bGVzL2Nsb3NlbmVzcy9pbmRleC5qcyIsIi9Vc2Vycy9meG1vYmlsZTE2L3N3aXBlL25vZGVfbW9kdWxlcy9nZXRpZHMvaW5kZXguanMiLCIvVXNlcnMvZnhtb2JpbGUxNi9zd2lwZS9ub2RlX21vZHVsZXMvaGFtbWVyanMvaGFtbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpXG52YXIgdWkgPSByZXF1aXJlKCdnZXRpZHMnKShkb2N1bWVudC5ib2R5KVxudmFyIGNsb3NlbmVzcyA9IHJlcXVpcmUoJ2Nsb3NlbmVzcycpXG52YXIgcmVsZWFzZWQgPSB0cnVlXG52YXIgdDAgPSBudWxsXG52YXIgaCA9IHdpbmRvdy5pbm5lckhlaWdodFxudmFyIG1heERlbHRhID0gaCAqIC43NlxudmFyIG1pblRvcCA9IDAgLSBtYXhEZWx0YVxudmFyIG1heFRvcCA9IDBcbnZhciB3YXNEcmFnZ2luZyA9IGZhbHNlXG52YXIgZHJhZ2dlZCA9IDA7XG52YXIgY2xvc2VFbm91Z2ggPSBjbG9zZW5lc3MobWF4RGVsdGEsIDUpXG52YXIgY2xvc2VFbm91Z2hEID0gY2xvc2VuZXNzKDAsIDUpXG52YXIgdG9wID0gMDtcblxuaGFtbWVyKHVpLnRvcCkub24oJ3N3aXBldXAnLCBzd2lwZXVwKVxuaGFtbWVyKHVpLnRvcCkub24oJ3N3aXBlZG93bicsc3dpcGVkb3duKVxuaGFtbWVyKHVpLnRvcCkub24oJ3JlbGVhc2UnLCBmdW5jdGlvbigpe1xuICBpZighd2FzRHJhZ2dpbmcpIHJldHVyblxuICB3YXNEcmFnZ2luZyA9IGZhbHNlXG4gIHZhciBlbCA9IHRoaXNcbiAgdGhpcy5jbGFzc0xpc3QuYWRkKCdzd2lwZScpXG4gIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2dCl7XG4gICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzd2lwZScpXG4gICAgdG9wID0gcGFyc2VGbG9hdChnZXRDU1ModGhpcywgJ3RvcCcpKVxuICB9KSBcbiAgXG4gIGlmKHBhcnNlRmxvYXQoZ2V0Q1NTKGVsLCAndG9wJykpIDwgbWluVG9wIC8gMikgZWwuc3R5bGUudG9wID0gbWluVG9wICsgJ3B4JyAgXG4gIGVsc2UgZWwuc3R5bGUudG9wID0gJzBweCdcbiAgdG9wID0gcGFyc2VGbG9hdChnZXRDU1MoZWwsICd0b3AnKSlcbn0pXG5oYW1tZXIodWkudG9wKS5vbignZHJhZ3VwJywgZHJhZ3VwKVxuaGFtbWVyKHVpLnRvcCkub24oJ2RyYWdkb3duJyxkcmFnZG93bilcblxuZnVuY3Rpb24gZHJhZ2Rvd24oZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSB0cnVlXG4gIHZhciBlbCA9IHRoaXMsIHQgPSAwXG4gIGlmKGNsb3NlRW5vdWdoRCh0ID0gcGFyc2VGbG9hdChnZXRDU1ModGhpcywgJ3RvcCcpKSkpIHJldHVyblxuICBlbHNle1xuICAgIHZhciBkZWx0YSA9IGV2dC5nZXN0dXJlLmRlbHRhWVxuICAgIGlmKE1hdGguYWJzKGRlbHRhKSA+IG1heERlbHRhKSByZXR1cm5cbiAgICBlbHNle1xuICAgICAgdGhpcy5zdHlsZS50b3AgPSB0b3AgKyBkZWx0YSArICdweCcgXG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBkcmFndXAoZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSB0cnVlXG4gIHZhciBlbCA9IHRoaXM7XG4gIGlmKGNsb3NlRW5vdWdoKE1hdGguYWJzKHBhcnNlRmxvYXQoZ2V0Q1NTKHRoaXMsICd0b3AnKSkpKSkgcmV0dXJuXG4gIHZhciBkZWx0YSA9IGV2dC5nZXN0dXJlLmRlbHRhWVxuICBpZihNYXRoLmFicyhkZWx0YSkgPiBtYXhEZWx0YSkgcmV0dXJuXG4gIGVsc2V7XG4gICAgdGhpcy5zdHlsZS50b3AgPSBkZWx0YSArICdweCdcbiAgfVxufVxuXG5mdW5jdGlvbiBzd2lwZWRvd24oZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSBmYWxzZVxuICB0aGlzLmNsYXNzTGlzdC5hZGQoJ3N3aXBlJylcbiAgdGhpcy5zdHlsZS50b3AgPSAnMCdcbiAgdG9wID0gMFxuICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldnQpe1xuICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnc3dpcGUnKVxuICAgIHRvcCA9IHBhcnNlRmxvYXQoZ2V0Q1NTKHRoaXMsICd0b3AnKSlcbiAgfSkgXG59XG5cbmZ1bmN0aW9uIHN3aXBldXAoZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSBmYWxzZVxuICB0aGlzLmNsYXNzTGlzdC5hZGQoJ3N3aXBlJylcbiAgdGhpcy5zdHlsZS50b3AgPSAwIC0gbWF4RGVsdGEgKyAncHgnIFxuICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldnQpe1xuICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnc3dpcGUnKVxuICAgIHRvcCA9IHBhcnNlRmxvYXQoZ2V0Q1NTKHRoaXMsICd0b3AnKSlcbiAgfSkgXG59XG5cbmZ1bmN0aW9uIGdldENTUyhlbCwgcHJvcCl7XG4gIHJldHVybiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG51bSwgZGlzdCl7XG5cdHJldHVybiBmdW5jdGlvbih2YWwpe1xuXHRcdHJldHVybiAoTWF0aC5hYnMobnVtIC0gdmFsKSA8IGRpc3QpXG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCl7XG5cbiAgICB2YXIgaWRzID0ge307XG5cbiAgICBpZignc3RyaW5nJyA9PSB0eXBlb2YgZWwpIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xuXG4gICAgaWYoIWVsKSBlbCA9IGRvY3VtZW50O1xuXG4gICAgdmFyIGNoaWxkcmVuID0gZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKTtcblxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY2hpbGRyZW4sIGZ1bmN0aW9uKGUpe1xuXG5cdGlmKGUuaWQubGVuZ3RoID4gMCl7XG5cblx0ICAgIGlkc1tlLmlkXSA9IGVcblxuXHR9XG5cbiAgICB9KVxuXG4gICAgcmV0dXJuIGlkc1xuXG59XG4iLCIvKiEgSGFtbWVyLkpTIC0gdjEuMC4xMCAtIDIwMTQtMDMtMjhcbiAqIGh0dHA6Ly9laWdodG1lZGlhLmdpdGh1Yi5pby9oYW1tZXIuanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgSm9yaWsgVGFuZ2VsZGVyIDxqLnRhbmdlbGRlckBnbWFpbC5jb20+O1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXG5cbihmdW5jdGlvbih3aW5kb3csIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSGFtbWVyXG4gKiB1c2UgdGhpcyB0byBjcmVhdGUgaW5zdGFuY2VzXG4gKiBAcGFyYW0gICB7SFRNTEVsZW1lbnR9ICAgZWxlbWVudFxuICogQHBhcmFtICAge09iamVjdH0gICAgICAgIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIEhhbW1lciA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBIYW1tZXIuSW5zdGFuY2UoZWxlbWVudCwgb3B0aW9ucyB8fCB7fSk7XG59O1xuXG5IYW1tZXIuVkVSU0lPTiA9ICcxLjAuMTAnO1xuXG4vLyBkZWZhdWx0IHNldHRpbmdzXG5IYW1tZXIuZGVmYXVsdHMgPSB7XG4gIC8vIGFkZCBzdHlsZXMgYW5kIGF0dHJpYnV0ZXMgdG8gdGhlIGVsZW1lbnQgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIGRvaW5nXG4gIC8vIGl0cyBuYXRpdmUgYmVoYXZpb3IuIHRoaXMgZG9lc250IHByZXZlbnQgdGhlIHNjcm9sbGluZywgYnV0IGNhbmNlbHNcbiAgLy8gdGhlIGNvbnRleHRtZW51LCB0YXAgaGlnaGxpZ2h0aW5nIGV0Y1xuICAvLyBzZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzXG4gIHN0b3BfYnJvd3Nlcl9iZWhhdmlvcjoge1xuICAgIC8vIHRoaXMgYWxzbyB0cmlnZ2VycyBvbnNlbGVjdHN0YXJ0PWZhbHNlIGZvciBJRVxuICAgIHVzZXJTZWxlY3QgICAgICAgOiAnbm9uZScsXG4gICAgLy8gdGhpcyBtYWtlcyB0aGUgZWxlbWVudCBibG9ja2luZyBpbiBJRTEwPiwgeW91IGNvdWxkIGV4cGVyaW1lbnQgd2l0aCB0aGUgdmFsdWVcbiAgICAvLyBzZWUgZm9yIG1vcmUgb3B0aW9ucyB0aGlzIGlzc3VlOyBodHRwczovL2dpdGh1Yi5jb20vRWlnaHRNZWRpYS9oYW1tZXIuanMvaXNzdWVzLzI0MVxuICAgIHRvdWNoQWN0aW9uICAgICAgOiAnbm9uZScsXG4gICAgdG91Y2hDYWxsb3V0ICAgICA6ICdub25lJyxcbiAgICBjb250ZW50Wm9vbWluZyAgIDogJ25vbmUnLFxuICAgIHVzZXJEcmFnICAgICAgICAgOiAnbm9uZScsXG4gICAgdGFwSGlnaGxpZ2h0Q29sb3I6ICdyZ2JhKDAsMCwwLDApJ1xuICB9XG5cbiAgLy9cbiAgLy8gbW9yZSBzZXR0aW5ncyBhcmUgZGVmaW5lZCBwZXIgZ2VzdHVyZSBhdCAvZ2VzdHVyZXNcbiAgLy9cbn07XG5cblxuLy8gZGV0ZWN0IHRvdWNoZXZlbnRzXG5IYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMgPSB3aW5kb3cubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkIHx8IHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZDtcbkhhbW1lci5IQVNfVE9VQ0hFVkVOVFMgPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcblxuLy8gZG9udCB1c2UgbW91c2VldmVudHMgb24gbW9iaWxlIGRldmljZXNcbkhhbW1lci5NT0JJTEVfUkVHRVggPSAvbW9iaWxlfHRhYmxldHxpcChhZHxob25lfG9kKXxhbmRyb2lkfHNpbGsvaTtcbkhhbW1lci5OT19NT1VTRUVWRU5UUyA9IEhhbW1lci5IQVNfVE9VQ0hFVkVOVFMgJiYgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goSGFtbWVyLk1PQklMRV9SRUdFWCk7XG5cbi8vIGV2ZW50dHlwZXMgcGVyIHRvdWNoZXZlbnQgKHN0YXJ0LCBtb3ZlLCBlbmQpXG4vLyBhcmUgZmlsbGVkIGJ5IEV2ZW50LmRldGVybWluZUV2ZW50VHlwZXMgb24gc2V0dXBcbkhhbW1lci5FVkVOVF9UWVBFUyA9IHt9O1xuXG4vLyBpbnRlcnZhbCBpbiB3aGljaCBIYW1tZXIgcmVjYWxjdWxhdGVzIGN1cnJlbnQgdmVsb2NpdHkgaW4gbXNcbkhhbW1lci5VUERBVEVfVkVMT0NJVFlfSU5URVJWQUwgPSAxNjtcblxuLy8gaGFtbWVyIGRvY3VtZW50IHdoZXJlIHRoZSBiYXNlIGV2ZW50cyBhcmUgYWRkZWQgYXRcbkhhbW1lci5ET0NVTUVOVCA9IHdpbmRvdy5kb2N1bWVudDtcblxuLy8gZGVmaW5lIHRoZXNlIGFsc28gYXMgdmFycywgZm9yIGJldHRlciBtaW5pZmljYXRpb25cbi8vIGRpcmVjdGlvbiBkZWZpbmVzXG52YXIgRElSRUNUSU9OX0RPV04gPSBIYW1tZXIuRElSRUNUSU9OX0RPV04gPSAnZG93bic7XG52YXIgRElSRUNUSU9OX0xFRlQgPSBIYW1tZXIuRElSRUNUSU9OX0xFRlQgPSAnbGVmdCc7XG52YXIgRElSRUNUSU9OX1VQID0gSGFtbWVyLkRJUkVDVElPTl9VUCA9ICd1cCc7XG52YXIgRElSRUNUSU9OX1JJR0hUID0gSGFtbWVyLkRJUkVDVElPTl9SSUdIVCA9ICdyaWdodCc7XG5cbi8vIHBvaW50ZXIgdHlwZVxudmFyIFBPSU5URVJfTU9VU0UgPSBIYW1tZXIuUE9JTlRFUl9NT1VTRSA9ICdtb3VzZSc7XG52YXIgUE9JTlRFUl9UT1VDSCA9IEhhbW1lci5QT0lOVEVSX1RPVUNIID0gJ3RvdWNoJztcbnZhciBQT0lOVEVSX1BFTiA9IEhhbW1lci5QT0lOVEVSX1BFTiA9ICdwZW4nO1xuXG4vLyB0b3VjaCBldmVudCBkZWZpbmVzXG52YXIgRVZFTlRfU1RBUlQgPSBIYW1tZXIuRVZFTlRfU1RBUlQgPSAnc3RhcnQnO1xudmFyIEVWRU5UX01PVkUgPSBIYW1tZXIuRVZFTlRfTU9WRSA9ICdtb3ZlJztcbnZhciBFVkVOVF9FTkQgPSBIYW1tZXIuRVZFTlRfRU5EID0gJ2VuZCc7XG5cblxuLy8gcGx1Z2lucyBhbmQgZ2VzdHVyZXMgbmFtZXNwYWNlc1xuSGFtbWVyLnBsdWdpbnMgPSBIYW1tZXIucGx1Z2lucyB8fCB7fTtcbkhhbW1lci5nZXN0dXJlcyA9IEhhbW1lci5nZXN0dXJlcyB8fCB7fTtcblxuXG4vLyBpZiB0aGUgd2luZG93IGV2ZW50cyBhcmUgc2V0Li4uXG5IYW1tZXIuUkVBRFkgPSBmYWxzZTtcblxuXG4vKipcbiAqIHNldHVwIGV2ZW50cyB0byBkZXRlY3QgZ2VzdHVyZXMgb24gdGhlIGRvY3VtZW50XG4gKi9cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBpZihIYW1tZXIuUkVBRFkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBmaW5kIHdoYXQgZXZlbnR0eXBlcyB3ZSBhZGQgbGlzdGVuZXJzIHRvXG4gIEV2ZW50LmRldGVybWluZUV2ZW50VHlwZXMoKTtcblxuICAvLyBSZWdpc3RlciBhbGwgZ2VzdHVyZXMgaW5zaWRlIEhhbW1lci5nZXN0dXJlc1xuICBVdGlscy5lYWNoKEhhbW1lci5nZXN0dXJlcywgZnVuY3Rpb24oZ2VzdHVyZSl7XG4gICAgRGV0ZWN0aW9uLnJlZ2lzdGVyKGdlc3R1cmUpO1xuICB9KTtcblxuICAvLyBBZGQgdG91Y2ggZXZlbnRzIG9uIHRoZSBkb2N1bWVudFxuICBFdmVudC5vblRvdWNoKEhhbW1lci5ET0NVTUVOVCwgRVZFTlRfTU9WRSwgRGV0ZWN0aW9uLmRldGVjdCk7XG4gIEV2ZW50Lm9uVG91Y2goSGFtbWVyLkRPQ1VNRU5ULCBFVkVOVF9FTkQsIERldGVjdGlvbi5kZXRlY3QpO1xuXG4gIC8vIEhhbW1lciBpcyByZWFkeS4uLiFcbiAgSGFtbWVyLlJFQURZID0gdHJ1ZTtcbn1cblxudmFyIFV0aWxzID0gSGFtbWVyLnV0aWxzID0ge1xuICAvKipcbiAgICogZXh0ZW5kIG1ldGhvZCxcbiAgICogYWxzbyB1c2VkIGZvciBjbG9uaW5nIHdoZW4gZGVzdCBpcyBhbiBlbXB0eSBvYmplY3RcbiAgICogQHBhcmFtICAge09iamVjdH0gICAgZGVzdFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBzcmNcbiAgICogQHBhcm0gIHtCb29sZWFufSAgbWVyZ2UgICAgZG8gYSBtZXJnZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAgICBkZXN0XG4gICAqL1xuICBleHRlbmQ6IGZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMsIG1lcmdlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gc3JjKSB7XG4gICAgICBpZihkZXN0W2tleV0gIT09IHVuZGVmaW5lZCAmJiBtZXJnZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGRlc3Rba2V5XSA9IHNyY1trZXldO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBmb3IgZWFjaFxuICAgKiBAcGFyYW0gb2JqXG4gICAqIEBwYXJhbSBpdGVyYXRvclxuICAgKi9cbiAgZWFjaDogZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGksIG87XG4gICAgLy8gbmF0aXZlIGZvckVhY2ggb24gYXJyYXlzXG4gICAgaWYgKCdmb3JFYWNoJyBpbiBvYmopIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9XG4gICAgLy8gYXJyYXlzXG4gICAgZWxzZSBpZihvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvcihpPS0xOyAobz1vYmpbKytpXSk7KSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG8sIGksIG9iaikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG9iamVjdHNcbiAgICBlbHNlIHtcbiAgICAgIGZvcihpIGluIG9iaikge1xuICAgICAgICBpZihvYmouaGFzT3duUHJvcGVydHkoaSkgJiZcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiBmaW5kIGlmIGEgc3RyaW5nIGNvbnRhaW5zIHRoZSBuZWVkbGVcbiAgICogQHBhcmFtICAge1N0cmluZ30gIHNyY1xuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgbmVlZGxlXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBmb3VuZFxuICAgKi9cbiAgaW5TdHI6IGZ1bmN0aW9uIGluU3RyKHNyYywgbmVlZGxlKSB7XG4gICAgcmV0dXJuIHNyYy5pbmRleE9mKG5lZWRsZSkgPiAtMTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XG4gICAqIHVzZWQgZm9yIGV2ZW50IGRlbGVnYXRpb24gdHJpY2tzXG4gICAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBub2RlXG4gICAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBwYXJlbnRcbiAgICogQHJldHVybnMge2Jvb2xlYW59ICAgICAgIGhhc19wYXJlbnRcbiAgICovXG4gIGhhc1BhcmVudDogZnVuY3Rpb24gaGFzUGFyZW50KG5vZGUsIHBhcmVudCkge1xuICAgIHdoaWxlKG5vZGUpIHtcbiAgICAgIGlmKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGdldCB0aGUgY2VudGVyIG9mIGFsbCB0aGUgdG91Y2hlc1xuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICB0b3VjaGVzXG4gICAqIEByZXR1cm5zIHtPYmplY3R9ICAgIGNlbnRlciBwYWdlWFkgY2xpZW50WFlcbiAgICovXG4gIGdldENlbnRlcjogZnVuY3Rpb24gZ2V0Q2VudGVyKHRvdWNoZXMpIHtcbiAgICB2YXIgcGFnZVggPSBbXVxuICAgICAgLCBwYWdlWSA9IFtdXG4gICAgICAsIGNsaWVudFggPSBbXVxuICAgICAgLCBjbGllbnRZID0gW11cbiAgICAgICwgbWluID0gTWF0aC5taW5cbiAgICAgICwgbWF4ID0gTWF0aC5tYXg7XG5cbiAgICAvLyBubyBuZWVkIHRvIGxvb3Agd2hlbiBvbmx5IG9uZSB0b3VjaFxuICAgIGlmKHRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwYWdlWDogdG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgcGFnZVk6IHRvdWNoZXNbMF0ucGFnZVksXG4gICAgICAgIGNsaWVudFg6IHRvdWNoZXNbMF0uY2xpZW50WCxcbiAgICAgICAgY2xpZW50WTogdG91Y2hlc1swXS5jbGllbnRZXG4gICAgICB9O1xuICAgIH1cblxuICAgIFV0aWxzLmVhY2godG91Y2hlcywgZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgIHBhZ2VYLnB1c2godG91Y2gucGFnZVgpO1xuICAgICAgcGFnZVkucHVzaCh0b3VjaC5wYWdlWSk7XG4gICAgICBjbGllbnRYLnB1c2godG91Y2guY2xpZW50WCk7XG4gICAgICBjbGllbnRZLnB1c2godG91Y2guY2xpZW50WSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGFnZVg6IChtaW4uYXBwbHkoTWF0aCwgcGFnZVgpICsgbWF4LmFwcGx5KE1hdGgsIHBhZ2VYKSkgLyAyLFxuICAgICAgcGFnZVk6IChtaW4uYXBwbHkoTWF0aCwgcGFnZVkpICsgbWF4LmFwcGx5KE1hdGgsIHBhZ2VZKSkgLyAyLFxuICAgICAgY2xpZW50WDogKG1pbi5hcHBseShNYXRoLCBjbGllbnRYKSArIG1heC5hcHBseShNYXRoLCBjbGllbnRYKSkgLyAyLFxuICAgICAgY2xpZW50WTogKG1pbi5hcHBseShNYXRoLCBjbGllbnRZKSArIG1heC5hcHBseShNYXRoLCBjbGllbnRZKSkgLyAyXG4gICAgfTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdGhlIHZlbG9jaXR5IGJldHdlZW4gdHdvIHBvaW50c1xuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgICBkZWx0YV90aW1lXG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICAgIGRlbHRhX3hcbiAgICogQHBhcmFtICAge051bWJlcn0gICAgZGVsdGFfeVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAgICB2ZWxvY2l0eVxuICAgKi9cbiAgZ2V0VmVsb2NpdHk6IGZ1bmN0aW9uIGdldFZlbG9jaXR5KGRlbHRhX3RpbWUsIGRlbHRhX3gsIGRlbHRhX3kpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogTWF0aC5hYnMoZGVsdGFfeCAvIGRlbHRhX3RpbWUpIHx8IDAsXG4gICAgICB5OiBNYXRoLmFicyhkZWx0YV95IC8gZGVsdGFfdGltZSkgfHwgMFxuICAgIH07XG4gIH0sXG5cblxuICAvKipcbiAgICogY2FsY3VsYXRlIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byBjb29yZGluYXRlc1xuICAgKiBAcGFyYW0gICB7VG91Y2h9ICAgICB0b3VjaDFcbiAgICogQHBhcmFtICAge1RvdWNofSAgICAgdG91Y2gyXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9ICAgIGFuZ2xlXG4gICAqL1xuICBnZXRBbmdsZTogZnVuY3Rpb24gZ2V0QW5nbGUodG91Y2gxLCB0b3VjaDIpIHtcbiAgICB2YXIgeCA9IHRvdWNoMi5jbGllbnRYIC0gdG91Y2gxLmNsaWVudFhcbiAgICAgICwgeSA9IHRvdWNoMi5jbGllbnRZIC0gdG91Y2gxLmNsaWVudFk7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIoeSwgeCkgKiAxODAgLyBNYXRoLlBJO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGFuZ2xlIHRvIGRpcmVjdGlvbiBkZWZpbmVcbiAgICogQHBhcmFtICAge1RvdWNofSAgICAgdG91Y2gxXG4gICAqIEBwYXJhbSAgIHtUb3VjaH0gICAgIHRvdWNoMlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAgICBkaXJlY3Rpb24gY29uc3RhbnQsIGxpa2UgRElSRUNUSU9OX0xFRlRcbiAgICovXG4gIGdldERpcmVjdGlvbjogZnVuY3Rpb24gZ2V0RGlyZWN0aW9uKHRvdWNoMSwgdG91Y2gyKSB7XG4gICAgdmFyIHggPSBNYXRoLmFicyh0b3VjaDEuY2xpZW50WCAtIHRvdWNoMi5jbGllbnRYKVxuICAgICAgLCB5ID0gTWF0aC5hYnModG91Y2gxLmNsaWVudFkgLSB0b3VjaDIuY2xpZW50WSk7XG4gICAgaWYoeCA+PSB5KSB7XG4gICAgICByZXR1cm4gdG91Y2gxLmNsaWVudFggLSB0b3VjaDIuY2xpZW50WCA+IDAgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcbiAgICB9XG4gICAgcmV0dXJuIHRvdWNoMS5jbGllbnRZIC0gdG91Y2gyLmNsaWVudFkgPiAwID8gRElSRUNUSU9OX1VQIDogRElSRUNUSU9OX0RPV047XG4gIH0sXG5cblxuICAvKipcbiAgICogY2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byB0b3VjaGVzXG4gICAqIEBwYXJhbSAgIHtUb3VjaH0gICAgIHRvdWNoMVxuICAgKiBAcGFyYW0gICB7VG91Y2h9ICAgICB0b3VjaDJcbiAgICogQHJldHVybnMge051bWJlcn0gICAgZGlzdGFuY2VcbiAgICovXG4gIGdldERpc3RhbmNlOiBmdW5jdGlvbiBnZXREaXN0YW5jZSh0b3VjaDEsIHRvdWNoMikge1xuICAgIHZhciB4ID0gdG91Y2gyLmNsaWVudFggLSB0b3VjaDEuY2xpZW50WFxuICAgICAgLCB5ID0gdG91Y2gyLmNsaWVudFkgLSB0b3VjaDEuY2xpZW50WTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh4ICogeCkgKyAoeSAqIHkpKTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byB0b3VjaExpc3RzIChmaW5nZXJzKVxuICAgKiBubyBzY2FsZSBpcyAxLCBhbmQgZ29lcyBkb3duIHRvIDAgd2hlbiBwaW5jaGVkIHRvZ2V0aGVyLCBhbmQgYmlnZ2VyIHdoZW4gcGluY2hlZCBvdXRcbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgc3RhcnRcbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgZW5kXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9ICAgIHNjYWxlXG4gICAqL1xuICBnZXRTY2FsZTogZnVuY3Rpb24gZ2V0U2NhbGUoc3RhcnQsIGVuZCkge1xuICAgIC8vIG5lZWQgdHdvIGZpbmdlcnMuLi5cbiAgICBpZihzdGFydC5sZW5ndGggPj0gMiAmJiBlbmQubGVuZ3RoID49IDIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERpc3RhbmNlKGVuZFswXSwgZW5kWzFdKSAvIHRoaXMuZ2V0RGlzdGFuY2Uoc3RhcnRbMF0sIHN0YXJ0WzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG4gIH0sXG5cblxuICAvKipcbiAgICogY2FsY3VsYXRlIHRoZSByb3RhdGlvbiBkZWdyZWVzIGJldHdlZW4gdHdvIHRvdWNoTGlzdHMgKGZpbmdlcnMpXG4gICAqIEBwYXJhbSAgIHtBcnJheX0gICAgIHN0YXJ0XG4gICAqIEBwYXJhbSAgIHtBcnJheX0gICAgIGVuZFxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSAgICByb3RhdGlvblxuICAgKi9cbiAgZ2V0Um90YXRpb246IGZ1bmN0aW9uIGdldFJvdGF0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICAvLyBuZWVkIHR3byBmaW5nZXJzXG4gICAgaWYoc3RhcnQubGVuZ3RoID49IDIgJiYgZW5kLmxlbmd0aCA+PSAyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBbmdsZShlbmRbMV0sIGVuZFswXSkgLSB0aGlzLmdldEFuZ2xlKHN0YXJ0WzFdLCBzdGFydFswXSk7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGJvb2xlYW4gaWYgdGhlIGRpcmVjdGlvbiBpcyB2ZXJ0aWNhbFxuICAgKiBAcGFyYW0gICAge1N0cmluZ30gICAgZGlyZWN0aW9uXG4gICAqIEByZXR1cm5zICB7Qm9vbGVhbn0gICBpc192ZXJ0aWNhbFxuICAgKi9cbiAgaXNWZXJ0aWNhbDogZnVuY3Rpb24gaXNWZXJ0aWNhbChkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gZGlyZWN0aW9uID09IERJUkVDVElPTl9VUCB8fCBkaXJlY3Rpb24gPT0gRElSRUNUSU9OX0RPV047XG4gIH0sXG5cblxuICAvKipcbiAgICogdG9nZ2xlIGJyb3dzZXIgZGVmYXVsdCBiZWhhdmlvciB3aXRoIGNzcyBwcm9wc1xuICAgKiBAcGFyYW0gICB7SHRtbEVsZW1lbnR9ICAgZWxlbWVudFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICAgICAgY3NzX3Byb3BzXG4gICAqIEBwYXJhbSAgIHtCb29sZWFufSAgICAgICB0b2dnbGVcbiAgICovXG4gIHRvZ2dsZURlZmF1bHRCZWhhdmlvcjogZnVuY3Rpb24gdG9nZ2xlRGVmYXVsdEJlaGF2aW9yKGVsZW1lbnQsIGNzc19wcm9wcywgdG9nZ2xlKSB7XG4gICAgaWYoIWNzc19wcm9wcyB8fCAhZWxlbWVudCB8fCAhZWxlbWVudC5zdHlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHdpdGggY3NzIHByb3BlcnRpZXMgZm9yIG1vZGVybiBicm93c2Vyc1xuICAgIFV0aWxzLmVhY2goWyd3ZWJraXQnLCAnbW96JywgJ01veicsICdtcycsICdvJywgJyddLCBmdW5jdGlvbiBzZXRTdHlsZSh2ZW5kb3IpIHtcbiAgICAgIFV0aWxzLmVhY2goY3NzX3Byb3BzLCBmdW5jdGlvbih2YWx1ZSwgcHJvcCkge1xuICAgICAgICAgIC8vIHZlbmRlciBwcmVmaXggYXQgdGhlIHByb3BlcnR5XG4gICAgICAgICAgaWYodmVuZG9yKSB7XG4gICAgICAgICAgICBwcm9wID0gdmVuZG9yICsgcHJvcC5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIHByb3Auc3Vic3RyaW5nKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlXG4gICAgICAgICAgaWYocHJvcCBpbiBlbGVtZW50LnN0eWxlKSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gIXRvZ2dsZSAmJiB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBmYWxzZV9mbiA9IGZ1bmN0aW9uKCl7IHJldHVybiBmYWxzZTsgfTtcblxuICAgIC8vIGFsc28gdGhlIGRpc2FibGUgb25zZWxlY3RzdGFydFxuICAgIGlmKGNzc19wcm9wcy51c2VyU2VsZWN0ID09ICdub25lJykge1xuICAgICAgZWxlbWVudC5vbnNlbGVjdHN0YXJ0ID0gIXRvZ2dsZSAmJiBmYWxzZV9mbjtcbiAgICB9XG4gICAgLy8gYW5kIGRpc2FibGUgb25kcmFnc3RhcnRcbiAgICBpZihjc3NfcHJvcHMudXNlckRyYWcgPT0gJ25vbmUnKSB7XG4gICAgICBlbGVtZW50Lm9uZHJhZ3N0YXJ0ID0gIXRvZ2dsZSAmJiBmYWxzZV9mbjtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBjcmVhdGUgbmV3IGhhbW1lciBpbnN0YW5jZVxuICogYWxsIG1ldGhvZHMgc2hvdWxkIHJldHVybiB0aGUgaW5zdGFuY2UgaXRzZWxmLCBzbyBpdCBpcyBjaGFpbmFibGUuXG4gKiBAcGFyYW0gICB7SFRNTEVsZW1lbnR9ICAgICAgIGVsZW1lbnRcbiAqIEBwYXJhbSAgIHtPYmplY3R9ICAgICAgICAgICAgW29wdGlvbnM9e31dXG4gKiBAcmV0dXJucyB7SGFtbWVyLkluc3RhbmNlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbkhhbW1lci5JbnN0YW5jZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIHNldHVwIEhhbW1lckpTIHdpbmRvdyBldmVudHMgYW5kIHJlZ2lzdGVyIGFsbCBnZXN0dXJlc1xuICAvLyB0aGlzIGFsc28gc2V0cyB1cCB0aGUgZGVmYXVsdCBvcHRpb25zXG4gIHNldHVwKCk7XG5cbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICAvLyBzdGFydC9zdG9wIGRldGVjdGlvbiBvcHRpb25cbiAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAvLyBtZXJnZSBvcHRpb25zXG4gIHRoaXMub3B0aW9ucyA9IFV0aWxzLmV4dGVuZChcbiAgICBVdGlscy5leHRlbmQoe30sIEhhbW1lci5kZWZhdWx0cyksXG4gICAgb3B0aW9ucyB8fCB7fSk7XG5cbiAgLy8gYWRkIHNvbWUgY3NzIHRvIHRoZSBlbGVtZW50IHRvIHByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBkb2luZyBpdHMgbmF0aXZlIGJlaGF2b2lyXG4gIGlmKHRoaXMub3B0aW9ucy5zdG9wX2Jyb3dzZXJfYmVoYXZpb3IpIHtcbiAgICBVdGlscy50b2dnbGVEZWZhdWx0QmVoYXZpb3IodGhpcy5lbGVtZW50LCB0aGlzLm9wdGlvbnMuc3RvcF9icm93c2VyX2JlaGF2aW9yLCBmYWxzZSk7XG4gIH1cblxuICAvLyBzdGFydCBkZXRlY3Rpb24gb24gdG91Y2hzdGFydFxuICB0aGlzLmV2ZW50U3RhcnRIYW5kbGVyID0gRXZlbnQub25Ub3VjaChlbGVtZW50LCBFVkVOVF9TVEFSVCwgZnVuY3Rpb24oZXYpIHtcbiAgICBpZihzZWxmLmVuYWJsZWQpIHtcbiAgICAgIERldGVjdGlvbi5zdGFydERldGVjdChzZWxmLCBldik7XG4gICAgfVxuICB9KTtcblxuICAvLyBrZWVwIGEgbGlzdCBvZiB1c2VyIGV2ZW50IGhhbmRsZXJzIHdoaWNoIG5lZWRzIHRvIGJlIHJlbW92ZWQgd2hlbiBjYWxsaW5nICdkaXNwb3NlJ1xuICB0aGlzLmV2ZW50SGFuZGxlcnMgPSBbXTtcblxuICAvLyByZXR1cm4gaW5zdGFuY2VcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbkhhbW1lci5JbnN0YW5jZS5wcm90b3R5cGUgPSB7XG4gIC8qKlxuICAgKiBiaW5kIGV2ZW50cyB0byB0aGUgaW5zdGFuY2VcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICBnZXN0dXJlXG4gICAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gICAgaGFuZGxlclxuICAgKiBAcmV0dXJucyB7SGFtbWVyLkluc3RhbmNlfVxuICAgKi9cbiAgb246IGZ1bmN0aW9uIG9uRXZlbnQoZ2VzdHVyZSwgaGFuZGxlcikge1xuICAgIHZhciBnZXN0dXJlcyA9IGdlc3R1cmUuc3BsaXQoJyAnKTtcbiAgICBVdGlscy5lYWNoKGdlc3R1cmVzLCBmdW5jdGlvbihnZXN0dXJlKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihnZXN0dXJlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMucHVzaCh7IGdlc3R1cmU6IGdlc3R1cmUsIGhhbmRsZXI6IGhhbmRsZXIgfSk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cblxuICAvKipcbiAgICogdW5iaW5kIGV2ZW50cyB0byB0aGUgaW5zdGFuY2VcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICBnZXN0dXJlXG4gICAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gICAgaGFuZGxlclxuICAgKiBAcmV0dXJucyB7SGFtbWVyLkluc3RhbmNlfVxuICAgKi9cbiAgb2ZmOiBmdW5jdGlvbiBvZmZFdmVudChnZXN0dXJlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGdlc3R1cmVzID0gZ2VzdHVyZS5zcGxpdCgnICcpXG4gICAgICAsIGksIGVoO1xuICAgIFV0aWxzLmVhY2goZ2VzdHVyZXMsIGZ1bmN0aW9uKGdlc3R1cmUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGdlc3R1cmUsIGhhbmRsZXIsIGZhbHNlKTtcblxuICAgICAgLy8gcmVtb3ZlIHRoZSBldmVudCBoYW5kbGVyIGZyb20gdGhlIGludGVybmFsIGxpc3RcbiAgICAgIGZvcihpPS0xOyAoZWg9dGhpcy5ldmVudEhhbmRsZXJzWysraV0pOykge1xuICAgICAgICBpZihlaC5nZXN0dXJlID09PSBnZXN0dXJlICYmIGVoLmhhbmRsZXIgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cblxuICAvKipcbiAgICogdHJpZ2dlciBnZXN0dXJlIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgZ2VzdHVyZVxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICAgIFtldmVudERhdGFdXG4gICAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gICAqL1xuICB0cmlnZ2VyOiBmdW5jdGlvbiB0cmlnZ2VyRXZlbnQoZ2VzdHVyZSwgZXZlbnREYXRhKSB7XG4gICAgLy8gb3B0aW9uYWxcbiAgICBpZighZXZlbnREYXRhKSB7XG4gICAgICBldmVudERhdGEgPSB7fTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgRE9NIGV2ZW50XG4gICAgdmFyIGV2ZW50ID0gSGFtbWVyLkRPQ1VNRU5ULmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGV2ZW50LmluaXRFdmVudChnZXN0dXJlLCB0cnVlLCB0cnVlKTtcbiAgICBldmVudC5nZXN0dXJlID0gZXZlbnREYXRhO1xuXG4gICAgLy8gdHJpZ2dlciBvbiB0aGUgdGFyZ2V0IGlmIGl0IGlzIGluIHRoZSBpbnN0YW5jZSBlbGVtZW50LFxuICAgIC8vIHRoaXMgaXMgZm9yIGV2ZW50IGRlbGVnYXRpb24gdHJpY2tzXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgaWYoVXRpbHMuaGFzUGFyZW50KGV2ZW50RGF0YS50YXJnZXQsIGVsZW1lbnQpKSB7XG4gICAgICBlbGVtZW50ID0gZXZlbnREYXRhLnRhcmdldDtcbiAgICB9XG5cbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGVuYWJsZSBvZiBkaXNhYmxlIGhhbW1lci5qcyBkZXRlY3Rpb25cbiAgICogQHBhcmFtICAge0Jvb2xlYW59ICAgc3RhdGVcbiAgICogQHJldHVybnMge0hhbW1lci5JbnN0YW5jZX1cbiAgICovXG4gIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKHN0YXRlKSB7XG4gICAgdGhpcy5lbmFibGVkID0gc3RhdGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cblxuICAvKipcbiAgICogZGlzcG9zZSB0aGlzIGhhbW1lciBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7SGFtbWVyLkluc3RhbmNlfVxuICAgKi9cbiAgZGlzcG9zZTogZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICB2YXIgaSwgZWg7XG5cbiAgICAvLyB1bmRvIGFsbCBjaGFuZ2VzIG1hZGUgYnkgc3RvcF9icm93c2VyX2JlaGF2aW9yXG4gICAgaWYodGhpcy5vcHRpb25zLnN0b3BfYnJvd3Nlcl9iZWhhdmlvcikge1xuICAgICAgVXRpbHMudG9nZ2xlRGVmYXVsdEJlaGF2aW9yKHRoaXMuZWxlbWVudCwgdGhpcy5vcHRpb25zLnN0b3BfYnJvd3Nlcl9iZWhhdmlvciwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gdW5iaW5kIGFsbCBjdXN0b20gZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoaT0tMTsgKGVoPXRoaXMuZXZlbnRIYW5kbGVyc1srK2ldKTspIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGVoLmdlc3R1cmUsIGVoLmhhbmRsZXIsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5ldmVudEhhbmRsZXJzID0gW107XG5cbiAgICAvLyB1bmJpbmQgdGhlIHN0YXJ0IGV2ZW50IGxpc3RlbmVyXG4gICAgRXZlbnQudW5iaW5kRG9tKHRoaXMuZWxlbWVudCwgSGFtbWVyLkVWRU5UX1RZUEVTW0VWRU5UX1NUQVJUXSwgdGhpcy5ldmVudFN0YXJ0SGFuZGxlcik7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuXG4vKipcbiAqIHRoaXMgaG9sZHMgdGhlIGxhc3QgbW92ZSBldmVudCxcbiAqIHVzZWQgdG8gZml4IGVtcHR5IHRvdWNoZW5kIGlzc3VlXG4gKiBzZWUgdGhlIG9uVG91Y2ggZXZlbnQgZm9yIGFuIGV4cGxhbmF0aW9uXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgbGFzdF9tb3ZlX2V2ZW50ID0gbnVsbDtcblxuLyoqXG4gKiB3aGVuIHRoZSBtb3VzZSBpcyBob2xkIGRvd24sIHRoaXMgaXMgdHJ1ZVxuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cbnZhciBzaG91bGRfZGV0ZWN0ID0gZmFsc2U7XG5cbi8qKlxuICogd2hlbiB0b3VjaCBldmVudHMgaGF2ZSBiZWVuIGZpcmVkLCB0aGlzIGlzIHRydWVcbiAqIEB0eXBlIHtCb29sZWFufVxuICovXG52YXIgdG91Y2hfdHJpZ2dlcmVkID0gZmFsc2U7XG5cblxudmFyIEV2ZW50ID0gSGFtbWVyLmV2ZW50ID0ge1xuICAvKipcbiAgICogc2ltcGxlIGFkZEV2ZW50TGlzdGVuZXJcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIGVsZW1lbnRcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIHR5cGVcbiAgICogQHBhcmFtICAge0Z1bmN0aW9ufSAgICAgIGhhbmRsZXJcbiAgICovXG4gIGJpbmREb206IGZ1bmN0aW9uKGVsZW1lbnQsIHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgdHlwZXMgPSB0eXBlLnNwbGl0KCcgJyk7XG4gICAgVXRpbHMuZWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIHNpbXBsZSByZW1vdmVFdmVudExpc3RlbmVyXG4gICAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBlbGVtZW50XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICB0eXBlXG4gICAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gICAgICBoYW5kbGVyXG4gICAqL1xuICB1bmJpbmREb206IGZ1bmN0aW9uKGVsZW1lbnQsIHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgdHlwZXMgPSB0eXBlLnNwbGl0KCcgJyk7XG4gICAgVXRpbHMuZWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIHRvdWNoIGV2ZW50cyB3aXRoIG1vdXNlIGZhbGxiYWNrXG4gICAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBlbGVtZW50XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICBldmVudFR5cGUgICAgICAgIGxpa2UgRVZFTlRfTU9WRVxuICAgKiBAcGFyYW0gICB7RnVuY3Rpb259ICAgICAgaGFuZGxlclxuICAgKi9cbiAgb25Ub3VjaDogZnVuY3Rpb24gb25Ub3VjaChlbGVtZW50LCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuICAgIHZhciBiaW5kRG9tT25Ub3VjaCA9IGZ1bmN0aW9uIGJpbmREb21PblRvdWNoKGV2KSB7XG4gICAgICB2YXIgc3JjRXZlbnRUeXBlID0gZXYudHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAvLyBvbm1vdXNldXAsIGJ1dCB3aGVuIHRvdWNoZW5kIGhhcyBiZWVuIGZpcmVkIHdlIGRvIG5vdGhpbmcuXG4gICAgICAvLyB0aGlzIGlzIGZvciB0b3VjaGRldmljZXMgd2hpY2ggYWxzbyBmaXJlIGEgbW91c2V1cCBvbiB0b3VjaGVuZFxuICAgICAgaWYoVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAnbW91c2UnKSAmJiB0b3VjaF90cmlnZ2VyZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBtb3VzZWJ1dHRvbiBtdXN0IGJlIGRvd24gb3IgYSB0b3VjaCBldmVudFxuICAgICAgZWxzZSBpZihVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICd0b3VjaCcpIHx8ICAgLy8gdG91Y2ggZXZlbnRzIGFyZSBhbHdheXMgb24gc2NyZWVuXG4gICAgICAgIFV0aWxzLmluU3RyKHNyY0V2ZW50VHlwZSwgJ3BvaW50ZXJkb3duJykgfHwgLy8gcG9pbnRlcmV2ZW50cyB0b3VjaFxuICAgICAgICAoVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAnbW91c2UnKSAmJiBldi53aGljaCA9PT0gMSkgICAvLyBtb3VzZSBpcyBwcmVzc2VkXG4gICAgICAgICkge1xuICAgICAgICBzaG91bGRfZGV0ZWN0ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbW91c2UgaXNuJ3QgcHJlc3NlZFxuICAgICAgZWxzZSBpZihVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICdtb3VzZScpICYmICFldi53aGljaCkge1xuICAgICAgICBzaG91bGRfZGV0ZWN0ID0gZmFsc2U7XG4gICAgICB9XG5cblxuICAgICAgLy8gd2UgYXJlIGluIGEgdG91Y2ggZXZlbnQsIHNldCB0aGUgdG91Y2ggdHJpZ2dlcmVkIGJvb2wgdG8gdHJ1ZSxcbiAgICAgIC8vIHRoaXMgZm9yIHRoZSBjb25mbGljdHMgdGhhdCBtYXkgb2NjdXIgb24gaW9zIGFuZCBhbmRyb2lkXG4gICAgICBpZihVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICd0b3VjaCcpIHx8IFV0aWxzLmluU3RyKHNyY0V2ZW50VHlwZSwgJ3BvaW50ZXInKSkge1xuICAgICAgICB0b3VjaF90cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb3VudCB0aGUgdG90YWwgdG91Y2hlcyBvbiB0aGUgc2NyZWVuXG4gICAgICB2YXIgY291bnRfdG91Y2hlcyA9IDA7XG5cbiAgICAgIC8vIHdoZW4gdG91Y2ggaGFzIGJlZW4gdHJpZ2dlcmVkIGluIHRoaXMgZGV0ZWN0aW9uIHNlc3Npb25cbiAgICAgIC8vIGFuZCB3ZSBhcmUgbm93IGhhbmRsaW5nIGEgbW91c2UgZXZlbnQsIHdlIHN0b3AgdGhhdCB0byBwcmV2ZW50IGNvbmZsaWN0c1xuICAgICAgaWYoc2hvdWxkX2RldGVjdCkge1xuICAgICAgICAvLyB1cGRhdGUgcG9pbnRlcmV2ZW50XG4gICAgICAgIGlmKEhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUyAmJiBldmVudFR5cGUgIT0gRVZFTlRfRU5EKSB7XG4gICAgICAgICAgY291bnRfdG91Y2hlcyA9IFBvaW50ZXJFdmVudC51cGRhdGVQb2ludGVyKGV2ZW50VHlwZSwgZXYpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRvdWNoXG4gICAgICAgIGVsc2UgaWYoVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAndG91Y2gnKSkge1xuICAgICAgICAgIGNvdW50X3RvdWNoZXMgPSBldi50b3VjaGVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBtb3VzZVxuICAgICAgICBlbHNlIGlmKCF0b3VjaF90cmlnZ2VyZWQpIHtcbiAgICAgICAgICBjb3VudF90b3VjaGVzID0gVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAndXAnKSA/IDAgOiAxO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBpZiB3ZSBhcmUgaW4gYSBlbmQgZXZlbnQsIGJ1dCB3aGVuIHdlIHJlbW92ZSBvbmUgdG91Y2ggYW5kXG4gICAgICAgIC8vIHdlIHN0aWxsIGhhdmUgZW5vdWdoLCBzZXQgZXZlbnRUeXBlIHRvIG1vdmVcbiAgICAgICAgaWYoY291bnRfdG91Y2hlcyA+IDAgJiYgZXZlbnRUeXBlID09IEVWRU5UX0VORCkge1xuICAgICAgICAgIGV2ZW50VHlwZSA9IEVWRU5UX01PVkU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm8gdG91Y2hlcywgZm9yY2UgdGhlIGVuZCBldmVudFxuICAgICAgICBlbHNlIGlmKCFjb3VudF90b3VjaGVzKSB7XG4gICAgICAgICAgZXZlbnRUeXBlID0gRVZFTlRfRU5EO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIGxhc3QgbW92ZSBldmVudFxuICAgICAgICBpZihjb3VudF90b3VjaGVzIHx8IGxhc3RfbW92ZV9ldmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RfbW92ZV9ldmVudCA9IGV2O1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyB0cmlnZ2VyIHRoZSBoYW5kbGVyXG4gICAgICAgIGhhbmRsZXIuY2FsbChEZXRlY3Rpb24sIHNlbGYuY29sbGVjdEV2ZW50RGF0YShlbGVtZW50LCBldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRUb3VjaExpc3QobGFzdF9tb3ZlX2V2ZW50LCBldmVudFR5cGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2KSApO1xuXG4gICAgICAgIC8vIHJlbW92ZSBwb2ludGVyZXZlbnQgZnJvbSBsaXN0XG4gICAgICAgIGlmKEhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUyAmJiBldmVudFR5cGUgPT0gRVZFTlRfRU5EKSB7XG4gICAgICAgICAgY291bnRfdG91Y2hlcyA9IFBvaW50ZXJFdmVudC51cGRhdGVQb2ludGVyKGV2ZW50VHlwZSwgZXYpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG9uIHRoZSBlbmQgd2UgcmVzZXQgZXZlcnl0aGluZ1xuICAgICAgaWYoIWNvdW50X3RvdWNoZXMpIHtcbiAgICAgICAgbGFzdF9tb3ZlX2V2ZW50ID0gbnVsbDtcbiAgICAgICAgc2hvdWxkX2RldGVjdCA9IGZhbHNlO1xuICAgICAgICB0b3VjaF90cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgUG9pbnRlckV2ZW50LnJlc2V0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuYmluZERvbShlbGVtZW50LCBIYW1tZXIuRVZFTlRfVFlQRVNbZXZlbnRUeXBlXSwgYmluZERvbU9uVG91Y2gpO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBib3VuZCBmdW5jdGlvbiB0byBiZSBhYmxlIHRvIHVuYmluZCBpdCBsYXRlclxuICAgIHJldHVybiBiaW5kRG9tT25Ub3VjaDtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiB3ZSBoYXZlIGRpZmZlcmVudCBldmVudHMgZm9yIGVhY2ggZGV2aWNlL2Jyb3dzZXJcbiAgICogZGV0ZXJtaW5lIHdoYXQgd2UgbmVlZCBhbmQgc2V0IHRoZW0gaW4gdGhlIEhhbW1lci5FVkVOVF9UWVBFUyBjb25zdGFudFxuICAgKi9cbiAgZGV0ZXJtaW5lRXZlbnRUeXBlczogZnVuY3Rpb24gZGV0ZXJtaW5lRXZlbnRUeXBlcygpIHtcbiAgICAvLyBkZXRlcm1pbmUgdGhlIGV2ZW50dHlwZSB3ZSB3YW50IHRvIHNldFxuICAgIHZhciB0eXBlcztcblxuICAgIC8vIHBvaW50ZXJFdmVudHMgbWFnaWNcbiAgICBpZihIYW1tZXIuSEFTX1BPSU5URVJFVkVOVFMpIHtcbiAgICAgIHR5cGVzID0gUG9pbnRlckV2ZW50LmdldEV2ZW50cygpO1xuICAgIH1cbiAgICAvLyBvbiBBbmRyb2lkLCBpT1MsIGJsYWNrYmVycnksIHdpbmRvd3MgbW9iaWxlIHdlIGRvbnQgd2FudCBhbnkgbW91c2VldmVudHNcbiAgICBlbHNlIGlmKEhhbW1lci5OT19NT1VTRUVWRU5UUykge1xuICAgICAgdHlwZXMgPSBbXG4gICAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgICAgJ3RvdWNobW92ZScsXG4gICAgICAgICd0b3VjaGVuZCB0b3VjaGNhbmNlbCddO1xuICAgIH1cbiAgICAvLyBmb3Igbm9uIHBvaW50ZXIgZXZlbnRzIGJyb3dzZXJzIGFuZCBtaXhlZCBicm93c2VycyxcbiAgICAvLyBsaWtlIGNocm9tZSBvbiB3aW5kb3dzOCB0b3VjaCBsYXB0b3BcbiAgICBlbHNlIHtcbiAgICAgIHR5cGVzID0gW1xuICAgICAgICAndG91Y2hzdGFydCBtb3VzZWRvd24nLFxuICAgICAgICAndG91Y2htb3ZlIG1vdXNlbW92ZScsXG4gICAgICAgICd0b3VjaGVuZCB0b3VjaGNhbmNlbCBtb3VzZXVwJ107XG4gICAgfVxuXG4gICAgSGFtbWVyLkVWRU5UX1RZUEVTW0VWRU5UX1NUQVJUXSA9IHR5cGVzWzBdO1xuICAgIEhhbW1lci5FVkVOVF9UWVBFU1tFVkVOVF9NT1ZFXSA9IHR5cGVzWzFdO1xuICAgIEhhbW1lci5FVkVOVF9UWVBFU1tFVkVOVF9FTkRdID0gdHlwZXNbMl07XG4gIH0sXG5cblxuICAvKipcbiAgICogY3JlYXRlIHRvdWNobGlzdCBkZXBlbmRpbmcgb24gdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIGV2XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgIGV2ZW50VHlwZSAgIHVzZWQgYnkgdGhlIGZha2VtdWx0aXRvdWNoIHBsdWdpblxuICAgKi9cbiAgZ2V0VG91Y2hMaXN0OiBmdW5jdGlvbiBnZXRUb3VjaExpc3QoZXYvKiwgZXZlbnRUeXBlKi8pIHtcbiAgICAvLyBnZXQgdGhlIGZha2UgcG9pbnRlckV2ZW50IHRvdWNobGlzdFxuICAgIGlmKEhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUykge1xuICAgICAgcmV0dXJuIFBvaW50ZXJFdmVudC5nZXRUb3VjaExpc3QoKTtcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIHRvdWNobGlzdFxuICAgIGlmKGV2LnRvdWNoZXMpIHtcbiAgICAgIHJldHVybiBldi50b3VjaGVzO1xuICAgIH1cblxuICAgIC8vIG1ha2UgZmFrZSB0b3VjaGxpc3QgZnJvbSBtb3VzZSBwb3NpdGlvblxuICAgIGV2LmlkZW50aWZpZXIgPSAxO1xuICAgIHJldHVybiBbZXZdO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGNvbGxlY3QgZXZlbnQgZGF0YSBmb3IgSGFtbWVyIGpzXG4gICAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBlbGVtZW50XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICBldmVudFR5cGUgICAgICAgIGxpa2UgRVZFTlRfTU9WRVxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICAgICAgZXZlbnREYXRhXG4gICAqL1xuICBjb2xsZWN0RXZlbnREYXRhOiBmdW5jdGlvbiBjb2xsZWN0RXZlbnREYXRhKGVsZW1lbnQsIGV2ZW50VHlwZSwgdG91Y2hlcywgZXYpIHtcbiAgICAvLyBmaW5kIG91dCBwb2ludGVyVHlwZVxuICAgIHZhciBwb2ludGVyVHlwZSA9IFBPSU5URVJfVE9VQ0g7XG4gICAgaWYoVXRpbHMuaW5TdHIoZXYudHlwZSwgJ21vdXNlJykgfHwgUG9pbnRlckV2ZW50Lm1hdGNoVHlwZShQT0lOVEVSX01PVVNFLCBldikpIHtcbiAgICAgIHBvaW50ZXJUeXBlID0gUE9JTlRFUl9NT1VTRTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2VudGVyICAgICA6IFV0aWxzLmdldENlbnRlcih0b3VjaGVzKSxcbiAgICAgIHRpbWVTdGFtcCAgOiBEYXRlLm5vdygpLFxuICAgICAgdGFyZ2V0ICAgICA6IGV2LnRhcmdldCxcbiAgICAgIHRvdWNoZXMgICAgOiB0b3VjaGVzLFxuICAgICAgZXZlbnRUeXBlICA6IGV2ZW50VHlwZSxcbiAgICAgIHBvaW50ZXJUeXBlOiBwb2ludGVyVHlwZSxcbiAgICAgIHNyY0V2ZW50ICAgOiBldixcblxuICAgICAgLyoqXG4gICAgICAgKiBwcmV2ZW50IHRoZSBicm93c2VyIGRlZmF1bHQgYWN0aW9uc1xuICAgICAgICogbW9zdGx5IHVzZWQgdG8gZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIGJyb3dzZXJcbiAgICAgICAqL1xuICAgICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3JjRXZlbnQgPSB0aGlzLnNyY0V2ZW50O1xuICAgICAgICBzcmNFdmVudC5wcmV2ZW50TWFuaXB1bGF0aW9uICYmIHNyY0V2ZW50LnByZXZlbnRNYW5pcHVsYXRpb24oKTtcbiAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQgJiYgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogc3RvcCBidWJibGluZyB0aGUgZXZlbnQgdXAgdG8gaXRzIHBhcmVudHNcbiAgICAgICAqL1xuICAgICAgc3RvcFByb3BhZ2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zcmNFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogaW1tZWRpYXRlbHkgc3RvcCBnZXN0dXJlIGRldGVjdGlvblxuICAgICAgICogbWlnaHQgYmUgdXNlZnVsIGFmdGVyIGEgc3dpcGUgd2FzIGRldGVjdGVkXG4gICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICovXG4gICAgICBzdG9wRGV0ZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIERldGVjdGlvbi5zdG9wRGV0ZWN0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxudmFyIFBvaW50ZXJFdmVudCA9IEhhbW1lci5Qb2ludGVyRXZlbnQgPSB7XG4gIC8qKlxuICAgKiBob2xkcyBhbGwgcG9pbnRlcnNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHBvaW50ZXJzOiB7fSxcblxuICAvKipcbiAgICogZ2V0IGEgbGlzdCBvZiBwb2ludGVyc1xuICAgKiBAcmV0dXJucyB7QXJyYXl9ICAgICB0b3VjaGxpc3RcbiAgICovXG4gIGdldFRvdWNoTGlzdDogZnVuY3Rpb24gZ2V0VG91Y2hMaXN0KCkge1xuICAgIHZhciB0b3VjaGxpc3QgPSBbXTtcbiAgICAvLyB3ZSBjYW4gdXNlIGZvckVhY2ggc2luY2UgcG9pbnRlckV2ZW50cyBvbmx5IGlzIGluIElFMTBcbiAgICBVdGlscy5lYWNoKHRoaXMucG9pbnRlcnMsIGZ1bmN0aW9uKHBvaW50ZXIpe1xuICAgICAgdG91Y2hsaXN0LnB1c2gocG9pbnRlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG91Y2hsaXN0O1xuICB9LFxuXG4gIC8qKlxuICAgKiB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIGEgcG9pbnRlclxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgIHR5cGUgICAgICAgICAgICAgRVZFTlRfRU5EXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgcG9pbnRlckV2ZW50XG4gICAqL1xuICB1cGRhdGVQb2ludGVyOiBmdW5jdGlvbiB1cGRhdGVQb2ludGVyKHR5cGUsIHBvaW50ZXJFdmVudCkge1xuICAgIGlmKHR5cGUgPT0gRVZFTlRfRU5EKSB7XG4gICAgICBkZWxldGUgdGhpcy5wb2ludGVyc1twb2ludGVyRXZlbnQucG9pbnRlcklkXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwb2ludGVyRXZlbnQuaWRlbnRpZmllciA9IHBvaW50ZXJFdmVudC5wb2ludGVySWQ7XG4gICAgICB0aGlzLnBvaW50ZXJzW3BvaW50ZXJFdmVudC5wb2ludGVySWRdID0gcG9pbnRlckV2ZW50O1xuICAgIH1cblxuICAgIC8vIGl0J3Mgc2F2ZSB0byB1c2UgT2JqZWN0LmtleXMsIHNpbmNlIHBvaW50ZXJFdmVudHMgYXJlIG9ubHkgaW4gbmV3ZXIgYnJvd3NlcnNcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wb2ludGVycykubGVuZ3RoO1xuICB9LFxuXG4gIC8qKlxuICAgKiBjaGVjayBpZiBldiBtYXRjaGVzIHBvaW50ZXJ0eXBlXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICBwb2ludGVyVHlwZSAgICAgUE9JTlRFUl9NT1VTRVxuICAgKiBAcGFyYW0gICB7UG9pbnRlckV2ZW50fSAgZXZcbiAgICovXG4gIG1hdGNoVHlwZTogZnVuY3Rpb24gbWF0Y2hUeXBlKHBvaW50ZXJUeXBlLCBldikge1xuICAgIGlmKCFldi5wb2ludGVyVHlwZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBwdCA9IGV2LnBvaW50ZXJUeXBlXG4gICAgICAsIHR5cGVzID0ge307XG5cbiAgICB0eXBlc1tQT0lOVEVSX01PVVNFXSA9IChwdCA9PT0gUE9JTlRFUl9NT1VTRSk7XG4gICAgdHlwZXNbUE9JTlRFUl9UT1VDSF0gPSAocHQgPT09IFBPSU5URVJfVE9VQ0gpO1xuICAgIHR5cGVzW1BPSU5URVJfUEVOXSA9IChwdCA9PT0gUE9JTlRFUl9QRU4pO1xuICAgIHJldHVybiB0eXBlc1twb2ludGVyVHlwZV07XG4gIH0sXG5cblxuICAvKipcbiAgICogZ2V0IGV2ZW50c1xuICAgKi9cbiAgZ2V0RXZlbnRzOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICdwb2ludGVyZG93biBNU1BvaW50ZXJEb3duJyxcbiAgICAgICdwb2ludGVybW92ZSBNU1BvaW50ZXJNb3ZlJyxcbiAgICAgICdwb2ludGVydXAgcG9pbnRlcmNhbmNlbCBNU1BvaW50ZXJVcCBNU1BvaW50ZXJDYW5jZWwnXG4gICAgXTtcbiAgfSxcblxuICAvKipcbiAgICogcmVzZXQgdGhlIGxpc3RcbiAgICovXG4gIHJlc2V0OiBmdW5jdGlvbiByZXNldExpc3QoKSB7XG4gICAgdGhpcy5wb2ludGVycyA9IHt9O1xuICB9XG59O1xuXG5cbnZhciBEZXRlY3Rpb24gPSBIYW1tZXIuZGV0ZWN0aW9uID0ge1xuICAvLyBjb250YWlucyBhbGwgcmVnaXN0cmVkIEhhbW1lci5nZXN0dXJlcyBpbiB0aGUgY29ycmVjdCBvcmRlclxuICBnZXN0dXJlczogW10sXG5cbiAgLy8gZGF0YSBvZiB0aGUgY3VycmVudCBIYW1tZXIuZ2VzdHVyZSBkZXRlY3Rpb24gc2Vzc2lvblxuICBjdXJyZW50IDogbnVsbCxcblxuICAvLyB0aGUgcHJldmlvdXMgSGFtbWVyLmdlc3R1cmUgc2Vzc2lvbiBkYXRhXG4gIC8vIGlzIGEgZnVsbCBjbG9uZSBvZiB0aGUgcHJldmlvdXMgZ2VzdHVyZS5jdXJyZW50IG9iamVjdFxuICBwcmV2aW91czogbnVsbCxcblxuICAvLyB3aGVuIHRoaXMgYmVjb21lcyB0cnVlLCBubyBnZXN0dXJlcyBhcmUgZmlyZWRcbiAgc3RvcHBlZCA6IGZhbHNlLFxuXG5cbiAgLyoqXG4gICAqIHN0YXJ0IEhhbW1lci5nZXN0dXJlIGRldGVjdGlvblxuICAgKiBAcGFyYW0gICB7SGFtbWVyLkluc3RhbmNlfSAgIGluc3RcbiAgICogQHBhcmFtICAge09iamVjdH0gICAgICAgICAgICBldmVudERhdGFcbiAgICovXG4gIHN0YXJ0RGV0ZWN0OiBmdW5jdGlvbiBzdGFydERldGVjdChpbnN0LCBldmVudERhdGEpIHtcbiAgICAvLyBhbHJlYWR5IGJ1c3kgd2l0aCBhIEhhbW1lci5nZXN0dXJlIGRldGVjdGlvbiBvbiBhbiBlbGVtZW50XG4gICAgaWYodGhpcy5jdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cbiAgICAvLyBob2xkcyBjdXJyZW50IHNlc3Npb25cbiAgICB0aGlzLmN1cnJlbnQgPSB7XG4gICAgICBpbnN0ICAgICAgICAgICAgICA6IGluc3QsIC8vIHJlZmVyZW5jZSB0byBIYW1tZXJJbnN0YW5jZSB3ZSdyZSB3b3JraW5nIGZvclxuICAgICAgc3RhcnRFdmVudCAgICAgICAgOiBVdGlscy5leHRlbmQoe30sIGV2ZW50RGF0YSksIC8vIHN0YXJ0IGV2ZW50RGF0YSBmb3IgZGlzdGFuY2VzLCB0aW1pbmcgZXRjXG4gICAgICBsYXN0RXZlbnQgICAgICAgICA6IGZhbHNlLCAvLyBsYXN0IGV2ZW50RGF0YVxuICAgICAgbGFzdFZlbG9jaXR5RXZlbnQgOiBmYWxzZSwgLy8gbGFzdCBldmVudERhdGEgZm9yIHZlbG9jaXR5LlxuICAgICAgdmVsb2NpdHkgICAgICAgICAgOiBmYWxzZSwgLy8gY3VycmVudCB2ZWxvY2l0eVxuICAgICAgbmFtZSAgICAgICAgICAgICAgOiAnJyAvLyBjdXJyZW50IGdlc3R1cmUgd2UncmUgaW4vZGV0ZWN0ZWQsIGNhbiBiZSAndGFwJywgJ2hvbGQnIGV0Y1xuICAgIH07XG5cbiAgICB0aGlzLmRldGVjdChldmVudERhdGEpO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIEhhbW1lci5nZXN0dXJlIGRldGVjdGlvblxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBldmVudERhdGFcbiAgICovXG4gIGRldGVjdDogZnVuY3Rpb24gZGV0ZWN0KGV2ZW50RGF0YSkge1xuICAgIGlmKCF0aGlzLmN1cnJlbnQgfHwgdGhpcy5zdG9wcGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZXh0ZW5kIGV2ZW50IGRhdGEgd2l0aCBjYWxjdWxhdGlvbnMgYWJvdXQgc2NhbGUsIGRpc3RhbmNlIGV0Y1xuICAgIGV2ZW50RGF0YSA9IHRoaXMuZXh0ZW5kRXZlbnREYXRhKGV2ZW50RGF0YSk7XG5cbiAgICAvLyBoYW1tZXIgaW5zdGFuY2UgYW5kIGluc3RhbmNlIG9wdGlvbnNcbiAgICB2YXIgaW5zdCA9IHRoaXMuY3VycmVudC5pbnN0LFxuICAgICAgICBpbnN0X29wdGlvbnMgPSBpbnN0Lm9wdGlvbnM7XG5cbiAgICAvLyBjYWxsIEhhbW1lci5nZXN0dXJlIGhhbmRsZXJzXG4gICAgVXRpbHMuZWFjaCh0aGlzLmdlc3R1cmVzLCBmdW5jdGlvbiB0cmlnZ2VyR2VzdHVyZShnZXN0dXJlKSB7XG4gICAgICAvLyBvbmx5IHdoZW4gdGhlIGluc3RhbmNlIG9wdGlvbnMgaGF2ZSBlbmFibGVkIHRoaXMgZ2VzdHVyZVxuICAgICAgaWYoIXRoaXMuc3RvcHBlZCAmJiBpbnN0X29wdGlvbnNbZ2VzdHVyZS5uYW1lXSAhPT0gZmFsc2UgJiYgaW5zdC5lbmFibGVkICE9PSBmYWxzZSApIHtcbiAgICAgICAgLy8gaWYgYSBoYW5kbGVyIHJldHVybnMgZmFsc2UsIHdlIHN0b3Agd2l0aCB0aGUgZGV0ZWN0aW9uXG4gICAgICAgIGlmKGdlc3R1cmUuaGFuZGxlci5jYWxsKGdlc3R1cmUsIGV2ZW50RGF0YSwgaW5zdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy5zdG9wRGV0ZWN0KCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICAvLyBzdG9yZSBhcyBwcmV2aW91cyBldmVudCBldmVudFxuICAgIGlmKHRoaXMuY3VycmVudCkge1xuICAgICAgdGhpcy5jdXJyZW50Lmxhc3RFdmVudCA9IGV2ZW50RGF0YTtcbiAgICB9XG5cbiAgICAvLyBlbmQgZXZlbnQsIGJ1dCBub3QgdGhlIGxhc3QgdG91Y2gsIHNvIGRvbnQgc3RvcFxuICAgIGlmKGV2ZW50RGF0YS5ldmVudFR5cGUgPT0gRVZFTlRfRU5EICYmICFldmVudERhdGEudG91Y2hlcy5sZW5ndGggLSAxKSB7XG4gICAgICB0aGlzLnN0b3BEZXRlY3QoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnREYXRhO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGNsZWFyIHRoZSBIYW1tZXIuZ2VzdHVyZSB2YXJzXG4gICAqIHRoaXMgaXMgY2FsbGVkIG9uIGVuZERldGVjdCwgYnV0IGNhbiBhbHNvIGJlIHVzZWQgd2hlbiBhIGZpbmFsIEhhbW1lci5nZXN0dXJlIGhhcyBiZWVuIGRldGVjdGVkXG4gICAqIHRvIHN0b3Agb3RoZXIgSGFtbWVyLmdlc3R1cmVzIGZyb20gYmVpbmcgZmlyZWRcbiAgICovXG4gIHN0b3BEZXRlY3Q6IGZ1bmN0aW9uIHN0b3BEZXRlY3QoKSB7XG4gICAgLy8gY2xvbmUgY3VycmVudCBkYXRhIHRvIHRoZSBzdG9yZSBhcyB0aGUgcHJldmlvdXMgZ2VzdHVyZVxuICAgIC8vIHVzZWQgZm9yIHRoZSBkb3VibGUgdGFwIGdlc3R1cmUsIHNpbmNlIHRoaXMgaXMgYW4gb3RoZXIgZ2VzdHVyZSBkZXRlY3Qgc2Vzc2lvblxuICAgIHRoaXMucHJldmlvdXMgPSBVdGlscy5leHRlbmQoe30sIHRoaXMuY3VycmVudCk7XG5cbiAgICAvLyByZXNldCB0aGUgY3VycmVudFxuICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG5cbiAgICAvLyBzdG9wcGVkIVxuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gIH0sXG5cblxuICAvKipcbiAgICogY2FsY3VsYXRlIHZlbG9jaXR5XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBldlxuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgZGVsdGFfdGltZVxuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgZGVsdGFfeFxuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgZGVsdGFfeVxuICAgKi9cbiAgZ2V0VmVsb2NpdHlEYXRhOiBmdW5jdGlvbiBnZXRWZWxvY2l0eURhdGEoZXYsIGRlbHRhX3RpbWUsIGRlbHRhX3gsIGRlbHRhX3kpIHtcbiAgICB2YXIgY3VyID0gdGhpcy5jdXJyZW50XG4gICAgICAsIHZlbG9jaXR5RXYgPSBjdXIubGFzdFZlbG9jaXR5RXZlbnRcbiAgICAgICwgdmVsb2NpdHkgPSBjdXIudmVsb2NpdHk7XG5cbiAgICAvLyBjYWxjdWxhdGUgdmVsb2NpdHkgZXZlcnkgeCBtc1xuICAgIGlmICh2ZWxvY2l0eUV2ICYmIGV2LnRpbWVTdGFtcCAtIHZlbG9jaXR5RXYudGltZVN0YW1wID4gSGFtbWVyLlVQREFURV9WRUxPQ0lUWV9JTlRFUlZBTCkge1xuICAgICAgdmVsb2NpdHkgPSBVdGlscy5nZXRWZWxvY2l0eShldi50aW1lU3RhbXAgLSB2ZWxvY2l0eUV2LnRpbWVTdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYuY2VudGVyLmNsaWVudFggLSB2ZWxvY2l0eUV2LmNlbnRlci5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2LmNlbnRlci5jbGllbnRZIC0gdmVsb2NpdHlFdi5jZW50ZXIuY2xpZW50WSk7XG4gICAgICBjdXIubGFzdFZlbG9jaXR5RXZlbnQgPSBldjtcbiAgICB9XG4gICAgZWxzZSBpZighY3VyLnZlbG9jaXR5KSB7XG4gICAgICB2ZWxvY2l0eSA9IFV0aWxzLmdldFZlbG9jaXR5KGRlbHRhX3RpbWUsIGRlbHRhX3gsIGRlbHRhX3kpO1xuICAgICAgY3VyLmxhc3RWZWxvY2l0eUV2ZW50ID0gZXY7XG4gICAgfVxuXG4gICAgY3VyLnZlbG9jaXR5ID0gdmVsb2NpdHk7XG5cbiAgICBldi52ZWxvY2l0eVggPSB2ZWxvY2l0eS54O1xuICAgIGV2LnZlbG9jaXR5WSA9IHZlbG9jaXR5Lnk7XG4gIH0sXG5cblxuICAvKipcbiAgICogY2FsY3VsYXRlIGludGVyaW0gYW5nbGUgYW5kIGRpcmVjdGlvblxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgZXZcbiAgICovXG4gIGdldEludGVyaW1EYXRhOiBmdW5jdGlvbiBnZXRJbnRlcmltRGF0YShldikge1xuICAgIHZhciBsYXN0RXZlbnQgPSB0aGlzLmN1cnJlbnQubGFzdEV2ZW50XG4gICAgICAsIGFuZ2xlXG4gICAgICAsIGRpcmVjdGlvbjtcblxuICAgIC8vIGVuZCBldmVudHMgKGUuZy4gZHJhZ2VuZCkgZG9uJ3QgaGF2ZSB1c2VmdWwgdmFsdWVzIGZvciBpbnRlcmltRGlyZWN0aW9uICYgaW50ZXJpbUFuZ2xlXG4gICAgLy8gYmVjYXVzZSB0aGUgcHJldmlvdXMgZXZlbnQgaGFzIGV4YWN0bHkgdGhlIHNhbWUgY29vcmRpbmF0ZXNcbiAgICAvLyBzbyBmb3IgZW5kIGV2ZW50cywgdGFrZSB0aGUgcHJldmlvdXMgdmFsdWVzIG9mIGludGVyaW1EaXJlY3Rpb24gJiBpbnRlcmltQW5nbGVcbiAgICAvLyBpbnN0ZWFkIG9mIHJlY2FsY3VsYXRpbmcgdGhlbSBhbmQgZ2V0dGluZyBhIHNwdXJpb3VzICcwJ1xuICAgIGlmKGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgIGFuZ2xlID0gbGFzdEV2ZW50ICYmIGxhc3RFdmVudC5pbnRlcmltQW5nbGU7XG4gICAgICBkaXJlY3Rpb24gPSBsYXN0RXZlbnQgJiYgbGFzdEV2ZW50LmludGVyaW1EaXJlY3Rpb247XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYW5nbGUgPSBsYXN0RXZlbnQgJiYgVXRpbHMuZ2V0QW5nbGUobGFzdEV2ZW50LmNlbnRlciwgZXYuY2VudGVyKTtcbiAgICAgIGRpcmVjdGlvbiA9IGxhc3RFdmVudCAmJiBVdGlscy5nZXREaXJlY3Rpb24obGFzdEV2ZW50LmNlbnRlciwgZXYuY2VudGVyKTtcbiAgICB9XG5cbiAgICBldi5pbnRlcmltQW5nbGUgPSBhbmdsZTtcbiAgICBldi5pbnRlcmltRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGV4dGVuZCBldmVudERhdGEgZm9yIEhhbW1lci5nZXN0dXJlc1xuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgIGV2RGF0YVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAgIGV2RGF0YVxuICAgKi9cbiAgZXh0ZW5kRXZlbnREYXRhOiBmdW5jdGlvbiBleHRlbmRFdmVudERhdGEoZXYpIHtcbiAgICB2YXIgY3VyID0gdGhpcy5jdXJyZW50XG4gICAgICAsIHN0YXJ0RXYgPSBjdXIuc3RhcnRFdmVudDtcblxuICAgIC8vIGlmIHRoZSB0b3VjaGVzIGNoYW5nZSwgc2V0IHRoZSBuZXcgdG91Y2hlcyBvdmVyIHRoZSBzdGFydEV2ZW50IHRvdWNoZXNcbiAgICAvLyB0aGlzIGJlY2F1c2UgdG91Y2hldmVudHMgZG9uJ3QgaGF2ZSBhbGwgdGhlIHRvdWNoZXMgb24gdG91Y2hzdGFydCwgb3IgdGhlXG4gICAgLy8gdXNlciBtdXN0IHBsYWNlIGhpcyBmaW5nZXJzIGF0IHRoZSBFWEFDVCBzYW1lIHRpbWUgb24gdGhlIHNjcmVlbiwgd2hpY2ggaXMgbm90IHJlYWxpc3RpY1xuICAgIC8vIGJ1dCwgc29tZXRpbWVzIGl0IGhhcHBlbnMgdGhhdCBib3RoIGZpbmdlcnMgYXJlIHRvdWNoaW5nIGF0IHRoZSBFWEFDVCBzYW1lIHRpbWVcbiAgICBpZihldi50b3VjaGVzLmxlbmd0aCAhPSBzdGFydEV2LnRvdWNoZXMubGVuZ3RoIHx8IGV2LnRvdWNoZXMgPT09IHN0YXJ0RXYudG91Y2hlcykge1xuICAgICAgLy8gZXh0ZW5kIDEgbGV2ZWwgZGVlcCB0byBnZXQgdGhlIHRvdWNobGlzdCB3aXRoIHRoZSB0b3VjaCBvYmplY3RzXG4gICAgICBzdGFydEV2LnRvdWNoZXMgPSBbXTtcbiAgICAgIFV0aWxzLmVhY2goZXYudG91Y2hlcywgZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgICAgc3RhcnRFdi50b3VjaGVzLnB1c2goVXRpbHMuZXh0ZW5kKHt9LCB0b3VjaCkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhX3RpbWUgPSBldi50aW1lU3RhbXAgLSBzdGFydEV2LnRpbWVTdGFtcFxuICAgICAgLCBkZWx0YV94ID0gZXYuY2VudGVyLmNsaWVudFggLSBzdGFydEV2LmNlbnRlci5jbGllbnRYXG4gICAgICAsIGRlbHRhX3kgPSBldi5jZW50ZXIuY2xpZW50WSAtIHN0YXJ0RXYuY2VudGVyLmNsaWVudFk7XG5cbiAgICB0aGlzLmdldFZlbG9jaXR5RGF0YShldiwgZGVsdGFfdGltZSwgZGVsdGFfeCwgZGVsdGFfeSk7XG4gICAgdGhpcy5nZXRJbnRlcmltRGF0YShldik7XG5cbiAgICBVdGlscy5leHRlbmQoZXYsIHtcbiAgICAgIHN0YXJ0RXZlbnQ6IHN0YXJ0RXYsXG5cbiAgICAgIGRlbHRhVGltZSA6IGRlbHRhX3RpbWUsXG4gICAgICBkZWx0YVggICAgOiBkZWx0YV94LFxuICAgICAgZGVsdGFZICAgIDogZGVsdGFfeSxcblxuICAgICAgZGlzdGFuY2UgIDogVXRpbHMuZ2V0RGlzdGFuY2Uoc3RhcnRFdi5jZW50ZXIsIGV2LmNlbnRlciksXG4gICAgICBhbmdsZSAgICAgOiBVdGlscy5nZXRBbmdsZShzdGFydEV2LmNlbnRlciwgZXYuY2VudGVyKSxcbiAgICAgIGRpcmVjdGlvbiA6IFV0aWxzLmdldERpcmVjdGlvbihzdGFydEV2LmNlbnRlciwgZXYuY2VudGVyKSxcblxuICAgICAgc2NhbGUgICAgIDogVXRpbHMuZ2V0U2NhbGUoc3RhcnRFdi50b3VjaGVzLCBldi50b3VjaGVzKSxcbiAgICAgIHJvdGF0aW9uICA6IFV0aWxzLmdldFJvdGF0aW9uKHN0YXJ0RXYudG91Y2hlcywgZXYudG91Y2hlcylcbiAgICB9KTtcblxuICAgIHJldHVybiBldjtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiByZWdpc3RlciBuZXcgZ2VzdHVyZVxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBnZXN0dXJlIG9iamVjdCwgc2VlIGdlc3R1cmVzLmpzIGZvciBkb2N1bWVudGF0aW9uXG4gICAqIEByZXR1cm5zIHtBcnJheX0gICAgIGdlc3R1cmVzXG4gICAqL1xuICByZWdpc3RlcjogZnVuY3Rpb24gcmVnaXN0ZXIoZ2VzdHVyZSkge1xuICAgIC8vIGFkZCBhbiBlbmFibGUgZ2VzdHVyZSBvcHRpb25zIGlmIHRoZXJlIGlzIG5vIGdpdmVuXG4gICAgdmFyIG9wdGlvbnMgPSBnZXN0dXJlLmRlZmF1bHRzIHx8IHt9O1xuICAgIGlmKG9wdGlvbnNbZ2VzdHVyZS5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zW2dlc3R1cmUubmFtZV0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGV4dGVuZCBIYW1tZXIgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIEhhbW1lci5nZXN0dXJlIG9wdGlvbnNcbiAgICBVdGlscy5leHRlbmQoSGFtbWVyLmRlZmF1bHRzLCBvcHRpb25zLCB0cnVlKTtcblxuICAgIC8vIHNldCBpdHMgaW5kZXhcbiAgICBnZXN0dXJlLmluZGV4ID0gZ2VzdHVyZS5pbmRleCB8fCAxMDAwO1xuXG4gICAgLy8gYWRkIEhhbW1lci5nZXN0dXJlIHRvIHRoZSBsaXN0XG4gICAgdGhpcy5nZXN0dXJlcy5wdXNoKGdlc3R1cmUpO1xuXG4gICAgLy8gc29ydCB0aGUgbGlzdCBieSBpbmRleFxuICAgIHRoaXMuZ2VzdHVyZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICBpZihhLmluZGV4IDwgYi5pbmRleCkgeyByZXR1cm4gLTE7IH1cbiAgICAgIGlmKGEuaW5kZXggPiBiLmluZGV4KSB7IHJldHVybiAxOyB9XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmdlc3R1cmVzO1xuICB9XG59O1xuXG5cbi8qKlxuICogRHJhZ1xuICogTW92ZSB3aXRoIHggZmluZ2VycyAoZGVmYXVsdCAxKSBhcm91bmQgb24gdGhlIHBhZ2UuIEJsb2NraW5nIHRoZSBzY3JvbGxpbmcgd2hlblxuICogbW92aW5nIGxlZnQgYW5kIHJpZ2h0IGlzIGEgZ29vZCBwcmFjdGljZS4gV2hlbiBhbGwgdGhlIGRyYWcgZXZlbnRzIGFyZSBibG9ja2luZ1xuICogeW91IGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRoYXQgYXJlYS5cbiAqIEBldmVudHMgIGRyYWcsIGRyYXBsZWZ0LCBkcmFncmlnaHQsIGRyYWd1cCwgZHJhZ2Rvd25cbiAqL1xuSGFtbWVyLmdlc3R1cmVzLkRyYWcgPSB7XG4gIG5hbWUgICAgIDogJ2RyYWcnLFxuICBpbmRleCAgICA6IDUwLFxuICBkZWZhdWx0cyA6IHtcbiAgICBkcmFnX21pbl9kaXN0YW5jZSAgICAgICAgICAgIDogMTAsXG5cbiAgICAvLyBTZXQgY29ycmVjdF9mb3JfZHJhZ19taW5fZGlzdGFuY2UgdG8gdHJ1ZSB0byBtYWtlIHRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZHJhZ1xuICAgIC8vIGJlIGNhbGN1bGF0ZWQgZnJvbSB3aGVyZSB0aGUgZHJhZyB3YXMgdHJpZ2dlcmVkLCBub3QgZnJvbSB3aGVyZSB0aGUgdG91Y2ggc3RhcnRlZC5cbiAgICAvLyBVc2VmdWwgdG8gYXZvaWQgYSBqZXJrLXN0YXJ0aW5nIGRyYWcsIHdoaWNoIGNhbiBtYWtlIGZpbmUtYWRqdXN0bWVudHNcbiAgICAvLyB0aHJvdWdoIGRyYWdnaW5nIGRpZmZpY3VsdCwgYW5kIGJlIHZpc3VhbGx5IHVuYXBwZWFsaW5nLlxuICAgIGNvcnJlY3RfZm9yX2RyYWdfbWluX2Rpc3RhbmNlOiB0cnVlLFxuXG4gICAgLy8gc2V0IDAgZm9yIHVubGltaXRlZCwgYnV0IHRoaXMgY2FuIGNvbmZsaWN0IHdpdGggdHJhbnNmb3JtXG4gICAgZHJhZ19tYXhfdG91Y2hlcyAgICAgICAgICAgICA6IDEsXG5cbiAgICAvLyBwcmV2ZW50IGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciB3aGVuIGRyYWdnaW5nIG9jY3Vyc1xuICAgIC8vIGJlIGNhcmVmdWwgd2l0aCBpdCwgaXQgbWFrZXMgdGhlIGVsZW1lbnQgYSBibG9ja2luZyBlbGVtZW50XG4gICAgLy8gd2hlbiB5b3UgYXJlIHVzaW5nIHRoZSBkcmFnIGdlc3R1cmUsIGl0IGlzIGEgZ29vZCBwcmFjdGljZSB0byBzZXQgdGhpcyB0cnVlXG4gICAgZHJhZ19ibG9ja19ob3Jpem9udGFsICAgICAgICA6IGZhbHNlLFxuICAgIGRyYWdfYmxvY2tfdmVydGljYWwgICAgICAgICAgOiBmYWxzZSxcblxuICAgIC8vIGRyYWdfbG9ja190b19heGlzIGtlZXBzIHRoZSBkcmFnIGdlc3R1cmUgb24gdGhlIGF4aXMgdGhhdCBpdCBzdGFydGVkIG9uLFxuICAgIC8vIEl0IGRpc2FsbG93cyB2ZXJ0aWNhbCBkaXJlY3Rpb25zIGlmIHRoZSBpbml0aWFsIGRpcmVjdGlvbiB3YXMgaG9yaXpvbnRhbCwgYW5kIHZpY2UgdmVyc2EuXG4gICAgZHJhZ19sb2NrX3RvX2F4aXMgICAgICAgICAgICA6IGZhbHNlLFxuXG4gICAgLy8gZHJhZyBsb2NrIG9ubHkga2lja3MgaW4gd2hlbiBkaXN0YW5jZSA+IGRyYWdfbG9ja19taW5fZGlzdGFuY2VcbiAgICAvLyBUaGlzIHdheSwgbG9ja2luZyBvY2N1cnMgb25seSB3aGVuIHRoZSBkaXN0YW5jZSBoYXMgYmVjb21lIGxhcmdlIGVub3VnaCB0byByZWxpYWJseSBkZXRlcm1pbmUgdGhlIGRpcmVjdGlvblxuICAgIGRyYWdfbG9ja19taW5fZGlzdGFuY2UgICAgICAgOiAyNVxuICB9LFxuXG4gIHRyaWdnZXJlZDogZmFsc2UsXG4gIGhhbmRsZXIgIDogZnVuY3Rpb24gZHJhZ0dlc3R1cmUoZXYsIGluc3QpIHtcbiAgICB2YXIgY3VyID0gRGV0ZWN0aW9uLmN1cnJlbnQ7XG5cbiAgICAvLyBjdXJyZW50IGdlc3R1cmUgaXNudCBkcmFnLCBidXQgZHJhZ2dlZCBpcyB0cnVlXG4gICAgLy8gdGhpcyBtZWFucyBhbiBvdGhlciBnZXN0dXJlIGlzIGJ1c3kuIG5vdyBjYWxsIGRyYWdlbmRcbiAgICBpZihjdXIubmFtZSAhPSB0aGlzLm5hbWUgJiYgdGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUgKyAnZW5kJywgZXYpO1xuICAgICAgdGhpcy50cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBtYXggdG91Y2hlc1xuICAgIGlmKGluc3Qub3B0aW9ucy5kcmFnX21heF90b3VjaGVzID4gMCAmJlxuICAgICAgZXYudG91Y2hlcy5sZW5ndGggPiBpbnN0Lm9wdGlvbnMuZHJhZ19tYXhfdG91Y2hlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaChldi5ldmVudFR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfU1RBUlQ6XG4gICAgICAgIHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVWRU5UX01PVkU6XG4gICAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgICAvLyBvciB3ZSBjYW4gYmUgYWxyZWFkeSBpbiBkcmFnZ2luZ1xuICAgICAgICBpZihldi5kaXN0YW5jZSA8IGluc3Qub3B0aW9ucy5kcmFnX21pbl9kaXN0YW5jZSAmJlxuICAgICAgICAgIGN1ci5uYW1lICE9IHRoaXMubmFtZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGFydENlbnRlciA9IGN1ci5zdGFydEV2ZW50LmNlbnRlcjtcblxuICAgICAgICAvLyB3ZSBhcmUgZHJhZ2dpbmchXG4gICAgICAgIGlmKGN1ci5uYW1lICE9IHRoaXMubmFtZSkge1xuICAgICAgICAgIGN1ci5uYW1lID0gdGhpcy5uYW1lO1xuICAgICAgICAgIGlmKGluc3Qub3B0aW9ucy5jb3JyZWN0X2Zvcl9kcmFnX21pbl9kaXN0YW5jZSAmJiBldi5kaXN0YW5jZSA+IDApIHtcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkcmFnIGlzIHRyaWdnZXJlZCwgc2V0IHRoZSBldmVudCBjZW50ZXIgdG8gZHJhZ19taW5fZGlzdGFuY2UgcGl4ZWxzIGZyb20gdGhlIG9yaWdpbmFsIGV2ZW50IGNlbnRlci5cbiAgICAgICAgICAgIC8vIFdpdGhvdXQgdGhpcyBjb3JyZWN0aW9uLCB0aGUgZHJhZ2dlZCBkaXN0YW5jZSB3b3VsZCBqdW1wc3RhcnQgYXQgZHJhZ19taW5fZGlzdGFuY2UgcGl4ZWxzIGluc3RlYWQgb2YgYXQgMC5cbiAgICAgICAgICAgIC8vIEl0IG1pZ2h0IGJlIHVzZWZ1bCB0byBzYXZlIHRoZSBvcmlnaW5hbCBzdGFydCBwb2ludCBzb21ld2hlcmVcbiAgICAgICAgICAgIHZhciBmYWN0b3IgPSBNYXRoLmFicyhpbnN0Lm9wdGlvbnMuZHJhZ19taW5fZGlzdGFuY2UgLyBldi5kaXN0YW5jZSk7XG4gICAgICAgICAgICBzdGFydENlbnRlci5wYWdlWCArPSBldi5kZWx0YVggKiBmYWN0b3I7XG4gICAgICAgICAgICBzdGFydENlbnRlci5wYWdlWSArPSBldi5kZWx0YVkgKiBmYWN0b3I7XG4gICAgICAgICAgICBzdGFydENlbnRlci5jbGllbnRYICs9IGV2LmRlbHRhWCAqIGZhY3RvcjtcbiAgICAgICAgICAgIHN0YXJ0Q2VudGVyLmNsaWVudFkgKz0gZXYuZGVsdGFZICogZmFjdG9yO1xuXG4gICAgICAgICAgICAvLyByZWNhbGN1bGF0ZSBldmVudCBkYXRhIHVzaW5nIG5ldyBzdGFydCBwb2ludFxuICAgICAgICAgICAgZXYgPSBEZXRlY3Rpb24uZXh0ZW5kRXZlbnREYXRhKGV2KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsb2NrIGRyYWcgdG8gYXhpcz9cbiAgICAgICAgaWYoY3VyLmxhc3RFdmVudC5kcmFnX2xvY2tlZF90b19heGlzIHx8XG4gICAgICAgICAgICAoIGluc3Qub3B0aW9ucy5kcmFnX2xvY2tfdG9fYXhpcyAmJlxuICAgICAgICAgICAgICBpbnN0Lm9wdGlvbnMuZHJhZ19sb2NrX21pbl9kaXN0YW5jZSA8PSBldi5kaXN0YW5jZVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgIGV2LmRyYWdfbG9ja2VkX3RvX2F4aXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsYXN0X2RpcmVjdGlvbiA9IGN1ci5sYXN0RXZlbnQuZGlyZWN0aW9uO1xuICAgICAgICBpZihldi5kcmFnX2xvY2tlZF90b19heGlzICYmIGxhc3RfZGlyZWN0aW9uICE9PSBldi5kaXJlY3Rpb24pIHtcbiAgICAgICAgICAvLyBrZWVwIGRpcmVjdGlvbiBvbiB0aGUgYXhpcyB0aGF0IHRoZSBkcmFnIGdlc3R1cmUgc3RhcnRlZCBvblxuICAgICAgICAgIGlmKFV0aWxzLmlzVmVydGljYWwobGFzdF9kaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICBldi5kaXJlY3Rpb24gPSAoZXYuZGVsdGFZIDwgMCkgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBldi5kaXJlY3Rpb24gPSAoZXYuZGVsdGFYIDwgMCkgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaXJzdCB0aW1lLCB0cmlnZ2VyIGRyYWdzdGFydCBldmVudFxuICAgICAgICBpZighdGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgJ3N0YXJ0JywgZXYpO1xuICAgICAgICAgIHRoaXMudHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyaWdnZXIgZXZlbnRzXG4gICAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUsIGV2KTtcbiAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArIGV2LmRpcmVjdGlvbiwgZXYpO1xuXG4gICAgICAgIHZhciBpc192ZXJ0aWNhbCA9IFV0aWxzLmlzVmVydGljYWwoZXYuZGlyZWN0aW9uKTtcblxuICAgICAgICAvLyBibG9jayB0aGUgYnJvd3NlciBldmVudHNcbiAgICAgICAgaWYoKGluc3Qub3B0aW9ucy5kcmFnX2Jsb2NrX3ZlcnRpY2FsICYmIGlzX3ZlcnRpY2FsKSB8fFxuICAgICAgICAgIChpbnN0Lm9wdGlvbnMuZHJhZ19ibG9ja19ob3Jpem9udGFsICYmICFpc192ZXJ0aWNhbCkpIHtcbiAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVWRU5UX0VORDpcbiAgICAgICAgLy8gdHJpZ2dlciBkcmFnZW5kXG4gICAgICAgIGlmKHRoaXMudHJpZ2dlcmVkKSB7XG4gICAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArICdlbmQnLCBldik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSG9sZFxuICogVG91Y2ggc3RheXMgYXQgdGhlIHNhbWUgcGxhY2UgZm9yIHggdGltZVxuICogQGV2ZW50cyAgaG9sZFxuICovXG5IYW1tZXIuZ2VzdHVyZXMuSG9sZCA9IHtcbiAgbmFtZSAgICA6ICdob2xkJyxcbiAgaW5kZXggICA6IDEwLFxuICBkZWZhdWx0czoge1xuICAgIGhvbGRfdGltZW91dCAgOiA1MDAsXG4gICAgaG9sZF90aHJlc2hvbGQ6IDJcbiAgfSxcbiAgdGltZXIgICA6IG51bGwsXG5cbiAgaGFuZGxlciA6IGZ1bmN0aW9uIGhvbGRHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgc3dpdGNoKGV2LmV2ZW50VHlwZSkge1xuICAgICAgY2FzZSBFVkVOVF9TVEFSVDpcbiAgICAgICAgLy8gY2xlYXIgYW55IHJ1bm5pbmcgdGltZXJzXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcblxuICAgICAgICAvLyBzZXQgdGhlIGdlc3R1cmUgc28gd2UgY2FuIGNoZWNrIGluIHRoZSB0aW1lb3V0IGlmIGl0IHN0aWxsIGlzXG4gICAgICAgIERldGVjdGlvbi5jdXJyZW50Lm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICAgICAgLy8gc2V0IHRpbWVyIGFuZCBpZiBhZnRlciB0aGUgdGltZW91dCBpdCBzdGlsbCBpcyBob2xkLFxuICAgICAgICAvLyB3ZSB0cmlnZ2VyIHRoZSBob2xkIGV2ZW50XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmKERldGVjdGlvbi5jdXJyZW50Lm5hbWUgPT0gJ2hvbGQnKSB7XG4gICAgICAgICAgICBpbnN0LnRyaWdnZXIoJ2hvbGQnLCBldik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBpbnN0Lm9wdGlvbnMuaG9sZF90aW1lb3V0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIHdoZW4geW91IG1vdmUgb3IgZW5kIHdlIGNsZWFyIHRoZSB0aW1lclxuICAgICAgY2FzZSBFVkVOVF9NT1ZFOlxuICAgICAgICBpZihldi5kaXN0YW5jZSA+IGluc3Qub3B0aW9ucy5ob2xkX3RocmVzaG9sZCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFVkVOVF9FTkQ6XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJlbGVhc2VcbiAqIENhbGxlZCBhcyBsYXN0LCB0ZWxscyB0aGUgdXNlciBoYXMgcmVsZWFzZWQgdGhlIHNjcmVlblxuICogQGV2ZW50cyAgcmVsZWFzZVxuICovXG5IYW1tZXIuZ2VzdHVyZXMuUmVsZWFzZSA9IHtcbiAgbmFtZSAgIDogJ3JlbGVhc2UnLFxuICBpbmRleCAgOiBJbmZpbml0eSxcbiAgaGFuZGxlcjogZnVuY3Rpb24gcmVsZWFzZUdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfRU5EKSB7XG4gICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lLCBldik7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFN3aXBlXG4gKiB0cmlnZ2VycyBzd2lwZSBldmVudHMgd2hlbiB0aGUgZW5kIHZlbG9jaXR5IGlzIGFib3ZlIHRoZSB0aHJlc2hvbGRcbiAqIGZvciBiZXN0IHVzYWdlLCBzZXQgcHJldmVudF9kZWZhdWx0IChvbiB0aGUgZHJhZyBnZXN0dXJlKSB0byB0cnVlXG4gKiBAZXZlbnRzICBzd2lwZSwgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0LCBzd2lwZXVwLCBzd2lwZWRvd25cbiAqL1xuSGFtbWVyLmdlc3R1cmVzLlN3aXBlID0ge1xuICBuYW1lICAgIDogJ3N3aXBlJyxcbiAgaW5kZXggICA6IDQwLFxuICBkZWZhdWx0czoge1xuICAgIHN3aXBlX21pbl90b3VjaGVzOiAxLFxuICAgIHN3aXBlX21heF90b3VjaGVzOiAxLFxuICAgIHN3aXBlX3ZlbG9jaXR5ICAgOiAwLjdcbiAgfSxcbiAgaGFuZGxlciA6IGZ1bmN0aW9uIHN3aXBlR2VzdHVyZShldiwgaW5zdCkge1xuICAgIGlmKGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgIC8vIG1heCB0b3VjaGVzXG4gICAgICBpZihldi50b3VjaGVzLmxlbmd0aCA8IGluc3Qub3B0aW9ucy5zd2lwZV9taW5fdG91Y2hlcyB8fFxuICAgICAgICBldi50b3VjaGVzLmxlbmd0aCA+IGluc3Qub3B0aW9ucy5zd2lwZV9tYXhfdG91Y2hlcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgLy8gb3Igd2UgY2FuIGJlIGFscmVhZHkgaW4gZHJhZ2dpbmdcbiAgICAgIGlmKGV2LnZlbG9jaXR5WCA+IGluc3Qub3B0aW9ucy5zd2lwZV92ZWxvY2l0eSB8fFxuICAgICAgICBldi52ZWxvY2l0eVkgPiBpbnN0Lm9wdGlvbnMuc3dpcGVfdmVsb2NpdHkpIHtcbiAgICAgICAgLy8gdHJpZ2dlciBzd2lwZSBldmVudHNcbiAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSwgZXYpO1xuICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgZXYuZGlyZWN0aW9uLCBldik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFRhcC9Eb3VibGVUYXBcbiAqIFF1aWNrIHRvdWNoIGF0IGEgcGxhY2Ugb3IgZG91YmxlIGF0IHRoZSBzYW1lIHBsYWNlXG4gKiBAZXZlbnRzICB0YXAsIGRvdWJsZXRhcFxuICovXG5IYW1tZXIuZ2VzdHVyZXMuVGFwID0ge1xuICBuYW1lICAgIDogJ3RhcCcsXG4gIGluZGV4ICAgOiAxMDAsXG4gIGRlZmF1bHRzOiB7XG4gICAgdGFwX21heF90b3VjaHRpbWUgOiAyNTAsXG4gICAgdGFwX21heF9kaXN0YW5jZSAgOiAxMCxcbiAgICB0YXBfYWx3YXlzICAgICAgICA6IHRydWUsXG4gICAgZG91YmxldGFwX2Rpc3RhbmNlOiAyMCxcbiAgICBkb3VibGV0YXBfaW50ZXJ2YWw6IDMwMFxuICB9LFxuXG4gIGhhc19tb3ZlZDogZmFsc2UsXG5cbiAgaGFuZGxlciA6IGZ1bmN0aW9uIHRhcEdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICB2YXIgcHJldiwgc2luY2VfcHJldiwgZGlkX2RvdWJsZXRhcDtcblxuICAgIC8vIHJlc2V0IG1vdmVkIHN0YXRlXG4gICAgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX1NUQVJUKSB7XG4gICAgICB0aGlzLmhhc19tb3ZlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHRoZSBkaXN0YW5jZSB3ZSd2ZSBtb3ZlZC4gSWYgaXQncyBhYm92ZSB0aGUgbWF4IE9OQ0UsIHJlbWVtYmVyIHRoYXQgKGZpeGVzICM0MDYpLlxuICAgIGVsc2UgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX01PVkUgJiYgIXRoaXMubW92ZWQpIHtcbiAgICAgIHRoaXMuaGFzX21vdmVkID0gKGV2LmRpc3RhbmNlID4gaW5zdC5vcHRpb25zLnRhcF9tYXhfZGlzdGFuY2UpO1xuICAgIH1cblxuICAgIGVsc2UgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX0VORCAmJlxuICAgICAgICBldi5zcmNFdmVudC50eXBlICE9ICd0b3VjaGNhbmNlbCcgJiZcbiAgICAgICAgZXYuZGVsdGFUaW1lIDwgaW5zdC5vcHRpb25zLnRhcF9tYXhfdG91Y2h0aW1lICYmICF0aGlzLmhhc19tb3ZlZCkge1xuXG4gICAgICAvLyBwcmV2aW91cyBnZXN0dXJlLCBmb3IgdGhlIGRvdWJsZSB0YXAgc2luY2UgdGhlc2UgYXJlIHR3byBkaWZmZXJlbnQgZ2VzdHVyZSBkZXRlY3Rpb25zXG4gICAgICBwcmV2ID0gRGV0ZWN0aW9uLnByZXZpb3VzO1xuICAgICAgc2luY2VfcHJldiA9IHByZXYgJiYgcHJldi5sYXN0RXZlbnQgJiYgZXYudGltZVN0YW1wIC0gcHJldi5sYXN0RXZlbnQudGltZVN0YW1wO1xuICAgICAgZGlkX2RvdWJsZXRhcCA9IGZhbHNlO1xuXG4gICAgICAvLyBjaGVjayBpZiBkb3VibGUgdGFwXG4gICAgICBpZihwcmV2ICYmIHByZXYubmFtZSA9PSAndGFwJyAmJlxuICAgICAgICAgIChzaW5jZV9wcmV2ICYmIHNpbmNlX3ByZXYgPCBpbnN0Lm9wdGlvbnMuZG91YmxldGFwX2ludGVydmFsKSAmJlxuICAgICAgICAgIGV2LmRpc3RhbmNlIDwgaW5zdC5vcHRpb25zLmRvdWJsZXRhcF9kaXN0YW5jZSkge1xuICAgICAgICBpbnN0LnRyaWdnZXIoJ2RvdWJsZXRhcCcsIGV2KTtcbiAgICAgICAgZGlkX2RvdWJsZXRhcCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRvIGEgc2luZ2xlIHRhcFxuICAgICAgaWYoIWRpZF9kb3VibGV0YXAgfHwgaW5zdC5vcHRpb25zLnRhcF9hbHdheXMpIHtcbiAgICAgICAgRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSA9ICd0YXAnO1xuICAgICAgICBpbnN0LnRyaWdnZXIoRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSwgZXYpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBUb3VjaFxuICogQ2FsbGVkIGFzIGZpcnN0LCB0ZWxscyB0aGUgdXNlciBoYXMgdG91Y2hlZCB0aGUgc2NyZWVuXG4gKiBAZXZlbnRzICB0b3VjaFxuICovXG5IYW1tZXIuZ2VzdHVyZXMuVG91Y2ggPSB7XG4gIG5hbWUgICAgOiAndG91Y2gnLFxuICBpbmRleCAgIDogLUluZmluaXR5LFxuICBkZWZhdWx0czoge1xuICAgIC8vIGNhbGwgcHJldmVudERlZmF1bHQgYXQgdG91Y2hzdGFydCwgYW5kIG1ha2VzIHRoZSBlbGVtZW50IGJsb2NraW5nIGJ5XG4gICAgLy8gZGlzYWJsaW5nIHRoZSBzY3JvbGxpbmcgb2YgdGhlIHBhZ2UsIGJ1dCBpdCBpbXByb3ZlcyBnZXN0dXJlcyBsaWtlXG4gICAgLy8gdHJhbnNmb3JtaW5nIGFuZCBkcmFnZ2luZy5cbiAgICAvLyBiZSBjYXJlZnVsIHdpdGggdXNpbmcgdGhpcywgaXQgY2FuIGJlIHZlcnkgYW5ub3lpbmcgZm9yIHVzZXJzIHRvIGJlIHN0dWNrXG4gICAgLy8gb24gdGhlIHBhZ2VcbiAgICBwcmV2ZW50X2RlZmF1bHQgICAgOiBmYWxzZSxcblxuICAgIC8vIGRpc2FibGUgbW91c2UgZXZlbnRzLCBzbyBvbmx5IHRvdWNoIChvciBwZW4hKSBpbnB1dCB0cmlnZ2VycyBldmVudHNcbiAgICBwcmV2ZW50X21vdXNlZXZlbnRzOiBmYWxzZVxuICB9LFxuICBoYW5kbGVyIDogZnVuY3Rpb24gdG91Y2hHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgaWYoaW5zdC5vcHRpb25zLnByZXZlbnRfbW91c2VldmVudHMgJiZcbiAgICAgICAgZXYucG9pbnRlclR5cGUgPT0gUE9JTlRFUl9NT1VTRSkge1xuICAgICAgZXYuc3RvcERldGVjdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKGluc3Qub3B0aW9ucy5wcmV2ZW50X2RlZmF1bHQpIHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX1NUQVJUKSB7XG4gICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lLCBldik7XG4gICAgfVxuICB9XG59O1xuXG5cbi8qKlxuICogVHJhbnNmb3JtXG4gKiBVc2VyIHdhbnQgdG8gc2NhbGUgb3Igcm90YXRlIHdpdGggMiBmaW5nZXJzXG4gKiBAZXZlbnRzICB0cmFuc2Zvcm0sIHBpbmNoLCBwaW5jaGluLCBwaW5jaG91dCwgcm90YXRlXG4gKi9cbkhhbW1lci5nZXN0dXJlcy5UcmFuc2Zvcm0gPSB7XG4gIG5hbWUgICAgIDogJ3RyYW5zZm9ybScsXG4gIGluZGV4ICAgIDogNDUsXG4gIGRlZmF1bHRzIDoge1xuICAgIC8vIGZhY3Rvciwgbm8gc2NhbGUgaXMgMSwgem9vbWluIGlzIHRvIDAgYW5kIHpvb21vdXQgdW50aWwgaGlnaGVyIHRoZW4gMVxuICAgIHRyYW5zZm9ybV9taW5fc2NhbGUgICAgICA6IDAuMDEsXG4gICAgLy8gcm90YXRpb24gaW4gZGVncmVlc1xuICAgIHRyYW5zZm9ybV9taW5fcm90YXRpb24gICA6IDEsXG4gICAgLy8gcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3Igd2hlbiB0d28gdG91Y2hlcyBhcmUgb24gdGhlIHNjcmVlblxuICAgIC8vIGJ1dCBpdCBtYWtlcyB0aGUgZWxlbWVudCBhIGJsb2NraW5nIGVsZW1lbnRcbiAgICAvLyB3aGVuIHlvdSBhcmUgdXNpbmcgdGhlIHRyYW5zZm9ybSBnZXN0dXJlLCBpdCBpcyBhIGdvb2QgcHJhY3RpY2UgdG8gc2V0IHRoaXMgdHJ1ZVxuICAgIHRyYW5zZm9ybV9hbHdheXNfYmxvY2sgICA6IGZhbHNlLFxuICAgIC8vIGVuc3VyZXMgdGhhdCBhbGwgdG91Y2hlcyBvY2N1cnJlZCB3aXRoaW4gdGhlIGluc3RhbmNlIGVsZW1lbnRcbiAgICB0cmFuc2Zvcm1fd2l0aGluX2luc3RhbmNlOiBmYWxzZVxuICB9LFxuXG4gIHRyaWdnZXJlZDogZmFsc2UsXG5cbiAgaGFuZGxlciAgOiBmdW5jdGlvbiB0cmFuc2Zvcm1HZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgLy8gY3VycmVudCBnZXN0dXJlIGlzbnQgZHJhZywgYnV0IGRyYWdnZWQgaXMgdHJ1ZVxuICAgIC8vIHRoaXMgbWVhbnMgYW4gb3RoZXIgZ2VzdHVyZSBpcyBidXN5LiBub3cgY2FsbCBkcmFnZW5kXG4gICAgaWYoRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSAhPSB0aGlzLm5hbWUgJiYgdGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUgKyAnZW5kJywgZXYpO1xuICAgICAgdGhpcy50cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBhdCBsZWFzdCBtdWx0aXRvdWNoXG4gICAgaWYoZXYudG91Y2hlcy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gcHJldmVudCBkZWZhdWx0IHdoZW4gdHdvIGZpbmdlcnMgYXJlIG9uIHRoZSBzY3JlZW5cbiAgICBpZihpbnN0Lm9wdGlvbnMudHJhbnNmb3JtX2Fsd2F5c19ibG9jaykge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiBhbGwgdG91Y2hlcyBvY2N1cnJlZCB3aXRoaW4gdGhlIGluc3RhbmNlIGVsZW1lbnRcbiAgICBpZihpbnN0Lm9wdGlvbnMudHJhbnNmb3JtX3dpdGhpbl9pbnN0YW5jZSkge1xuICAgICAgZm9yKHZhciBpPS0xOyBldi50b3VjaGVzWysraV07KSB7XG4gICAgICAgIGlmKCFVdGlscy5oYXNQYXJlbnQoZXYudG91Y2hlc1tpXS50YXJnZXQsIGluc3QuZWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2goZXYuZXZlbnRUeXBlKSB7XG4gICAgICBjYXNlIEVWRU5UX1NUQVJUOlxuICAgICAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFVkVOVF9NT1ZFOlxuICAgICAgICB2YXIgc2NhbGVfdGhyZXNob2xkID0gTWF0aC5hYnMoMSAtIGV2LnNjYWxlKTtcbiAgICAgICAgdmFyIHJvdGF0aW9uX3RocmVzaG9sZCA9IE1hdGguYWJzKGV2LnJvdGF0aW9uKTtcblxuICAgICAgICAvLyB3aGVuIHRoZSBkaXN0YW5jZSB3ZSBtb3ZlZCBpcyB0b28gc21hbGwgd2Ugc2tpcCB0aGlzIGdlc3R1cmVcbiAgICAgICAgLy8gb3Igd2UgY2FuIGJlIGFscmVhZHkgaW4gZHJhZ2dpbmdcbiAgICAgICAgaWYoc2NhbGVfdGhyZXNob2xkIDwgaW5zdC5vcHRpb25zLnRyYW5zZm9ybV9taW5fc2NhbGUgJiZcbiAgICAgICAgICByb3RhdGlvbl90aHJlc2hvbGQgPCBpbnN0Lm9wdGlvbnMudHJhbnNmb3JtX21pbl9yb3RhdGlvbikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIGFyZSB0cmFuc2Zvcm1pbmchXG4gICAgICAgIERldGVjdGlvbi5jdXJyZW50Lm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICAgICAgLy8gZmlyc3QgdGltZSwgdHJpZ2dlciBkcmFnc3RhcnQgZXZlbnRcbiAgICAgICAgaWYoIXRoaXMudHJpZ2dlcmVkKSB7XG4gICAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArICdzdGFydCcsIGV2KTtcbiAgICAgICAgICB0aGlzLnRyaWdnZXJlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lLCBldik7IC8vIGJhc2ljIHRyYW5zZm9ybSBldmVudFxuXG4gICAgICAgIC8vIHRyaWdnZXIgcm90YXRlIGV2ZW50XG4gICAgICAgIGlmKHJvdGF0aW9uX3RocmVzaG9sZCA+IGluc3Qub3B0aW9ucy50cmFuc2Zvcm1fbWluX3JvdGF0aW9uKSB7XG4gICAgICAgICAgaW5zdC50cmlnZ2VyKCdyb3RhdGUnLCBldik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0cmlnZ2VyIHBpbmNoIGV2ZW50XG4gICAgICAgIGlmKHNjYWxlX3RocmVzaG9sZCA+IGluc3Qub3B0aW9ucy50cmFuc2Zvcm1fbWluX3NjYWxlKSB7XG4gICAgICAgICAgaW5zdC50cmlnZ2VyKCdwaW5jaCcsIGV2KTtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIoJ3BpbmNoJyArIChldi5zY2FsZTwxID8gJ2luJyA6ICdvdXQnKSwgZXYpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVWRU5UX0VORDpcbiAgICAgICAgLy8gdHJpZ2dlciBkcmFnZW5kXG4gICAgICAgIGlmKHRoaXMudHJpZ2dlcmVkKSB7XG4gICAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArICdlbmQnLCBldik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8vIEFNRCBleHBvcnRcbmlmKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpe1xuICAgIHJldHVybiBIYW1tZXI7XG4gIH0pO1xufVxuLy8gY29tbW9uanMgZXhwb3J0XG5lbHNlIGlmKHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBIYW1tZXI7XG59XG4vLyBicm93c2VyIGV4cG9ydFxuZWxzZSB7XG4gIHdpbmRvdy5IYW1tZXIgPSBIYW1tZXI7XG59XG5cbn0pKHdpbmRvdyk7Il19
