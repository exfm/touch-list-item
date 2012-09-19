(function(){
    "use strict";   
    
function TouchListItem(el, opts){

    // Is this a touch device? Or just mouse clicks?
    this.isTouchDevice = 'ontouchstart' in document.documentElement;
    
    // the element we are attaching to. Required.
    if(el){
        this.el = el;
        this.removeListeners();
        this.addListeners();
    }
    else{
        throw new TypeError("You must provide an element");
    }
    
    
    // should we add rgba(0,0,0,0) to webkitTapHighlightColor style on 
    // element to remove the tap highlight?
    this.removeTapHighlight = true;
    
    // should we add 'none' to webkitTouchCallout style on element
    // to remove touchCallout?
    this.removeTouchCallout = true;
    
    // should we add 'none' to webkitUserSelect style on element
    // to remove userSelect?
    this.removeUserSelect = true;
    
    // How long does touch need to go before we register it?
    this.timeoutMs = 100;
    
    // the class we will add to element on touchstart
    this.touchStartClass = 'touchstart';
    
    // extend all options passed in to this
    $.extend(this, opts);  
    
    // Keep track of the setTimeout
    this.timeout = null;
    
    // boolean if the element has touchStart class 
    this.hasTouchStartClass = false;
    
    this.addStyleOptions();
    
}

// remove touch and click listeners to the element
// if it is not a touch device, add 'click' listener
TouchListItem.prototype.removeListeners = function(){
    this.el.removeEventListener(
        'touchstart', 
        this.bindedTouchStartListener
    );
    this.el.removeEventListener(
        'touchend', 
        this.bindedTouchEndListener
    );
    this.el.removeEventListener(
        'touchmove', 
        this.bindedTouchMoveListener
    );
    this.el.removeEventListener(
        'click', 
        this.bindedClickListener
    );
}

// add touch listeners to the element
TouchListItem.prototype.addListeners = function(){
    if(this.isTouchDevice){
        this.bindedTouchStartListener = this.touchStartListener.bind(this);
        this.bindedTouchEndListener = this.touchEndListener.bind(this);
        this.bindedTouchMoveListener = this.touchMoveListener.bind(this);
        this.el.addEventListener(
            "touchstart", 
            this.bindedTouchStartListener, 
            true
        );
        this.el.addEventListener(
            "touchend", 
            this.bindedTouchEndListener, 
            true
        );
        this.el.addEventListener(
            "touchmove", 
            this.bindedTouchMoveListener, 
            true
        );
    }
    else{
        this.bindedClickListener = this.clickListener.bind(this);
        this.el.addEventListener(
            'click', 
            this.bindedClickListener, 
            false
        );
    }
}

// Add styles based on instance options
TouchListItem.prototype.addStyleOptions = function(){
    if(this.removeTapHighlight){
        $(this.el).css(
            'webkitTapHighlightColor', 
            'rgba(0,0,0,0)'
        );
    };
    if(this.removeTouchCallout){
        $(this.el).css(
            'webkitTouchCallout', 
            'none'
        );
    };
    if (this.removeUserSelect) {
        $(this.el).css(
            'webkitUserSelect', 
            'none'
        );
    };
}

// add touchStartClass to element. 
// remove touchEndClass
TouchListItem.prototype.addTouchStartClass = function(e){
    if (this.hasTouchStartClass == false){
        if(this.touchEndClass){
            $(this.el).removeClass(this.touchEndClass);
        }
        $(this.el).addClass(this.touchStartClass);
        this.hasTouchStartClass = true;
    }
}

// add touchEndClass to element
// remove touchStartClass
TouchListItem.prototype.removeTouchStartClass = function(e){
    if (this.hasTouchStartClass == true){
        $(this.el).removeClass(this.touchStartClass);
        if(this.touchEndClass){
            $(this.el).addClass(this.touchEndClass);
        }
        this.hasTouchStartClass = false;
    }
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
    $(this.el).removeClass(this.touchEndClass);
}

// for non-touch devices. Trigger a 'touched' event on click.
TouchListItem.prototype.clickListener = function(e){
    $(this.el).trigger('touched');
}

// check if we've got require
if(typeof module !== "undefined"){
    module.exports = TouchListItem;
}
else{
    window.TouchListItem = TouchListItem;
}
    
}());