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

goog.provide('bc.math');
goog.provide('bc.math.Box');
goog.provide('bc.math.Line');


/**
 * @param {number} x
 * @param {number} y
 * 
 * @constructor
 */
bc.math.Box = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

/**
 * Return a string with set precision (number of decimal places) and trailing zeroes removed
 * @param {number} value
 * @param {number=} precision
 * @return {string}
 */
bc.math.toFixed = function(value, precision) {
	return value.toFixed(precision || 0).replace(/^([^\.]*)$/, '$1.').replace(/\.?0*$/, '');
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number=} ex
 * @param {number=} ey
 * 
 * @return {number}
 */
bc.math.Line.lineLength = function(sx, sy, ex, ey) {
	if (arguments.length == 2)
		return Math.sqrt(sx*sx + sy*sy);
	
	var dx = ex - sx;
	var dy = ey - sy;
	return Math.sqrt(dx*dx + dy*dy);
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} accuracy
 * 
 * @return {number}
 */ 
bc.math.Line.curveLength = function(sx, sy, cx, cy, ex, ey, accuracy) {
	/** @type {number} */
	var total = 0;
	/** @type {number} */
	var tx = sx;
	/** @type {number} */
	var ty = sy;
	/** @type {number} */
	var px;
	/** @type {number} */
	var py;
	/** @type {number} */
	var t;
	/** @type {number} */
	var it;
	/** @type {number} */
	var a;
	/** @type {number} */
	var b;
	/** @type {number} */
	var c;
	
	/** @type {number} */
	var n = accuracy || 6;
	
	for (var i = 1; i <= n; i++){
		t = i/n;
		it = 1-t;
		a = it*it;
		b = 2*t*it;
		c = t*t;
		px = a*sx + b*cx + c*ex;
		py = a*sy + b*cy + c*ey;
		total += bc.math.Line.lineLength(tx, ty, px, py);
		tx = px;
		ty = py;
	}
	return total;
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number} t1
 * @param {number} t2
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSlice = function(sx, sy, cx, cy, ex, ey, t1, t2) {
	if (t1 == 0)
		return bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
	else if (t2 == 1)
		return bc.math.Line.curveSliceFrom(sx, sy, cx, cy, ex, ey, t1);
	
	var c = bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
	c.push(t1/t2);
	
	return bc.math.Line.curveSliceFrom.apply(null, c);
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} t
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSliceUpTo = function(sx, sy, cx, cy, ex, ey, t) {
	//if (t == undefined) t = 1;
	t = t || 1;
	if (t != 1) {
		var midx = cx + (ex-cx)*t;
		var midy = cy + (ey-cy)*t;
		cx = sx + (cx-sx)*t;
		cy = sy + (cy-sy)*t;
		ex = cx + (midx-cx)*t;
		ey = cy + (midy-cy)*t;
	}
	return [sx, sy, cx, cy, ex, ey];
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} t
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSliceFrom = function(sx, sy, cx, cy, ex, ey, t) {
	//if (t == undefined) t = 1;
	t = t || 1;
	if (t != 1) {
		var midx = sx + (cx-sx)*t;
		var midy = sy + (cy-sy)*t;
		cx = cx + (ex-cx)*t;
		cy = cy + (ey-cy)*t;
		sx = midx + (cx-midx)*t;
		sy = midy + (cy-midy)*t;
	}
	return [sx, sy, cx, cy, ex, ey];
};


/**
 * @param {goog.math.Coordinate} c The point to measure from
 * @param {goog.math.Coordinate} a First endpoint of the line segment
 * @param {goog.math.Coordinate} b Second endpoint of the line segment
 * 
 * @return {number} Distance from c to the line segment
 */
bc.math.distanceFromLineSegment = function(c, a, b) {
	var r_numerator = (c.x-a.x)*(b.x-a.x) + (c.y-a.y)*(b.y-a.y),
		r_denomenator = (b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y),
		r = r_numerator / r_denomenator,
		px = a.x + r*(b.x-a.x),
		py = a.y + r*(b.y-a.y),
		s = ((a.y-c.y)*(b.x-a.x)-(a.x-c.x)*(b.y-a.y) ) / r_denomenator,
		distanceLine = Math.abs(s)*Math.sqrt(r_denomenator),
		distanceSegment;

	if ( (r >= 0) && (r <= 1) ) {
		distanceSegment = distanceLine;
	}
	else {
		var dist1 = (c.x-a.x)*(c.x-a.x) + (c.y-a.y)*(c.y-a.y),
			dist2 = (c.x-b.x)*(c.x-b.x) + (c.y-b.y)*(c.y-b.y);
		
		if (dist1 < dist2)
			distanceSegment = Math.sqrt(dist1)
		else
			distanceSegment = Math.sqrt(dist2)
	}

	return distanceSegment;
};
