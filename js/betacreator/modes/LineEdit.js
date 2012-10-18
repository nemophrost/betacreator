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
goog.provide('bc.mode.LineEdit');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {number} id
 * 
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.LineEdit = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	/** @type {goog.math.Coordinate|null} */
	this.mouseDownPoint = null;

	/** @type {bc.model.Line|null} */
	this.activeLine = null;

	/** @type {goog.math.Coordinate|null} */
	this.controlPoint = null;

	/** @type {goog.math.Coordinate|null} */
	this.originalControlPoint = null;
};
goog.inherits(bc.mode.LineEdit, bc.Mode);

/**
 * Called each time the mode is activated
 */
bc.mode.LineEdit.prototype.onActivate = function() {
	var me = this;
	goog.array.some(this.canvas.getSelectedItems(), function(item) {
		if (item.type() == bc.model.ItemTypes.LINE) {
			me.activeLine = /** @type {bc.model.Line} */(item);
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
			return true;
		}

		return false;
	});
};

/**
 * Called each time the mode is deactivated
 */
bc.mode.LineEdit.prototype.onDeactivate = function() {
	this.mouseDownPoint = null;
	this.activeLine = null;
	this.controlPoint = null;
	this.originalControlPoint = null;
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseDown = function(point) {
	// just in case
	if (this.mouseDownPoint)
		this.mouseUp(point);

	if (!this.activeLine)
		return;

	var me = this;

	// check if we are near a control point, if so store it and a clone
	goog.array.some(this.activeLine.controlPoints(), function(cp, i) {
		if (goog.math.Coordinate.squaredDistance(/** @type {!goog.math.Coordinate} */(point), /** @type {!goog.math.Coordinate} */(cp)) < 100) {
			me.controlPoint = cp;
			me.originalControlPoint = cp.clone();
			return true;
		}

		return false;
	});

	if (this.controlPoint)
		this.mouseDownPoint = point;
	else
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseMove = function(point) {
	// if we have an active control point we are moving, just change it's x and y values directly
	if (this.mouseDownPoint && this.activeLine && this.controlPoint) {
		this.controlPoint.x = this.originalControlPoint.x + point.x - this.mouseDownPoint.x;
		this.controlPoint.y = this.originalControlPoint.y + point.y - this.mouseDownPoint.y;
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseUp = function(point) {
	this.mouseMove(point);

	if (this.mouseDownPoint && this.activeLine && this.controlPoint) {
		// copy the control points in a new array
		var newCPs = [];
		goog.array.forEach(this.activeLine.controlPoints(), function(cp) {
			newCPs.push(cp.clone());
		});

		// set the active control point back to what it was so when we run an action,
		// the undo history will be correct
		this.controlPoint.x = this.originalControlPoint.x;
		this.controlPoint.y = this.originalControlPoint.y;

		var changed = { id: this.activeLine.id };
		changed[bc.properties.LINE_CONTROLPOINTS] = newCPs;
		this.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
	}

	this.mouseDownPoint = null;
	this.controlPoint = null;
	this.originalControlPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.keyDown = function(e) {
	if(e.keyCode == goog.events.KeyCodes.ENTER) {
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
		return true;
	}
};
