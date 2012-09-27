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
goog.provide('bc.mode.Line');

goog.require('bc.Mode');
goog.require('bc.model.Line');
goog.require('bc.math.Point');

/**
 * @param {bc.model.Canvas} canvas
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Line = function(canvas) {
	bc.Mode.call(this, canvas);

	/** @type {Array.<bc.math.Point>} */
	this.points = [];

	/** @type {bc.math.Point|null} */
	this.movingPoint = null;

	/** @type {bc.model.Line|null} */
	this.activeLine = null;
};
goog.inherits(bc.mode.Line, bc.Mode);

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseDown = function(point) {
	if (this.activeLine) {
		this.activeLine.controlPoints(this.getPoints());
	}

	this.points.push(new bc.math.Point(point.x, point.y));

	if (this.activeLine) {
		this.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, {
			id: this.activeLine.id,
			controlPoints: this.getPoints()
		}));
	}
	else {
		this.movingPoint = new bc.math.Point(point.x, point.y);

		var action = new bc.model.Action(bc.model.ActionType.CreateLine, {
			controlPoints: this.getPoints(this.movingPoint)
		});
		this.canvas.runAction(action);
		this.activeLine = /** @type {bc.model.Line|null} */(this.canvas.getItem(action.params.id));
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseMove = function(point) {
	if (this.activeLine) {
		this.movingPoint = new bc.math.Point(point.x, point.y);
		this.activeLine.controlPoints(this.getPoints(this.movingPoint));
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.keyDown = function(e) {
	if(e.keyCode == goog.events.KeyCodes.ENTER && this.activeLine) {
		this.activeLine.controlPoints(this.points);
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
		this.onDeactivate();
		return true;
	}
};

bc.mode.Line.prototype.onDeactivate = function() {
	this.points = [];
	this.movingPoint = null;
	this.activeLine = null;
};

/**
 * Return a clone of the points array. Don't pass around the original points 
 * array because we change it in here.
 * 
 * @param {bc.math.Point=} extraPoint
 * @return {Array.<bc.math.Point>}
 */
bc.mode.Line.prototype.getPoints = function(extraPoint) {
	if (extraPoint)
		return this.points.concat([extraPoint]);
	else
		return this.points.concat([]);
};
