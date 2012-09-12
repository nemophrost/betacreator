goog.provide('bc.Color');
goog.provide('bc.color');
goog.provide('bc.color.alpha');

goog.require('goog.color');
goog.require('goog.color.alpha');


/**
 * @param {string} c The color string to parse
 * @param {?string=} defaultColor The color to fall back on if c is invalid
 * @return {Object}
 */
bc.color.parse = function(c, defaultColor) {
	defaultColor = defaultColor || '#ffffff';
	c = c || defaultColor;
	
	if (!goog.isString(c))
		throw Error(c + ' is not a valid 6-hex color string');
	
	if(c.length > 7 && c[0] == '#')
		c = c.substr(0,7);
	
	if(defaultColor.length > 7 && defaultColor[0] == '#')
		defaultColor = defaultColor.substr(0,7);
	
	try {
		return goog.color.parse(c);
	}
	catch(e) {
		return bc.color.parse(/** @type {string} */ (defaultColor), '#ffffff');
	}
};

/**
 * @param {string} c The color string to parse
 * @param {?string=} defaultColor The color to fall back on if c is invalid
 * @return {Object}
 */
bc.color.alpha.parse = function(c, defaultColor) {
	defaultColor = defaultColor || '#ffffff';
	c = c || defaultColor;
	
	if (!goog.isString(c))
		throw Error(c + ' is not a valid 8-hex color string');

	try {
		return goog.color.alpha.parse(c);
	}
	catch(e) {
		try {
			var nonAlphaColor = bc.color.parse(c, defaultColor).hex;
			return bc.color.alpha.parse(nonAlphaColor + 'ff', defaultColor + 'ff');
		}
		catch(er) {
			return bc.color.alpha.parse(/** @type {string} */ (defaultColor), '#ffffffff');
		}
	}
};

/**
 * @param {string} color A hex string representing a color
 * @param {number=} alpha The alpha for the returned white or black (defaults to 1)
 * 
 * @return {string} hex or rgba style string for drawing on a canvas
 */
bc.color.highContrastWhiteOrBlack = function(color, alpha) {
	alpha = alpha || 1;
	
	var ret = goog.color.highContrast(
		goog.color.hexToRgb(goog.color.parse(color).hex),
		[
			[0,0,0],
			[255,255,255]
		]
	);
	
	if (alpha < 1) {
		ret.push(alpha);
		return goog.color.alpha.rgbaArrayToRgbaStyle(ret);
	}
	else {
		return goog.color.rgbArrayToHex(ret);
	}
};





/**
 * @param {?bc.Color|string|Array.<number>|Object=} color
 * @param {string|Array.<number>|bc.Color|Object=} defaultColor
 * 
 * @constructor
 */
bc.Color = function(color, defaultColor) {

	/** @type {boolean} */
	this.isColor = true;

	/** 
	 * @type {number}
	 * @private
	 */
	this._r = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._g = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._b = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._a = 0;

	if (!color && defaultColor)
		color = defaultColor;
	
	if (!color)
		return;
	
	if (goog.isString(color)) {
		if (color.toLowerCase() == 'transparent')
			color = '#0000';
		this.ahex(color);
	}
	else if (goog.isArray(color) && color.length >= 3) {
		this.rgba([
			color[0],
			color[1],
			color[2],
			goog.isNumber(color[3]) ? color[3] : 1
		]);
	}
	else if (color.isColor) {
		this.clone(/** @type {bc.Color} */(color));
	}
	else if (goog.isObject(color)) {
		if ('h' in color && 's' in color && 'v' in color) {
			this.hsv([color['h'], color['s'], color['v'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
		else if ('h' in color && 's' in color && 'l' in color) {
			this.hsl([color['h'], color['s'], color['l'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
		else if ('r' in color && 'g' in color && 'b' in color) {
			this.rgba([color['r'], color['g'], color['b'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
	}
};

/**
 * @param {bc.Color} color
 * 
 * @return {bc.Color}
 */
bc.Color.prototype.clone = function(color) {
	this._r = color._r;
	this._g = color._g;
	this._b = color._b;
	this._a = color._a;
	
	return this;
};

/**
 * @param {string=} hex
 * 
 * @return {bc.Color|string}
 */
bc.Color.prototype.hex = function(hex) {
	if  (hex === undefined)
		return goog.color.rgbArrayToHex(/** @type {Array.<number>} */ (this.rgb()));
	
	return this.ahex(hex);
};

/**
 * @param {string=} ahex
 * 
 * @return {bc.Color|string}
 */
bc.Color.prototype.ahex = function(ahex) {
	if  (ahex === undefined)
		return goog.color.alpha.rgbaArrayToHex(/** @type {Array.<number>} */ (this.rgba()));
	
	var rgba = goog.color.alpha.hexToRgba(bc.color.alpha.parse(ahex).hex);
	
	this._r = rgba[0];
	this._g = rgba[1];
	this._b = rgba[2];
	this._a = rgba[3];
	
	return this;
};

/**
 * @param {Array.<number>=} rgb
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.rgb = function(rgb) {
	if (rgb === undefined)
		return [this._r, this._g, this._b];
	
	return this.rgba(rgb);
};

/**
 * r [0-255]
 * g [0-255]
 * b [0-255]
 * a [0-1]
 * 
 * @param {Array.<number>=} rgba
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.rgba = function(rgba) {
	if (rgba === undefined)
		return [this._r, this._g, this._b, this._a];
	
	this._r = goog.math.clamp(Math.round(rgba[0]), 0, 255);
	this._g = goog.math.clamp(Math.round(rgba[1]), 0, 255);
	this._b = goog.math.clamp(Math.round(rgba[2]), 0, 255);
	this._a = goog.math.clamp(/** @type {number} */ (goog.isNumber(rgba[3]) ? rgba[3] : 1), 0, 1);
	
	return this;
};


/**
 * @param {Array.<number>=} hsl
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsl = function(hsl) {
	if (hsl === undefined)
		return goog.color.rgbToHsl(this._r, this._g, this._b);
	
	return this.hsla(hsl);
};


/**
 * h [0-360]
 * s [0-1]
 * l [0-1]
 * a [0-1]
 * 
 * @param {Array.<number>=} hsla
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsla = function(hsla) {
	if (hsla === undefined)
		return /** @type {Array}*/(this.hsl()).concat([this._a]);
	
	var h = goog.math.clamp(Math.round(360 + hsla[0])%360, 0, 360),
		s = goog.math.clamp(hsla[1], 0, 1),
		l = goog.math.clamp(hsla[2], 0, 1),
		a = goog.math.clamp(goog.isNumber(hsla[3]) ? hsla[3] : 1, 0, 1),
		rgb = goog.color.hslToRgb(h, s, l);

	this._r = rgb[0];
	this._g = rgb[1];
	this._b = rgb[2];
	this._a = a;
	
	return this;
};


/**
 * h [0-360]
 * s [0-1]
 * v [0-1]
 * 
 * @param {Array.<number>=} hsv
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsv = function(hsv) {
	if (hsv === undefined) {
		var ret = goog.color.rgbArrayToHsv(/** @type {Array.<number>} */ (this.rgb()));
		ret[0] = this.hsl()[0],
		ret[2] /= 255;
		return ret;
	}
	
	var h = goog.math.clamp(Math.round(360 + hsv[0])%360, 0, 360),
		s = goog.math.clamp(hsv[1], 0, 1),
		v = goog.math.clamp(hsv[2], 0, 1),
		a = goog.math.clamp(goog.isNumber(hsv[3]) ? hsv[3] : 1, 0, 1),
		rgb = goog.color.hsvToRgb(h, s, goog.math.clamp(Math.round(v*255), 0, 255));

	this._r = rgb[0];
	this._g = rgb[1];
	this._b = rgb[2];
	this._a = a;
	
	return this;
};

/**
 * @return {string}
 */
bc.Color.prototype.rgbStyle = function() {
	return goog.color.hexToRgbStyle(/** @type {string} */ (this.hex()));
};

/**
 * @return {string}
 */
bc.Color.prototype.rgbaStyle = function() {
	return goog.color.alpha.hexToRgbaStyle(/** @type {string} */ (this.ahex()));
};

/**
 * Serialize the color for storage in a property
 * @param {boolean=} asObject
 *
 * @return {string|Object}
 */
bc.Color.prototype.serialize = function(asObject) {
    if(!asObject)
		return /** @type {string} */ (this.ahex());
	
    else
        return {
            'r': this._r,
            'g': this._g,
            'b': this._b,
            'a': this._a
		};
};

