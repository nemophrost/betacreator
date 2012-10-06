/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Line');

goog.require('bc.model.Item');
goog.require('bc.math');
goog.require('bc.object');
goog.require('bc.render.DashedLine');
goog.require('bc.uuid');
goog.require('goog.array');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Line = function(params, defaults) {
	params = params || {};
	
	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.LINE;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || defaults[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = params.color || defaults[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || defaults[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_LINEWIDTH] = params.lineWidth || 3;
	this.properties[bc.properties.LINE_CONTROLPOINTS] = params.controlPoints || [];
	this.properties[bc.properties.LINE_ONLENGTH] = params.onLength || defaults[bc.properties.LINE_ONLENGTH];
	this.properties[bc.properties.LINE_OFFLENGTH] = goog.isNumber(params.offLength) ? params.offLength : defaults[bc.properties.LINE_OFFLENGTH];
	this.properties[bc.properties.LINE_CURVED] = params.curved || defaults[bc.properties.LINE_CURVED];


	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.controlPoints = /** @type {function(Array.<goog.math.Coordinate>=):Array.<goog.math.Coordinate>} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CONTROLPOINTS));
	this.onLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_ONLENGTH));
	this.offLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_OFFLENGTH));
	this.curved = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CURVED));
	
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_LINEWIDTH,
		bc.properties.LINE_CONTROLPOINTS,
		bc.properties.LINE_ONLENGTH,
		bc.properties.LINE_OFFLENGTH,
		bc.properties.LINE_CURVED
	];

	this.offset = new goog.math.Coordinate(0,0);
	
	/** @type {Array.<goog.math.Coordinate>} */
	this.points = [];
	
	this.updatePoints();
};

/**
* Get points along a curve
* 
* @param {number} sx start x
* @param {number} sy start y
* @param {number} cx Control point x
* @param {number} cy Control point y
* @param {number} x
* @param {number} y
* @param {number} pointDistance
* 
* @return {Array.<goog.math.Coordinate>}
*/
bc.model.Line.prototype.getCurvePoints = function(sx, sy, cx, cy, x, y, pointDistance) {
	/** @type {Array.<goog.math.Coordinate>} */
	var ret = [];
	
	/** @type {number} */
	var segLength = bc.math.Line.curveLength(sx, sy, cx, cy, x, y);
	/** @type {number} */
	var t = 0;
	/** @type {number} */
	var t2 = 0;
	/** @type {Array.<number>} */
	var c;
	
	var remainLength = segLength;
	var fullDashCount = Math.floor(remainLength/pointDistance);
	var ont = pointDistance/segLength;
	
	if (fullDashCount){
		for (var i=0; i<fullDashCount; i++){
			t2 = t + ont;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			ret.push(new goog.math.Coordinate(c[4], c[5]));
			t = t2;
		}
		
		ret.push(new goog.math.Coordinate(x, y));
	}
	
	return ret;
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/

/**
 * Apply the offset to all the control points and return the result
 *
 * @return {Object}
 */
bc.model.Line.prototype.applyOffset = function() {	
	var me = this,
		cp = [],
		ret = {};
	
	goog.array.forEach(this.controlPoints(), function(point) {
		cp.push(new goog.math.Coordinate(point.x + me.offset.x, point.y + me.offset.y));
	});
	
	this.offset.x = 0;
	this.offset.y = 0;

	ret[bc.properties.LINE_CONTROLPOINTS] = cp;
	return ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Line.parseParams = function(params) {
	params = params || {};
	
	var ret = {
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		lineWidth:	params[bc.properties.ITEM_LINEWIDTH],
		onLength:	params[bc.properties.LINE_ONLENGTH],
		offLength:	params[bc.properties.LINE_OFFLENGTH],
		curved:		params[bc.properties.LINE_CURVED]
	};
	
	if (params[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(params[bc.properties.LINE_CONTROLPOINTS])) {
		var cp = [];
		goog.array.forEach(params[bc.properties.LINE_CONTROLPOINTS], function(point) {
			cp.push(new goog.math.Coordinate(point['x'], point['y']));
		});
		ret.controlPoints = cp;
	}
	
	return ret;
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Line.prototype.setOffset = function(p) {
	this.offset = p;
};

/**
 * @return {Object}
 */
bc.model.Line.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	var cps = [];
	if (ret[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(ret[bc.properties.LINE_CONTROLPOINTS])) {
		goog.array.forEach(ret[bc.properties.LINE_CONTROLPOINTS], function(p) {
			cps.push({
				'x': p.x,
				'y': p.y
			});
		});
		ret[bc.properties.LINE_CONTROLPOINTS] = cps;
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Line.prototype.getActionParams = function() {
	var me = this,
		ret = {};

	goog.array.forEach(this.actionProperties, function(key) {
		ret[key] = me.properties[key];
	});

	return ret;
};

/**
 * @param {Object} params
 */
bc.model.Line.prototype.setActionParams = function(params) {
	var me = this;
	goog.array.forEach(this.actionProperties, function(key) {
		if (params[key] !== undefined)
			me.properties[key] = params[key];
	});
};

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.Line.prototype.hitTest = function(x,y,selected) {
	var p = this.points,
		minDist = this.lineWidth()*this.scale()/2 + 6;
	
	for(var i = 0, l = p.length - 1; i < l; i++) {
		if(bc.math.distanceFromLineSegment(new goog.math.Coordinate(x,y),p[i],p[i+1]) < minDist) {
			return true;
		}
	}
	return false;
};

/**
 * Calculate the bounding box based on the control points and set the 'bb' property.
 */
bc.model.Line.prototype.updateBoundingBox = function() {
	if (this.controlPoints().length === 0) {
		this.bb = null;
		return;
	}
	
	var minX = Number.MAX_VALUE,
		maxX = Number.MIN_VALUE,
		minY = Number.MAX_VALUE,
		maxY = Number.MIN_VALUE;
	
	goog.array.forEach(this.controlPoints(), function(point) {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	});
	
	this.bb = new bc.math.Box(minX, minY, maxX - minX, maxY - minY);
};

/**
 * Get all the points for the line (used in hit test) and set the 'points'
 * property
 */
bc.model.Line.prototype.updatePoints = function() {
	var me = this;
	
	/** @type {Array.<goog.math.Coordinate>} */
	var ret = [];
	
	var pointDistance = 10;
	
	if (this.curved()) {
		var cps = this.controlPoints(),
			cpLength = cps.length;
		
		goog.array.forEach(cps, function(cp, i) {
			// for first point, just move to it
			if (i === 0) {
				ret.push(new goog.math.Coordinate(cp.x, cp.y));
			}
			else {
				var prevCP = cps[i - 1];
				
				// for second point just add a point at half way between it and
				// the first
				if (i == 1)
					ret.push(new goog.math.Coordinate((cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2));
				// for every other points, get the points for the curve from the
				// previous half-way point to the current half-way point
				else
					ret = ret.concat(me.getCurvePoints(
							ret[ret.length-1].x,
							ret[ret.length-1].y,
							prevCP.x,
							prevCP.y,
							(cp.x + prevCP.x)/2,
							(cp.y + prevCP.y)/2,
							pointDistance
						));
				
				// if it's the last point, add it
				if (i == cpLength - 1)
					ret.push(new goog.math.Coordinate(cp.x, cp.y));
			}
		});
	}
	else {
		goog.array.forEach(this.controlPoints(), function(cp, i) {
			ret.push(new goog.math.Coordinate(cp.x, cp.y));
		});
	}
	
	this.points = ret;
};
