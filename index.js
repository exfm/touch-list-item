(function(){
    "use strict";   
    

function TouchListItem(el, opts){
    
    // Is this a touch device? Or just mouse clicks?
    this.isTouchDevice = 'ontouchstart' in document.documentElement;
    
    // $ cache the element
    this.el = $(el);
        
    // add our listeners
    this.addListeners();
    
    // should we add rgba(0,0,0,0) to webkitTapHighlightColor style on 
    // element children to remove the tap highlight?
    this.removeTapHighlight = true;
    
    // should we add 'none' to webkitTouchCallout style on element
    // children to remove touchCallout?
    this.removeTouchCallout = true;
    
    // should we add 'none' to webkitUserSelect style on element
    //  childrento remove userSelect?
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
    
    return this.el;
}

// add touch listeners to the element
TouchListItem.prototype.addListeners = function(){
    this.removeListeners();
    if(this.isTouchDevice){
        this.bindedTouchStartListener = this.touchStartListener.bind(this);
        this.bindedTouchEndListener = this.touchEndListener.bind(this);
        this.bindedTouchMoveListener = this.touchMoveListener.bind(this);
        this.el.bind(
            "touchstart", 
            this.bindedTouchStartListener, 
            true
        );
        this.el.bind(
            "touchend", 
            this.bindedTouchEndListener, 
            true
        );
        this.el.bind(
            "touchmove", 
            this.bindedTouchMoveListener, 
            true
        );
    }
    else{
        this.bindedClickListener = this.clickListener.bind(this);
        this.el.bind(
            'click', 
            this.bindedClickListener, 
            false
        );
    }
}

// remove touch and click listeners to the element
// if it is not a touch device, add 'click' listener
TouchListItem.prototype.removeListeners = function(){
    this.el.unbind(
        'touchstart', 
        this.bindedTouchStartListener
    );
    this.el.unbind(
        'touchend', 
        this.bindedTouchEndListener
    );
    this.el.unbind(
        'touchmove', 
        this.bindedTouchMoveListener
    );
    this.el.unbind(
        'click', 
        this.bindedClickListener
    );
}

// Add styles based on instance options
TouchListItem.prototype.addStyleOptions = function(){
    if(this.removeTapHighlight){
        this.el.children().css(
            'webkitTapHighlightColor', 
            'rgba(0,0,0,0)'
        );
    };
    if(this.removeTouchCallout){
        this.el.children().css(
            'webkitTouchCallout', 
            'none'
        );
    };
    if (this.removeUserSelect) {
        this.el.children().css(
            'webkitUserSelect', 
            'none'
        );
    };
}

// add touchStartClass to element. 
// remove touchEndClass
TouchListItem.prototype.addTouchStartClass = function(el){
    $(el).removeClass(this.touchEndClass)
        .addClass(this.touchStartClass);
}

TouchListItem.prototype.getTarget = function(el){
    var target = el;
    if(this.listItemClass){
        if($(el).hasClass(this.listItemClass)){
            target = el;
        }
        else{
            target = $(el).parents('.'+this.listItemClass);
        }
    }
    return target;
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
            var target = this.getTarget(e.target);
            this.addTouchStartClass(target)
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
        var target = this.getTarget(e.target);
        $(target).removeClass(this.touchStartClass)
            .addClass(this.touchEndClass);
        this.el.trigger('touched', {
            'touchedElement': target
        });
    }
}

// listen for 'touchmove' event. Clear the timeout
// set this.moved to true
// and remove the touchStartClass and touchEndClass from element
TouchListItem.prototype.touchMoveListener = function(e){
    this.moved = true;
    clearTimeout(this.timeout);
    $(this.el.children()).removeClass(this.touchStartClass)
        .removeClass(this.touchEndClass);
}

// for non-touch devices. Trigger a 'touched' event on click.
TouchListItem.prototype.clickListener = function(e){
    var target = this.getTarget(e.target);
    this.el.trigger(
        'touched', 
        {
            'touchedElement': target
        }
    );
}

// check if we've got require
if(typeof module !== "undefined"){
    module.exports = TouchListItem;
}
else{
    window.TouchListItem = TouchListItem;
}
    
}());