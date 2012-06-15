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
goog.provide('bc.mode.Anchor');

goog.require('bc.Mode');
goog.require('bc.model.stamp.Anchor');
goog.require('bc.math.Point');

/**
 * @param {bc.model.Canvas} canvas
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Anchor = function(canvas) {
	bc.Mode.call(this, canvas);
}
goog.inherits(bc.mode.Anchor, bc.Mode);

/**
 * @inheritDoc
 */
bc.mode.Anchor.prototype.mouseDown = function(point) {
	this.canvas.runAction(new bc.model.Action(bc.model.ActionType.CreateStamp, {
		type: 'anchor',
		x: point.x,
		y: point.y
	}));
}

/**
 * @inheritDoc
 */
bc.mode.Anchor.prototype.getCursor = function() {
	return 'url(http://cdn1.iconfinder.com/data/icons/BRILLIANT/sports/png/24/ballooning.png) 12 12';
}
