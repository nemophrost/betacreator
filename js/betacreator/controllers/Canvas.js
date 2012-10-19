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

goog.provide('bc.controller.Canvas');

goog.require('bc.mode.Select');
goog.require('bc.mode.Line');
goog.require('bc.mode.Stamp');
goog.require('bc.mode.Text');
goog.require('bc.mode.LineEdit');
goog.require('bc.model.Action');
goog.require('bc.model.stamp.Anchor');
goog.require('bc.model.stamp.Piton');
goog.require('bc.model.stamp.Rappel');
goog.require('bc.model.stamp.Belay');
goog.require('bc.model.Text');
goog.require('bc.model.Line');
goog.require('bc.model.Canvas');
goog.require('bc.view.Canvas');
goog.require('goog.array');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.Client} client
 * @param {Image} image
 * @constructor
 */
bc.controller.Canvas = function(client, image) {
	var me = this;
	
	this.client = client;
	this.model = new bc.model.Canvas(this, image);
	this.view = new bc.view.Canvas(this, this.model);

	this.offset = new goog.math.Coordinate();

	/** @type {string|null} */
	this.selected = null;

	bc.property.canvas = this;
	
	/* Modes
	========================================================================= */
	
	this.modes = {};

	this.modes[bc.Client.modes.SELECT] = new bc.mode.Select(this, bc.Client.modes.SELECT);
	this.modes[bc.Client.modes.LINE] = new bc.mode.Line(this, bc.Client.modes.LINE, this.model.tempLine);
	this.modes[bc.Client.modes.STAMP] = new bc.mode.Stamp(this, bc.Client.modes.STAMP);
	this.modes[bc.Client.modes.TEXT] = new bc.mode.Text(this, bc.Client.modes.TEXT);
	this.modes[bc.Client.modes.LINE_EDIT] = new bc.mode.LineEdit(this, bc.Client.modes.LINE_EDIT);

	var lastModeParam = null;
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.MODE, function(mode, param) {
		if (me.modes[mode]) {
			var changed = me.mode != me.modes[mode] || lastModeParam != param;

			if (changed && me.mode && me.mode.onDeactivate)
				me.mode.onDeactivate();

			me.mode = me.modes[mode];

			if (changed && me.mode.onActivate)
				me.mode.onActivate(param);

			lastModeParam = param;
		}
	});
	
	/** @type {bc.Mode} */
	this.mode = null;
	
	
	/* Undo/redo functionality
	========================================================================= */
	
	/**
	 * A list of actions that have been done that could be undone.
	 * @type {Array.<Array.<bc.model.Action>>}
	 */
	this.undoHistory = [];
	
	/**
	 * A list of actions that have been undone that could be redone.
	 * @type {Array.<Array.<bc.model.Action>>}
	 */
	this.redoHistory = [];
	
	/**
	 * Depth of the current undo batch.  When this is zero,
	 * we commit the current batch to undoHistory.
	 * @type {number}
	 */
	this.undoBatchLevel = 0;
	
	/**
	 * A list of actions that have been done that could be undone.
	 * When undoBatchLevel reaches 0, these are committed to
	 * undoHistory.
	 * @type {Array.<bc.model.Action>}
	 */
	this.undoBatch = [];
	
	//Just in case some Javascript error keeps endUndoBatch from getting
	//called, call it ourselves very frequently so that not too much undo
	//data gets bunched up together.
	setInterval(function() {
		me.endUndoBatch();
	}, 100);
};

/**
 * Start a batch of actions that should be undone as a unit.
 */
bc.controller.Canvas.prototype.startUndoBatch = function() {
	this.undoBatchLevel++;
};

/**
 * End a batch of actions that should be undone as a unit
 */
bc.controller.Canvas.prototype.endUndoBatch = function() {	
	this.undoBatchLevel = Math.max(0, this.undoBatchLevel - 1);
	
	if(this.undoBatchLevel == 0 && this.undoBatch.length > 0) {
		this.undoHistory.unshift(this.undoBatch);
		this.redoHistory = [];
		this.undoBatch = [];
	}
};

/**
 * @return {boolean} True if there is something in the undo history
 * @private
 */
bc.controller.Canvas.prototype.canUndo = function() {
	return this.undoHistory.length > 0;
};

/**
 * @return {boolean} True if there is something in the redo history
 * @private
 */
bc.controller.Canvas.prototype.canRedo = function() {
	return this.redoHistory.length > 0;
};

/**
 * Clears all undo and redo history
 * @private
 */
bc.controller.Canvas.prototype.clearUndoHistory = function() {
	this.undoHistory = [];
	this.redoHistory = [];
};

/**
 * @param {Event} e
 * @return {goog.math.Coordinate}
 * @private
 */
bc.controller.Canvas.prototype.eventToCoord = function(e) {
	var x = e.clientX,
		y = e.clientY,
		offset = goog.style.getPageOffset(this.client.gui.viewport);
	
	return new goog.math.Coordinate(
		Math.round((x - offset.x - this.offset.x)/this.model.scale),
		Math.round((y - offset.y - this.offset.y)/this.model.scale)
	);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * Undoes the most recent batch in the undo history
 */
bc.controller.Canvas.prototype.undo = function() {
	if(this.undoHistory.length === 0)
		return;
	
	var oldBatch = this.undoHistory[0];
	var newBatch = [];
	
	var me = this;
	goog.array.forEach(oldBatch, function(a) {
		a = bc.model.Action.getReverseAction(a);
		if(a != null) {
			a.isUndo = true;
			a.isRedo = false;
			newBatch.unshift(a);
			
			me.runAction(a);
		}
	});
	
	//Remove the old actionset from the end of the undo history.
	this.undoHistory.shift();
	
	//Add the new actionset to the redo history
	this.redoHistory.unshift(newBatch);
};

/**
 * Redoes the most recent batch in the redo history
 */
bc.controller.Canvas.prototype.redo = function() {
	if(this.redoHistory.length === 0)
		return;
	
	var oldBatch = this.redoHistory[0];
	var newBatch = [];

	var me = this;
	goog.array.forEach(oldBatch, function(a) {
		a = bc.model.Action.getReverseAction(a);
		if(a != null) {
			a.isRedo = true;
			a.isUndo = false;
			newBatch.unshift(a);
			
			me.runAction(a);
		}
	});
	
	//Remove the old actionset from the start of the redo history.
	this.redoHistory.shift();
	
	//Add the new actionset to the undo history
	this.undoHistory.unshift(newBatch);
};

/**
 * @param {bc.model.Action} action
 * @return {boolean} success
 */
bc.controller.Canvas.prototype.runAction = function(action) {
	var item;
	switch (action.type) {
		case bc.model.ActionType.CreateStamp:
			switch (action.params.type) {
				case bc.model.ItemTypes.ANCHOR:
					item = new bc.model.stamp.Anchor(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.PITON:
					item = new bc.model.stamp.Piton(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.RAPPEL:
					item = new bc.model.stamp.Rappel(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.BELAY:
					item = new bc.model.stamp.Belay(action.params, this.model.properties);
					break;
				default:
					break;
			}
			
			if (item) {
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else
				return false;
			
			break;
		case bc.model.ActionType.CreateLine:
			if (action.params.controlPoints && action.params.controlPoints.length > 1) {
				item = new bc.model.Line(action.params, this.model.properties);
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else {
				return false;
			}
			
			break;
		case bc.model.ActionType.CreateText:
			if (action.params.text) {
				item = new bc.model.Text(action.params, this.model.properties);
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else {
				return false;
			}
			
			break;
		case bc.model.ActionType.EditItem:
			item = this.model.getItem(action.params.id);
			
			if (item) {
				if (!action.oldParams) {
					var allParams = item.getActionParams(),
						oldParams = {
							id: action.params.id
						};

					for (var key in action.params) {
						if (allParams[key] !== undefined)
							oldParams[key] = allParams[key];
					}
					action.oldParams = oldParams;
				}

				item.setActionParams(action.params);
			}
			else
				return false;
			
			break;
		case bc.model.ActionType.DeleteStamp:
		case bc.model.ActionType.DeleteText:
		case bc.model.ActionType.DeleteLine:
			item = this.model.getItem(action.params.id);
			
			if (item)
				this.model.removeItem(item);
			else
				return false;
			
			break;
		default:
			return false;
	}
	
	this.startUndoBatch();
	
	if(!action.isUndo && !action.isRedo)
		this.undoBatch.unshift(action);

	this.endUndoBatch();

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.ACTION);
	
	return true;
};

/**
 * @param {bc.model.Item} item
 * @return {boolean}
 */
bc.controller.Canvas.prototype.isItemSelected = function(item) {
	return this.selected == item.id;
};

/**
 * @param {bc.model.Item} item
 */
bc.controller.Canvas.prototype.selectItem = function(item) {
	this.selected = item.id;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @return {Array.<bc.model.Item>} items
 */
bc.controller.Canvas.prototype.getSelectedItems = function() {
	if (!this.selected)
		return [];

	var item = this.model.getItem(this.selected);

	if (item)
		return [item];
	else
		return [];
};

/**
 */
bc.controller.Canvas.prototype.deselectAll = function() {
	this.selected = null;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseDown = function(e) {
	this.mode.mouseDown(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseMove = function(e) {
	this.mode.mouseMove(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseUp = function(e) {
	this.mode.mouseUp(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.dblClick = function(e) {
	this.mode.dblClick(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.keyDown = function(e) {
	return this.mode.keyDown(e);
};

bc.controller.Canvas.prototype.zoomOut = function() {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);

	this.model.zoomOut();
};

bc.controller.Canvas.prototype.zoomIn = function() {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);

	this.model.zoomIn();
};

/**
 * @param {number|string} zoom can be a number (from 1-1200) or 'cover' or 'contain'
 */
bc.controller.Canvas.prototype.setZoom = function(zoom) {
	if (goog.isNumber(zoom)) {
		zoom /= 100;
	}
	else if (zoom == 'cover') {
		zoom = Math.max(
			this.client.viewportWidth/this.model.w,
			this.client.viewportHeight/this.model.h
		);
	}
	else { // contain
		zoom = Math.min(
			this.client.viewportWidth/this.model.w,
			this.client.viewportHeight/this.model.h
		);
	}

	this.model.zoomTo(zoom);

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {number} scaleFactor
 */
bc.controller.Canvas.prototype.setZoomOffset = function(scaleFactor) {
	var centerX = scaleFactor*(this.client.viewportWidth/2 - this.offset.x),
		centerY = scaleFactor*(this.client.viewportHeight/2 - this.offset.y);

	this.offset.x = -Math.round(centerX - this.client.viewportWidth/2);
	this.offset.y = -Math.round(centerY - this.client.viewportHeight/2);
};

bc.controller.Canvas.prototype.setCenterOffset = function() {
	this.offset.x = Math.round(this.client.viewportWidth/2 - this.model.w*this.model.scale/2);
	this.offset.y = Math.round(this.client.viewportHeight/2 - this.model.h*this.model.scale/2);
};
