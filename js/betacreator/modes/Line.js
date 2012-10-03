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
goog.require('goog.math.Coordinate');

/**
 * @param {bc.model.Canvas} canvas
 * @param {number} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Line = function(canvas, id, tempLine) {
	bc.Mode.call(this, canvas, id);

	/** @type {Array.<goog.math.Coordinate>} */
	this.points = [];

	/** @type {goog.math.Coordinate|null} */
	this.movingPoint = null;

	/** @type {bc.model.Line|null} */
	this.activeLine = null;

	/** @type {bc.model.Line} */
	this.tempLine = tempLine;
};
goog.inherits(bc.mode.Line, bc.Mode);

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseDown = function(point) {
	if (this.activeLine) {
		this.activeLine.controlPoints(this.getPoints());
	}

	this.points.push(new goog.math.Coordinate(point.x, point.y));

	if (this.activeLine) {
		var changed = { id: this.activeLine.id };
		changed[bc.properties.LINE_CONTROLPOINTS] = this.getPoints();
		this.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
	}
	else if (this.points.length > 1) {
		this.resetTempLine();
		var action = new bc.model.Action(bc.model.ActionType.CreateLine, {
			controlPoints: this.getPoints()
		});
		this.canvas.runAction(action);
		this.activeLine = /** @type {bc.model.Line|null} */(this.canvas.getItem(action.params.id));
	}
	else {
		this.movingPoint = new goog.math.Coordinate(point.x, point.y);
		this.tempLine.controlPoints(this.getPoints(this.movingPoint));
		this.tempLine.onLength(this.canvas.properties[bc.properties.LINE_ONLENGTH]);
		this.tempLine.offLength(this.canvas.properties[bc.properties.LINE_OFFLENGTH]);
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseMove = function(point) {
	var affectedLine = this.activeLine || this.tempLine;
	if (affectedLine) {
		this.movingPoint = new goog.math.Coordinate(point.x, point.y);
		affectedLine.controlPoints(this.getPoints(this.movingPoint));
		affectedLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.keyDown = function(e) {
	if(e.keyCode == goog.events.KeyCodes.ENTER && this.activeLine) {
		this.onDeactivate();
		return true;
	}
};

bc.mode.Line.prototype.onDeactivate = function() {
	if (this.activeLine) {
		this.activeLine.controlPoints(this.getPoints());
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
	this.points = [];
	this.movingPoint = null;
	this.activeLine = null;
	this.resetTempLine();
};

/**
 * Return a clone of the points array. Don't pass around the original points 
 * array because we change it in here.
 * 
 * @param {goog.math.Coordinate=} extraPoint
 * @return {Array.<goog.math.Coordinate>}
 * @private
 */
bc.mode.Line.prototype.getPoints = function(extraPoint) {
	if (extraPoint)
		return this.points.concat([extraPoint]);
	else
		return this.points.concat([]);
};

/**
 * @private
 */
bc.mode.Line.prototype.resetTempLine = function() {
	this.tempLine.controlPoints([new goog.math.Coordinate(0,0)]);
};
