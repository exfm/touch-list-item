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
    
    // the class we will add to the element on touchend
    this.touchEndClass = '';
    
    // extend all options passed in to this
    $.extend(this, opts);  
    
    // Keep track of the setTimeout
    this.timeout = null;
    
    // boolean if the element parent moved
    this.moved = false;
    
    this.addStyleOptions();
    
}

// add touch listeners to the element
TouchListItem.prototype.addListeners = function(){
    this.removeListeners();
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
        this.el.parentNode.addEventListener(
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
    this.el.parentNode.removeEventListener(
        'touchmove', 
        this.bindedTouchMoveListener
    );
    this.el.removeEventListener(
        'click', 
        this.bindedClickListener
    );
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
    $(this.el).removeClass(this.touchEndClass)
        .addClass(this.touchStartClass);
}


// listen for 'touchstart' event. Set a timer for timeoutMs 
// After that time has passed if we are still touching, add
// touchStartClass to element.
// addTouchStartClass comes from touch-element
TouchListItem.prototype.touchStartListener = function(e){
    this.moved = false;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(
        function(){ 
            this.addTouchStartClass(e)
        }.bind(this),
        this.timeoutMs 
    );
}

// listen for 'touchend' event. Clear the timeout
// if the element's parent didn't move, remove touchStarClass
// add touchEndClass and fire 'touched' event
TouchListItem.prototype.touchEndListener = function(e){
    clearTimeout(this.timeout);
    if(this.moved == false){
        $(this.el).removeClass(this.touchStartClass)
            .addClass(this.touchEndClass)
            .trigger('touched');
    }
}

// listen for 'touchmove' event. Clear the timeout
// set this.moved to true
// and remove the touchStartClass and touchEndClass from element
TouchListItem.prototype.touchMoveListener = function(e){
    this.moved = true;
    clearTimeout(this.timeout);
    $(this.el).removeClass(this.touchStartClass)
        .removeClass(this.touchEndClass);
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