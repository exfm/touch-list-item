(function(){
    "use strict";
    
    var util = require('util'),
        touchElement = require('touch-element');    
    
function TouchListItem(el, opts){

    // the element we are attaching to. Required.
    if(el){
        this.el = el;
        this.addListeners();
    }
    else{
        throw new TypeError("You must provide an element");
    }
    
    // the class we will add to the element when touch starts
    this.touchStartClass = opts.touchStartClass || "touchstart";
    
    // the class we will add to the element when touch ends
    this.touchEndClass = opts.touchEndClass || null;
    
    // should we add rgba(0,0,0,0) to webkitTapHighlightColor style on 
    // element to remove the tap highlight?
    this.removeTapHighlight = opts.removeTapHighlight || true;
    if(this.removeTapHighlight){
        this.el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
    };

    // should we add 'none' to webkitTouchCallout style on element
    // to remove touchCallout?
    this.removeTouchCallout = opts.removeTouchCallout || true;
    if(this.removeTouchCallout){
        this.el.style.webkitTouchCallout = "none";
    };

    // should we add 'none' to webkitUserSelect style on element
    // to remove userSelect?
    this.removeUserSelect = opts.removeUserSelect || true;
    if (this.removeUserSelect) {
        this.el.style.webkitUserSelect = "none";
    };
    
    // How long does touch need to go before we register it?
    this.timeoutMs = opts.timeoutMs || 100;
    
    // Keep track of the setTimeout
    this.timeout = null;
    
}

// inherit from touch-element
util.inherits(TouchListItem, touchElement);

// add touch listeners to the element
TouchListItem.prototype.addListeners(){
    this.el.addEventListener(
        "touchstart", 
        this.touchStartListener.bind(this), 
        true
    );
    this.el.addEventListener(
        "touchend", 
        this.touchEndListener.bind(this), 
        true
    );
    this.el.addEventListener(
        "touchmove", 
        this.touchMoveListener.bind(this), 
        true
    );
}

// listen for 'touchstart' event. Set a timer for timeoutMs 
// After that time has passed if we are still touching, add
// touchStartClass to element.
// addTouchStartClass comes from touch-element
TouchListItem.prototype.touchStartListener = function(e){
    this.timeout = setTimeout(
        function(){ 
            this.addTouchStartClass(e)
        }.bind(this),
        this.timeoutMs 
    );
}

// listen for 'touchend' event. Clear the timeout
// and remove the touchStartClass from element
// removeTouchStartClass comes from touch-element
TouchListItem.prototype.touchEndListener = function(e){
    clearTimeout(this.timeout);
    this.removeTouchStartClass(e);
}

// listen for 'touchmove' event. Clear the timeout
// and remove the touchStartClass from element
// removeTouchStartClass comes from touch-element
TouchListItem.prototype.touchMoveListener = function(e){
    clearTimeout(this.timeout);
    this.removeTouchStartClass(e);
}

// check if we've got require
if(typeof module !== "undefined"){
    module.exports = TouchListItem;
}
else{
    window.TouchListItem = TouchListItem;
}
    
}());