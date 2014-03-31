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
      console.log(top, delta)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9meG1vYmlsZTE2L3N3aXBlL2VudHJ5LmpzIiwiL1VzZXJzL2Z4bW9iaWxlMTYvc3dpcGUvbm9kZV9tb2R1bGVzL2Nsb3NlbmVzcy9pbmRleC5qcyIsIi9Vc2Vycy9meG1vYmlsZTE2L3N3aXBlL25vZGVfbW9kdWxlcy9nZXRpZHMvaW5kZXguanMiLCIvVXNlcnMvZnhtb2JpbGUxNi9zd2lwZS9ub2RlX21vZHVsZXMvaGFtbWVyanMvaGFtbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpXG52YXIgdWkgPSByZXF1aXJlKCdnZXRpZHMnKShkb2N1bWVudC5ib2R5KVxudmFyIGNsb3NlbmVzcyA9IHJlcXVpcmUoJ2Nsb3NlbmVzcycpXG52YXIgcmVsZWFzZWQgPSB0cnVlXG52YXIgdDAgPSBudWxsXG52YXIgaCA9IHdpbmRvdy5pbm5lckhlaWdodFxudmFyIG1heERlbHRhID0gaCAqIC43NlxudmFyIG1pblRvcCA9IDAgLSBtYXhEZWx0YVxudmFyIG1heFRvcCA9IDBcbnZhciB3YXNEcmFnZ2luZyA9IGZhbHNlXG52YXIgZHJhZ2dlZCA9IDA7XG52YXIgY2xvc2VFbm91Z2ggPSBjbG9zZW5lc3MobWF4RGVsdGEsIDUpXG52YXIgY2xvc2VFbm91Z2hEID0gY2xvc2VuZXNzKDAsIDUpXG52YXIgdG9wID0gMDtcblxuaGFtbWVyKHVpLnRvcCkub24oJ3N3aXBldXAnLCBzd2lwZXVwKVxuaGFtbWVyKHVpLnRvcCkub24oJ3N3aXBlZG93bicsc3dpcGVkb3duKVxuaGFtbWVyKHVpLnRvcCkub24oJ3JlbGVhc2UnLCBmdW5jdGlvbigpe1xuICBpZighd2FzRHJhZ2dpbmcpIHJldHVyblxuICB3YXNEcmFnZ2luZyA9IGZhbHNlXG4gIHZhciBlbCA9IHRoaXNcbiAgaWYocGFyc2VGbG9hdChnZXRDU1MoZWwsICd0b3AnKSkgPCBtaW5Ub3AgLyAyKSBlbC5zdHlsZS50b3AgPSBtaW5Ub3AgKyAncHgnICBcbiAgZWxzZSBlbC5zdHlsZS50b3AgPSAnMHB4J1xuICB0b3AgPSBwYXJzZUZsb2F0KGdldENTUyhlbCwgJ3RvcCcpKVxufSlcbmhhbW1lcih1aS50b3ApLm9uKCdkcmFndXAnLCBkcmFndXApXG5oYW1tZXIodWkudG9wKS5vbignZHJhZ2Rvd24nLGRyYWdkb3duKVxuXG5mdW5jdGlvbiBkcmFnZG93bihldnQpe1xuICB3YXNEcmFnZ2luZyA9IHRydWVcbiAgdmFyIGVsID0gdGhpcywgdCA9IDBcbiAgaWYoY2xvc2VFbm91Z2hEKHQgPSBwYXJzZUZsb2F0KGdldENTUyh0aGlzLCAndG9wJykpKSkgcmV0dXJuXG4gIGVsc2V7XG4gICAgdmFyIGRlbHRhID0gZXZ0Lmdlc3R1cmUuZGVsdGFZXG4gICAgaWYoTWF0aC5hYnMoZGVsdGEpID4gbWF4RGVsdGEpIHJldHVyblxuICAgIGVsc2V7XG4gICAgICBjb25zb2xlLmxvZyh0b3AsIGRlbHRhKVxuICAgICAgdGhpcy5zdHlsZS50b3AgPSB0b3AgKyBkZWx0YSArICdweCcgXG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBkcmFndXAoZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSB0cnVlXG4gIHZhciBlbCA9IHRoaXM7XG4gIGlmKGNsb3NlRW5vdWdoKE1hdGguYWJzKHBhcnNlRmxvYXQoZ2V0Q1NTKHRoaXMsICd0b3AnKSkpKSkgcmV0dXJuXG4gIHZhciBkZWx0YSA9IGV2dC5nZXN0dXJlLmRlbHRhWVxuICBpZihNYXRoLmFicyhkZWx0YSkgPiBtYXhEZWx0YSkgcmV0dXJuXG4gIGVsc2V7XG4gICAgdGhpcy5zdHlsZS50b3AgPSBkZWx0YSArICdweCdcbiAgfVxufVxuXG5mdW5jdGlvbiBzd2lwZWRvd24oZXZ0KXtcbiAgd2FzRHJhZ2dpbmcgPSBmYWxzZVxuICB0aGlzLmNsYXNzTGlzdC5hZGQoJ3N3aXBlJylcbiAgdGhpcy5zdHlsZS50b3AgPSAnMCdcbiAgdG9wID0gMFxuICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldnQpe1xuICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnc3dpcGUnKVxuICB9KSBcbn1cblxuZnVuY3Rpb24gc3dpcGV1cChldnQpe1xuICB3YXNEcmFnZ2luZyA9IGZhbHNlXG4gIHRoaXMuY2xhc3NMaXN0LmFkZCgnc3dpcGUnKVxuICB0aGlzLnN0eWxlLnRvcCA9IDAgLSBtYXhEZWx0YSArICdweCcgXG4gIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2dCl7XG4gICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdzd2lwZScpXG4gICAgdG9wID0gcGFyc2VGbG9hdChnZXRDU1ModGhpcywgJ3RvcCcpKVxuICB9KSBcbn1cblxuZnVuY3Rpb24gZ2V0Q1NTKGVsLCBwcm9wKXtcbiAgcmV0dXJuIGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUocHJvcClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obnVtLCBkaXN0KXtcblx0cmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cdFx0cmV0dXJuIChNYXRoLmFicyhudW0gLSB2YWwpIDwgZGlzdClcblx0fVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsKXtcblxuICAgIHZhciBpZHMgPSB7fTtcblxuICAgIGlmKCdzdHJpbmcnID09IHR5cGVvZiBlbCkgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCk7XG5cbiAgICBpZighZWwpIGVsID0gZG9jdW1lbnQ7XG5cbiAgICB2YXIgY2hpbGRyZW4gPSBlbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChjaGlsZHJlbiwgZnVuY3Rpb24oZSl7XG5cblx0aWYoZS5pZC5sZW5ndGggPiAwKXtcblxuXHQgICAgaWRzW2UuaWRdID0gZVxuXG5cdH1cblxuICAgIH0pXG5cbiAgICByZXR1cm4gaWRzXG5cbn1cbiIsIi8qISBIYW1tZXIuSlMgLSB2MS4wLjEwIC0gMjAxNC0wMy0yOFxuICogaHR0cDovL2VpZ2h0bWVkaWEuZ2l0aHViLmlvL2hhbW1lci5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCBKb3JpayBUYW5nZWxkZXIgPGoudGFuZ2VsZGVyQGdtYWlsLmNvbT47XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgKi9cblxuKGZ1bmN0aW9uKHdpbmRvdywgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBIYW1tZXJcbiAqIHVzZSB0aGlzIHRvIGNyZWF0ZSBpbnN0YW5jZXNcbiAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICBlbGVtZW50XG4gKiBAcGFyYW0gICB7T2JqZWN0fSAgICAgICAgb3B0aW9uc1xuICogQHJldHVybnMge0hhbW1lci5JbnN0YW5jZX1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgSGFtbWVyID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IEhhbW1lci5JbnN0YW5jZShlbGVtZW50LCBvcHRpb25zIHx8IHt9KTtcbn07XG5cbkhhbW1lci5WRVJTSU9OID0gJzEuMC4xMCc7XG5cbi8vIGRlZmF1bHQgc2V0dGluZ3NcbkhhbW1lci5kZWZhdWx0cyA9IHtcbiAgLy8gYWRkIHN0eWxlcyBhbmQgYXR0cmlidXRlcyB0byB0aGUgZWxlbWVudCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gZG9pbmdcbiAgLy8gaXRzIG5hdGl2ZSBiZWhhdmlvci4gdGhpcyBkb2VzbnQgcHJldmVudCB0aGUgc2Nyb2xsaW5nLCBidXQgY2FuY2Vsc1xuICAvLyB0aGUgY29udGV4dG1lbnUsIHRhcCBoaWdobGlnaHRpbmcgZXRjXG4gIC8vIHNldCB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXNcbiAgc3RvcF9icm93c2VyX2JlaGF2aW9yOiB7XG4gICAgLy8gdGhpcyBhbHNvIHRyaWdnZXJzIG9uc2VsZWN0c3RhcnQ9ZmFsc2UgZm9yIElFXG4gICAgdXNlclNlbGVjdCAgICAgICA6ICdub25lJyxcbiAgICAvLyB0aGlzIG1ha2VzIHRoZSBlbGVtZW50IGJsb2NraW5nIGluIElFMTA+LCB5b3UgY291bGQgZXhwZXJpbWVudCB3aXRoIHRoZSB2YWx1ZVxuICAgIC8vIHNlZSBmb3IgbW9yZSBvcHRpb25zIHRoaXMgaXNzdWU7IGh0dHBzOi8vZ2l0aHViLmNvbS9FaWdodE1lZGlhL2hhbW1lci5qcy9pc3N1ZXMvMjQxXG4gICAgdG91Y2hBY3Rpb24gICAgICA6ICdub25lJyxcbiAgICB0b3VjaENhbGxvdXQgICAgIDogJ25vbmUnLFxuICAgIGNvbnRlbnRab29taW5nICAgOiAnbm9uZScsXG4gICAgdXNlckRyYWcgICAgICAgICA6ICdub25lJyxcbiAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXG4gIH1cblxuICAvL1xuICAvLyBtb3JlIHNldHRpbmdzIGFyZSBkZWZpbmVkIHBlciBnZXN0dXJlIGF0IC9nZXN0dXJlc1xuICAvL1xufTtcblxuXG4vLyBkZXRlY3QgdG91Y2hldmVudHNcbkhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUyA9IHdpbmRvdy5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgfHwgd2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xuSGFtbWVyLkhBU19UT1VDSEVWRU5UUyA9ICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpO1xuXG4vLyBkb250IHVzZSBtb3VzZWV2ZW50cyBvbiBtb2JpbGUgZGV2aWNlc1xuSGFtbWVyLk1PQklMRV9SRUdFWCA9IC9tb2JpbGV8dGFibGV0fGlwKGFkfGhvbmV8b2QpfGFuZHJvaWR8c2lsay9pO1xuSGFtbWVyLk5PX01PVVNFRVZFTlRTID0gSGFtbWVyLkhBU19UT1VDSEVWRU5UUyAmJiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaChIYW1tZXIuTU9CSUxFX1JFR0VYKTtcblxuLy8gZXZlbnR0eXBlcyBwZXIgdG91Y2hldmVudCAoc3RhcnQsIG1vdmUsIGVuZClcbi8vIGFyZSBmaWxsZWQgYnkgRXZlbnQuZGV0ZXJtaW5lRXZlbnRUeXBlcyBvbiBzZXR1cFxuSGFtbWVyLkVWRU5UX1RZUEVTID0ge307XG5cbi8vIGludGVydmFsIGluIHdoaWNoIEhhbW1lciByZWNhbGN1bGF0ZXMgY3VycmVudCB2ZWxvY2l0eSBpbiBtc1xuSGFtbWVyLlVQREFURV9WRUxPQ0lUWV9JTlRFUlZBTCA9IDE2O1xuXG4vLyBoYW1tZXIgZG9jdW1lbnQgd2hlcmUgdGhlIGJhc2UgZXZlbnRzIGFyZSBhZGRlZCBhdFxuSGFtbWVyLkRPQ1VNRU5UID0gd2luZG93LmRvY3VtZW50O1xuXG4vLyBkZWZpbmUgdGhlc2UgYWxzbyBhcyB2YXJzLCBmb3IgYmV0dGVyIG1pbmlmaWNhdGlvblxuLy8gZGlyZWN0aW9uIGRlZmluZXNcbnZhciBESVJFQ1RJT05fRE9XTiA9IEhhbW1lci5ESVJFQ1RJT05fRE9XTiA9ICdkb3duJztcbnZhciBESVJFQ1RJT05fTEVGVCA9IEhhbW1lci5ESVJFQ1RJT05fTEVGVCA9ICdsZWZ0JztcbnZhciBESVJFQ1RJT05fVVAgPSBIYW1tZXIuRElSRUNUSU9OX1VQID0gJ3VwJztcbnZhciBESVJFQ1RJT05fUklHSFQgPSBIYW1tZXIuRElSRUNUSU9OX1JJR0hUID0gJ3JpZ2h0JztcblxuLy8gcG9pbnRlciB0eXBlXG52YXIgUE9JTlRFUl9NT1VTRSA9IEhhbW1lci5QT0lOVEVSX01PVVNFID0gJ21vdXNlJztcbnZhciBQT0lOVEVSX1RPVUNIID0gSGFtbWVyLlBPSU5URVJfVE9VQ0ggPSAndG91Y2gnO1xudmFyIFBPSU5URVJfUEVOID0gSGFtbWVyLlBPSU5URVJfUEVOID0gJ3Blbic7XG5cbi8vIHRvdWNoIGV2ZW50IGRlZmluZXNcbnZhciBFVkVOVF9TVEFSVCA9IEhhbW1lci5FVkVOVF9TVEFSVCA9ICdzdGFydCc7XG52YXIgRVZFTlRfTU9WRSA9IEhhbW1lci5FVkVOVF9NT1ZFID0gJ21vdmUnO1xudmFyIEVWRU5UX0VORCA9IEhhbW1lci5FVkVOVF9FTkQgPSAnZW5kJztcblxuXG4vLyBwbHVnaW5zIGFuZCBnZXN0dXJlcyBuYW1lc3BhY2VzXG5IYW1tZXIucGx1Z2lucyA9IEhhbW1lci5wbHVnaW5zIHx8IHt9O1xuSGFtbWVyLmdlc3R1cmVzID0gSGFtbWVyLmdlc3R1cmVzIHx8IHt9O1xuXG5cbi8vIGlmIHRoZSB3aW5kb3cgZXZlbnRzIGFyZSBzZXQuLi5cbkhhbW1lci5SRUFEWSA9IGZhbHNlO1xuXG5cbi8qKlxuICogc2V0dXAgZXZlbnRzIHRvIGRldGVjdCBnZXN0dXJlcyBvbiB0aGUgZG9jdW1lbnRcbiAqL1xuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGlmKEhhbW1lci5SRUFEWSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZpbmQgd2hhdCBldmVudHR5cGVzIHdlIGFkZCBsaXN0ZW5lcnMgdG9cbiAgRXZlbnQuZGV0ZXJtaW5lRXZlbnRUeXBlcygpO1xuXG4gIC8vIFJlZ2lzdGVyIGFsbCBnZXN0dXJlcyBpbnNpZGUgSGFtbWVyLmdlc3R1cmVzXG4gIFV0aWxzLmVhY2goSGFtbWVyLmdlc3R1cmVzLCBmdW5jdGlvbihnZXN0dXJlKXtcbiAgICBEZXRlY3Rpb24ucmVnaXN0ZXIoZ2VzdHVyZSk7XG4gIH0pO1xuXG4gIC8vIEFkZCB0b3VjaCBldmVudHMgb24gdGhlIGRvY3VtZW50XG4gIEV2ZW50Lm9uVG91Y2goSGFtbWVyLkRPQ1VNRU5ULCBFVkVOVF9NT1ZFLCBEZXRlY3Rpb24uZGV0ZWN0KTtcbiAgRXZlbnQub25Ub3VjaChIYW1tZXIuRE9DVU1FTlQsIEVWRU5UX0VORCwgRGV0ZWN0aW9uLmRldGVjdCk7XG5cbiAgLy8gSGFtbWVyIGlzIHJlYWR5Li4uIVxuICBIYW1tZXIuUkVBRFkgPSB0cnVlO1xufVxuXG52YXIgVXRpbHMgPSBIYW1tZXIudXRpbHMgPSB7XG4gIC8qKlxuICAgKiBleHRlbmQgbWV0aG9kLFxuICAgKiBhbHNvIHVzZWQgZm9yIGNsb25pbmcgd2hlbiBkZXN0IGlzIGFuIGVtcHR5IG9iamVjdFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICBkZXN0XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIHNyY1xuICAgKiBAcGFybSAge0Jvb2xlYW59ICBtZXJnZSAgICBkbyBhIG1lcmdlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9ICAgIGRlc3RcbiAgICovXG4gIGV4dGVuZDogZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYywgbWVyZ2UpIHtcbiAgICBmb3IodmFyIGtleSBpbiBzcmMpIHtcbiAgICAgIGlmKGRlc3Rba2V5XSAhPT0gdW5kZWZpbmVkICYmIG1lcmdlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZGVzdFtrZXldID0gc3JjW2tleV07XG4gICAgfVxuICAgIHJldHVybiBkZXN0O1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGZvciBlYWNoXG4gICAqIEBwYXJhbSBvYmpcbiAgICogQHBhcmFtIGl0ZXJhdG9yXG4gICAqL1xuICBlYWNoOiBmdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgaSwgbztcbiAgICAvLyBuYXRpdmUgZm9yRWFjaCBvbiBhcnJheXNcbiAgICBpZiAoJ2ZvckVhY2gnIGluIG9iaikge1xuICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgICAvLyBhcnJheXNcbiAgICBlbHNlIGlmKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yKGk9LTE7IChvPW9ialsrK2ldKTspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbywgaSwgb2JqKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb2JqZWN0c1xuICAgIGVsc2Uge1xuICAgICAgZm9yKGkgaW4gb2JqKSB7XG4gICAgICAgIGlmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSAmJlxuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIGZpbmQgaWYgYSBzdHJpbmcgY29udGFpbnMgdGhlIG5lZWRsZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgc3JjXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBuZWVkbGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IGZvdW5kXG4gICAqL1xuICBpblN0cjogZnVuY3Rpb24gaW5TdHIoc3JjLCBuZWVkbGUpIHtcbiAgICByZXR1cm4gc3JjLmluZGV4T2YobmVlZGxlKSA+IC0xO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGZpbmQgaWYgYSBub2RlIGlzIGluIHRoZSBnaXZlbiBwYXJlbnRcbiAgICogdXNlZCBmb3IgZXZlbnQgZGVsZWdhdGlvbiB0cmlja3NcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIG5vZGVcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIHBhcmVudFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gICAgICAgaGFzX3BhcmVudFxuICAgKi9cbiAgaGFzUGFyZW50OiBmdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XG4gICAgd2hpbGUobm9kZSkge1xuICAgICAgaWYobm9kZSA9PSBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cblxuICAvKipcbiAgICogZ2V0IHRoZSBjZW50ZXIgb2YgYWxsIHRoZSB0b3VjaGVzXG4gICAqIEBwYXJhbSAgIHtBcnJheX0gICAgIHRvdWNoZXNcbiAgICogQHJldHVybnMge09iamVjdH0gICAgY2VudGVyIHBhZ2VYWSBjbGllbnRYWVxuICAgKi9cbiAgZ2V0Q2VudGVyOiBmdW5jdGlvbiBnZXRDZW50ZXIodG91Y2hlcykge1xuICAgIHZhciBwYWdlWCA9IFtdXG4gICAgICAsIHBhZ2VZID0gW11cbiAgICAgICwgY2xpZW50WCA9IFtdXG4gICAgICAsIGNsaWVudFkgPSBbXVxuICAgICAgLCBtaW4gPSBNYXRoLm1pblxuICAgICAgLCBtYXggPSBNYXRoLm1heDtcblxuICAgIC8vIG5vIG5lZWQgdG8gbG9vcCB3aGVuIG9ubHkgb25lIHRvdWNoXG4gICAgaWYodG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBhZ2VYOiB0b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICBwYWdlWTogdG91Y2hlc1swXS5wYWdlWSxcbiAgICAgICAgY2xpZW50WDogdG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICBjbGllbnRZOiB0b3VjaGVzWzBdLmNsaWVudFlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgVXRpbHMuZWFjaCh0b3VjaGVzLCBmdW5jdGlvbih0b3VjaCkge1xuICAgICAgcGFnZVgucHVzaCh0b3VjaC5wYWdlWCk7XG4gICAgICBwYWdlWS5wdXNoKHRvdWNoLnBhZ2VZKTtcbiAgICAgIGNsaWVudFgucHVzaCh0b3VjaC5jbGllbnRYKTtcbiAgICAgIGNsaWVudFkucHVzaCh0b3VjaC5jbGllbnRZKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBwYWdlWDogKG1pbi5hcHBseShNYXRoLCBwYWdlWCkgKyBtYXguYXBwbHkoTWF0aCwgcGFnZVgpKSAvIDIsXG4gICAgICBwYWdlWTogKG1pbi5hcHBseShNYXRoLCBwYWdlWSkgKyBtYXguYXBwbHkoTWF0aCwgcGFnZVkpKSAvIDIsXG4gICAgICBjbGllbnRYOiAobWluLmFwcGx5KE1hdGgsIGNsaWVudFgpICsgbWF4LmFwcGx5KE1hdGgsIGNsaWVudFgpKSAvIDIsXG4gICAgICBjbGllbnRZOiAobWluLmFwcGx5KE1hdGgsIGNsaWVudFkpICsgbWF4LmFwcGx5KE1hdGgsIGNsaWVudFkpKSAvIDJcbiAgICB9O1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGNhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgYmV0d2VlbiB0d28gcG9pbnRzXG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICAgIGRlbHRhX3RpbWVcbiAgICogQHBhcmFtICAge051bWJlcn0gICAgZGVsdGFfeFxuICAgKiBAcGFyYW0gICB7TnVtYmVyfSAgICBkZWx0YV95XG4gICAqIEByZXR1cm5zIHtPYmplY3R9ICAgIHZlbG9jaXR5XG4gICAqL1xuICBnZXRWZWxvY2l0eTogZnVuY3Rpb24gZ2V0VmVsb2NpdHkoZGVsdGFfdGltZSwgZGVsdGFfeCwgZGVsdGFfeSkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiBNYXRoLmFicyhkZWx0YV94IC8gZGVsdGFfdGltZSkgfHwgMCxcbiAgICAgIHk6IE1hdGguYWJzKGRlbHRhX3kgLyBkZWx0YV90aW1lKSB8fCAwXG4gICAgfTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIGNvb3JkaW5hdGVzXG4gICAqIEBwYXJhbSAgIHtUb3VjaH0gICAgIHRvdWNoMVxuICAgKiBAcGFyYW0gICB7VG91Y2h9ICAgICB0b3VjaDJcbiAgICogQHJldHVybnMge051bWJlcn0gICAgYW5nbGVcbiAgICovXG4gIGdldEFuZ2xlOiBmdW5jdGlvbiBnZXRBbmdsZSh0b3VjaDEsIHRvdWNoMikge1xuICAgIHZhciB4ID0gdG91Y2gyLmNsaWVudFggLSB0b3VjaDEuY2xpZW50WFxuICAgICAgLCB5ID0gdG91Y2gyLmNsaWVudFkgLSB0b3VjaDEuY2xpZW50WTtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih5LCB4KSAqIDE4MCAvIE1hdGguUEk7XG4gIH0sXG5cblxuICAvKipcbiAgICogYW5nbGUgdG8gZGlyZWN0aW9uIGRlZmluZVxuICAgKiBAcGFyYW0gICB7VG91Y2h9ICAgICB0b3VjaDFcbiAgICogQHBhcmFtICAge1RvdWNofSAgICAgdG91Y2gyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9ICAgIGRpcmVjdGlvbiBjb25zdGFudCwgbGlrZSBESVJFQ1RJT05fTEVGVFxuICAgKi9cbiAgZ2V0RGlyZWN0aW9uOiBmdW5jdGlvbiBnZXREaXJlY3Rpb24odG91Y2gxLCB0b3VjaDIpIHtcbiAgICB2YXIgeCA9IE1hdGguYWJzKHRvdWNoMS5jbGllbnRYIC0gdG91Y2gyLmNsaWVudFgpXG4gICAgICAsIHkgPSBNYXRoLmFicyh0b3VjaDEuY2xpZW50WSAtIHRvdWNoMi5jbGllbnRZKTtcbiAgICBpZih4ID49IHkpIHtcbiAgICAgIHJldHVybiB0b3VjaDEuY2xpZW50WCAtIHRvdWNoMi5jbGllbnRYID4gMCA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgIH1cbiAgICByZXR1cm4gdG91Y2gxLmNsaWVudFkgLSB0b3VjaDIuY2xpZW50WSA+IDAgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHRvdWNoZXNcbiAgICogQHBhcmFtICAge1RvdWNofSAgICAgdG91Y2gxXG4gICAqIEBwYXJhbSAgIHtUb3VjaH0gICAgIHRvdWNoMlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfSAgICBkaXN0YW5jZVxuICAgKi9cbiAgZ2V0RGlzdGFuY2U6IGZ1bmN0aW9uIGdldERpc3RhbmNlKHRvdWNoMSwgdG91Y2gyKSB7XG4gICAgdmFyIHggPSB0b3VjaDIuY2xpZW50WCAtIHRvdWNoMS5jbGllbnRYXG4gICAgICAsIHkgPSB0b3VjaDIuY2xpZW50WSAtIHRvdWNoMS5jbGllbnRZO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGNhbGN1bGF0ZSB0aGUgc2NhbGUgZmFjdG9yIGJldHdlZW4gdHdvIHRvdWNoTGlzdHMgKGZpbmdlcnMpXG4gICAqIG5vIHNjYWxlIGlzIDEsIGFuZCBnb2VzIGRvd24gdG8gMCB3aGVuIHBpbmNoZWQgdG9nZXRoZXIsIGFuZCBiaWdnZXIgd2hlbiBwaW5jaGVkIG91dFxuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICBzdGFydFxuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICBlbmRcbiAgICogQHJldHVybnMge051bWJlcn0gICAgc2NhbGVcbiAgICovXG4gIGdldFNjYWxlOiBmdW5jdGlvbiBnZXRTY2FsZShzdGFydCwgZW5kKSB7XG4gICAgLy8gbmVlZCB0d28gZmluZ2Vycy4uLlxuICAgIGlmKHN0YXJ0Lmxlbmd0aCA+PSAyICYmIGVuZC5sZW5ndGggPj0gMikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0pIC8gdGhpcy5nZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gMTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdGhlIHJvdGF0aW9uIGRlZ3JlZXMgYmV0d2VlbiB0d28gdG91Y2hMaXN0cyAoZmluZ2VycylcbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgc3RhcnRcbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgZW5kXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9ICAgIHJvdGF0aW9uXG4gICAqL1xuICBnZXRSb3RhdGlvbjogZnVuY3Rpb24gZ2V0Um90YXRpb24oc3RhcnQsIGVuZCkge1xuICAgIC8vIG5lZWQgdHdvIGZpbmdlcnNcbiAgICBpZihzdGFydC5sZW5ndGggPj0gMiAmJiBlbmQubGVuZ3RoID49IDIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEFuZ2xlKGVuZFsxXSwgZW5kWzBdKSAtIHRoaXMuZ2V0QW5nbGUoc3RhcnRbMV0sIHN0YXJ0WzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH0sXG5cblxuICAvKipcbiAgICogYm9vbGVhbiBpZiB0aGUgZGlyZWN0aW9uIGlzIHZlcnRpY2FsXG4gICAqIEBwYXJhbSAgICB7U3RyaW5nfSAgICBkaXJlY3Rpb25cbiAgICogQHJldHVybnMgIHtCb29sZWFufSAgIGlzX3ZlcnRpY2FsXG4gICAqL1xuICBpc1ZlcnRpY2FsOiBmdW5jdGlvbiBpc1ZlcnRpY2FsKGRpcmVjdGlvbikge1xuICAgIHJldHVybiBkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1VQIHx8IGRpcmVjdGlvbiA9PSBESVJFQ1RJT05fRE9XTjtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiB0b2dnbGUgYnJvd3NlciBkZWZhdWx0IGJlaGF2aW9yIHdpdGggY3NzIHByb3BzXG4gICAqIEBwYXJhbSAgIHtIdG1sRWxlbWVudH0gICBlbGVtZW50XG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgICAgICBjc3NfcHJvcHNcbiAgICogQHBhcmFtICAge0Jvb2xlYW59ICAgICAgIHRvZ2dsZVxuICAgKi9cbiAgdG9nZ2xlRGVmYXVsdEJlaGF2aW9yOiBmdW5jdGlvbiB0b2dnbGVEZWZhdWx0QmVoYXZpb3IoZWxlbWVudCwgY3NzX3Byb3BzLCB0b2dnbGUpIHtcbiAgICBpZighY3NzX3Byb3BzIHx8ICFlbGVtZW50IHx8ICFlbGVtZW50LnN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gd2l0aCBjc3MgcHJvcGVydGllcyBmb3IgbW9kZXJuIGJyb3dzZXJzXG4gICAgVXRpbHMuZWFjaChbJ3dlYmtpdCcsICdtb3onLCAnTW96JywgJ21zJywgJ28nLCAnJ10sIGZ1bmN0aW9uIHNldFN0eWxlKHZlbmRvcikge1xuICAgICAgVXRpbHMuZWFjaChjc3NfcHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBwcm9wKSB7XG4gICAgICAgICAgLy8gdmVuZGVyIHByZWZpeCBhdCB0aGUgcHJvcGVydHlcbiAgICAgICAgICBpZih2ZW5kb3IpIHtcbiAgICAgICAgICAgIHByb3AgPSB2ZW5kb3IgKyBwcm9wLnN1YnN0cmluZygwLCAxKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHNldCB0aGUgc3R5bGVcbiAgICAgICAgICBpZihwcm9wIGluIGVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbcHJvcF0gPSAhdG9nZ2xlICYmIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIGZhbHNlX2ZuID0gZnVuY3Rpb24oKXsgcmV0dXJuIGZhbHNlOyB9O1xuXG4gICAgLy8gYWxzbyB0aGUgZGlzYWJsZSBvbnNlbGVjdHN0YXJ0XG4gICAgaWYoY3NzX3Byb3BzLnVzZXJTZWxlY3QgPT0gJ25vbmUnKSB7XG4gICAgICBlbGVtZW50Lm9uc2VsZWN0c3RhcnQgPSAhdG9nZ2xlICYmIGZhbHNlX2ZuO1xuICAgIH1cbiAgICAvLyBhbmQgZGlzYWJsZSBvbmRyYWdzdGFydFxuICAgIGlmKGNzc19wcm9wcy51c2VyRHJhZyA9PSAnbm9uZScpIHtcbiAgICAgIGVsZW1lbnQub25kcmFnc3RhcnQgPSAhdG9nZ2xlICYmIGZhbHNlX2ZuO1xuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIGNyZWF0ZSBuZXcgaGFtbWVyIGluc3RhbmNlXG4gKiBhbGwgbWV0aG9kcyBzaG91bGQgcmV0dXJuIHRoZSBpbnN0YW5jZSBpdHNlbGYsIHNvIGl0IGlzIGNoYWluYWJsZS5cbiAqIEBwYXJhbSAgIHtIVE1MRWxlbWVudH0gICAgICAgZWxlbWVudFxuICogQHBhcmFtICAge09iamVjdH0gICAgICAgICAgICBbb3B0aW9ucz17fV1cbiAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuSGFtbWVyLkluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gc2V0dXAgSGFtbWVySlMgd2luZG93IGV2ZW50cyBhbmQgcmVnaXN0ZXIgYWxsIGdlc3R1cmVzXG4gIC8vIHRoaXMgYWxzbyBzZXRzIHVwIHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAgc2V0dXAoKTtcblxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gIC8vIHN0YXJ0L3N0b3AgZGV0ZWN0aW9uIG9wdGlvblxuICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gIC8vIG1lcmdlIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0gVXRpbHMuZXh0ZW5kKFxuICAgIFV0aWxzLmV4dGVuZCh7fSwgSGFtbWVyLmRlZmF1bHRzKSxcbiAgICBvcHRpb25zIHx8IHt9KTtcblxuICAvLyBhZGQgc29tZSBjc3MgdG8gdGhlIGVsZW1lbnQgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIGRvaW5nIGl0cyBuYXRpdmUgYmVoYXZvaXJcbiAgaWYodGhpcy5vcHRpb25zLnN0b3BfYnJvd3Nlcl9iZWhhdmlvcikge1xuICAgIFV0aWxzLnRvZ2dsZURlZmF1bHRCZWhhdmlvcih0aGlzLmVsZW1lbnQsIHRoaXMub3B0aW9ucy5zdG9wX2Jyb3dzZXJfYmVoYXZpb3IsIGZhbHNlKTtcbiAgfVxuXG4gIC8vIHN0YXJ0IGRldGVjdGlvbiBvbiB0b3VjaHN0YXJ0XG4gIHRoaXMuZXZlbnRTdGFydEhhbmRsZXIgPSBFdmVudC5vblRvdWNoKGVsZW1lbnQsIEVWRU5UX1NUQVJULCBmdW5jdGlvbihldikge1xuICAgIGlmKHNlbGYuZW5hYmxlZCkge1xuICAgICAgRGV0ZWN0aW9uLnN0YXJ0RGV0ZWN0KHNlbGYsIGV2KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGtlZXAgYSBsaXN0IG9mIHVzZXIgZXZlbnQgaGFuZGxlcnMgd2hpY2ggbmVlZHMgdG8gYmUgcmVtb3ZlZCB3aGVuIGNhbGxpbmcgJ2Rpc3Bvc2UnXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdO1xuXG4gIC8vIHJldHVybiBpbnN0YW5jZVxuICByZXR1cm4gdGhpcztcbn07XG5cblxuSGFtbWVyLkluc3RhbmNlLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqIGJpbmQgZXZlbnRzIHRvIHRoZSBpbnN0YW5jZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgIGdlc3R1cmVcbiAgICogQHBhcmFtICAge0Z1bmN0aW9ufSAgICBoYW5kbGVyXG4gICAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gICAqL1xuICBvbjogZnVuY3Rpb24gb25FdmVudChnZXN0dXJlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGdlc3R1cmVzID0gZ2VzdHVyZS5zcGxpdCgnICcpO1xuICAgIFV0aWxzLmVhY2goZ2VzdHVyZXMsIGZ1bmN0aW9uKGdlc3R1cmUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGdlc3R1cmUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wdXNoKHsgZ2VzdHVyZTogZ2VzdHVyZSwgaGFuZGxlcjogaGFuZGxlciB9KTtcbiAgICB9LCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuXG4gIC8qKlxuICAgKiB1bmJpbmQgZXZlbnRzIHRvIHRoZSBpbnN0YW5jZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgIGdlc3R1cmVcbiAgICogQHBhcmFtICAge0Z1bmN0aW9ufSAgICBoYW5kbGVyXG4gICAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gICAqL1xuICBvZmY6IGZ1bmN0aW9uIG9mZkV2ZW50KGdlc3R1cmUsIGhhbmRsZXIpIHtcbiAgICB2YXIgZ2VzdHVyZXMgPSBnZXN0dXJlLnNwbGl0KCcgJylcbiAgICAgICwgaSwgZWg7XG4gICAgVXRpbHMuZWFjaChnZXN0dXJlcywgZnVuY3Rpb24oZ2VzdHVyZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZ2VzdHVyZSwgaGFuZGxlciwgZmFsc2UpO1xuXG4gICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGhhbmRsZXIgZnJvbSB0aGUgaW50ZXJuYWwgbGlzdFxuICAgICAgZm9yKGk9LTE7IChlaD10aGlzLmV2ZW50SGFuZGxlcnNbKytpXSk7KSB7XG4gICAgICAgIGlmKGVoLmdlc3R1cmUgPT09IGdlc3R1cmUgJiYgZWguaGFuZGxlciA9PT0gaGFuZGxlcikge1xuICAgICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuXG4gIC8qKlxuICAgKiB0cmlnZ2VyIGdlc3R1cmUgZXZlbnRcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICBnZXN0dXJlXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgICAgW2V2ZW50RGF0YV1cbiAgICogQHJldHVybnMge0hhbW1lci5JbnN0YW5jZX1cbiAgICovXG4gIHRyaWdnZXI6IGZ1bmN0aW9uIHRyaWdnZXJFdmVudChnZXN0dXJlLCBldmVudERhdGEpIHtcbiAgICAvLyBvcHRpb25hbFxuICAgIGlmKCFldmVudERhdGEpIHtcbiAgICAgIGV2ZW50RGF0YSA9IHt9O1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBET00gZXZlbnRcbiAgICB2YXIgZXZlbnQgPSBIYW1tZXIuRE9DVU1FTlQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZXZlbnQuaW5pdEV2ZW50KGdlc3R1cmUsIHRydWUsIHRydWUpO1xuICAgIGV2ZW50Lmdlc3R1cmUgPSBldmVudERhdGE7XG5cbiAgICAvLyB0cmlnZ2VyIG9uIHRoZSB0YXJnZXQgaWYgaXQgaXMgaW4gdGhlIGluc3RhbmNlIGVsZW1lbnQsXG4gICAgLy8gdGhpcyBpcyBmb3IgZXZlbnQgZGVsZWdhdGlvbiB0cmlja3NcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudDtcbiAgICBpZihVdGlscy5oYXNQYXJlbnQoZXZlbnREYXRhLnRhcmdldCwgZWxlbWVudCkpIHtcbiAgICAgIGVsZW1lbnQgPSBldmVudERhdGEudGFyZ2V0O1xuICAgIH1cblxuICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cblxuICAvKipcbiAgICogZW5hYmxlIG9mIGRpc2FibGUgaGFtbWVyLmpzIGRldGVjdGlvblxuICAgKiBAcGFyYW0gICB7Qm9vbGVhbn0gICBzdGF0ZVxuICAgKiBAcmV0dXJucyB7SGFtbWVyLkluc3RhbmNlfVxuICAgKi9cbiAgZW5hYmxlOiBmdW5jdGlvbiBlbmFibGUoc3RhdGUpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBzdGF0ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBkaXNwb3NlIHRoaXMgaGFtbWVyIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtIYW1tZXIuSW5zdGFuY2V9XG4gICAqL1xuICBkaXNwb3NlOiBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgIHZhciBpLCBlaDtcblxuICAgIC8vIHVuZG8gYWxsIGNoYW5nZXMgbWFkZSBieSBzdG9wX2Jyb3dzZXJfYmVoYXZpb3JcbiAgICBpZih0aGlzLm9wdGlvbnMuc3RvcF9icm93c2VyX2JlaGF2aW9yKSB7XG4gICAgICBVdGlscy50b2dnbGVEZWZhdWx0QmVoYXZpb3IodGhpcy5lbGVtZW50LCB0aGlzLm9wdGlvbnMuc3RvcF9icm93c2VyX2JlaGF2aW9yLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyB1bmJpbmQgYWxsIGN1c3RvbSBldmVudCBoYW5kbGVyc1xuICAgIGZvcihpPS0xOyAoZWg9dGhpcy5ldmVudEhhbmRsZXJzWysraV0pOykge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZWguZ2VzdHVyZSwgZWguaGFuZGxlciwgZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMgPSBbXTtcblxuICAgIC8vIHVuYmluZCB0aGUgc3RhcnQgZXZlbnQgbGlzdGVuZXJcbiAgICBFdmVudC51bmJpbmREb20odGhpcy5lbGVtZW50LCBIYW1tZXIuRVZFTlRfVFlQRVNbRVZFTlRfU1RBUlRdLCB0aGlzLmV2ZW50U3RhcnRIYW5kbGVyKTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5cbi8qKlxuICogdGhpcyBob2xkcyB0aGUgbGFzdCBtb3ZlIGV2ZW50LFxuICogdXNlZCB0byBmaXggZW1wdHkgdG91Y2hlbmQgaXNzdWVcbiAqIHNlZSB0aGUgb25Ub3VjaCBldmVudCBmb3IgYW4gZXhwbGFuYXRpb25cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBsYXN0X21vdmVfZXZlbnQgPSBudWxsO1xuXG4vKipcbiAqIHdoZW4gdGhlIG1vdXNlIGlzIGhvbGQgZG93biwgdGhpcyBpcyB0cnVlXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xudmFyIHNob3VsZF9kZXRlY3QgPSBmYWxzZTtcblxuLyoqXG4gKiB3aGVuIHRvdWNoIGV2ZW50cyBoYXZlIGJlZW4gZmlyZWQsIHRoaXMgaXMgdHJ1ZVxuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cbnZhciB0b3VjaF90cmlnZ2VyZWQgPSBmYWxzZTtcblxuXG52YXIgRXZlbnQgPSBIYW1tZXIuZXZlbnQgPSB7XG4gIC8qKlxuICAgKiBzaW1wbGUgYWRkRXZlbnRMaXN0ZW5lclxuICAgKiBAcGFyYW0gICB7SFRNTEVsZW1lbnR9ICAgZWxlbWVudFxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgICAgdHlwZVxuICAgKiBAcGFyYW0gICB7RnVuY3Rpb259ICAgICAgaGFuZGxlclxuICAgKi9cbiAgYmluZERvbTogZnVuY3Rpb24oZWxlbWVudCwgdHlwZSwgaGFuZGxlcikge1xuICAgIHZhciB0eXBlcyA9IHR5cGUuc3BsaXQoJyAnKTtcbiAgICBVdGlscy5lYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cblxuICAvKipcbiAgICogc2ltcGxlIHJlbW92ZUV2ZW50TGlzdGVuZXJcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIGVsZW1lbnRcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIHR5cGVcbiAgICogQHBhcmFtICAge0Z1bmN0aW9ufSAgICAgIGhhbmRsZXJcbiAgICovXG4gIHVuYmluZERvbTogZnVuY3Rpb24oZWxlbWVudCwgdHlwZSwgaGFuZGxlcikge1xuICAgIHZhciB0eXBlcyA9IHR5cGUuc3BsaXQoJyAnKTtcbiAgICBVdGlscy5lYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cblxuICAvKipcbiAgICogdG91Y2ggZXZlbnRzIHdpdGggbW91c2UgZmFsbGJhY2tcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIGVsZW1lbnRcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIGV2ZW50VHlwZSAgICAgICAgbGlrZSBFVkVOVF9NT1ZFXG4gICAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gICAgICBoYW5kbGVyXG4gICAqL1xuICBvblRvdWNoOiBmdW5jdGlvbiBvblRvdWNoKGVsZW1lbnQsIGV2ZW50VHlwZSwgaGFuZGxlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuXG4gICAgdmFyIGJpbmREb21PblRvdWNoID0gZnVuY3Rpb24gYmluZERvbU9uVG91Y2goZXYpIHtcbiAgICAgIHZhciBzcmNFdmVudFR5cGUgPSBldi50eXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIC8vIG9ubW91c2V1cCwgYnV0IHdoZW4gdG91Y2hlbmQgaGFzIGJlZW4gZmlyZWQgd2UgZG8gbm90aGluZy5cbiAgICAgIC8vIHRoaXMgaXMgZm9yIHRvdWNoZGV2aWNlcyB3aGljaCBhbHNvIGZpcmUgYSBtb3VzZXVwIG9uIHRvdWNoZW5kXG4gICAgICBpZihVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICdtb3VzZScpICYmIHRvdWNoX3RyaWdnZXJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIG1vdXNlYnV0dG9uIG11c3QgYmUgZG93biBvciBhIHRvdWNoIGV2ZW50XG4gICAgICBlbHNlIGlmKFV0aWxzLmluU3RyKHNyY0V2ZW50VHlwZSwgJ3RvdWNoJykgfHwgICAvLyB0b3VjaCBldmVudHMgYXJlIGFsd2F5cyBvbiBzY3JlZW5cbiAgICAgICAgVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAncG9pbnRlcmRvd24nKSB8fCAvLyBwb2ludGVyZXZlbnRzIHRvdWNoXG4gICAgICAgIChVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICdtb3VzZScpICYmIGV2LndoaWNoID09PSAxKSAgIC8vIG1vdXNlIGlzIHByZXNzZWRcbiAgICAgICAgKSB7XG4gICAgICAgIHNob3VsZF9kZXRlY3QgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBtb3VzZSBpc24ndCBwcmVzc2VkXG4gICAgICBlbHNlIGlmKFV0aWxzLmluU3RyKHNyY0V2ZW50VHlwZSwgJ21vdXNlJykgJiYgIWV2LndoaWNoKSB7XG4gICAgICAgIHNob3VsZF9kZXRlY3QgPSBmYWxzZTtcbiAgICAgIH1cblxuXG4gICAgICAvLyB3ZSBhcmUgaW4gYSB0b3VjaCBldmVudCwgc2V0IHRoZSB0b3VjaCB0cmlnZ2VyZWQgYm9vbCB0byB0cnVlLFxuICAgICAgLy8gdGhpcyBmb3IgdGhlIGNvbmZsaWN0cyB0aGF0IG1heSBvY2N1ciBvbiBpb3MgYW5kIGFuZHJvaWRcbiAgICAgIGlmKFV0aWxzLmluU3RyKHNyY0V2ZW50VHlwZSwgJ3RvdWNoJykgfHwgVXRpbHMuaW5TdHIoc3JjRXZlbnRUeXBlLCAncG9pbnRlcicpKSB7XG4gICAgICAgIHRvdWNoX3RyaWdnZXJlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvdW50IHRoZSB0b3RhbCB0b3VjaGVzIG9uIHRoZSBzY3JlZW5cbiAgICAgIHZhciBjb3VudF90b3VjaGVzID0gMDtcblxuICAgICAgLy8gd2hlbiB0b3VjaCBoYXMgYmVlbiB0cmlnZ2VyZWQgaW4gdGhpcyBkZXRlY3Rpb24gc2Vzc2lvblxuICAgICAgLy8gYW5kIHdlIGFyZSBub3cgaGFuZGxpbmcgYSBtb3VzZSBldmVudCwgd2Ugc3RvcCB0aGF0IHRvIHByZXZlbnQgY29uZmxpY3RzXG4gICAgICBpZihzaG91bGRfZGV0ZWN0KSB7XG4gICAgICAgIC8vIHVwZGF0ZSBwb2ludGVyZXZlbnRcbiAgICAgICAgaWYoSGFtbWVyLkhBU19QT0lOVEVSRVZFTlRTICYmIGV2ZW50VHlwZSAhPSBFVkVOVF9FTkQpIHtcbiAgICAgICAgICBjb3VudF90b3VjaGVzID0gUG9pbnRlckV2ZW50LnVwZGF0ZVBvaW50ZXIoZXZlbnRUeXBlLCBldik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdG91Y2hcbiAgICAgICAgZWxzZSBpZihVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICd0b3VjaCcpKSB7XG4gICAgICAgICAgY291bnRfdG91Y2hlcyA9IGV2LnRvdWNoZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1vdXNlXG4gICAgICAgIGVsc2UgaWYoIXRvdWNoX3RyaWdnZXJlZCkge1xuICAgICAgICAgIGNvdW50X3RvdWNoZXMgPSBVdGlscy5pblN0cihzcmNFdmVudFR5cGUsICd1cCcpID8gMCA6IDE7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGlmIHdlIGFyZSBpbiBhIGVuZCBldmVudCwgYnV0IHdoZW4gd2UgcmVtb3ZlIG9uZSB0b3VjaCBhbmRcbiAgICAgICAgLy8gd2Ugc3RpbGwgaGF2ZSBlbm91Z2gsIHNldCBldmVudFR5cGUgdG8gbW92ZVxuICAgICAgICBpZihjb3VudF90b3VjaGVzID4gMCAmJiBldmVudFR5cGUgPT0gRVZFTlRfRU5EKSB7XG4gICAgICAgICAgZXZlbnRUeXBlID0gRVZFTlRfTU9WRTtcbiAgICAgICAgfVxuICAgICAgICAvLyBubyB0b3VjaGVzLCBmb3JjZSB0aGUgZW5kIGV2ZW50XG4gICAgICAgIGVsc2UgaWYoIWNvdW50X3RvdWNoZXMpIHtcbiAgICAgICAgICBldmVudFR5cGUgPSBFVkVOVF9FTkQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgbGFzdCBtb3ZlIGV2ZW50XG4gICAgICAgIGlmKGNvdW50X3RvdWNoZXMgfHwgbGFzdF9tb3ZlX2V2ZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgbGFzdF9tb3ZlX2V2ZW50ID0gZXY7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIHRyaWdnZXIgdGhlIGhhbmRsZXJcbiAgICAgICAgaGFuZGxlci5jYWxsKERldGVjdGlvbiwgc2VsZi5jb2xsZWN0RXZlbnREYXRhKGVsZW1lbnQsIGV2ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldFRvdWNoTGlzdChsYXN0X21vdmVfZXZlbnQsIGV2ZW50VHlwZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYpICk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHBvaW50ZXJldmVudCBmcm9tIGxpc3RcbiAgICAgICAgaWYoSGFtbWVyLkhBU19QT0lOVEVSRVZFTlRTICYmIGV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgICAgICBjb3VudF90b3VjaGVzID0gUG9pbnRlckV2ZW50LnVwZGF0ZVBvaW50ZXIoZXZlbnRUeXBlLCBldik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gb24gdGhlIGVuZCB3ZSByZXNldCBldmVyeXRoaW5nXG4gICAgICBpZighY291bnRfdG91Y2hlcykge1xuICAgICAgICBsYXN0X21vdmVfZXZlbnQgPSBudWxsO1xuICAgICAgICBzaG91bGRfZGV0ZWN0ID0gZmFsc2U7XG4gICAgICAgIHRvdWNoX3RyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgICBQb2ludGVyRXZlbnQucmVzZXQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5iaW5kRG9tKGVsZW1lbnQsIEhhbW1lci5FVkVOVF9UWVBFU1tldmVudFR5cGVdLCBiaW5kRG9tT25Ub3VjaCk7XG5cbiAgICAvLyByZXR1cm4gdGhlIGJvdW5kIGZ1bmN0aW9uIHRvIGJlIGFibGUgdG8gdW5iaW5kIGl0IGxhdGVyXG4gICAgcmV0dXJuIGJpbmREb21PblRvdWNoO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIHdlIGhhdmUgZGlmZmVyZW50IGV2ZW50cyBmb3IgZWFjaCBkZXZpY2UvYnJvd3NlclxuICAgKiBkZXRlcm1pbmUgd2hhdCB3ZSBuZWVkIGFuZCBzZXQgdGhlbSBpbiB0aGUgSGFtbWVyLkVWRU5UX1RZUEVTIGNvbnN0YW50XG4gICAqL1xuICBkZXRlcm1pbmVFdmVudFR5cGVzOiBmdW5jdGlvbiBkZXRlcm1pbmVFdmVudFR5cGVzKCkge1xuICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnR0eXBlIHdlIHdhbnQgdG8gc2V0XG4gICAgdmFyIHR5cGVzO1xuXG4gICAgLy8gcG9pbnRlckV2ZW50cyBtYWdpY1xuICAgIGlmKEhhbW1lci5IQVNfUE9JTlRFUkVWRU5UUykge1xuICAgICAgdHlwZXMgPSBQb2ludGVyRXZlbnQuZ2V0RXZlbnRzKCk7XG4gICAgfVxuICAgIC8vIG9uIEFuZHJvaWQsIGlPUywgYmxhY2tiZXJyeSwgd2luZG93cyBtb2JpbGUgd2UgZG9udCB3YW50IGFueSBtb3VzZWV2ZW50c1xuICAgIGVsc2UgaWYoSGFtbWVyLk5PX01PVVNFRVZFTlRTKSB7XG4gICAgICB0eXBlcyA9IFtcbiAgICAgICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgICAndG91Y2htb3ZlJyxcbiAgICAgICAgJ3RvdWNoZW5kIHRvdWNoY2FuY2VsJ107XG4gICAgfVxuICAgIC8vIGZvciBub24gcG9pbnRlciBldmVudHMgYnJvd3NlcnMgYW5kIG1peGVkIGJyb3dzZXJzLFxuICAgIC8vIGxpa2UgY2hyb21lIG9uIHdpbmRvd3M4IHRvdWNoIGxhcHRvcFxuICAgIGVsc2Uge1xuICAgICAgdHlwZXMgPSBbXG4gICAgICAgICd0b3VjaHN0YXJ0IG1vdXNlZG93bicsXG4gICAgICAgICd0b3VjaG1vdmUgbW91c2Vtb3ZlJyxcbiAgICAgICAgJ3RvdWNoZW5kIHRvdWNoY2FuY2VsIG1vdXNldXAnXTtcbiAgICB9XG5cbiAgICBIYW1tZXIuRVZFTlRfVFlQRVNbRVZFTlRfU1RBUlRdID0gdHlwZXNbMF07XG4gICAgSGFtbWVyLkVWRU5UX1RZUEVTW0VWRU5UX01PVkVdID0gdHlwZXNbMV07XG4gICAgSGFtbWVyLkVWRU5UX1RZUEVTW0VWRU5UX0VORF0gPSB0eXBlc1syXTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjcmVhdGUgdG91Y2hsaXN0IGRlcGVuZGluZyBvbiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICAge09iamVjdH0gICAgZXZcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgZXZlbnRUeXBlICAgdXNlZCBieSB0aGUgZmFrZW11bHRpdG91Y2ggcGx1Z2luXG4gICAqL1xuICBnZXRUb3VjaExpc3Q6IGZ1bmN0aW9uIGdldFRvdWNoTGlzdChldi8qLCBldmVudFR5cGUqLykge1xuICAgIC8vIGdldCB0aGUgZmFrZSBwb2ludGVyRXZlbnQgdG91Y2hsaXN0XG4gICAgaWYoSGFtbWVyLkhBU19QT0lOVEVSRVZFTlRTKSB7XG4gICAgICByZXR1cm4gUG9pbnRlckV2ZW50LmdldFRvdWNoTGlzdCgpO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgdG91Y2hsaXN0XG4gICAgaWYoZXYudG91Y2hlcykge1xuICAgICAgcmV0dXJuIGV2LnRvdWNoZXM7XG4gICAgfVxuXG4gICAgLy8gbWFrZSBmYWtlIHRvdWNobGlzdCBmcm9tIG1vdXNlIHBvc2l0aW9uXG4gICAgZXYuaWRlbnRpZmllciA9IDE7XG4gICAgcmV0dXJuIFtldl07XG4gIH0sXG5cblxuICAvKipcbiAgICogY29sbGVjdCBldmVudCBkYXRhIGZvciBIYW1tZXIganNcbiAgICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgIGVsZW1lbnRcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIGV2ZW50VHlwZSAgICAgICAgbGlrZSBFVkVOVF9NT1ZFXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgICAgICBldmVudERhdGFcbiAgICovXG4gIGNvbGxlY3RFdmVudERhdGE6IGZ1bmN0aW9uIGNvbGxlY3RFdmVudERhdGEoZWxlbWVudCwgZXZlbnRUeXBlLCB0b3VjaGVzLCBldikge1xuICAgIC8vIGZpbmQgb3V0IHBvaW50ZXJUeXBlXG4gICAgdmFyIHBvaW50ZXJUeXBlID0gUE9JTlRFUl9UT1VDSDtcbiAgICBpZihVdGlscy5pblN0cihldi50eXBlLCAnbW91c2UnKSB8fCBQb2ludGVyRXZlbnQubWF0Y2hUeXBlKFBPSU5URVJfTU9VU0UsIGV2KSkge1xuICAgICAgcG9pbnRlclR5cGUgPSBQT0lOVEVSX01PVVNFO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjZW50ZXIgICAgIDogVXRpbHMuZ2V0Q2VudGVyKHRvdWNoZXMpLFxuICAgICAgdGltZVN0YW1wICA6IERhdGUubm93KCksXG4gICAgICB0YXJnZXQgICAgIDogZXYudGFyZ2V0LFxuICAgICAgdG91Y2hlcyAgICA6IHRvdWNoZXMsXG4gICAgICBldmVudFR5cGUgIDogZXZlbnRUeXBlLFxuICAgICAgcG9pbnRlclR5cGU6IHBvaW50ZXJUeXBlLFxuICAgICAgc3JjRXZlbnQgICA6IGV2LFxuXG4gICAgICAvKipcbiAgICAgICAqIHByZXZlbnQgdGhlIGJyb3dzZXIgZGVmYXVsdCBhY3Rpb25zXG4gICAgICAgKiBtb3N0bHkgdXNlZCB0byBkaXNhYmxlIHNjcm9sbGluZyBvZiB0aGUgYnJvd3NlclxuICAgICAgICovXG4gICAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzcmNFdmVudCA9IHRoaXMuc3JjRXZlbnQ7XG4gICAgICAgIHNyY0V2ZW50LnByZXZlbnRNYW5pcHVsYXRpb24gJiYgc3JjRXZlbnQucHJldmVudE1hbmlwdWxhdGlvbigpO1xuICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCAmJiBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBzdG9wIGJ1YmJsaW5nIHRoZSBldmVudCB1cCB0byBpdHMgcGFyZW50c1xuICAgICAgICovXG4gICAgICBzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNyY0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBpbW1lZGlhdGVseSBzdG9wIGdlc3R1cmUgZGV0ZWN0aW9uXG4gICAgICAgKiBtaWdodCBiZSB1c2VmdWwgYWZ0ZXIgYSBzd2lwZSB3YXMgZGV0ZWN0ZWRcbiAgICAgICAqIEByZXR1cm4geyp9XG4gICAgICAgKi9cbiAgICAgIHN0b3BEZXRlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRGV0ZWN0aW9uLnN0b3BEZXRlY3QoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG52YXIgUG9pbnRlckV2ZW50ID0gSGFtbWVyLlBvaW50ZXJFdmVudCA9IHtcbiAgLyoqXG4gICAqIGhvbGRzIGFsbCBwb2ludGVyc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgcG9pbnRlcnM6IHt9LFxuXG4gIC8qKlxuICAgKiBnZXQgYSBsaXN0IG9mIHBvaW50ZXJzXG4gICAqIEByZXR1cm5zIHtBcnJheX0gICAgIHRvdWNobGlzdFxuICAgKi9cbiAgZ2V0VG91Y2hMaXN0OiBmdW5jdGlvbiBnZXRUb3VjaExpc3QoKSB7XG4gICAgdmFyIHRvdWNobGlzdCA9IFtdO1xuICAgIC8vIHdlIGNhbiB1c2UgZm9yRWFjaCBzaW5jZSBwb2ludGVyRXZlbnRzIG9ubHkgaXMgaW4gSUUxMFxuICAgIFV0aWxzLmVhY2godGhpcy5wb2ludGVycywgZnVuY3Rpb24ocG9pbnRlcil7XG4gICAgICB0b3VjaGxpc3QucHVzaChwb2ludGVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0b3VjaGxpc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIHVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgYSBwb2ludGVyXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgdHlwZSAgICAgICAgICAgICBFVkVOVF9FTkRcbiAgICogQHBhcmFtICAge09iamVjdH0gICBwb2ludGVyRXZlbnRcbiAgICovXG4gIHVwZGF0ZVBvaW50ZXI6IGZ1bmN0aW9uIHVwZGF0ZVBvaW50ZXIodHlwZSwgcG9pbnRlckV2ZW50KSB7XG4gICAgaWYodHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnBvaW50ZXJzW3BvaW50ZXJFdmVudC5wb2ludGVySWRdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHBvaW50ZXJFdmVudC5pZGVudGlmaWVyID0gcG9pbnRlckV2ZW50LnBvaW50ZXJJZDtcbiAgICAgIHRoaXMucG9pbnRlcnNbcG9pbnRlckV2ZW50LnBvaW50ZXJJZF0gPSBwb2ludGVyRXZlbnQ7XG4gICAgfVxuXG4gICAgLy8gaXQncyBzYXZlIHRvIHVzZSBPYmplY3Qua2V5cywgc2luY2UgcG9pbnRlckV2ZW50cyBhcmUgb25seSBpbiBuZXdlciBicm93c2Vyc1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBvaW50ZXJzKS5sZW5ndGg7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGNoZWNrIGlmIGV2IG1hdGNoZXMgcG9pbnRlcnR5cGVcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIHBvaW50ZXJUeXBlICAgICBQT0lOVEVSX01PVVNFXG4gICAqIEBwYXJhbSAgIHtQb2ludGVyRXZlbnR9ICBldlxuICAgKi9cbiAgbWF0Y2hUeXBlOiBmdW5jdGlvbiBtYXRjaFR5cGUocG9pbnRlclR5cGUsIGV2KSB7XG4gICAgaWYoIWV2LnBvaW50ZXJUeXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHB0ID0gZXYucG9pbnRlclR5cGVcbiAgICAgICwgdHlwZXMgPSB7fTtcblxuICAgIHR5cGVzW1BPSU5URVJfTU9VU0VdID0gKHB0ID09PSBQT0lOVEVSX01PVVNFKTtcbiAgICB0eXBlc1tQT0lOVEVSX1RPVUNIXSA9IChwdCA9PT0gUE9JTlRFUl9UT1VDSCk7XG4gICAgdHlwZXNbUE9JTlRFUl9QRU5dID0gKHB0ID09PSBQT0lOVEVSX1BFTik7XG4gICAgcmV0dXJuIHR5cGVzW3BvaW50ZXJUeXBlXTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBnZXQgZXZlbnRzXG4gICAqL1xuICBnZXRFdmVudHM6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJ3BvaW50ZXJkb3duIE1TUG9pbnRlckRvd24nLFxuICAgICAgJ3BvaW50ZXJtb3ZlIE1TUG9pbnRlck1vdmUnLFxuICAgICAgJ3BvaW50ZXJ1cCBwb2ludGVyY2FuY2VsIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCdcbiAgICBdO1xuICB9LFxuXG4gIC8qKlxuICAgKiByZXNldCB0aGUgbGlzdFxuICAgKi9cbiAgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0TGlzdCgpIHtcbiAgICB0aGlzLnBvaW50ZXJzID0ge307XG4gIH1cbn07XG5cblxudmFyIERldGVjdGlvbiA9IEhhbW1lci5kZXRlY3Rpb24gPSB7XG4gIC8vIGNvbnRhaW5zIGFsbCByZWdpc3RyZWQgSGFtbWVyLmdlc3R1cmVzIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gIGdlc3R1cmVzOiBbXSxcblxuICAvLyBkYXRhIG9mIHRoZSBjdXJyZW50IEhhbW1lci5nZXN0dXJlIGRldGVjdGlvbiBzZXNzaW9uXG4gIGN1cnJlbnQgOiBudWxsLFxuXG4gIC8vIHRoZSBwcmV2aW91cyBIYW1tZXIuZ2VzdHVyZSBzZXNzaW9uIGRhdGFcbiAgLy8gaXMgYSBmdWxsIGNsb25lIG9mIHRoZSBwcmV2aW91cyBnZXN0dXJlLmN1cnJlbnQgb2JqZWN0XG4gIHByZXZpb3VzOiBudWxsLFxuXG4gIC8vIHdoZW4gdGhpcyBiZWNvbWVzIHRydWUsIG5vIGdlc3R1cmVzIGFyZSBmaXJlZFxuICBzdG9wcGVkIDogZmFsc2UsXG5cblxuICAvKipcbiAgICogc3RhcnQgSGFtbWVyLmdlc3R1cmUgZGV0ZWN0aW9uXG4gICAqIEBwYXJhbSAgIHtIYW1tZXIuSW5zdGFuY2V9ICAgaW5zdFxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgICAgICAgICAgIGV2ZW50RGF0YVxuICAgKi9cbiAgc3RhcnREZXRlY3Q6IGZ1bmN0aW9uIHN0YXJ0RGV0ZWN0KGluc3QsIGV2ZW50RGF0YSkge1xuICAgIC8vIGFscmVhZHkgYnVzeSB3aXRoIGEgSGFtbWVyLmdlc3R1cmUgZGV0ZWN0aW9uIG9uIGFuIGVsZW1lbnRcbiAgICBpZih0aGlzLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuICAgIC8vIGhvbGRzIGN1cnJlbnQgc2Vzc2lvblxuICAgIHRoaXMuY3VycmVudCA9IHtcbiAgICAgIGluc3QgICAgICAgICAgICAgIDogaW5zdCwgLy8gcmVmZXJlbmNlIHRvIEhhbW1lckluc3RhbmNlIHdlJ3JlIHdvcmtpbmcgZm9yXG4gICAgICBzdGFydEV2ZW50ICAgICAgICA6IFV0aWxzLmV4dGVuZCh7fSwgZXZlbnREYXRhKSwgLy8gc3RhcnQgZXZlbnREYXRhIGZvciBkaXN0YW5jZXMsIHRpbWluZyBldGNcbiAgICAgIGxhc3RFdmVudCAgICAgICAgIDogZmFsc2UsIC8vIGxhc3QgZXZlbnREYXRhXG4gICAgICBsYXN0VmVsb2NpdHlFdmVudCA6IGZhbHNlLCAvLyBsYXN0IGV2ZW50RGF0YSBmb3IgdmVsb2NpdHkuXG4gICAgICB2ZWxvY2l0eSAgICAgICAgICA6IGZhbHNlLCAvLyBjdXJyZW50IHZlbG9jaXR5XG4gICAgICBuYW1lICAgICAgICAgICAgICA6ICcnIC8vIGN1cnJlbnQgZ2VzdHVyZSB3ZSdyZSBpbi9kZXRlY3RlZCwgY2FuIGJlICd0YXAnLCAnaG9sZCcgZXRjXG4gICAgfTtcblxuICAgIHRoaXMuZGV0ZWN0KGV2ZW50RGF0YSk7XG4gIH0sXG5cblxuICAvKipcbiAgICogSGFtbWVyLmdlc3R1cmUgZGV0ZWN0aW9uXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIGV2ZW50RGF0YVxuICAgKi9cbiAgZGV0ZWN0OiBmdW5jdGlvbiBkZXRlY3QoZXZlbnREYXRhKSB7XG4gICAgaWYoIXRoaXMuY3VycmVudCB8fCB0aGlzLnN0b3BwZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBleHRlbmQgZXZlbnQgZGF0YSB3aXRoIGNhbGN1bGF0aW9ucyBhYm91dCBzY2FsZSwgZGlzdGFuY2UgZXRjXG4gICAgZXZlbnREYXRhID0gdGhpcy5leHRlbmRFdmVudERhdGEoZXZlbnREYXRhKTtcblxuICAgIC8vIGhhbW1lciBpbnN0YW5jZSBhbmQgaW5zdGFuY2Ugb3B0aW9uc1xuICAgIHZhciBpbnN0ID0gdGhpcy5jdXJyZW50Lmluc3QsXG4gICAgICAgIGluc3Rfb3B0aW9ucyA9IGluc3Qub3B0aW9ucztcblxuICAgIC8vIGNhbGwgSGFtbWVyLmdlc3R1cmUgaGFuZGxlcnNcbiAgICBVdGlscy5lYWNoKHRoaXMuZ2VzdHVyZXMsIGZ1bmN0aW9uIHRyaWdnZXJHZXN0dXJlKGdlc3R1cmUpIHtcbiAgICAgIC8vIG9ubHkgd2hlbiB0aGUgaW5zdGFuY2Ugb3B0aW9ucyBoYXZlIGVuYWJsZWQgdGhpcyBnZXN0dXJlXG4gICAgICBpZighdGhpcy5zdG9wcGVkICYmIGluc3Rfb3B0aW9uc1tnZXN0dXJlLm5hbWVdICE9PSBmYWxzZSAmJiBpbnN0LmVuYWJsZWQgIT09IGZhbHNlICkge1xuICAgICAgICAvLyBpZiBhIGhhbmRsZXIgcmV0dXJucyBmYWxzZSwgd2Ugc3RvcCB3aXRoIHRoZSBkZXRlY3Rpb25cbiAgICAgICAgaWYoZ2VzdHVyZS5oYW5kbGVyLmNhbGwoZ2VzdHVyZSwgZXZlbnREYXRhLCBpbnN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB0aGlzLnN0b3BEZXRlY3QoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIC8vIHN0b3JlIGFzIHByZXZpb3VzIGV2ZW50IGV2ZW50XG4gICAgaWYodGhpcy5jdXJyZW50KSB7XG4gICAgICB0aGlzLmN1cnJlbnQubGFzdEV2ZW50ID0gZXZlbnREYXRhO1xuICAgIH1cblxuICAgIC8vIGVuZCBldmVudCwgYnV0IG5vdCB0aGUgbGFzdCB0b3VjaCwgc28gZG9udCBzdG9wXG4gICAgaWYoZXZlbnREYXRhLmV2ZW50VHlwZSA9PSBFVkVOVF9FTkQgJiYgIWV2ZW50RGF0YS50b3VjaGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuc3RvcERldGVjdCgpO1xuICAgIH1cblxuICAgIHJldHVybiBldmVudERhdGE7XG4gIH0sXG5cblxuICAvKipcbiAgICogY2xlYXIgdGhlIEhhbW1lci5nZXN0dXJlIHZhcnNcbiAgICogdGhpcyBpcyBjYWxsZWQgb24gZW5kRGV0ZWN0LCBidXQgY2FuIGFsc28gYmUgdXNlZCB3aGVuIGEgZmluYWwgSGFtbWVyLmdlc3R1cmUgaGFzIGJlZW4gZGV0ZWN0ZWRcbiAgICogdG8gc3RvcCBvdGhlciBIYW1tZXIuZ2VzdHVyZXMgZnJvbSBiZWluZyBmaXJlZFxuICAgKi9cbiAgc3RvcERldGVjdDogZnVuY3Rpb24gc3RvcERldGVjdCgpIHtcbiAgICAvLyBjbG9uZSBjdXJyZW50IGRhdGEgdG8gdGhlIHN0b3JlIGFzIHRoZSBwcmV2aW91cyBnZXN0dXJlXG4gICAgLy8gdXNlZCBmb3IgdGhlIGRvdWJsZSB0YXAgZ2VzdHVyZSwgc2luY2UgdGhpcyBpcyBhbiBvdGhlciBnZXN0dXJlIGRldGVjdCBzZXNzaW9uXG4gICAgdGhpcy5wcmV2aW91cyA9IFV0aWxzLmV4dGVuZCh7fSwgdGhpcy5jdXJyZW50KTtcblxuICAgIC8vIHJlc2V0IHRoZSBjdXJyZW50XG4gICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcblxuICAgIC8vIHN0b3BwZWQhXG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgdmVsb2NpdHlcbiAgICogQHBhcmFtICAge09iamVjdH0gIGV2XG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICBkZWx0YV90aW1lXG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICBkZWx0YV94XG4gICAqIEBwYXJhbSAgIHtOdW1iZXJ9ICBkZWx0YV95XG4gICAqL1xuICBnZXRWZWxvY2l0eURhdGE6IGZ1bmN0aW9uIGdldFZlbG9jaXR5RGF0YShldiwgZGVsdGFfdGltZSwgZGVsdGFfeCwgZGVsdGFfeSkge1xuICAgIHZhciBjdXIgPSB0aGlzLmN1cnJlbnRcbiAgICAgICwgdmVsb2NpdHlFdiA9IGN1ci5sYXN0VmVsb2NpdHlFdmVudFxuICAgICAgLCB2ZWxvY2l0eSA9IGN1ci52ZWxvY2l0eTtcblxuICAgIC8vIGNhbGN1bGF0ZSB2ZWxvY2l0eSBldmVyeSB4IG1zXG4gICAgaWYgKHZlbG9jaXR5RXYgJiYgZXYudGltZVN0YW1wIC0gdmVsb2NpdHlFdi50aW1lU3RhbXAgPiBIYW1tZXIuVVBEQVRFX1ZFTE9DSVRZX0lOVEVSVkFMKSB7XG4gICAgICB2ZWxvY2l0eSA9IFV0aWxzLmdldFZlbG9jaXR5KGV2LnRpbWVTdGFtcCAtIHZlbG9jaXR5RXYudGltZVN0YW1wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5jZW50ZXIuY2xpZW50WCAtIHZlbG9jaXR5RXYuY2VudGVyLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXYuY2VudGVyLmNsaWVudFkgLSB2ZWxvY2l0eUV2LmNlbnRlci5jbGllbnRZKTtcbiAgICAgIGN1ci5sYXN0VmVsb2NpdHlFdmVudCA9IGV2O1xuICAgIH1cbiAgICBlbHNlIGlmKCFjdXIudmVsb2NpdHkpIHtcbiAgICAgIHZlbG9jaXR5ID0gVXRpbHMuZ2V0VmVsb2NpdHkoZGVsdGFfdGltZSwgZGVsdGFfeCwgZGVsdGFfeSk7XG4gICAgICBjdXIubGFzdFZlbG9jaXR5RXZlbnQgPSBldjtcbiAgICB9XG5cbiAgICBjdXIudmVsb2NpdHkgPSB2ZWxvY2l0eTtcblxuICAgIGV2LnZlbG9jaXR5WCA9IHZlbG9jaXR5Lng7XG4gICAgZXYudmVsb2NpdHlZID0gdmVsb2NpdHkueTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBjYWxjdWxhdGUgaW50ZXJpbSBhbmdsZSBhbmQgZGlyZWN0aW9uXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICBldlxuICAgKi9cbiAgZ2V0SW50ZXJpbURhdGE6IGZ1bmN0aW9uIGdldEludGVyaW1EYXRhKGV2KSB7XG4gICAgdmFyIGxhc3RFdmVudCA9IHRoaXMuY3VycmVudC5sYXN0RXZlbnRcbiAgICAgICwgYW5nbGVcbiAgICAgICwgZGlyZWN0aW9uO1xuXG4gICAgLy8gZW5kIGV2ZW50cyAoZS5nLiBkcmFnZW5kKSBkb24ndCBoYXZlIHVzZWZ1bCB2YWx1ZXMgZm9yIGludGVyaW1EaXJlY3Rpb24gJiBpbnRlcmltQW5nbGVcbiAgICAvLyBiZWNhdXNlIHRoZSBwcmV2aW91cyBldmVudCBoYXMgZXhhY3RseSB0aGUgc2FtZSBjb29yZGluYXRlc1xuICAgIC8vIHNvIGZvciBlbmQgZXZlbnRzLCB0YWtlIHRoZSBwcmV2aW91cyB2YWx1ZXMgb2YgaW50ZXJpbURpcmVjdGlvbiAmIGludGVyaW1BbmdsZVxuICAgIC8vIGluc3RlYWQgb2YgcmVjYWxjdWxhdGluZyB0aGVtIGFuZCBnZXR0aW5nIGEgc3B1cmlvdXMgJzAnXG4gICAgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX0VORCkge1xuICAgICAgYW5nbGUgPSBsYXN0RXZlbnQgJiYgbGFzdEV2ZW50LmludGVyaW1BbmdsZTtcbiAgICAgIGRpcmVjdGlvbiA9IGxhc3RFdmVudCAmJiBsYXN0RXZlbnQuaW50ZXJpbURpcmVjdGlvbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhbmdsZSA9IGxhc3RFdmVudCAmJiBVdGlscy5nZXRBbmdsZShsYXN0RXZlbnQuY2VudGVyLCBldi5jZW50ZXIpO1xuICAgICAgZGlyZWN0aW9uID0gbGFzdEV2ZW50ICYmIFV0aWxzLmdldERpcmVjdGlvbihsYXN0RXZlbnQuY2VudGVyLCBldi5jZW50ZXIpO1xuICAgIH1cblxuICAgIGV2LmludGVyaW1BbmdsZSA9IGFuZ2xlO1xuICAgIGV2LmludGVyaW1EaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gIH0sXG5cblxuICAvKipcbiAgICogZXh0ZW5kIGV2ZW50RGF0YSBmb3IgSGFtbWVyLmdlc3R1cmVzXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgZXZEYXRhXG4gICAqIEByZXR1cm5zIHtPYmplY3R9ICAgZXZEYXRhXG4gICAqL1xuICBleHRlbmRFdmVudERhdGE6IGZ1bmN0aW9uIGV4dGVuZEV2ZW50RGF0YShldikge1xuICAgIHZhciBjdXIgPSB0aGlzLmN1cnJlbnRcbiAgICAgICwgc3RhcnRFdiA9IGN1ci5zdGFydEV2ZW50O1xuXG4gICAgLy8gaWYgdGhlIHRvdWNoZXMgY2hhbmdlLCBzZXQgdGhlIG5ldyB0b3VjaGVzIG92ZXIgdGhlIHN0YXJ0RXZlbnQgdG91Y2hlc1xuICAgIC8vIHRoaXMgYmVjYXVzZSB0b3VjaGV2ZW50cyBkb24ndCBoYXZlIGFsbCB0aGUgdG91Y2hlcyBvbiB0b3VjaHN0YXJ0LCBvciB0aGVcbiAgICAvLyB1c2VyIG11c3QgcGxhY2UgaGlzIGZpbmdlcnMgYXQgdGhlIEVYQUNUIHNhbWUgdGltZSBvbiB0aGUgc2NyZWVuLCB3aGljaCBpcyBub3QgcmVhbGlzdGljXG4gICAgLy8gYnV0LCBzb21ldGltZXMgaXQgaGFwcGVucyB0aGF0IGJvdGggZmluZ2VycyBhcmUgdG91Y2hpbmcgYXQgdGhlIEVYQUNUIHNhbWUgdGltZVxuICAgIGlmKGV2LnRvdWNoZXMubGVuZ3RoICE9IHN0YXJ0RXYudG91Y2hlcy5sZW5ndGggfHwgZXYudG91Y2hlcyA9PT0gc3RhcnRFdi50b3VjaGVzKSB7XG4gICAgICAvLyBleHRlbmQgMSBsZXZlbCBkZWVwIHRvIGdldCB0aGUgdG91Y2hsaXN0IHdpdGggdGhlIHRvdWNoIG9iamVjdHNcbiAgICAgIHN0YXJ0RXYudG91Y2hlcyA9IFtdO1xuICAgICAgVXRpbHMuZWFjaChldi50b3VjaGVzLCBmdW5jdGlvbih0b3VjaCkge1xuICAgICAgICBzdGFydEV2LnRvdWNoZXMucHVzaChVdGlscy5leHRlbmQoe30sIHRvdWNoKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgZGVsdGFfdGltZSA9IGV2LnRpbWVTdGFtcCAtIHN0YXJ0RXYudGltZVN0YW1wXG4gICAgICAsIGRlbHRhX3ggPSBldi5jZW50ZXIuY2xpZW50WCAtIHN0YXJ0RXYuY2VudGVyLmNsaWVudFhcbiAgICAgICwgZGVsdGFfeSA9IGV2LmNlbnRlci5jbGllbnRZIC0gc3RhcnRFdi5jZW50ZXIuY2xpZW50WTtcblxuICAgIHRoaXMuZ2V0VmVsb2NpdHlEYXRhKGV2LCBkZWx0YV90aW1lLCBkZWx0YV94LCBkZWx0YV95KTtcbiAgICB0aGlzLmdldEludGVyaW1EYXRhKGV2KTtcblxuICAgIFV0aWxzLmV4dGVuZChldiwge1xuICAgICAgc3RhcnRFdmVudDogc3RhcnRFdixcblxuICAgICAgZGVsdGFUaW1lIDogZGVsdGFfdGltZSxcbiAgICAgIGRlbHRhWCAgICA6IGRlbHRhX3gsXG4gICAgICBkZWx0YVkgICAgOiBkZWx0YV95LFxuXG4gICAgICBkaXN0YW5jZSAgOiBVdGlscy5nZXREaXN0YW5jZShzdGFydEV2LmNlbnRlciwgZXYuY2VudGVyKSxcbiAgICAgIGFuZ2xlICAgICA6IFV0aWxzLmdldEFuZ2xlKHN0YXJ0RXYuY2VudGVyLCBldi5jZW50ZXIpLFxuICAgICAgZGlyZWN0aW9uIDogVXRpbHMuZ2V0RGlyZWN0aW9uKHN0YXJ0RXYuY2VudGVyLCBldi5jZW50ZXIpLFxuXG4gICAgICBzY2FsZSAgICAgOiBVdGlscy5nZXRTY2FsZShzdGFydEV2LnRvdWNoZXMsIGV2LnRvdWNoZXMpLFxuICAgICAgcm90YXRpb24gIDogVXRpbHMuZ2V0Um90YXRpb24oc3RhcnRFdi50b3VjaGVzLCBldi50b3VjaGVzKVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV2O1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyIG5ldyBnZXN0dXJlXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICAgIGdlc3R1cmUgb2JqZWN0LCBzZWUgZ2VzdHVyZXMuanMgZm9yIGRvY3VtZW50YXRpb25cbiAgICogQHJldHVybnMge0FycmF5fSAgICAgZ2VzdHVyZXNcbiAgICovXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbiByZWdpc3RlcihnZXN0dXJlKSB7XG4gICAgLy8gYWRkIGFuIGVuYWJsZSBnZXN0dXJlIG9wdGlvbnMgaWYgdGhlcmUgaXMgbm8gZ2l2ZW5cbiAgICB2YXIgb3B0aW9ucyA9IGdlc3R1cmUuZGVmYXVsdHMgfHwge307XG4gICAgaWYob3B0aW9uc1tnZXN0dXJlLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnNbZ2VzdHVyZS5uYW1lXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gZXh0ZW5kIEhhbW1lciBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgSGFtbWVyLmdlc3R1cmUgb3B0aW9uc1xuICAgIFV0aWxzLmV4dGVuZChIYW1tZXIuZGVmYXVsdHMsIG9wdGlvbnMsIHRydWUpO1xuXG4gICAgLy8gc2V0IGl0cyBpbmRleFxuICAgIGdlc3R1cmUuaW5kZXggPSBnZXN0dXJlLmluZGV4IHx8IDEwMDA7XG5cbiAgICAvLyBhZGQgSGFtbWVyLmdlc3R1cmUgdG8gdGhlIGxpc3RcbiAgICB0aGlzLmdlc3R1cmVzLnB1c2goZ2VzdHVyZSk7XG5cbiAgICAvLyBzb3J0IHRoZSBsaXN0IGJ5IGluZGV4XG4gICAgdGhpcy5nZXN0dXJlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIGlmKGEuaW5kZXggPCBiLmluZGV4KSB7IHJldHVybiAtMTsgfVxuICAgICAgaWYoYS5pbmRleCA+IGIuaW5kZXgpIHsgcmV0dXJuIDE7IH1cbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuZ2VzdHVyZXM7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBEcmFnXG4gKiBNb3ZlIHdpdGggeCBmaW5nZXJzIChkZWZhdWx0IDEpIGFyb3VuZCBvbiB0aGUgcGFnZS4gQmxvY2tpbmcgdGhlIHNjcm9sbGluZyB3aGVuXG4gKiBtb3ZpbmcgbGVmdCBhbmQgcmlnaHQgaXMgYSBnb29kIHByYWN0aWNlLiBXaGVuIGFsbCB0aGUgZHJhZyBldmVudHMgYXJlIGJsb2NraW5nXG4gKiB5b3UgZGlzYWJsZSBzY3JvbGxpbmcgb24gdGhhdCBhcmVhLlxuICogQGV2ZW50cyAgZHJhZywgZHJhcGxlZnQsIGRyYWdyaWdodCwgZHJhZ3VwLCBkcmFnZG93blxuICovXG5IYW1tZXIuZ2VzdHVyZXMuRHJhZyA9IHtcbiAgbmFtZSAgICAgOiAnZHJhZycsXG4gIGluZGV4ICAgIDogNTAsXG4gIGRlZmF1bHRzIDoge1xuICAgIGRyYWdfbWluX2Rpc3RhbmNlICAgICAgICAgICAgOiAxMCxcblxuICAgIC8vIFNldCBjb3JyZWN0X2Zvcl9kcmFnX21pbl9kaXN0YW5jZSB0byB0cnVlIHRvIG1ha2UgdGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBkcmFnXG4gICAgLy8gYmUgY2FsY3VsYXRlZCBmcm9tIHdoZXJlIHRoZSBkcmFnIHdhcyB0cmlnZ2VyZWQsIG5vdCBmcm9tIHdoZXJlIHRoZSB0b3VjaCBzdGFydGVkLlxuICAgIC8vIFVzZWZ1bCB0byBhdm9pZCBhIGplcmstc3RhcnRpbmcgZHJhZywgd2hpY2ggY2FuIG1ha2UgZmluZS1hZGp1c3RtZW50c1xuICAgIC8vIHRocm91Z2ggZHJhZ2dpbmcgZGlmZmljdWx0LCBhbmQgYmUgdmlzdWFsbHkgdW5hcHBlYWxpbmcuXG4gICAgY29ycmVjdF9mb3JfZHJhZ19taW5fZGlzdGFuY2U6IHRydWUsXG5cbiAgICAvLyBzZXQgMCBmb3IgdW5saW1pdGVkLCBidXQgdGhpcyBjYW4gY29uZmxpY3Qgd2l0aCB0cmFuc2Zvcm1cbiAgICBkcmFnX21heF90b3VjaGVzICAgICAgICAgICAgIDogMSxcblxuICAgIC8vIHByZXZlbnQgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yIHdoZW4gZHJhZ2dpbmcgb2NjdXJzXG4gICAgLy8gYmUgY2FyZWZ1bCB3aXRoIGl0LCBpdCBtYWtlcyB0aGUgZWxlbWVudCBhIGJsb2NraW5nIGVsZW1lbnRcbiAgICAvLyB3aGVuIHlvdSBhcmUgdXNpbmcgdGhlIGRyYWcgZ2VzdHVyZSwgaXQgaXMgYSBnb29kIHByYWN0aWNlIHRvIHNldCB0aGlzIHRydWVcbiAgICBkcmFnX2Jsb2NrX2hvcml6b250YWwgICAgICAgIDogZmFsc2UsXG4gICAgZHJhZ19ibG9ja192ZXJ0aWNhbCAgICAgICAgICA6IGZhbHNlLFxuXG4gICAgLy8gZHJhZ19sb2NrX3RvX2F4aXMga2VlcHMgdGhlIGRyYWcgZ2VzdHVyZSBvbiB0aGUgYXhpcyB0aGF0IGl0IHN0YXJ0ZWQgb24sXG4gICAgLy8gSXQgZGlzYWxsb3dzIHZlcnRpY2FsIGRpcmVjdGlvbnMgaWYgdGhlIGluaXRpYWwgZGlyZWN0aW9uIHdhcyBob3Jpem9udGFsLCBhbmQgdmljZSB2ZXJzYS5cbiAgICBkcmFnX2xvY2tfdG9fYXhpcyAgICAgICAgICAgIDogZmFsc2UsXG5cbiAgICAvLyBkcmFnIGxvY2sgb25seSBraWNrcyBpbiB3aGVuIGRpc3RhbmNlID4gZHJhZ19sb2NrX21pbl9kaXN0YW5jZVxuICAgIC8vIFRoaXMgd2F5LCBsb2NraW5nIG9jY3VycyBvbmx5IHdoZW4gdGhlIGRpc3RhbmNlIGhhcyBiZWNvbWUgbGFyZ2UgZW5vdWdoIHRvIHJlbGlhYmx5IGRldGVybWluZSB0aGUgZGlyZWN0aW9uXG4gICAgZHJhZ19sb2NrX21pbl9kaXN0YW5jZSAgICAgICA6IDI1XG4gIH0sXG5cbiAgdHJpZ2dlcmVkOiBmYWxzZSxcbiAgaGFuZGxlciAgOiBmdW5jdGlvbiBkcmFnR2VzdHVyZShldiwgaW5zdCkge1xuICAgIHZhciBjdXIgPSBEZXRlY3Rpb24uY3VycmVudDtcblxuICAgIC8vIGN1cnJlbnQgZ2VzdHVyZSBpc250IGRyYWcsIGJ1dCBkcmFnZ2VkIGlzIHRydWVcbiAgICAvLyB0aGlzIG1lYW5zIGFuIG90aGVyIGdlc3R1cmUgaXMgYnVzeS4gbm93IGNhbGwgZHJhZ2VuZFxuICAgIGlmKGN1ci5uYW1lICE9IHRoaXMubmFtZSAmJiB0aGlzLnRyaWdnZXJlZCkge1xuICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArICdlbmQnLCBldik7XG4gICAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG1heCB0b3VjaGVzXG4gICAgaWYoaW5zdC5vcHRpb25zLmRyYWdfbWF4X3RvdWNoZXMgPiAwICYmXG4gICAgICBldi50b3VjaGVzLmxlbmd0aCA+IGluc3Qub3B0aW9ucy5kcmFnX21heF90b3VjaGVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpdGNoKGV2LmV2ZW50VHlwZSkge1xuICAgICAgY2FzZSBFVkVOVF9TVEFSVDpcbiAgICAgICAgdGhpcy50cmlnZ2VyZWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVZFTlRfTU9WRTpcbiAgICAgICAgLy8gd2hlbiB0aGUgZGlzdGFuY2Ugd2UgbW92ZWQgaXMgdG9vIHNtYWxsIHdlIHNraXAgdGhpcyBnZXN0dXJlXG4gICAgICAgIC8vIG9yIHdlIGNhbiBiZSBhbHJlYWR5IGluIGRyYWdnaW5nXG4gICAgICAgIGlmKGV2LmRpc3RhbmNlIDwgaW5zdC5vcHRpb25zLmRyYWdfbWluX2Rpc3RhbmNlICYmXG4gICAgICAgICAgY3VyLm5hbWUgIT0gdGhpcy5uYW1lKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXJ0Q2VudGVyID0gY3VyLnN0YXJ0RXZlbnQuY2VudGVyO1xuXG4gICAgICAgIC8vIHdlIGFyZSBkcmFnZ2luZyFcbiAgICAgICAgaWYoY3VyLm5hbWUgIT0gdGhpcy5uYW1lKSB7XG4gICAgICAgICAgY3VyLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgaWYoaW5zdC5vcHRpb25zLmNvcnJlY3RfZm9yX2RyYWdfbWluX2Rpc3RhbmNlICYmIGV2LmRpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgLy8gV2hlbiBhIGRyYWcgaXMgdHJpZ2dlcmVkLCBzZXQgdGhlIGV2ZW50IGNlbnRlciB0byBkcmFnX21pbl9kaXN0YW5jZSBwaXhlbHMgZnJvbSB0aGUgb3JpZ2luYWwgZXZlbnQgY2VudGVyLlxuICAgICAgICAgICAgLy8gV2l0aG91dCB0aGlzIGNvcnJlY3Rpb24sIHRoZSBkcmFnZ2VkIGRpc3RhbmNlIHdvdWxkIGp1bXBzdGFydCBhdCBkcmFnX21pbl9kaXN0YW5jZSBwaXhlbHMgaW5zdGVhZCBvZiBhdCAwLlxuICAgICAgICAgICAgLy8gSXQgbWlnaHQgYmUgdXNlZnVsIHRvIHNhdmUgdGhlIG9yaWdpbmFsIHN0YXJ0IHBvaW50IHNvbWV3aGVyZVxuICAgICAgICAgICAgdmFyIGZhY3RvciA9IE1hdGguYWJzKGluc3Qub3B0aW9ucy5kcmFnX21pbl9kaXN0YW5jZSAvIGV2LmRpc3RhbmNlKTtcbiAgICAgICAgICAgIHN0YXJ0Q2VudGVyLnBhZ2VYICs9IGV2LmRlbHRhWCAqIGZhY3RvcjtcbiAgICAgICAgICAgIHN0YXJ0Q2VudGVyLnBhZ2VZICs9IGV2LmRlbHRhWSAqIGZhY3RvcjtcbiAgICAgICAgICAgIHN0YXJ0Q2VudGVyLmNsaWVudFggKz0gZXYuZGVsdGFYICogZmFjdG9yO1xuICAgICAgICAgICAgc3RhcnRDZW50ZXIuY2xpZW50WSArPSBldi5kZWx0YVkgKiBmYWN0b3I7XG5cbiAgICAgICAgICAgIC8vIHJlY2FsY3VsYXRlIGV2ZW50IGRhdGEgdXNpbmcgbmV3IHN0YXJ0IHBvaW50XG4gICAgICAgICAgICBldiA9IERldGVjdGlvbi5leHRlbmRFdmVudERhdGEoZXYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvY2sgZHJhZyB0byBheGlzP1xuICAgICAgICBpZihjdXIubGFzdEV2ZW50LmRyYWdfbG9ja2VkX3RvX2F4aXMgfHxcbiAgICAgICAgICAgICggaW5zdC5vcHRpb25zLmRyYWdfbG9ja190b19heGlzICYmXG4gICAgICAgICAgICAgIGluc3Qub3B0aW9ucy5kcmFnX2xvY2tfbWluX2Rpc3RhbmNlIDw9IGV2LmRpc3RhbmNlXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgZXYuZHJhZ19sb2NrZWRfdG9fYXhpcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxhc3RfZGlyZWN0aW9uID0gY3VyLmxhc3RFdmVudC5kaXJlY3Rpb247XG4gICAgICAgIGlmKGV2LmRyYWdfbG9ja2VkX3RvX2F4aXMgJiYgbGFzdF9kaXJlY3Rpb24gIT09IGV2LmRpcmVjdGlvbikge1xuICAgICAgICAgIC8vIGtlZXAgZGlyZWN0aW9uIG9uIHRoZSBheGlzIHRoYXQgdGhlIGRyYWcgZ2VzdHVyZSBzdGFydGVkIG9uXG4gICAgICAgICAgaWYoVXRpbHMuaXNWZXJ0aWNhbChsYXN0X2RpcmVjdGlvbikpIHtcbiAgICAgICAgICAgIGV2LmRpcmVjdGlvbiA9IChldi5kZWx0YVkgPCAwKSA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2LmRpcmVjdGlvbiA9IChldi5kZWx0YVggPCAwKSA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpcnN0IHRpbWUsIHRyaWdnZXIgZHJhZ3N0YXJ0IGV2ZW50XG4gICAgICAgIGlmKCF0aGlzLnRyaWdnZXJlZCkge1xuICAgICAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUgKyAnc3RhcnQnLCBldik7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpZ2dlciBldmVudHNcbiAgICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSwgZXYpO1xuICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgZXYuZGlyZWN0aW9uLCBldik7XG5cbiAgICAgICAgdmFyIGlzX3ZlcnRpY2FsID0gVXRpbHMuaXNWZXJ0aWNhbChldi5kaXJlY3Rpb24pO1xuXG4gICAgICAgIC8vIGJsb2NrIHRoZSBicm93c2VyIGV2ZW50c1xuICAgICAgICBpZigoaW5zdC5vcHRpb25zLmRyYWdfYmxvY2tfdmVydGljYWwgJiYgaXNfdmVydGljYWwpIHx8XG4gICAgICAgICAgKGluc3Qub3B0aW9ucy5kcmFnX2Jsb2NrX2hvcml6b250YWwgJiYgIWlzX3ZlcnRpY2FsKSkge1xuICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVZFTlRfRU5EOlxuICAgICAgICAvLyB0cmlnZ2VyIGRyYWdlbmRcbiAgICAgICAgaWYodGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgJ2VuZCcsIGV2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIb2xkXG4gKiBUb3VjaCBzdGF5cyBhdCB0aGUgc2FtZSBwbGFjZSBmb3IgeCB0aW1lXG4gKiBAZXZlbnRzICBob2xkXG4gKi9cbkhhbW1lci5nZXN0dXJlcy5Ib2xkID0ge1xuICBuYW1lICAgIDogJ2hvbGQnLFxuICBpbmRleCAgIDogMTAsXG4gIGRlZmF1bHRzOiB7XG4gICAgaG9sZF90aW1lb3V0ICA6IDUwMCxcbiAgICBob2xkX3RocmVzaG9sZDogMlxuICB9LFxuICB0aW1lciAgIDogbnVsbCxcblxuICBoYW5kbGVyIDogZnVuY3Rpb24gaG9sZEdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICBzd2l0Y2goZXYuZXZlbnRUeXBlKSB7XG4gICAgICBjYXNlIEVWRU5UX1NUQVJUOlxuICAgICAgICAvLyBjbGVhciBhbnkgcnVubmluZyB0aW1lcnNcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgZ2VzdHVyZSBzbyB3ZSBjYW4gY2hlY2sgaW4gdGhlIHRpbWVvdXQgaWYgaXQgc3RpbGwgaXNcbiAgICAgICAgRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSA9IHRoaXMubmFtZTtcblxuICAgICAgICAvLyBzZXQgdGltZXIgYW5kIGlmIGFmdGVyIHRoZSB0aW1lb3V0IGl0IHN0aWxsIGlzIGhvbGQsXG4gICAgICAgIC8vIHdlIHRyaWdnZXIgdGhlIGhvbGQgZXZlbnRcbiAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYoRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSA9PSAnaG9sZCcpIHtcbiAgICAgICAgICAgIGluc3QudHJpZ2dlcignaG9sZCcsIGV2KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGluc3Qub3B0aW9ucy5ob2xkX3RpbWVvdXQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gd2hlbiB5b3UgbW92ZSBvciBlbmQgd2UgY2xlYXIgdGhlIHRpbWVyXG4gICAgICBjYXNlIEVWRU5UX01PVkU6XG4gICAgICAgIGlmKGV2LmRpc3RhbmNlID4gaW5zdC5vcHRpb25zLmhvbGRfdGhyZXNob2xkKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVWRU5UX0VORDpcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogUmVsZWFzZVxuICogQ2FsbGVkIGFzIGxhc3QsIHRlbGxzIHRoZSB1c2VyIGhhcyByZWxlYXNlZCB0aGUgc2NyZWVuXG4gKiBAZXZlbnRzICByZWxlYXNlXG4gKi9cbkhhbW1lci5nZXN0dXJlcy5SZWxlYXNlID0ge1xuICBuYW1lICAgOiAncmVsZWFzZScsXG4gIGluZGV4ICA6IEluZmluaXR5LFxuICBoYW5kbGVyOiBmdW5jdGlvbiByZWxlYXNlR2VzdHVyZShldiwgaW5zdCkge1xuICAgIGlmKGV2LmV2ZW50VHlwZSA9PSBFVkVOVF9FTkQpIHtcbiAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUsIGV2KTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU3dpcGVcbiAqIHRyaWdnZXJzIHN3aXBlIGV2ZW50cyB3aGVuIHRoZSBlbmQgdmVsb2NpdHkgaXMgYWJvdmUgdGhlIHRocmVzaG9sZFxuICogZm9yIGJlc3QgdXNhZ2UsIHNldCBwcmV2ZW50X2RlZmF1bHQgKG9uIHRoZSBkcmFnIGdlc3R1cmUpIHRvIHRydWVcbiAqIEBldmVudHMgIHN3aXBlLCBzd2lwZWxlZnQsIHN3aXBlcmlnaHQsIHN3aXBldXAsIHN3aXBlZG93blxuICovXG5IYW1tZXIuZ2VzdHVyZXMuU3dpcGUgPSB7XG4gIG5hbWUgICAgOiAnc3dpcGUnLFxuICBpbmRleCAgIDogNDAsXG4gIGRlZmF1bHRzOiB7XG4gICAgc3dpcGVfbWluX3RvdWNoZXM6IDEsXG4gICAgc3dpcGVfbWF4X3RvdWNoZXM6IDEsXG4gICAgc3dpcGVfdmVsb2NpdHkgICA6IDAuN1xuICB9LFxuICBoYW5kbGVyIDogZnVuY3Rpb24gc3dpcGVHZXN0dXJlKGV2LCBpbnN0KSB7XG4gICAgaWYoZXYuZXZlbnRUeXBlID09IEVWRU5UX0VORCkge1xuICAgICAgLy8gbWF4IHRvdWNoZXNcbiAgICAgIGlmKGV2LnRvdWNoZXMubGVuZ3RoIDwgaW5zdC5vcHRpb25zLnN3aXBlX21pbl90b3VjaGVzIHx8XG4gICAgICAgIGV2LnRvdWNoZXMubGVuZ3RoID4gaW5zdC5vcHRpb25zLnN3aXBlX21heF90b3VjaGVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gd2hlbiB0aGUgZGlzdGFuY2Ugd2UgbW92ZWQgaXMgdG9vIHNtYWxsIHdlIHNraXAgdGhpcyBnZXN0dXJlXG4gICAgICAvLyBvciB3ZSBjYW4gYmUgYWxyZWFkeSBpbiBkcmFnZ2luZ1xuICAgICAgaWYoZXYudmVsb2NpdHlYID4gaW5zdC5vcHRpb25zLnN3aXBlX3ZlbG9jaXR5IHx8XG4gICAgICAgIGV2LnZlbG9jaXR5WSA+IGluc3Qub3B0aW9ucy5zd2lwZV92ZWxvY2l0eSkge1xuICAgICAgICAvLyB0cmlnZ2VyIHN3aXBlIGV2ZW50c1xuICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lLCBldik7XG4gICAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUgKyBldi5kaXJlY3Rpb24sIGV2KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVGFwL0RvdWJsZVRhcFxuICogUXVpY2sgdG91Y2ggYXQgYSBwbGFjZSBvciBkb3VibGUgYXQgdGhlIHNhbWUgcGxhY2VcbiAqIEBldmVudHMgIHRhcCwgZG91YmxldGFwXG4gKi9cbkhhbW1lci5nZXN0dXJlcy5UYXAgPSB7XG4gIG5hbWUgICAgOiAndGFwJyxcbiAgaW5kZXggICA6IDEwMCxcbiAgZGVmYXVsdHM6IHtcbiAgICB0YXBfbWF4X3RvdWNodGltZSA6IDI1MCxcbiAgICB0YXBfbWF4X2Rpc3RhbmNlICA6IDEwLFxuICAgIHRhcF9hbHdheXMgICAgICAgIDogdHJ1ZSxcbiAgICBkb3VibGV0YXBfZGlzdGFuY2U6IDIwLFxuICAgIGRvdWJsZXRhcF9pbnRlcnZhbDogMzAwXG4gIH0sXG5cbiAgaGFzX21vdmVkOiBmYWxzZSxcblxuICBoYW5kbGVyIDogZnVuY3Rpb24gdGFwR2VzdHVyZShldiwgaW5zdCkge1xuICAgIHZhciBwcmV2LCBzaW5jZV9wcmV2LCBkaWRfZG91YmxldGFwO1xuXG4gICAgLy8gcmVzZXQgbW92ZWQgc3RhdGVcbiAgICBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfU1RBUlQpIHtcbiAgICAgIHRoaXMuaGFzX21vdmVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgdGhlIGRpc3RhbmNlIHdlJ3ZlIG1vdmVkLiBJZiBpdCdzIGFib3ZlIHRoZSBtYXggT05DRSwgcmVtZW1iZXIgdGhhdCAoZml4ZXMgIzQwNikuXG4gICAgZWxzZSBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfTU9WRSAmJiAhdGhpcy5tb3ZlZCkge1xuICAgICAgdGhpcy5oYXNfbW92ZWQgPSAoZXYuZGlzdGFuY2UgPiBpbnN0Lm9wdGlvbnMudGFwX21heF9kaXN0YW5jZSk7XG4gICAgfVxuXG4gICAgZWxzZSBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfRU5EICYmXG4gICAgICAgIGV2LnNyY0V2ZW50LnR5cGUgIT0gJ3RvdWNoY2FuY2VsJyAmJlxuICAgICAgICBldi5kZWx0YVRpbWUgPCBpbnN0Lm9wdGlvbnMudGFwX21heF90b3VjaHRpbWUgJiYgIXRoaXMuaGFzX21vdmVkKSB7XG5cbiAgICAgIC8vIHByZXZpb3VzIGdlc3R1cmUsIGZvciB0aGUgZG91YmxlIHRhcCBzaW5jZSB0aGVzZSBhcmUgdHdvIGRpZmZlcmVudCBnZXN0dXJlIGRldGVjdGlvbnNcbiAgICAgIHByZXYgPSBEZXRlY3Rpb24ucHJldmlvdXM7XG4gICAgICBzaW5jZV9wcmV2ID0gcHJldiAmJiBwcmV2Lmxhc3RFdmVudCAmJiBldi50aW1lU3RhbXAgLSBwcmV2Lmxhc3RFdmVudC50aW1lU3RhbXA7XG4gICAgICBkaWRfZG91YmxldGFwID0gZmFsc2U7XG5cbiAgICAgIC8vIGNoZWNrIGlmIGRvdWJsZSB0YXBcbiAgICAgIGlmKHByZXYgJiYgcHJldi5uYW1lID09ICd0YXAnICYmXG4gICAgICAgICAgKHNpbmNlX3ByZXYgJiYgc2luY2VfcHJldiA8IGluc3Qub3B0aW9ucy5kb3VibGV0YXBfaW50ZXJ2YWwpICYmXG4gICAgICAgICAgZXYuZGlzdGFuY2UgPCBpbnN0Lm9wdGlvbnMuZG91YmxldGFwX2Rpc3RhbmNlKSB7XG4gICAgICAgIGluc3QudHJpZ2dlcignZG91YmxldGFwJywgZXYpO1xuICAgICAgICBkaWRfZG91YmxldGFwID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZG8gYSBzaW5nbGUgdGFwXG4gICAgICBpZighZGlkX2RvdWJsZXRhcCB8fCBpbnN0Lm9wdGlvbnMudGFwX2Fsd2F5cykge1xuICAgICAgICBEZXRlY3Rpb24uY3VycmVudC5uYW1lID0gJ3RhcCc7XG4gICAgICAgIGluc3QudHJpZ2dlcihEZXRlY3Rpb24uY3VycmVudC5uYW1lLCBldik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFRvdWNoXG4gKiBDYWxsZWQgYXMgZmlyc3QsIHRlbGxzIHRoZSB1c2VyIGhhcyB0b3VjaGVkIHRoZSBzY3JlZW5cbiAqIEBldmVudHMgIHRvdWNoXG4gKi9cbkhhbW1lci5nZXN0dXJlcy5Ub3VjaCA9IHtcbiAgbmFtZSAgICA6ICd0b3VjaCcsXG4gIGluZGV4ICAgOiAtSW5maW5pdHksXG4gIGRlZmF1bHRzOiB7XG4gICAgLy8gY2FsbCBwcmV2ZW50RGVmYXVsdCBhdCB0b3VjaHN0YXJ0LCBhbmQgbWFrZXMgdGhlIGVsZW1lbnQgYmxvY2tpbmcgYnlcbiAgICAvLyBkaXNhYmxpbmcgdGhlIHNjcm9sbGluZyBvZiB0aGUgcGFnZSwgYnV0IGl0IGltcHJvdmVzIGdlc3R1cmVzIGxpa2VcbiAgICAvLyB0cmFuc2Zvcm1pbmcgYW5kIGRyYWdnaW5nLlxuICAgIC8vIGJlIGNhcmVmdWwgd2l0aCB1c2luZyB0aGlzLCBpdCBjYW4gYmUgdmVyeSBhbm5veWluZyBmb3IgdXNlcnMgdG8gYmUgc3R1Y2tcbiAgICAvLyBvbiB0aGUgcGFnZVxuICAgIHByZXZlbnRfZGVmYXVsdCAgICA6IGZhbHNlLFxuXG4gICAgLy8gZGlzYWJsZSBtb3VzZSBldmVudHMsIHNvIG9ubHkgdG91Y2ggKG9yIHBlbiEpIGlucHV0IHRyaWdnZXJzIGV2ZW50c1xuICAgIHByZXZlbnRfbW91c2VldmVudHM6IGZhbHNlXG4gIH0sXG4gIGhhbmRsZXIgOiBmdW5jdGlvbiB0b3VjaEdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICBpZihpbnN0Lm9wdGlvbnMucHJldmVudF9tb3VzZWV2ZW50cyAmJlxuICAgICAgICBldi5wb2ludGVyVHlwZSA9PSBQT0lOVEVSX01PVVNFKSB7XG4gICAgICBldi5zdG9wRGV0ZWN0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoaW5zdC5vcHRpb25zLnByZXZlbnRfZGVmYXVsdCkge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpZihldi5ldmVudFR5cGUgPT0gRVZFTlRfU1RBUlQpIHtcbiAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUsIGV2KTtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBUcmFuc2Zvcm1cbiAqIFVzZXIgd2FudCB0byBzY2FsZSBvciByb3RhdGUgd2l0aCAyIGZpbmdlcnNcbiAqIEBldmVudHMgIHRyYW5zZm9ybSwgcGluY2gsIHBpbmNoaW4sIHBpbmNob3V0LCByb3RhdGVcbiAqL1xuSGFtbWVyLmdlc3R1cmVzLlRyYW5zZm9ybSA9IHtcbiAgbmFtZSAgICAgOiAndHJhbnNmb3JtJyxcbiAgaW5kZXggICAgOiA0NSxcbiAgZGVmYXVsdHMgOiB7XG4gICAgLy8gZmFjdG9yLCBubyBzY2FsZSBpcyAxLCB6b29taW4gaXMgdG8gMCBhbmQgem9vbW91dCB1bnRpbCBoaWdoZXIgdGhlbiAxXG4gICAgdHJhbnNmb3JtX21pbl9zY2FsZSAgICAgIDogMC4wMSxcbiAgICAvLyByb3RhdGlvbiBpbiBkZWdyZWVzXG4gICAgdHJhbnNmb3JtX21pbl9yb3RhdGlvbiAgIDogMSxcbiAgICAvLyBwcmV2ZW50IGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciB3aGVuIHR3byB0b3VjaGVzIGFyZSBvbiB0aGUgc2NyZWVuXG4gICAgLy8gYnV0IGl0IG1ha2VzIHRoZSBlbGVtZW50IGEgYmxvY2tpbmcgZWxlbWVudFxuICAgIC8vIHdoZW4geW91IGFyZSB1c2luZyB0aGUgdHJhbnNmb3JtIGdlc3R1cmUsIGl0IGlzIGEgZ29vZCBwcmFjdGljZSB0byBzZXQgdGhpcyB0cnVlXG4gICAgdHJhbnNmb3JtX2Fsd2F5c19ibG9jayAgIDogZmFsc2UsXG4gICAgLy8gZW5zdXJlcyB0aGF0IGFsbCB0b3VjaGVzIG9jY3VycmVkIHdpdGhpbiB0aGUgaW5zdGFuY2UgZWxlbWVudFxuICAgIHRyYW5zZm9ybV93aXRoaW5faW5zdGFuY2U6IGZhbHNlXG4gIH0sXG5cbiAgdHJpZ2dlcmVkOiBmYWxzZSxcblxuICBoYW5kbGVyICA6IGZ1bmN0aW9uIHRyYW5zZm9ybUdlc3R1cmUoZXYsIGluc3QpIHtcbiAgICAvLyBjdXJyZW50IGdlc3R1cmUgaXNudCBkcmFnLCBidXQgZHJhZ2dlZCBpcyB0cnVlXG4gICAgLy8gdGhpcyBtZWFucyBhbiBvdGhlciBnZXN0dXJlIGlzIGJ1c3kuIG5vdyBjYWxsIGRyYWdlbmRcbiAgICBpZihEZXRlY3Rpb24uY3VycmVudC5uYW1lICE9IHRoaXMubmFtZSAmJiB0aGlzLnRyaWdnZXJlZCkge1xuICAgICAgaW5zdC50cmlnZ2VyKHRoaXMubmFtZSArICdlbmQnLCBldik7XG4gICAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGF0IGxlYXN0IG11bHRpdG91Y2hcbiAgICBpZihldi50b3VjaGVzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBwcmV2ZW50IGRlZmF1bHQgd2hlbiB0d28gZmluZ2VycyBhcmUgb24gdGhlIHNjcmVlblxuICAgIGlmKGluc3Qub3B0aW9ucy50cmFuc2Zvcm1fYWx3YXlzX2Jsb2NrKSB7XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGFsbCB0b3VjaGVzIG9jY3VycmVkIHdpdGhpbiB0aGUgaW5zdGFuY2UgZWxlbWVudFxuICAgIGlmKGluc3Qub3B0aW9ucy50cmFuc2Zvcm1fd2l0aGluX2luc3RhbmNlKSB7XG4gICAgICBmb3IodmFyIGk9LTE7IGV2LnRvdWNoZXNbKytpXTspIHtcbiAgICAgICAgaWYoIVV0aWxzLmhhc1BhcmVudChldi50b3VjaGVzW2ldLnRhcmdldCwgaW5zdC5lbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN3aXRjaChldi5ldmVudFR5cGUpIHtcbiAgICAgIGNhc2UgRVZFTlRfU1RBUlQ6XG4gICAgICAgIHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEVWRU5UX01PVkU6XG4gICAgICAgIHZhciBzY2FsZV90aHJlc2hvbGQgPSBNYXRoLmFicygxIC0gZXYuc2NhbGUpO1xuICAgICAgICB2YXIgcm90YXRpb25fdGhyZXNob2xkID0gTWF0aC5hYnMoZXYucm90YXRpb24pO1xuXG4gICAgICAgIC8vIHdoZW4gdGhlIGRpc3RhbmNlIHdlIG1vdmVkIGlzIHRvbyBzbWFsbCB3ZSBza2lwIHRoaXMgZ2VzdHVyZVxuICAgICAgICAvLyBvciB3ZSBjYW4gYmUgYWxyZWFkeSBpbiBkcmFnZ2luZ1xuICAgICAgICBpZihzY2FsZV90aHJlc2hvbGQgPCBpbnN0Lm9wdGlvbnMudHJhbnNmb3JtX21pbl9zY2FsZSAmJlxuICAgICAgICAgIHJvdGF0aW9uX3RocmVzaG9sZCA8IGluc3Qub3B0aW9ucy50cmFuc2Zvcm1fbWluX3JvdGF0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgYXJlIHRyYW5zZm9ybWluZyFcbiAgICAgICAgRGV0ZWN0aW9uLmN1cnJlbnQubmFtZSA9IHRoaXMubmFtZTtcblxuICAgICAgICAvLyBmaXJzdCB0aW1lLCB0cmlnZ2VyIGRyYWdzdGFydCBldmVudFxuICAgICAgICBpZighdGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgJ3N0YXJ0JywgZXYpO1xuICAgICAgICAgIHRoaXMudHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluc3QudHJpZ2dlcih0aGlzLm5hbWUsIGV2KTsgLy8gYmFzaWMgdHJhbnNmb3JtIGV2ZW50XG5cbiAgICAgICAgLy8gdHJpZ2dlciByb3RhdGUgZXZlbnRcbiAgICAgICAgaWYocm90YXRpb25fdGhyZXNob2xkID4gaW5zdC5vcHRpb25zLnRyYW5zZm9ybV9taW5fcm90YXRpb24pIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIoJ3JvdGF0ZScsIGV2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyaWdnZXIgcGluY2ggZXZlbnRcbiAgICAgICAgaWYoc2NhbGVfdGhyZXNob2xkID4gaW5zdC5vcHRpb25zLnRyYW5zZm9ybV9taW5fc2NhbGUpIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIoJ3BpbmNoJywgZXYpO1xuICAgICAgICAgIGluc3QudHJpZ2dlcigncGluY2gnICsgKGV2LnNjYWxlPDEgPyAnaW4nIDogJ291dCcpLCBldik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRVZFTlRfRU5EOlxuICAgICAgICAvLyB0cmlnZ2VyIGRyYWdlbmRcbiAgICAgICAgaWYodGhpcy50cmlnZ2VyZWQpIHtcbiAgICAgICAgICBpbnN0LnRyaWdnZXIodGhpcy5uYW1lICsgJ2VuZCcsIGV2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxuLy8gQU1EIGV4cG9ydFxuaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEhhbW1lcjtcbiAgfSk7XG59XG4vLyBjb21tb25qcyBleHBvcnRcbmVsc2UgaWYodHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IEhhbW1lcjtcbn1cbi8vIGJyb3dzZXIgZXhwb3J0XG5lbHNlIHtcbiAgd2luZG93LkhhbW1lciA9IEhhbW1lcjtcbn1cblxufSkod2luZG93KTsiXX0=
