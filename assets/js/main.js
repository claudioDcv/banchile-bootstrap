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



// setTimeout(function(){
//    window.location.reload(1);
// }, 1000);

(function(a) {
    function g(a, b) {
        var c = a.data("ddslick");
        var d = a.find(".dd-selected"),
            e = d.siblings(".dd-selected-value"),
            f = a.find(".dd-options"),
            g = d.siblings(".dd-pointer"),
            h = a.find(".dd-option").eq(b),
            k = h.closest("li"),
            l = c.settings,
            m = c.settings.data[b];
        a.find(".dd-option").removeClass("dd-option-selected");
        h.addClass("dd-option-selected");
        c.selectedIndex = b;
        c.selectedItem = k;
        c.selectedData = m;
        if (l.showSelectedHTML) {
            d.html((m.imageSrc ? '<i class="dd-selected-image' + (l.imagePosition == "right" ? " dd-image-right" : "") +' '+ m.imageSrc + '"></i>' : "") + (m.text ? '<label class="dd-selected-text">' + m.text + "</label>" : "") + (m.description ? '<small class="dd-selected-description dd-desc' + (l.truncateDescription ? " dd-selected-description-truncated" : "") + '" >' + m.description + "</small>" : ""))
        } else d.html(m.text);
        e.val(m.value);
        c.original.val(m.value);
        a.data("ddslick", c);
        i(a);
        j(a);
        if (typeof l.onSelected == "function") {
            l.onSelected.call(this, c)
        }
    }

    function h(b) {
        var c = b.find(".dd-select"),
            d = c.siblings(".dd-options"),
            e = c.find(".dd-pointer"),
            f = d.is(":visible");
        a(".dd-click-off-close").not(d).slideUp(50);
        a(".dd-pointer").removeClass("dd-pointer-up");
        if (f) {
            d.slideUp("fast");
            e.removeClass("dd-pointer-up")
        } else {
            d.slideDown("fast");
            e.addClass("dd-pointer-up")
        }
        k(b)
    }

    function i(a) {
        a.find(".dd-options").slideUp(50);
        a.find(".dd-pointer").removeClass("dd-pointer-up").removeClass("dd-pointer-up")
    }

    function j(a) {
        var b = a.find(".dd-select").css("height");
        var c = a.find(".dd-selected-description");
        var d = a.find(".dd-selected-image");
        if (c.length <= 0 && d.length > 0) {
            //a.find(".dd-selected-text").css("lineHeight", b)
        }
    }

    function k(b) {
        b.find(".dd-option").each(function() {
            var c = a(this);
            var d = c.css("height");
            var e = c.find(".dd-option-description");
            var f = b.find(".dd-option-image");
            if (e.length <= 0 && f.length > 0) {
              //  c.find(".dd-option-text").css("lineHeight", d)
            }
        })
    }
    a.fn.ddslick = function(c) {
        if (b[c]) {
            return b[c].apply(this, Array.prototype.slice.call(arguments, 1))
        } else if (typeof c === "object" || !c) {
            return b.init.apply(this, arguments)
        } else {
            a.error("Method " + c + " does not exists.")
        }
    };
    var b = {},
        c = {
            data: [],
            keepJSONItemsOnTop: false,
            width: '100%',
            height: null,
            //background: "#eee",
            selectText: "",
            defaultSelectedIndex: null,
            truncateDescription: true,
            imagePosition: "left",
            showSelectedHTML: true,
            clickOffToClose: true,
            onSelected: function() {}
        },
        d = '<div class="dd-select"><input class="dd-selected-value" type="hidden" /><a class="dd-selected"></a><span class="dd-pointer dd-pointer-down"></span></div>',
        e = '<ul class="dd-options"></ul>',
        f = '';
    if (a("#css-ddslick").length <= 0) {
        a(f).appendTo("head")
    }
    b.init = function(b) {
        var b = a.extend({}, c, b);
        return this.each(function() {
            var c = a(this),
                f = c.data("ddslick");
            if (!f) {
                var i = [],
                    j = b.data;
                c.find("option").each(function() {
                    var b = a(this),
                        c = b.data();
                    i.push({
                        text: a.trim(b.text()),
                        value: b.val(),
                        selected: b.is(":selected"),
                        description: c.description,
                        imageSrc: c.imagesrc
                    })
                });
                if (b.keepJSONItemsOnTop) a.merge(b.data, i);
                else b.data = a.merge(i, b.data);
                var k = c,
                    l = a('<div id="' + c.attr("id") + '"></div>');
                c.replaceWith(l);
                c = l;
                c.addClass("dd-container").append(d).append(e);
                var i = c.find(".dd-select"),
                    m = c.find(".dd-options");
                m.css({
                    width: b.width
                });
                i.css({
                    width: b.width,
                    //background: b.background
                });
                c.css({
                    width: b.width
                });
                if (b.height != null) m.css({
                    height: b.height,
                    overflow: "auto"
                });
                a.each(b.data, function(a, c) {
                    if (c.selected) b.defaultSelectedIndex = a;
                    m.append("<li>" + '<a class="dd-option">' + (c.value ? ' <input class="dd-option-value" type="hidden" value="' + c.value + '" />' : "") + (c.imageSrc ? ' <i class="dd-option-image' + (b.imagePosition == "right" ? " dd-image-right" : "") +' '+ c.imageSrc + '"></i>' : "") + (c.text ? ' <label class="dd-option-text">' + c.text + "</label>" : "") + (c.description ? ' <small class="dd-option-description dd-desc">' + c.description + "</small>" : "") + "</a>" + "</li>")
                });
                var n = {
                    settings: b,
                    original: k,
                    selectedIndex: -1,
                    selectedItem: null,
                    selectedData: null
                };
                c.data("ddslick", n);
                if (b.selectText.length > 0 && b.defaultSelectedIndex == null) {
                    c.find(".dd-selected").html(b.selectText)
                } else {
                    var o = b.defaultSelectedIndex != null && b.defaultSelectedIndex >= 0 && b.defaultSelectedIndex < b.data.length ? b.defaultSelectedIndex : 0;
                    g(c, o)
                }
                c.find(".dd-select").on("click.ddslick", function() {
                    h(c)
                });
                c.find(".dd-option").on("click.ddslick", function() {
                    g(c, a(this).closest("li").index())
                });
                if (b.clickOffToClose) {
                    m.addClass("dd-click-off-close");
                    c.on("click.ddslick", function(a) {
                        a.stopPropagation()
                    });
                    a("body").on("click", function() {
                        a(".dd-click-off-close").slideUp(50).siblings(".dd-select").find(".dd-pointer").removeClass("dd-pointer-up")
                    })
                }
            }
        })
    };
    b.select = function(b) {
        return this.each(function() {
            if (b.index) g(a(this), b.index)
        })
    };
    b.open = function() {
        return this.each(function() {
            var b = a(this),
                c = b.data("ddslick");
            if (c) h(b)
        })
    };
    b.close = function() {
        return this.each(function() {
            var b = a(this),
                c = b.data("ddslick");
            if (c) i(b)
        })
    };
    b.destroy = function() {
        return this.each(function() {
            var b = a(this),
                c = b.data("ddslick");
            if (c) {
                var d = c.original;
                b.removeData("ddslick").unbind(".ddslick").replaceWith(d)
            }
        })
    }
})(jQuery)
 $(document).ready(function () {


   //Dropdown plugin data
   var ddData = [
       {
           text: "Rescate de Fondo Mutuo",
           value: 1,
           selected: false,
           //description: "Description with Twitter",
           imageSrc: "fa fa-globe"
       },
       {
           text: "Compra de dólar",
           value: 2,
           selected: false,
           //description: "Description with LinkedIn",
           imageSrc: "fa fa-user"
       },
       {
           text: "Transferencia a terceros",
           value: 3,
           selected: false,
           //description: "Description with Foursquare",
           imageSrc: "fa fa-university"
       }
   ];

   $('#empresa-1 #drop-operaciones-recurentes,#empresa-2 #drop-operaciones-recurentes').ddslick({
       data:ddData,
       //width:'100%',
       selectText: "Operaciones Recurentes",
       imagePosition:"right",
       onSelected: function(selectedData){
           //callback function: do something with selectedData;
       }
   });


   var ddData = [
       {
           text: "Cuenta 0",
           value: 0,
           selected: true,
           //description: "Description with Twitter",
          //  imageSrc: "fa fa-globe"
       },
       {
           text: "Cuenta 1",
           value: 1,
           selected: false,
           //description: "Description with Twitter",
          //  imageSrc: "fa fa-globe"
       },
       {
           text: "Cuenta 2",
           value: 2,
           selected: false,
           //description: "Description with LinkedIn",
          //  imageSrc: "fa fa-user"
       },
       {
           text: "Cuenta 3",
           value: 3,
           selected: false,
           //description: "Description with Foursquare",
          //  imageSrc: "fa fa-university"
       }
   ];

   $('#empresa-1 #drop-seleccionar-cuenta,#empresa-2 #drop-seleccionar-cuenta').ddslick({
       data:ddData,
       //width:'100%',
       selectText: "Cuenta 0",
       imagePosition:"right",
       onSelected: function(selectedData){
           //callback function: do something with selectedData;
       }
   });

   });
