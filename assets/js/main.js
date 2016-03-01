//CAROUSEL Bootstrap
+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }
// http://blog.alexmaccaw.com/css-transitions
$.fn.emulateTransitionEnd = function (duration) {
  var called = false
  var $el = this
  $(this).one('banbsTransitionEnd', function () { called = true })
  var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
  setTimeout(callback, duration)
  return this
}

$(function () {
  $.support.transition = transitionEnd()

  if (!$.support.transition) return

  $.event.special.banbsTransitionEnd = {
    bindType: $.support.transition.end,
    delegateType: $.support.transition.end,
    handle: function (e) {
      if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
    }
  }
})

}(jQuery);


+function ($) {
  'use strict';

  // Ban_Carousel CLASS DEFINITION
  // =========================

  var Ban_Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.ban-carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.banbs.ban_carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.banbs.ban_carousel', $.proxy(this.pause, this))
      .on('mouseleave.banbs.ban_carousel', $.proxy(this.cycle, this))
  }

  Ban_Carousel.VERSION  = '3.3.6'

  Ban_Carousel.TRANSITION_DURATION = 600

  Ban_Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Ban_Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Ban_Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Ban_Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.ban-item')
    return this.$items.index(item || this.$active)
  }

  Ban_Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Ban_Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.ban-item.ban-active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.banbs.ban-carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Ban_Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.ban-next, .ban-prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Ban_Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Ban_Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Ban_Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.ban-item.ban-active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('ban-active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.banbs.ban-carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.ban-active').removeClass('ban-active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('ban-active')
    }

    var slidEvent = $.Event('slid.banbs.ban-carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('ban-slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('banbsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('ban-active')
          $active.removeClass(['ban-active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Ban_Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('ban-active')
      $next.addClass('ban-active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // Ban_Carousel PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('banbs.ban-carousel')
      var options = $.extend({}, Ban_Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('banbs.ban-carousel', (data = new Ban_Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.Ban_Carousel

  $.fn.Ban_Carousel             = Plugin
  $.fn.Ban_Carousel.Constructor = Ban_Carousel


  // Ban_Carousel NO CONFLICT
  // ====================

  $.fn.Ban_Carousel.noConflict = function () {
    $.fn.Ban_Carousel = old
    return this
  }


  // Ban_Carousel DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-ban-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    console.log($this);
    if (!$target.hasClass('ban-carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-ban-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('banbs.ban-carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.banbs.ban-carousel.data-ban-api', '[data-slide]', clickHandler)
    .on('click.banbs.ban-carousel.data-ban-api', '[data-ban-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ban-ride="ban-carousel"]').each(function () {
      var $Ban_Carousel = $(this)
      Plugin.call($Ban_Carousel, $Ban_Carousel.data())
    })
  })

}(jQuery);



$(document).ready(function(){
  // invoke the carousel
  $('#carrusel-testimonios').Ban_Carousel({
    interval: false
  });
});
