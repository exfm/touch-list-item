(function(){
    "use strict";   
    
function TouchListItem(el, opts){
    
    // the element we are attaching to. Required.
    if(el){
        this.el = el;
        this.addListeners();
    }
    else{
        throw new TypeError("You must provide an element");
    }
    
    var touchElement;
    
    // requires touch-element as super
    if(typeof module !== "undefined"){
        var TouchElement = require('touch-element');
        touchElement = new TouchElement(this.el);
    }
    else{
        touchElement = new window.TouchElement(this.el, opts);
    }
    $.extend(this, touchElement);
    
    
    // How long does touch need to go before we register it?
    this.timeoutMs = 100;
    
    // extend all options passed in to this
    $.extend(this, opts);  
    
    // Keep track of the setTimeout
    this.timeout = null;
    
}

// inherit from touch-element
//util.inherits(TouchListItem, touchElement);

// add touch listeners to the element
TouchListItem.prototype.addListeners = function(){
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