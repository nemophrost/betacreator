goog.provide('bc.color');

goog.require('goog.color');
goog.require('goog.color.alpha');

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
} 
