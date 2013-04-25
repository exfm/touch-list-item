(function(){
    "use strict";   
    

function TouchListItem(el, opts){
    
    // Is this a touch device? Or just mouse clicks?
    this.isTouchDevice = 'ontouchstart' in document.documentElement;
    
    // Hardcode ChromeOS to be report as a non-touch device
    if(navigator.appVersion.indexOf('CrOS') != -1){
        this.isTouchDevice = false;
    };
    
    // $ cache the element
    this.el = $(el);
    
    // should we add rgba(0,0,0,0) to webkitTapHighlightColor style on 
    // element children to remove the tap highlight?
    this.removeTapHighlight = false;
    
    // should we add 'none' to webkitTouchCallout style on element
    // children to remove touchCallout?
    this.removeTouchCallout = false;
    
    // should we add 'none' to webkitUserSelect style on element
    //  children to remove userSelect?
    this.removeUserSelect = false;
    
    // should we add 'translate3d(0,0,0)' to webkitTransform style on element
    //  children for iOS5 fix?
    this.addTranslate3d = /OS 5(_\d)+ like Mac OS X/i.test(navigator.userAgent);
    
    // How long does touch need to go before we register it?
    this.timeoutMs = 100;
    
    // the class we will add to element on touchstart
    this.touchStartClass = 'touchstart';
    
    // the class we will add to the element on touchend
    this.touchEndClass = '';
    
    // boolean if we should trigger 'hitBottom' event
    this.triggerHitBottom = false;
    
    // boolean if we should trigger 'refresh' event
    this.triggerRefresh = false;
    
    // the class we will add to the refreshTarget if specified
    this.refreshClass = 'refreshing';
    
    // the negative threshold that triggers a refresh
    this.refreshThreshold = -80;
    
    // extend all options passed in to this
    $.extend(this, opts);  
    
    // cache the refresh target element
    if(this.triggerRefresh === true){
        this.refreshTarget =  $(this.refreshTarget);
    };
    
    // Keep track of the setTimeout
    this.timeout = null;
    
    // boolean if the element parent moved
    this.moved = false;
    
    // boolean if refresh happened
    this.shouldRefresh = false;
    
    this.addStyleOptions();
    
    // add our listeners
    this.addListeners();
    
    // boolean if user currently touching
    this.isTouching = false;
    
    // boolean if user is currently scrolling
    this.isScrolling = false;
    
    // requestAnimationFrame
    this.rAF = window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    
    return this.el;
};

// add touch listeners to the element
TouchListItem.prototype.addListeners = function(){
    this.removeListeners();
    if(this.isTouchDevice){
        this.bindedTouchStartListener = this.touchStartListener.bind(this);
        this.bindedTouchEndListener = this.touchEndListener.bind(this);
        this.bindedTouchMoveListener = this.touchMoveListener.bind(this);
        this.el.on(
            "touchstart", 
            this.bindedTouchStartListener, 
            true
        );
        this.el.on(
            "touchend", 
            this.bindedTouchEndListener, 
            true
        );
        this.el.on(
            "touchmove", 
            this.bindedTouchMoveListener, 
            true
        );
    }
    else{
        this.bindedClickListener = this.clickListener.bind(this);
        this.el.on(
            'click', 
            this.bindedClickListener, 
            false
        );
    }
    if(this.triggerHitBottom === true){
        this.hitBottomTriggered = false;
    };
    this.bindedScrollListener = this.scrollListener.bind(this);
    this.el.on(
        'scroll', 
        this.bindedScrollListener, 
        true
    );
};

// remove touch and click listeners to the element
// if it is not a touch device, add 'click' listener
TouchListItem.prototype.removeListeners = function(){
    this.el.off(
        'touchstart', 
        this.bindedTouchStartListener
    );
    this.el.off(
        'touchend', 
        this.bindedTouchEndListener
    );
    this.el.off(
        'touchmove', 
        this.bindedTouchMoveListener
    );
    this.el.off(
        'click', 
        this.bindedClickListener
    );
    this.el.off(
        'scroll', 
        this.bindedScrollListener
    );
};

// Add styles based on instance options
TouchListItem.prototype.addStyleOptions = function(){
    var addStyle = false;
    var children = [];
    if(this.listItemClass){
        children = this.el.find('.'+this.listItemClass);
    }
    else{
        children = this.el.children();
    };
    var style = {};
    if(this.removeTapHighlight){
        style['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
        addStyle = true;
    };
    if(this.removeTouchCallout){
        style['-webkit-touch-callout'] = 'none';
        addStyle = true;
    };
    if(this.removeUserSelect) {
        style['-webkit-user-select'] = 'none';
        addStyle = true;
    };
    if(this.addTranslate3d){
        style['-webkit-transform'] = 'translate3d(0,0,0)';
        addStyle = true;
    };
    if(addStyle === true){
        this.requestAnimationFrame(
            function(){
                children.css(style);
            }
        );
    }
};

// get the target from the liteItemClass option
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
};

// check for avoid targets
TouchListItem.prototype.isAvoidTarget = function(el){
    if(!this.avoidClass){
        return false;
    }
    else{
        return $(el).hasClass(this.avoidClass);
    }
};


// listen for 'touchstart' event. Set a timer for timeoutMs 
// After that time has passed if we are still touching, add
// touchStartClass to element.
// addTouchStartClass comes from touch-element
TouchListItem.prototype.touchStartListener = function(e){
    this.isTouching = true;
    if(this.isScrolling === false){
        if(this.isAvoidTarget(e.target) === false){
            this.moved = false;
            clearTimeout(this.timeout);
             this.timeout = setTimeout(
                function(){ 
                    this.requestAnimationFrame(function(){
                        this.touchTarget = $(this.getTarget(e.target));
                        $(this.touchTarget).removeClass(this.touchEndClass)
                            .addClass(this.touchStartClass);
                    });
                }.bind(this),
                this.timeoutMs 
            );
        }
        else{
            this.moved = true;
        }
    }
    else{
        this.setScrollingFalse();
        this.el.one(
            'scroll',
            this.setScrollingFalse.bind(this)
        );
    };
};

// listen for 'touchend' event. Clear the timeout
// if the element's parent didn't move, remove touchStarClass
// add touchEndClass and fire 'touched' event
TouchListItem.prototype.touchEndListener = function(e){
    this.isTouching = false;
    clearTimeout(this.timeout);
     if(this.moved === false){
        this.requestAnimationFrame(function(){
            var target = this.getTarget(e.target);
            $(target).removeClass(this.touchStartClass)
                .addClass(this.touchEndClass);
            this.el.trigger('touched', {
                'touchedElement': target
            });
        });
    };
    if(Math.abs(this.touchMoveScrollTop - this.scrollScrollTop) > 5){
        $(this.el).one(
            'endScroll',
            this.setScrollingFalse.bind(this)
        );
    }
    else {
        this.setScrollingFalse();
    }
    if(this.shouldRefresh === true){
        this.el.trigger('refresh');
    };
};

// listen for 'touchmove' event. Clear the timeout
// set this.moved to true
// and remove the touchStartClass and touchEndClass from element
TouchListItem.prototype.touchMoveListener = function(e){
    this.touchMoveScrollTop = this.el[0].scrollTop;
    this.moved = true;
    clearTimeout(this.timeout);
    if(this.touchTarget){
        this.requestAnimationFrame(function(){
            this.touchTarget.removeClass(this.touchStartClass)
                .removeClass(this.touchEndClass);
        });
    };
};

// for non-touch devices. Trigger a 'touched' event on click.
TouchListItem.prototype.clickListener = function(e){
    if(this.isAvoidTarget(e.target) === false){
        var target = this.getTarget(e.target);
        this.el.trigger(
            'touched', 
            {
                'touchedElement': target
            }
        );
    };
};

// scroll listener. Handles if we've hit bottom for 
// infinite scroll and if we pulled down to refresh
TouchListItem.prototype.scrollListener = function(e){
    this.isScrolling = true;
    this.scrollScrollTop = e.target.scrollTop;
    if(this.triggerHitBottom === true){
        if(
            e.target.scrollHeight - e.target.offsetHeight - 100 <= e.target.scrollTop &&
            this.hitBottomTriggered === false
        ){
            this.hitBottomTriggered = true;
            this.el.trigger(
                'hitBottom',
                {
                    'target': this
                }
            );
        }
    };
    if(this.triggerRefresh === true){
        if(e.target.scrollTop <= this.refreshThreshold){
            this.shouldRefresh = true;
            this.requestAnimationFrame(
                function(){
                    this.refreshTarget.addClass(this.refreshClass);
                }
            );
        }
        else{
            this.shouldRefresh = false;
            this.requestAnimationFrame(
                function(){
                    this.refreshTarget.removeClass(this.refreshClass);
                }
            );        
        }  
    };
    if(this.isTouching === false){
        this.el.trigger('endScroll');
    };
};

// set this.scrolling to false
TouchListItem.prototype.setScrollingFalse = function(e){
    this.isScrolling = false;
};


// use rAF if we've got it
TouchListItem.prototype.requestAnimationFrame = function(func){
    var rAF = this.rAF;
    if(rAF){
        rAF($.proxy(func, this));
    }
    else{
        func.call(this);
    }
};

// check if we've got require
if(typeof module !== "undefined"){
    module.exports = TouchListItem;
}
else{
    window.TouchListItem = TouchListItem;
};
    
}());