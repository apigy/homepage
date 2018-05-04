//
//
//
apigy = window.apigy || {};


const APIGY_ANIMATE = true;

(function() {
	
	$.fn.apigy_show = (function() {
		return APIGY_ANIMATE
			? function(speed, callback) {
				this.fadeIn(speed, callback);
				return this;
			}
			: function(speed, callback) {
				this.show();
				if(callback) callback();
				return this
			}	
	})();
	
	$.fn.apigy_hide = (function() {
		return APIGY_ANIMATE
			? function(speed, callback) {
				this.fadeOut(speed, callback);
				return this;
			}
			: function(speed, callback) {
				this.hide();
				if(callback) callback();
				return this
			}	
	})();
	
	$.fn.apigy_css = (function() {
		return APIGY_ANIMATE
			? function(css, speed, callback) {
				this.animate(css, speed, callback);
				return this;
			}
			: function(css, speed, callback) {
				this.css(css);
				if(callback) callback();
				return this
			}
	})();
	
	$.fn.apigy_clear_block = function() {
		this.append('<div class="clear"></div>');
	}
	
})();









/** ------------------------------------------------------------------------------------- */
apigy.Gallery = function(data, opts) {

    var defaults = {
        keyboard: true,
        resize: true,
        reposition: true
    }

    opts = $.extend({}, defaults, opts);

    var self = this;
    if(opts.resize)
        $(window)
            .unbind('resize', apigy.Gallery.resize)
            .resize(apigy.Gallery.resize)
            .resize()

    if(opts.reposition)
        $(window)
            .unbind('resize', apigy.Gallery.reposition)
		    .resize(apigy.Gallery.reposition)
		    .resize()

    if(opts.keyboard)
        $(window)
            .unbind('keydown')
            .keydown(function(e) {
                return apigy.Gallery.keydown(e, self)
            })

    setInterval(function() {
        apigy.Gallery.scroll();
    }, 800);

    if(!data) {
		return false;
	}
	
	this.data = data;

	var a = this.data.gallery.name.split('-')
	var title = a.length > 1
		? (a[0] + " <span>" + a[1] + "</span>")
		: a[0];

    var self = this;
	$('#header .title')
			.html(title)
			.apigy_show('slow', function() {
                self.render();
            })
	
	if(this.data.gallery.owner && this.data.gallery.owner.user.fullname)
		$('#owner')
			.html("and " + this.data.gallery.owner.user.fullname);
		
	this.modal = new apigy.Modal();

    $(window).resize();
}

apigy.Gallery.prototype.render = function() {
	
	var gallery = $('#gallery');
	
	var self = this;

    var count = 0;
	$(this.data.gallery.photos)
		.each(function(i, e) {
		
			var thumbnail = new apigy.Thumbnail(e);
			thumbnail.gallery = self;
			gallery.append(thumbnail.render());
            if(count++ < 20) thumbnail.load();
		});


	gallery.apigy_clear_block();
	gallery.apigy_show('fast');
	apigy.Gallery.reposition();
	apigy.Gallery.resize();
}

apigy.Gallery.reposition = function() {
	var gallery = $('#content-wrapper');
	var galleryHeight = gallery.outerHeight();
	var containerHeight = $(window).height() - $('#header').outerHeight() - $('#footer').outerHeight();

	if(containerHeight > galleryHeight)
		gallery.css('margin-top', $('#header').outerHeight() + ((containerHeight/2)-(galleryHeight/2)));
	else
		gallery.css('margin-top', $('#header').outerHeight());
}

apigy.Gallery.resize = function() {
	
	var w = $(window).width();
	var h = $('#header');
	var f = $('#footer');
	
	h.css('width', w);
	f.css('width', w);
	
	h.find('.spacer')
		.css({
			'height' : h.css('height'),
			'margin-left' : h.find('.title').innerWidth()
		});
		
}



var scroll_min;
var scroll_max;

apigy.Gallery.scroll = function() {

    var scrolltop = $(window).scrollTop() - 48 - 30;
    var height = $(window).height();

    var min = Math.floor(scrolltop/173);
    min = min > 0 ? min : 0;
    var max = Math.ceil((scrolltop+height)/173)

    if(min == scroll_min && max == scroll_max) {
        return;
    }

    scroll_min = min;
    scroll_max = max;
    
    var els = $('.photo-small').slice(min*4, (max*4))
    els.each(function(i, e) {
        $(e).data('thumbnail').load();
    });
}


apigy.Gallery.keydown = function(e, gallery) {

    switch(e.keyCode) {

        // enter
        case 13: return (function() {
            gallery.modal.close();
        })();

        // esc
        case 27: return (function() {
            gallery.modal.close();
        })();

        // space
        case 32: return (function() {
            gallery.selectNext();
            return false;
        })();

        // left
        case 37: return (function() {
            gallery.selectPrev();
            return false;
        })();

        // right
        case 39: return (function() {
            gallery.selectNext();
            return false;
        })();
    }

}

apigy.Gallery.prototype.selectNext = function() {

    var selected = $('.photo-small.selected');

    if(selected.length > 0)
        var thumb = $('.photo-small.selected')
            .removeClass('selected')
            .next()
            .addClass('selected')
            .data('thumbnail');
    else
        var thumb = $('.photo-small:first').addClass('selected').data('thumbnail');

    if(thumb)
        this.modal.show(thumb);
    else
        this.modal.close();
}

apigy.Gallery.prototype.selectPrev = function() {

    var selected = $('.photo-small.selected');

    if(selected.length > 0)
        var thumb = $('.photo-small.selected')
            .removeClass('selected')
            .prev()
            .addClass('selected')
            .data('thumbnail');
    else
        var thumb = $('.photo-small:first').addClass('selected').data('thumbnail');

    if(thumb)
        this.modal.show(thumb);
    else
        this.modal.close();
}






/** ------------------------------------------------------------------------------------- */

apigy.Thumbnail = function(data) {
	var self = this;
	this.data = data;
}

apigy.Thumbnail.prototype.render = function() {
	// build the dom
	// TODO: refactor to use templates?
	this.$ = $([
		'<div class="photo-small">',
			'<div class="photo-small-inner">',
				'<div class="photo-small-image" style="width:',
					this.data.photo.thumbnail_width,'px;height:',this.data.photo.thumbnail_height,'px;">',
				'</div>',
			'</div>',
		'</div>',
	].join(''));

    this.$.data('thumbnail', this);

	var self = this;
	
	this.$.click(function() {
		self.onclick();
	})
	
	return this.$;
}

/** load the thumbnail image */
apigy.Thumbnail.prototype.load = function() {

    if(this.loaded) return;
    this.loaded = true;

    this.$.addClass('loading');
	this.image = new Image();

	var self = this;
	$(this.image)
		.attr('src', this.data.photo.thumbnail_src)
		.attr('width', this.data.photo.thumbnail_width)
		.attr('height', this.data.photo.thumbnail_height)
		.hide()
		.load(function() { 
			self.onload();
		})
		.error(function() {
			self.onerror()
		})
	
	// insert the image into the dom
	this.$.find('.photo-small-image').append(this.image);
}

/** unload the thumbnail image */
apigy.Thumbnail.prototype.unload = function() {
	
	// remove the image from the dom
	this.$.find('.photo-small-image')
		.empty()
		.addClass('loading');
}

/** callback for when the image is loaded */
apigy.Thumbnail.prototype.onload = function() {
	
	// needed to prevent repaints in firefox
	// without it firefox's cpu will sky rocket
	this.$.removeClass('loading');
	
	$(this.image).show();
}

/** callback incase there was an error loading the thumnail image */
apigy.Thumbnail.prototype.onerror = function() {
    this.$.find('.loading')
            .removeClass('loading')
            .addClass('broken-thumb')
}

/** callback for thumnail click */
apigy.Thumbnail.prototype.onclick = function() {
    $('.selected').removeClass('selected');
    this.$.addClass('selected');
	this.gallery.modal.show(this);
}

apigy.Thumbnail.prototype.getAdjustedPhotoSize = function() {
	
	var maskHeight = apigy.Modal.getMaskHeight() - 50;
	var maskWidth = $(window).width() - 80;
	
	var awidth = this.data.photo.image_width
	var aheight = this.data.photo.image_height;
	
	// check height
	if(maskHeight < aheight) {
		var ratio = maskHeight/aheight;
		aheight = ratio * aheight;
		awidth = ratio * awidth;
	}
	if(maskWidth < awidth) {
		var ratio = maskWidth/awidth;
		aheight = ratio * aheight;
		awidth = ratio * awidth;
	}
	
	return {'height':aheight,'width':awidth};
}

apigy.Thumbnail.prototype.renderContent = function(modal, callback) {
	
	if(!this.data.photo.type || this.data.photo.type == "photo") {
        
		var container = $('<div/>').addClass('image-container').css({ 'padding' : 10 });

		var image = new Image();

		var size = this.getAdjustedPhotoSize();

        var self = this;

		modal.growBox(size.width, size.height, function() {

			$(image)
                .attr('src', self.data.photo.preview_src || self.data.photo.image_src)
				.attr('width', size.width)
				.attr('height', size.height)
				.hide()
				.load(function() {
                    if(modal.closed) return;
                
						container.append(image);
						$(image).show();
						if(callback) callback();
				})
				.error(function() {
                    if(callback) callback();
                    container.parent().addClass('broken');
                })
		});

        modal.thumbnail = this;
        modal.showControls();

        modal.mask.unbind('click').click(function() {
			modal.close();
            modal.hideControls();
		})
			
		return container;
	}
	else
	if(this.data.photo.type == "iframe") {
		var iframe = $('<iframe />');
		var self = this;
		
		$(iframe)
			.attr('width', this.data.photo.image_width)
			.attr('height', this.data.photo.image_height)
			.css({'border' : '0px solid #fff', 'padding' : 10})
			.attr('src', this.data.photo.image_src)
			.hide()
			.load(function() {
				modal.growBox(self.data.photo.image_width, self.data.photo.image_height, function() {
					iframe.show();
					if(callback) callback();
				});
			})
			.error(function() {
			});

		modal.mask.unbind('click').click(function() {
			modal.close();
		})

		return iframe;
	}
	else
	if(this.data.photo.type == "load") {
		
		var self = this;
		var container = $('<div />');
		container.hide().load(self.data.photo.image_src, null, function() {
			modal.growBox(self.data.photo.image_width, self.data.photo.image_height, function() {
				container.show();
				if(callback) callback();
			})
		});
		
		modal.mask.unbind('click').click(function() {
			modal.close();
		});
		
		return container;
	}
	else
	if(this.data.photo.type == "inline") {
		var self = this;
		var container = $('<div />');
		container.hide().append($(self.data.photo.image_src))
		modal.growBox(self.data.photo.image_width, self.data.photo.image_height, function() {
			container.show();
			if(callback) callback();
		})

		return container;
	}
	
}










/** ------------------------------------------------------------------------------------- */
apigy.Modal = function(type, msg) {
	
	this.mask = apigy.Modal.makeMask();
	this.box = apigy.Modal.makeBox();

    this.closed = true;
    
	$('body')
		.append(this.mask)
		.append(this.box);
	
	$(window)
		.unbind('resize', apigy.Modal.resize)
		.resize(apigy.Modal.resize)
	
	if(type == "error") {
		this.show(new apigy.Thumbnail({
			"photo" : {
			'type' : 'inline',
			'image_src' : '<div class="error" style="margin:20px">'+msg+'</div>',
			'image_width' : 300,
			'image_height' : 56
			}
		}));
	}
}

apigy.Modal.prototype.close = function() {
    this.closed = true;
    this.hideControls();
    
	$("#apigy-modal-mask").hide();
	$("#apigy-modal-box")
        .stop()
		.empty()
		.css({
			'width' : 120,
			'height' : 120,
			'top' : $('#header').outerHeight() + (apigy.Modal.getMaskHeight()/2) - ((100+20)/2),
			'left' : ($(window).width()/2) - ((100+20)/2),
	 	})
		.addClass('loading')
		.hide();
}

apigy.Modal.resize = function() {
	
	$('#apigy-modal-mask').css({
		'width' : $(window).width(),
		'height' : apigy.Modal.getMaskHeight(),
		'top' : $('#header').outerHeight(),
		'left' : 0     
	});
	
	var box = $('#apigy-modal-box');
	box.css({
		'top' : $('#header').outerHeight() + (apigy.Modal.getMaskHeight()/2) - ((box.outerHeight())/2),
		'left' : ($(window).width()/2) - (box.width()/2),  
	});
	
}

apigy.Modal.getMaskHeight = function() {
	return $(window).height() - $('#header').outerHeight() - $('#footer').outerHeight();
}

apigy.Modal.makeMask = function() {
	return $('<div/>')
		.attr('id', 'apigy-modal-mask')
		.css({
			'width' : $(window).width(),
			'height' : apigy.Modal.getMaskHeight(),
			'background' : '#000',
			'opacity' : '0',
			'position' : 'fixed',
			'top' : $('#header').outerHeight(),
			'left' : 0     
		})
		.hide();
}

apigy.Modal.makeBox = function() {

	var maskHeight = apigy.Modal.getMaskHeight();
	
	var box = $('<div/>')
		.attr('id', 'apigy-modal-box')
		.addClass('loading')
		.css({
			'width' : 100 + 20,
			'height' : 100 + 20,
			'position' : 'fixed',
			// 'padding' : '10px',
//			'background-color' : '#fff',
			'top' : $('#header').outerHeight() + (maskHeight/2) - ((100+20)/2),
			'left' : ($(window).width()/2) - ((100+20)/2),
			'-moz-border-radius' : 4,
			'-webkit-border-radius' : 4,
			'-webkit-box-shadow' : '0px 0px 10px #000',
			'-moz-box-shadow' : '0px 0px 5px #000',
			'opacity' : '0'
		})
		.hide();
	
	return box;
}


apigy.Modal.prototype.hideControls = function() {
    $('#apigy-controls-next').remove();
    $('#apigy-controls-prev').remove();
    $('#apigy-controls-close').remove();
    $('#apigy-controls-star').remove();
    $('#apigy-controls-download').remove();
}

apigy.Modal.prototype.showControls = function() {

    this.hideControls();
    var self = this;

    var n = $('<div id="apigy-controls-next" />');
    n.append('<img src="/images/icons/right.png" />');
    n.css({
        top : $(window).height()/2,
        right : 10,
        zindex : 9999,
        height : 32,
        width :32,
        position: "fixed"
    })

    n.click(function() {
        self.thumbnail.gallery.selectNext();
    })

    var p = $('<div id="apigy-controls-prev" />');
    p.append('<img src="/images/icons/left.png" />');
    p.css({
        top :$(window).height()/2,
        left : 10,
        zindex : 9999,
        height : 32,
        width :32,
        position: "fixed"
    })

    p.click(function() {
        self.thumbnail.gallery.selectPrev();
    })



    var close = $('<div id="apigy-controls-close" />');
    close.append('<img src="/images/icons/close.png" />');
    close.css({
        top : ($('#header').outerHeight() / 2) - 16,
        right : 10,
        zindex : 9999,
        height : 32,
        width :32,
        position: "fixed"
    })
    close.click(function() {
        self.close();
    })
    $('body').append(close);


    var star = $('<div id="apigy-controls-star" />');
    star.append('<img src="/images/icons/star.png" />');
    star.css({
        top : ($('#header').outerHeight() / 2) - 16,
        right : 10 + 32 + 5,
        zindex : 9999,
        height : 32,
        width :32,
        position: "fixed"
    })
    star.click(function() {
        alert('todo')
    })
    $('body').append(star);

    var download = $('<div id="apigy-controls-download" />');
    download.append('<a href="'+self.thumbnail.data.photo.image_src+'" target="_blank"><img src="/images/icons/download.png" /></a>');
    download.css({
        top : ($('#header').outerHeight() / 2) - 16,
        right : 10 + 2*32 + 2*5,
        zindex : 9999,
        height : 32,
        width :32,
        position: "fixed"
    })
    $('body').append(download);


    $('body').append(n);
    $('body').append(p);
}


apigy.Modal.prototype.show = function(thumbnail) {

    this.closed = false;

	var self = this;

    self.box.empty().addClass('loading').removeClass('broken');
	this.mask.show().apigy_css({'opacity' : .8}, 'fast', function() {
		self.box.show().apigy_css({'opacity' : 1}, 'fast', function() {
			self.box.append(thumbnail.renderContent(self, function() {
				self.box.show();
//                self.showControls();
				self.box.removeClass('loading')
			}));
		});
	})
	
}

apigy.Modal.prototype.growBox = function(width, height, callback) {
	
	var maskHeight = apigy.Modal.getMaskHeight();
	
	var self = this;

    var time = 350;
    if(parseInt(this.box.css('width')) == parseInt(width + 20) &&
            parseInt(this.box.css('height')) == parseInt(height + 20)) {
        time = 0;
    }

	this.box
		.addClass('loading')
//        .css('opacity', .5)
		.apigy_css({
			'width' : width + 20,
			'height' : height + 20,
			'top' : $('#header').outerHeight() + (maskHeight/2) - ((height+20)/2),
			'left' : ($(window).width()/2) - ((width+20)/2),
		}, time, function() {
			callback();
//            self.box.css('opacity', 1)
		});
		
};



















































