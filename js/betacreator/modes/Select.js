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
goog.provide('bc.mode.Select');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {number} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Select = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	/** @type {goog.math.Coordinate|null} */
	this.mouseDownPoint = null;
};
goog.inherits(bc.mode.Select, bc.Mode);

/**
 * Called each time the mode is deactivated
 */
bc.mode.Select.prototype.onDeactivate = function() {
	this.mouseDownPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseDown = function(point) {
	var me = this,
		deselect = true;

	// just in case
	if (this.mouseDownPoint)
		this.mouseUp(point);

	this.mouseDownPoint = point;

	// loop through top down
	this.canvas.model.eachOrderedItem(function(item) {
		if (item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			me.canvas.selectItem(item);
			deselect = false;
			return true;
		}
	});

	if (deselect)
		this.canvas.deselectAll();
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseMove = function(point) {
	var me = this;
	if (this.mouseDownPoint) {
		goog.array.forEach(this.canvas.getSelectedItems(), function(item, i) {
			item.setOffset(new goog.math.Coordinate(point.x - me.mouseDownPoint.x, point.y - me.mouseDownPoint.y));
		});
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseUp = function(point) {
	var me = this;
	if (this.mouseDownPoint) {
		var dx = point.x - this.mouseDownPoint.x,
			dy = point.y - this.mouseDownPoint.y;

		if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
			goog.array.forEach(this.canvas.getSelectedItems(), function(item, i) {
				var changed = item.applyOffset(new goog.math.Coordinate(dx, dy));
				changed.id = item.id;
				me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
			});
		}
	}

	this.mouseDownPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.dblClick = function(point) {
	var item,
		me = this;
	
	// loop through top down
	this.canvas.model.eachOrderedItem(function(item) {
		if (item.type() == bc.model.ItemTypes.LINE && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE_EDIT);
			return true;
		}
		else if (item.type() == bc.model.ItemTypes.BELAY && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			var text = prompt(bc.i18n('Enter text for the belay:'), item.text());

			if (text !== null && text != item.text()) {
				var changed = { id: item.id };
				changed[bc.properties.TEXT] = text;
				me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
			}
			return true;
		}
		else if (item.type() == bc.model.ItemTypes.TEXT && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.SHOW_TEXT_AREA, function(text) {
				if (text !== null && text != item.text()) {
					var changed = { id: item.id };
					changed[bc.properties.TEXT] = text;
					me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
				}
			}, item.text());
			return true;
		}
	});
};

