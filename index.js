(function ($){

"use strict";

$.fn.touchList = function(options) {
    var opts = $.extend( {}, $.fn.touchList.defaults, options);
    return this.each(function() {
        new TouchList(this, opts);
    });
};

$.fn.touchList.defaults = {
    'isTouchDevice': 'ontouchstart' in document.documentElement,
    'touched': function() {},
    'removeTapHighlight': false,
    'removeTouchCallout': false,
    'removeUserSelect': false,
    'addTranslate3d': /OS 5(_\d)+ like Mac OS X/i.test(navigator.userAgent),
    'timeoutMs': 50,
    'touchStartClass': 'touchstart',
    'touchEndClass': '',
    'hitbottom': function() {},
    'hittop': function() {},
    'shouldTriggerHitBottom': true,
    'shouldTriggerHitTop': true,
    'refresh': function() {},
    'shouldDetectRefresh': true,
    'refreshClass': 'refreshing',
    'refreshThreshold': -80,
    'refreshTarget': null,
    'listItemClass': null,
    'avoidClass': null,
    'scrollend': function() {},
    'triggerTimeoutDelay': 300
};

function TouchList(el, opts){
    this.el = $(el);
    this.opts = opts;
    
    // cache the refresh target element
    if(this.opts.shouldDetectRefresh === true){
        this.refreshTarget = $(this.opts.refreshTarget);
    };
    
    // Keep track of the setTimeout
    this.timeout = null;
    
    // boolean if the element parent moved
    this.moved = false;
    
    // boolean if refresh happened
    this.shouldRefresh = false;
    
    this.addStyleOptions();
    
    // remove listeners
    this.removeListeners();
    
    // add our listeners
    this.addListeners();
    
    // boolean if user currently touching
    this.isTouching = false;
    
    // boolean if user is currently scrolling
    this.isScrolling = false;
    
    // boolean to keep track of when we trigger 'touched' event
    this.justTriggered = false;
    
    // requestAnimationFrame
    this.rAF = window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    

    return this;
    
}

// add touch listeners to the element
TouchList.prototype.addListeners = function(){
    if(this.opts.isTouchDevice){
        this.bindedTouchStartListener = $.proxy(this.touchStartListener, this);
        this.bindedTouchEndListener = $.proxy(this.touchEndListener, this);
        this.bindedTouchMoveListener = $.proxy(this.touchMoveListener, this);
        this.el.on('touchstart', this.bindedTouchStartListener);
        this.el.on('touchend', this.bindedTouchEndListener);
        this.el.on('touchmove', this.bindedTouchMoveListener);
    }
    else{
        this.bindedClickListener = $.proxy(this.clickListener, this);
        this.el.on('click', this.bindedClickListener);
    }
    this.bindedScrollListener = $.proxy(this.scrollListener, this);
    this.el.on('scroll', this.bindedScrollListener);
};

// remove touch and click listeners to the element
// if it is not a touch device, add 'click' listener
TouchList.prototype.removeListeners = function(){
    this.el.off('touchstart', this.bindedTouchStartListener);
    this.el.off('touchend', this.bindedTouchEndListener);
    this.el.off('touchmove', this.bindedTouchMoveListener);
    this.el.off('click', this.bindedClickListener);
    this.el.off('scroll', this.bindedScrollListener);
};

// Add styles based on instance options
TouchList.prototype.addStyleOptions = function(){
    var addStyle = false;
    var children = [];
    if(this.opts.listItemClass !== null){
        children = this.el.find('.'+this.opts.listItemClass);
    }
    else{
        children = this.el.children();
    };
    var style = {};
    if(this.opts.removeTapHighlight === true){
        style['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
        addStyle = true;
    };
    if(this.opts.removeTouchCallout === true){
        style['-webkit-touch-callout'] = 'none';
        addStyle = true;
    };
    if(this.opts.removeUserSelect === true) {
        style['-webkit-user-select'] = 'none';
        addStyle = true;
    };
    if(this.opts.addTranslate3d === true){
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

// get the target from the listItemClass option
TouchList.prototype.getTarget = function(el){
    var target = el;
    if(this.opts.listItemClass !== null){
        if($(el).hasClass(this.opts.listItemClass)){
            target = el;
        }
        else{
            target = $(el).parents('.'+this.opts.listItemClass);
        }
    }
    return target;
};

// check for avoid targets
TouchList.prototype.isAvoidTarget = function(el){
    if(this.opts.avoidClass === null){
        return false;
    }
    else{
        return $(el).hasClass(this.opts.avoidClass);
    }
};

// listen for 'touchstart' event. Set a timer for timeoutMs 
// After that time has passed if we are still touching, add
// touchStartClass to element.
// addTouchStartClass comes from touch-element
TouchList.prototype.touchStartListener = function(e){
    this.isTouching = true;
    if(this.isScrolling === false){
        if(this.isAvoidTarget(e.target) === false){
            this.moved = false;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(
                $.proxy(function(){ 
                    this.requestAnimationFrame(function(){
                        this.touchTarget = $(this.getTarget(e.target));
                        $(this.touchTarget)
                            .removeClass(this.opts.touchEndClass)
                            .addClass(this.opts.touchStartClass);
                    });
                }, this),
                this.opts.timeoutMs 
            );
        }
        else{
            this.moved = true;
        }
    }
    else{
        this.setScrollingFalse();
        this.el.one('scroll', $.proxy(this.setScrollingFalse, this));
    };
};

// listen for 'touchend' event. Clear the timeout
// if the element's parent didn't move, remove touchStarClass
// add touchEndClass and fire 'touched' event
TouchList.prototype.touchEndListener = function(e){
    this.isTouching = false;
    clearTimeout(this.timeout);
    if(this.moved === false){
        this.requestAnimationFrame(function(){
            var target = this.getTarget(e.target);
            $(target)
                .removeClass(this.opts.touchStartClass)
                .addClass(this.opts.touchEndClass);
            this.triggerTouched(e, target);
        });
    };
    if(Math.abs(this.touchMoveScrollTop - this.scrollScrollTop) > 5){
        this.el.one('endScroll', $.proxy(this.setScrollingFalse, this));
    }
    else {
        this.setScrollingFalse();
    }
    if(this.shouldRefresh === true){
        this.triggerRefresh();
    };
};

// listen for 'touchmove' event. Clear the timeout
// set this.moved to true
// and remove the touchStartClass and touchEndClass from element
TouchList.prototype.touchMoveListener = function(e){
    this.touchMoveScrollTop = this.el[0].scrollTop;
    this.moved = true;
    clearTimeout(this.timeout);
    if(this.touchTarget){
        this.requestAnimationFrame(function(){
            this.touchTarget
                .removeClass(this.opts.touchStartClass)
                .removeClass(this.opts.touchEndClass);
        });
    };
};

// for non-touch devices. Trigger a 'touched' event on click.
TouchList.prototype.clickListener = function(e){
    if(this.isAvoidTarget(e.target) === false){
        var target = this.getTarget(e.target);
        this.triggerTouched(e, target);
    };
};

// scroll listener. Handles if we've hit bottom for 
// infinite scroll and if we pulled down to refresh
TouchList.prototype.scrollListener = function(e){
    this.isScrolling = true;
    this.scrollScrollTop = e.target.scrollTop;
    if(this.opts.shouldTriggerHitTop === true){
        if(this.scrollScrollTop === 0){
            this.triggerHitTop();
        }   
    }
    if(this.opts.shouldTriggerHitBottom === true){
        if(e.target.scrollHeight - e.target.offsetHeight - 100 <= e.target.scrollTop){
            this.triggerHitBottom();
        }
    };
    if(this.opts.shouldDetectRefresh === true){
        if(e.target.scrollTop <= this.opts.refreshThreshold){
            this.shouldRefresh = true;
            if(this.refreshTarget !== null){
                this.requestAnimationFrame(
                    function(){
                        this.refreshTarget.addClass(this.opts.refreshClass);
                    }
                );
            }
        }
        else{
            this.shouldRefresh = false;
            this.requestAnimationFrame(
                function(){
                    this.refreshTarget.removeClass(this.opts.refreshClass);
                }
            );        
        }  
    };
    if(this.isTouching === false){
        this.el.trigger('endScroll');
    };
};

// set this.scrolling to false
TouchList.prototype.setScrollingFalse = function(e){
    this.isScrolling = false;
    this.triggerScrollEnd();
};

// use rAF if we've got it
TouchList.prototype.requestAnimationFrame = function(func){
    var rAF = this.rAF;
    if(rAF){
        rAF($.proxy(func, this));
    }
    else{
        func.call(this);
    }
};



// trigger our custom 'touched' event
TouchList.prototype.triggerTouched = function(e, target){
    if(this.justTriggered === false){
        this.opts.touched.call(this, e);
        var newEvent = $.extend(e, $.Event('touched'));
        this.el.trigger(newEvent);
        this.justTriggered = true;
        this.triggerTimeout = setTimeout(
            function(){
                this.justTriggered = false;
            }.bind(this),
            this.opts.triggerTimeoutDelay
        );
    }
}

// trigger our custom 'refresh' event
TouchList.prototype.triggerRefresh = function(e){
    this.opts.refresh.call(this, e);
    this.el.trigger($.extend($.Event('refresh'), e));
}

// trigger our custom 'hitbottom' event
TouchList.prototype.triggerHitBottom = function(e){
    this.opts.hitbottom.call(this, e);
    this.el.trigger($.extend($.Event('hitbottom'), e));
}

// trigger our custom 'hittop' event
TouchList.prototype.triggerHitTop = function(e){
    this.opts.hittop.call(this, e);
    this.el.trigger($.extend($.Event('hittop'), e));
}

// trigger our custom 'scrollend' event
TouchList.prototype.triggerScrollEnd = function(){
    this.opts.scrollend.call(this);
    this.el.trigger('scrollend');
}

}($)); // end

