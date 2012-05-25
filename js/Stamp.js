goog.provide('bc.model.Stamp');
goog.provide('bc.model.Anchor');

/**
 * @param {Object=} params
 * @constructor
 */
bc.model.Stamp = function(params) {
	params = params || {};
	
    this.scale = params.scale || 1;
    this.color = params.color || '#ffff00';
    this.alpha = params.alpha || 1;
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.w = params.w || 20;
    this.h = params.h || 20;
	
	this.padding = 10;
	
	this.canvas = $('<canvas width="' + (this.w + 2*this.padding) + '" + height="' + (this.h + 2*this.padding) + '"></canvas>')
		.css({ 'position': 'absolute' });
}

/**
 * @param {Object) params
 * @return {Object}
 */
bc.model.Stamp.parseParams = function(params) {
	params = params || {};
	
	return {
		type:	params['t'],
		scale:	params['s'],
		color:	params['c'],
		alpha:	params['a'],
		x:		params['x'],
		y:		params['y'],
		w:		params['w'],
		h:		params['h']
	};
}

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.serializeParams = function() {
	return {
		't': this.type,
		's': this.scale,
		'c': this.color,
		'a': this.alpha,
		'x': this.x,
		'y': this.y,
		'w': this.w,
		'h': this.h
	};
}

bc.model.Stamp.prototype.draw = function() {}

/**
 * @param {number=) pageScale
 */
bc.model.Stamp.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.scale,
		canvasWidth = Math.round(scale*this.w) + 2*this.padding,
		canvasHeight = Math.round(scale*this.h) + 2*this.padding;
	
	this.canvas.css({
		'left': Math.round(pageScale*this.x - canvasWidth/2) + 'px',
		'top': Math.round(pageScale*this.y - canvasHeight/2) + 'px'
	});
}

/**
 * @param {number=) pageScale
 * 
 * @return {boolean}
 */
bc.model.Stamp.prototype.render = function(pageScale) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.scale;
	
	var drawProperties = {
		w: this.w,
		h: this.h,
		color: this.color,
		alpha: this.alpha,
		scale: scale
	};
	
	var locationProperties = {
		x: this.x,
		y: this.y,
		w: this.w,
		h: this.h,
		scale: scale
	}
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;
		
		var ctx = this.canvas.get(0).getContext('2d'),
			canvasWidth = Math.round(scale*this.w) + 2*this.padding,
			canvasHeight = Math.round(scale*this.h) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.save();
		ctx.translate(this.padding, this.padding);
		ctx.scale(scale, scale);
		
		this.draw(ctx);
		
		ctx.restore();
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
}


/**
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.Anchor = function(params) {
	params = params || {};
	bc.model.Stamp.call(this, params);
	
    this.scale = params.scale || 1;
    this.color = params.color || '#000000';
    this.alpha = params.alpha || 1;
}
goog.inherits(bc.model.Anchor, bc.model.Stamp);

bc.model.Anchor.prototype.draw = function(ctx) {
   	ctx.fillStyle = '#ffffff';
   	ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(this.w,this.h);
    ctx.moveTo(this.w,0);
    ctx.lineTo(0,this.h);
	
	var startAngle = 0,
		r = Math.min(this.w,this.h)/2;
    ctx.moveTo(this.w/2 + r*Math.cos(startAngle), this.h/2 + r*Math.sin(startAngle));
    ctx.arc(this.w/2,this.h/2,r,startAngle,Math.PI*2);

    ctx.stroke();
}
