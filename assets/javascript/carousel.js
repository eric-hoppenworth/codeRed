/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*globals jQuery */

/*!
 * Coverflow
 *
 * Copyright (c) 2013-2016 Martijn W. van der Lee
 * Licensed under the MIT.
 */

/* Lightweight and flexible coverflow effect using CSS3 transforms.
 * For modern browsers with some amount of graceful degradation.
 * Optional support for jQuery.interpolate() plugin.
 * Optional support for .reflect() plugins.
 *
 * Requires jQuery 1.7+ and jQueryUI 1.9+.
 * Recommended jQuery 1.8+ and jQueryUI 1.9+.
 */

;(function($, undefined) {
	"use strict";

	var sign		= function(number) {
						return number < 0 ? -1 : 1;
					},
		scl			= function(number, fromMin, fromMax, toMin, toMax) {
						return ((number - fromMin) * (toMax - toMin) / (fromMax - fromMin)) + toMin;
					},
		wheelEvents	= ('onwheel' in document) ? 'wheel' : 'mousewheel',	// FF
		getWheel	= function(event) {
						if ('deltaY' in event.originalEvent) {
							return 0 - event.originalEvent.deltaY;
						} else if ('wheelDelta' in event.originalEvent) { 
							return event.originalEvent.wheelDelta;	// IE
						}
					};

	$.widget("vanderlee.coverflow", {
		options: {
			animateComplete:	undefined,
			animateStart:		undefined,
			animateStep:		undefined,
			density:			1,
			duration:			'normal',
			easing:				undefined,
			enableKeyboard:		'both',			// true, false, 'both', 'focus', 'hover', 'none'
			enableClick:		true,
			enableWheel:		true,
			index:				0,
			innerAngle:			-75,
			innerCss:			undefined,
			innerOffset:		100 / 3,
			innerScale:			0.75,
			outerAngle:			-30,
			outerCss:			undefined,
			outerScale:			0.25,
			selectedCss:		undefined,
			visible:			'density',		// 'density', 'all', NNN (exact)
			width:				undefined,

			change:				undefined,		// Whenever index is changed
			confirm:			undefined,		// Whenever clicking on the current item
			select:				undefined		// Whenever index is set (also on init)
		},

		_window_handler_resize:		null,
		_window_handler_keydown:	null,

		_create: function() {
			var that = this,
				covers = that._getCovers(),
				images = covers.filter('img').add('img', covers).filter(function() {
					return !(this.complete || this.height > 0);
				}),
				maxHeight = Math.max.apply(null, covers.map(function(){
					return $(this).height();
				}).get()),
				height;

			// Internal event prefix
			that.widgetEventPrefix	= 'vanderlee-coverflow';

			that.hovering			= false;
			that.pagesize			= 1;
			that.currentIndex		= that.options.index;
			
			// Fix height
			that.element.height(maxHeight);
			images.on(function() {
				height = that._getCovers().height();
				if (height > maxHeight) {
					maxHeight = height;
					that.element.height(maxHeight);
				}
			});

			// Hide all covers and set position to absolute
			covers.hide();

			// Add tabindex and autofocus if needed.
			if (this.element.not(':tabbable')) {
				this.element.attr('tabIndex', -1);
				if (this.element.attr('autofocus')) {
					this.element.focus();
				}
			}

			// Enable click-jump
			that.element.on('mousedown tap click', '> *', function(event) {
				if (that.options.enableClick) {
					var index = that._getCovers().index(this);
					if (index === that.currentIndex) {
						that._callback('confirm', event);
					} else {
						that._setIndex(index, true);
					}
				}
			});

			// Mousewheel
			that.element.on(wheelEvents, function(event) {
				if (that.options.enableWheel) {
					var delta = getWheel(event) > 0 ? 1 : -1;

					event.preventDefault();
					that._setIndex(that.options.index - delta, true);
				}
			});

			// Swipe
			if ($.isFunction(that.element.swipe)) {
				that.element.swipe({
					allowPageScroll: "vertical",
					swipe: function(event, direction, distance, duration, fingerCount) {
						var count = Math.round((direction==="left"? 1 : (direction==="right"? -1 : 0 )) * 1.25 * that.pagesize * distance / that.element.width());
						that._setIndex(that.options.index + count, true);
					}
				});
			}

			// Keyboard
//			that.element.hover(
//				function() { that.hovering = true; }
//			,	function() { that.hovering = false; }
//			);

			// Refresh on resize
			that._window_handler_resize = function() {
				that.refresh();
			};
			$(window).on('resize', that._window_handler_resize);

			that._window_handler_keydown = function(event) {
				if (($.inArray(that.options.enableKeyboard, [true, 'both', 'focus']) >= 0 && that.element.is(':focus'))
				 || ($.inArray(that.options.enableKeyboard, [true, 'both', 'hover']) >= 0 >= 0 && that.element.is(':hover'))) {
					switch (event.which) {
						case 36:	// home
							event.preventDefault();
							that._setIndex(0, true);
							break;

						case 35:	// end
							event.preventDefault();
							that._setIndex(that._getCovers().length - 1, true);
							break;

						case 38:	// up
						case 37:	// left
							event.preventDefault();
							that._setIndex(that.options.index - 1, true);
							break;

						case 40:	// down
						case 39:	// right
							event.preventDefault();
							that._setIndex(that.options.index + 1, true);
							break;

						case 33:	// page up (towards home)
							event.preventDefault();
							that._setIndex(that.options.index - that.pagesize, true);
							break;

						case 34:	// page down (towards end)
							event.preventDefault();
							that._setIndex(that.options.index + that.pagesize, true);
							break;
					}
				}
			};
			$(window).on('keydown', that._window_handler_keydown);

			// Initialize
			that._setIndex(that.options.index, false, true);

			return that;
		},


		/**
		 * Destroy this object
		 * @returns {undefined}
		 */
		_destroy: function() {
			$(window).off('resize', this._window_handler_resize);
			$(window).off('keydown', this._window_handler_keydown);
			this.element.height('');
		},

		/**
		 * Returns the currently selected cover
		 * @returns {jQuery} jQuery object
		 */
		cover: function() {
			return $(this._getCovers()[this.options.index]);
		},

		/**
		 *
		 * @returns {unresolved}
		 */
		_getCovers: function() {
			return $('> *', this.element);
		},

		_setIndex: function(index, animate, initial) {
			var that = this,
				covers = that._getCovers();

			index = Math.max(0, Math.min(index, covers.length - 1));

			if (index !== that.options.index) {
				// Fix reflections
				covers.css('position', 'absolute');
				this._frame(that.options.index);						

				if (animate === true || that.options.duration === 0) {
					that.options.index	= Math.round(index);
					
					var duration	= typeof that.options.duration === "number"
									? that.options.duration
									: jQuery.fx.speeds[that.options.duration] || jQuery.fx.speeds._default;
					
					this.refresh(duration, that.options.index);
				} else {
					that.options.index = Math.round(index);
					that.refresh(0);
				}
			} else if (initial === true) {
				that.refresh();
				that._callback('select');
			}
		},

		_callback: function(callback, event) {
			this._trigger(callback, event, [this._getCovers().get(this.currentIndex), this.currentIndex]);
		},

		index: function(index) {
			if (index === undefined) {
				return this.options.index;
			}

			while (index < 0) {
				index += this._getCovers().length;
			}

			this._setIndex(index, true);
		},
		
		_frame: function(frame) {
			frame = frame.toFixed(6);		
							
			var that		= this,
				covers		= that._getCovers(),
				count		= covers.length,
				parentWidth	= that.element.innerWidth(),			
				coverWidth	= that.options.width || covers.eq(this.options.index).show().get(0).offsetWidth,
				visible		= that.options.visible === 'density'	? Math.round(parentWidth * that.options.density / coverWidth)
							: $.isNumeric(that.options.visible)		? that.options.visible
							: count,
				parentLeft	= that.element.position().left - ((1 - that.options.outerScale) * coverWidth * 0.5),
				space		= (parentWidth - (that.options.outerScale * coverWidth)) * 0.5;
		
			that.pagesize	= visible;
			
			covers.removeClass('current').each(function(index, cover) {
				var $cover		= $(cover),
					position	= index - frame,
					offset		= Math.min(Math.max(-1., position / visible), 1),
					isMiddle	= position == 0,
					zIndex		= count - Math.abs(Math.round(position)),
					isVisible	= Math.abs(position) <= visible,
					sin			= Math.sin(offset * Math.PI * 0.5),
					cos			= Math.cos(offset * Math.PI * 0.5),
					left		= sign(sin) * scl(Math.abs(sin), 0, 1, that.options.innerOffset * that.options.density, space),
					scale		= isVisible ? scl(Math.abs(cos), 1, 0, that.options.innerScale, that.options.outerScale) : 0,
					angle		= sign(sin) * scl(Math.abs(sin), 0, 1, that.options.innerAngle, that.options.outerAngle),
					css			= isMiddle ? that.options.selectedCss || {}
								: ( $.interpolate && that.options.outerCss && !$.isEmptyObject(that.options.outerCss) ? (
									isVisible ? $.interpolate(that.options.innerCss || {}, that.options.outerCss, Math.abs(sin))
											  : that.options.outerCss
									) : {}
								),
					transform;
							
				// bad behaviour for being in the middle
				if (Math.abs(position) < 1) {
					angle	= 0 - (0 - angle) * Math.abs(position);
					scale	= 1 - (1 - scale) * Math.abs(position);
					left	= 0 - (0 - left) * Math.abs(position);
				}
				
				//@todo Test CSS for middle behaviour (or does $.interpolate handle it?)

				transform = 'scale(' + scale + ',' + scale + ') perspective(' + (parentWidth * 0.5) + 'px) rotateY(' + angle + 'deg)';
				
				$cover[isMiddle ? 'addClass' : 'removeClass']('current');
				$cover[isVisible ? 'show' : 'hide']();				
						
				$cover.css($.extend(css, {
					'left':					parentLeft + space + left,
					'z-index':				zIndex,
					'-webkit-transform':	transform,
					'-ms-transform':		transform,
					'transform':			transform
				}));
				
				that._trigger('animateStep', null, [cover, offset, isVisible, isMiddle, sin, cos]);
				
				if (frame == that.options.index) {
					that._trigger('animateComplete', null, [cover, offset, isVisible, isMiddle, sin, cos]);
				}
			});
		},

		refresh: function(duration, index) {	
			var that = this,
				previous = that.currentIndex,
				covers = that._getCovers(),
				covercount = covers.length,
				triggered = false;
		
			that._callback('before');
		
			covers.css('position', 'absolute');
			that.element.stop().animate({
				'__coverflow_frame':	index || that.options.index
			}, {
				'easing':	that.options.easing,
				'duration': duration || 0,
				'step':		function(now, fx) {					
					that._frame(now);					
					
					that.currentIndex = Math.max(0, Math.min(Math.round(now), covercount - 1));
					if (previous !== that.currentIndex) {
						previous = that.currentIndex;
						that._callback('change');
						if (that.currentIndex === that.options.index) {
							triggered = true;
						}
					}
				},
				'complete':		function() {				
					that.currentIndex	= that.options.index;
					that._callback('after');
					
					if (!triggered) {
						that._callback('change');
					}
					that._callback('select');
				}
			});
		}
	});
}(jQuery));

/*!
 * Interpolate
 *
 * Copyright (c) 2013-2016 Martijn W. van der Lee
 * Licensed under the MIT.
 */
(function(a,h){a.fn.interpolate=function(d,c,b,e){var f=this;a.isPlainObject(d)?(e=b||"linear",b=a.isNumeric(c)?c:.5,a.each(d,function(c,d){a.each(f,function(){a.Tween(this,{duration:1},c,d,e).run(b)})})):(b=a.isNumeric(b)?b:.5,a.each(f,function(){a.Tween(this[0],{duration:1},d,c,e||"linear").run(b)}));return this};a.interpolate=function(d,c,b,e){var f=a("<span/>"),g=a.extend({},d);f.css(g).interpolate(c,b,e);a.each(c,function(a,b){g[a]=f.css(a)});return g}})(jQuery);

//touch swipe
(function(a){if(typeof define==="function"&&define.amd&&define.amd.jQuery){define(["jquery"],a)}else{if(typeof module!=="undefined"&&module.exports){a(require("jquery"))}else{a(jQuery)}}}(function(f){var y="1.6.15",p="left",o="right",e="up",x="down",c="in",A="out",m="none",s="auto",l="swipe",t="pinch",B="tap",j="doubletap",b="longtap",z="hold",E="horizontal",u="vertical",i="all",r=10,g="start",k="move",h="end",q="cancel",a="ontouchstart" in window,v=window.navigator.msPointerEnabled&&!window.navigator.pointerEnabled&&!a,d=(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&!a,C="TouchSwipe";var n={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:true,triggerOnTouchLeave:false,allowPageScroll:"auto",fallbackToMouseEvents:true,excludedElements:"label, button, input, select, textarea, a, .noSwipe",preventDefaultEvents:true};f.fn.swipe=function(H){var G=f(this),F=G.data(C);if(F&&typeof H==="string"){if(F[H]){return F[H].apply(this,Array.prototype.slice.call(arguments,1))}else{f.error("Method "+H+" does not exist on jQuery.swipe")}}else{if(F&&typeof H==="object"){F.option.apply(this,arguments)}else{if(!F&&(typeof H==="object"||!H)){return w.apply(this,arguments)}}}return G};f.fn.swipe.version=y;f.fn.swipe.defaults=n;f.fn.swipe.phases={PHASE_START:g,PHASE_MOVE:k,PHASE_END:h,PHASE_CANCEL:q};f.fn.swipe.directions={LEFT:p,RIGHT:o,UP:e,DOWN:x,IN:c,OUT:A};f.fn.swipe.pageScroll={NONE:m,HORIZONTAL:E,VERTICAL:u,AUTO:s};f.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,ALL:i};function w(F){if(F&&(F.allowPageScroll===undefined&&(F.swipe!==undefined||F.swipeStatus!==undefined))){F.allowPageScroll=m}if(F.click!==undefined&&F.tap===undefined){F.tap=F.click}if(!F){F={}}F=f.extend({},f.fn.swipe.defaults,F);return this.each(function(){var H=f(this);var G=H.data(C);if(!G){G=new D(this,F);H.data(C,G)}})}function D(a5,au){var au=f.extend({},au);var az=(a||d||!au.fallbackToMouseEvents),K=az?(d?(v?"MSPointerDown":"pointerdown"):"touchstart"):"mousedown",ax=az?(d?(v?"MSPointerMove":"pointermove"):"touchmove"):"mousemove",V=az?(d?(v?"MSPointerUp":"pointerup"):"touchend"):"mouseup",T=az?(d?"mouseleave":null):"mouseleave",aD=(d?(v?"MSPointerCancel":"pointercancel"):"touchcancel");var ag=0,aP=null,a2=null,ac=0,a1=0,aZ=0,H=1,ap=0,aJ=0,N=null;var aR=f(a5);var aa="start";var X=0;var aQ={};var U=0,a3=0,a6=0,ay=0,O=0;var aW=null,af=null;try{aR.bind(K,aN);aR.bind(aD,ba)}catch(aj){f.error("events not supported "+K+","+aD+" on jQuery.swipe")}this.enable=function(){aR.bind(K,aN);aR.bind(aD,ba);return aR};this.disable=function(){aK();return aR};this.destroy=function(){aK();aR.data(C,null);aR=null};this.option=function(bd,bc){if(typeof bd==="object"){au=f.extend(au,bd)}else{if(au[bd]!==undefined){if(bc===undefined){return au[bd]}else{au[bd]=bc}}else{if(!bd){return au}else{f.error("Option "+bd+" does not exist on jQuery.swipe.options")}}}return null};function aN(be){if(aB()){return}if(f(be.target).closest(au.excludedElements,aR).length>0){return}var bf=be.originalEvent?be.originalEvent:be;var bd,bg=bf.touches,bc=bg?bg[0]:bf;aa=g;if(bg){X=bg.length}else{if(au.preventDefaultEvents!==false){be.preventDefault()}}ag=0;aP=null;a2=null;aJ=null;ac=0;a1=0;aZ=0;H=1;ap=0;N=ab();S();ai(0,bc);if(!bg||(X===au.fingers||au.fingers===i)||aX()){U=ar();if(X==2){ai(1,bg[1]);a1=aZ=at(aQ[0].start,aQ[1].start)}if(au.swipeStatus||au.pinchStatus){bd=P(bf,aa)}}else{bd=false}if(bd===false){aa=q;P(bf,aa);return bd}else{if(au.hold){af=setTimeout(f.proxy(function(){aR.trigger("hold",[bf.target]);if(au.hold){bd=au.hold.call(aR,bf,bf.target)}},this),au.longTapThreshold)}an(true)}return null}function a4(bf){var bi=bf.originalEvent?bf.originalEvent:bf;if(aa===h||aa===q||al()){return}var be,bj=bi.touches,bd=bj?bj[0]:bi;var bg=aH(bd);a3=ar();if(bj){X=bj.length}if(au.hold){clearTimeout(af)}aa=k;if(X==2){if(a1==0){ai(1,bj[1]);a1=aZ=at(aQ[0].start,aQ[1].start)}else{aH(bj[1]);aZ=at(aQ[0].end,aQ[1].end);aJ=aq(aQ[0].end,aQ[1].end)}H=a8(a1,aZ);ap=Math.abs(a1-aZ)}if((X===au.fingers||au.fingers===i)||!bj||aX()){aP=aL(bg.start,bg.end);a2=aL(bg.last,bg.end);ak(bf,a2);ag=aS(bg.start,bg.end);ac=aM();aI(aP,ag);be=P(bi,aa);if(!au.triggerOnTouchEnd||au.triggerOnTouchLeave){var bc=true;if(au.triggerOnTouchLeave){var bh=aY(this);bc=F(bg.end,bh)}if(!au.triggerOnTouchEnd&&bc){aa=aC(k)}else{if(au.triggerOnTouchLeave&&!bc){aa=aC(h)}}if(aa==q||aa==h){P(bi,aa)}}}else{aa=q;P(bi,aa)}if(be===false){aa=q;P(bi,aa)}}function M(bc){var bd=bc.originalEvent?bc.originalEvent:bc,be=bd.touches;if(be){if(be.length&&!al()){G(bd);return true}else{if(be.length&&al()){return true}}}if(al()){X=ay}a3=ar();ac=aM();if(bb()||!am()){aa=q;P(bd,aa)}else{if(au.triggerOnTouchEnd||(au.triggerOnTouchEnd==false&&aa===k)){if(au.preventDefaultEvents!==false){bc.preventDefault()}aa=h;P(bd,aa)}else{if(!au.triggerOnTouchEnd&&a7()){aa=h;aF(bd,aa,B)}else{if(aa===k){aa=q;P(bd,aa)}}}}an(false);return null}function ba(){X=0;a3=0;U=0;a1=0;aZ=0;H=1;S();an(false)}function L(bc){var bd=bc.originalEvent?bc.originalEvent:bc;if(au.triggerOnTouchLeave){aa=aC(h);P(bd,aa)}}function aK(){aR.unbind(K,aN);aR.unbind(aD,ba);aR.unbind(ax,a4);aR.unbind(V,M);if(T){aR.unbind(T,L)}an(false)}function aC(bg){var bf=bg;var be=aA();var bd=am();var bc=bb();if(!be||bc){bf=q}else{if(bd&&bg==k&&(!au.triggerOnTouchEnd||au.triggerOnTouchLeave)){bf=h}else{if(!bd&&bg==h&&au.triggerOnTouchLeave){bf=q}}}return bf}function P(be,bc){var bd,bf=be.touches;if(J()||W()){bd=aF(be,bc,l)}if((Q()||aX())&&bd!==false){bd=aF(be,bc,t)}if(aG()&&bd!==false){bd=aF(be,bc,j)}else{if(ao()&&bd!==false){bd=aF(be,bc,b)}else{if(ah()&&bd!==false){bd=aF(be,bc,B)}}}if(bc===q){if(W()){bd=aF(be,bc,l)}if(aX()){bd=aF(be,bc,t)}ba(be)}if(bc===h){if(bf){if(!bf.length){ba(be)}}else{ba(be)}}return bd}function aF(bf,bc,be){var bd;if(be==l){aR.trigger("swipeStatus",[bc,aP||null,ag||0,ac||0,X,aQ,a2]);if(au.swipeStatus){bd=au.swipeStatus.call(aR,bf,bc,aP||null,ag||0,ac||0,X,aQ,a2);if(bd===false){return false}}if(bc==h&&aV()){clearTimeout(aW);clearTimeout(af);aR.trigger("swipe",[aP,ag,ac,X,aQ,a2]);if(au.swipe){bd=au.swipe.call(aR,bf,aP,ag,ac,X,aQ,a2);if(bd===false){return false}}switch(aP){case p:aR.trigger("swipeLeft",[aP,ag,ac,X,aQ,a2]);if(au.swipeLeft){bd=au.swipeLeft.call(aR,bf,aP,ag,ac,X,aQ,a2)}break;case o:aR.trigger("swipeRight",[aP,ag,ac,X,aQ,a2]);if(au.swipeRight){bd=au.swipeRight.call(aR,bf,aP,ag,ac,X,aQ,a2)}break;case e:aR.trigger("swipeUp",[aP,ag,ac,X,aQ,a2]);if(au.swipeUp){bd=au.swipeUp.call(aR,bf,aP,ag,ac,X,aQ,a2)}break;case x:aR.trigger("swipeDown",[aP,ag,ac,X,aQ,a2]);if(au.swipeDown){bd=au.swipeDown.call(aR,bf,aP,ag,ac,X,aQ,a2)}break}}}if(be==t){aR.trigger("pinchStatus",[bc,aJ||null,ap||0,ac||0,X,H,aQ]);if(au.pinchStatus){bd=au.pinchStatus.call(aR,bf,bc,aJ||null,ap||0,ac||0,X,H,aQ);if(bd===false){return false}}if(bc==h&&a9()){switch(aJ){case c:aR.trigger("pinchIn",[aJ||null,ap||0,ac||0,X,H,aQ]);if(au.pinchIn){bd=au.pinchIn.call(aR,bf,aJ||null,ap||0,ac||0,X,H,aQ)}break;case A:aR.trigger("pinchOut",[aJ||null,ap||0,ac||0,X,H,aQ]);if(au.pinchOut){bd=au.pinchOut.call(aR,bf,aJ||null,ap||0,ac||0,X,H,aQ)}break}}}if(be==B){if(bc===q||bc===h){clearTimeout(aW);clearTimeout(af);if(Z()&&!I()){O=ar();aW=setTimeout(f.proxy(function(){O=null;aR.trigger("tap",[bf.target]);if(au.tap){bd=au.tap.call(aR,bf,bf.target)}},this),au.doubleTapThreshold)}else{O=null;aR.trigger("tap",[bf.target]);if(au.tap){bd=au.tap.call(aR,bf,bf.target)}}}}else{if(be==j){if(bc===q||bc===h){clearTimeout(aW);clearTimeout(af);O=null;aR.trigger("doubletap",[bf.target]);if(au.doubleTap){bd=au.doubleTap.call(aR,bf,bf.target)}}}else{if(be==b){if(bc===q||bc===h){clearTimeout(aW);O=null;aR.trigger("longtap",[bf.target]);if(au.longTap){bd=au.longTap.call(aR,bf,bf.target)}}}}}return bd}function am(){var bc=true;if(au.threshold!==null){bc=ag>=au.threshold}return bc}function bb(){var bc=false;if(au.cancelThreshold!==null&&aP!==null){bc=(aT(aP)-ag)>=au.cancelThreshold}return bc}function ae(){if(au.pinchThreshold!==null){return ap>=au.pinchThreshold}return true}function aA(){var bc;if(au.maxTimeThreshold){if(ac>=au.maxTimeThreshold){bc=false}else{bc=true}}else{bc=true}return bc}function ak(bc,bd){if(au.preventDefaultEvents===false){return}if(au.allowPageScroll===m){bc.preventDefault()}else{var be=au.allowPageScroll===s;switch(bd){case p:if((au.swipeLeft&&be)||(!be&&au.allowPageScroll!=E)){bc.preventDefault()}break;case o:if((au.swipeRight&&be)||(!be&&au.allowPageScroll!=E)){bc.preventDefault()}break;case e:if((au.swipeUp&&be)||(!be&&au.allowPageScroll!=u)){bc.preventDefault()}break;case x:if((au.swipeDown&&be)||(!be&&au.allowPageScroll!=u)){bc.preventDefault()}break}}}function a9(){var bd=aO();var bc=Y();var be=ae();return bd&&bc&&be}function aX(){return !!(au.pinchStatus||au.pinchIn||au.pinchOut)}function Q(){return !!(a9()&&aX())}function aV(){var bf=aA();var bh=am();var be=aO();var bc=Y();var bd=bb();var bg=!bd&&bc&&be&&bh&&bf;return bg}function W(){return !!(au.swipe||au.swipeStatus||au.swipeLeft||au.swipeRight||au.swipeUp||au.swipeDown)}function J(){return !!(aV()&&W())}function aO(){return((X===au.fingers||au.fingers===i)||!a)}function Y(){return aQ[0].end.x!==0}function a7(){return !!(au.tap)}function Z(){return !!(au.doubleTap)}function aU(){return !!(au.longTap)}function R(){if(O==null){return false}var bc=ar();return(Z()&&((bc-O)<=au.doubleTapThreshold))}function I(){return R()}function aw(){return((X===1||!a)&&(isNaN(ag)||ag<au.threshold))}function a0(){return((ac>au.longTapThreshold)&&(ag<r))}function ah(){return !!(aw()&&a7())}function aG(){return !!(R()&&Z())}function ao(){return !!(a0()&&aU())}function G(bc){a6=ar();ay=bc.touches.length+1}function S(){a6=0;ay=0}function al(){var bc=false;if(a6){var bd=ar()-a6;if(bd<=au.fingerReleaseThreshold){bc=true}}return bc}function aB(){return !!(aR.data(C+"_intouch")===true)}function an(bc){if(!aR){return}if(bc===true){aR.bind(ax,a4);aR.bind(V,M);if(T){aR.bind(T,L)}}else{aR.unbind(ax,a4,false);aR.unbind(V,M,false);if(T){aR.unbind(T,L,false)}}aR.data(C+"_intouch",bc===true)}function ai(be,bc){var bd={start:{x:0,y:0},last:{x:0,y:0},end:{x:0,y:0}};bd.start.x=bd.last.x=bd.end.x=bc.pageX||bc.clientX;bd.start.y=bd.last.y=bd.end.y=bc.pageY||bc.clientY;aQ[be]=bd;return bd}function aH(bc){var be=bc.identifier!==undefined?bc.identifier:0;var bd=ad(be);if(bd===null){bd=ai(be,bc)}bd.last.x=bd.end.x;bd.last.y=bd.end.y;bd.end.x=bc.pageX||bc.clientX;bd.end.y=bc.pageY||bc.clientY;return bd}function ad(bc){return aQ[bc]||null}function aI(bc,bd){bd=Math.max(bd,aT(bc));N[bc].distance=bd}function aT(bc){if(N[bc]){return N[bc].distance}return undefined}function ab(){var bc={};bc[p]=av(p);bc[o]=av(o);bc[e]=av(e);bc[x]=av(x);return bc}function av(bc){return{direction:bc,distance:0}}function aM(){return a3-U}function at(bf,be){var bd=Math.abs(bf.x-be.x);var bc=Math.abs(bf.y-be.y);return Math.round(Math.sqrt(bd*bd+bc*bc))}function a8(bc,bd){var be=(bd/bc)*1;return be.toFixed(2)}function aq(){if(H<1){return A}else{return c}}function aS(bd,bc){return Math.round(Math.sqrt(Math.pow(bc.x-bd.x,2)+Math.pow(bc.y-bd.y,2)))}function aE(bf,bd){var bc=bf.x-bd.x;var bh=bd.y-bf.y;var be=Math.atan2(bh,bc);var bg=Math.round(be*180/Math.PI);if(bg<0){bg=360-Math.abs(bg)}return bg}function aL(bd,bc){var be=aE(bd,bc);if((be<=45)&&(be>=0)){return p}else{if((be<=360)&&(be>=315)){return p}else{if((be>=135)&&(be<=225)){return o}else{if((be>45)&&(be<135)){return x}else{return e}}}}}function ar(){var bc=new Date();return bc.getTime()}function aY(bc){bc=f(bc);var be=bc.offset();var bd={left:be.left,right:be.left+bc.outerWidth(),top:be.top,bottom:be.top+bc.outerHeight()};return bd}function F(bc,bd){return(bc.x>bd.left&&bc.x<bd.right&&bc.y>bd.top&&bc.y<bd.bottom)}}}));

/*!
	reflection.js for jQuery v1.11
	(c) 2006-2013 Christophe Beyls <http://www.digitalia.be>
	MIT-style license.
*/
(function(a){a.fn.extend({reflect:function(b){b=a.extend({height:1/3,opacity:0.5},b);return this.unreflect().each(function(){var c=this;if(/^img$/i.test(c.tagName)){function d(){var g=c.width,f=c.height,l,i,m,h,k;i=Math.floor((b.height>1)?Math.min(f,b.height):f*b.height);l=a("<canvas />")[0];if(l.getContext){h=l.getContext("2d");try{a(l).attr({width:g,height:i});h.save();h.translate(0,f-1);h.scale(1,-1);h.drawImage(c,0,0,g,f);h.restore();h.globalCompositeOperation="destination-out";k=h.createLinearGradient(0,0,0,i);k.addColorStop(0,"rgba(255, 255, 255, "+(1-b.opacity)+")");k.addColorStop(1,"rgba(255, 255, 255, 1.0)");h.fillStyle=k;h.rect(0,0,g,i);h.fill()}catch(j){return}}else{if(!window.ActiveXObject){return}l=a("<img />").attr("src",c.src).css({width:g,height:f,marginBottom:i-f,filter:"FlipV progid:DXImageTransform.Microsoft.Alpha(Opacity="+(b.opacity*100)+", FinishOpacity=0, Style=1, StartX=0, StartY=0, FinishX=0, FinishY="+(i/f*100)+")"})[0]}a(l).css({display:"block",border:0});m=a(/^a$/i.test(c.parentNode.tagName)?"<span />":"<div />").insertAfter(c).append([c,l])[0];m.className=c.className;a.data(c,"reflected",m.style.cssText=c.style.cssText);a(m).css({width:g,height:f+i,overflow:"hidden"});c.style.cssText="display: block; border: 0px";c.className="reflected"}if(c.complete){d()}else{a(c).load(d)}}})},unreflect:function(){return this.unbind("load").each(function(){var c=this,b=a.data(this,"reflected"),d;if(b!==undefined){d=c.parentNode;c.className=d.className;c.style.cssText=b;a.removeData(c,"reflected");d.parentNode.replaceChild(c,d)}})}})})(jQuery);

// AUTOLOAD CODE BLOCK (MAY BE CHANGED OR REMOVED)
jQuery(function($) {
	$("img.reflect").reflect({/* Put custom options here */});
});

function initializeCoverflow(){
	//For the Carousel on the Browser Page
    if ($.fn.reflect) {
        $('#preview-coverflow .cover').reflect();   // only possible in very specific situations
    }

    $('#preview-coverflow').coverflow({
        index: 0,
        density: 2,
        innerOffset: 50,
        innerScale: .7,
        animateStep: function(event, cover, offset, isVisible, isMiddle, sin, cos) {
            if (isVisible) {
                if (isMiddle) {
                    $(cover).css({
                        'filter': 'none',
                        '-webkit-filter': 'none'
                    });
                } else {
                    var brightness = 1 + Math.abs(sin),
                        contrast = 1 - Math.abs(sin),
                        filter = 'contrast('+contrast+') brightness('+brightness+')';
                    $(cover).css({
                        'filter': filter,
                        '-webkit-filter': filter
                    });
                }
            }
        }
    });
}
initializeCoverflow();