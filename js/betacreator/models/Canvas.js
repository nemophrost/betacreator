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

goog.provide('bc.model.Canvas');

goog.require('bc.mode.Select');
goog.require('bc.mode.Line');
goog.require('bc.mode.Anchor');
goog.require('bc.mode.LineEdit');
goog.require('bc.model.Action');
goog.require('bc.property');
goog.require('goog.array');

/**
 * @param {bc.Client} client
 * @param {Image} image
 * @constructor
 */
bc.model.Canvas = function(client, image) {
	var me = this;
	
	this.client = client;
	this.image = image;
	
	this.h = image.height;
	this.w = image.width;
	
	/** @type {Array.<bc.model.Item>} */
	this.items = [];

	/** @type {Object} */
	this.properties = {};

	/** @type {string|null} */
	this.selected = null;

	bc.property.canvas = this;

	this.tempLine = new bc.model.Line({
		controlPoints: [ new goog.math.Coordinate(0,0) ]
	});

	this.addItem(this.tempLine);
	
	/* Modes
	 ======================================================================== */
	
	this.modes = {};

	this.modes[bc.Client.modes.SELECT] = new bc.mode.Select(this, bc.Client.modes.SELECT);
	this.modes[bc.Client.modes.LINE] = new bc.mode.Line(this, bc.Client.modes.LINE, this.tempLine);
	this.modes[bc.Client.modes.ANCHOR] = new bc.mode.Anchor(this, bc.Client.modes.ANCHOR);
	// this.modes[bc.Client.modes.PITON] = new bc.mode.Piton(this, bc.Client.modes.PITON);
	// this.modes[bc.Client.modes.RAPPEL] = new bc.mode.Rappel(this, bc.Client.modes.RAPPEL);
	// this.modes[bc.Client.modes.BELAY] = new bc.mode.Belay(this, bc.Client.modes.BELAY);
	// this.modes[bc.Client.modes.TEXT] = new bc.mode.Text(this, bc.Client.modes.TEXT);
	this.modes[bc.Client.modes.LINE_EDIT] = new bc.mode.LineEdit(this, bc.Client.modes.LINE_EDIT);


	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.MODE, function(mode) {
		if (me.modes[mode]) {
			var changed = me.mode != me.modes[mode];

			if (changed && me.mode && me.mode.onDeactivate)
				me.mode.onDeactivate();

			me.mode = me.modes[mode];

			if (changed && me.mode.onActivate)
				me.mode.onActivate();
		}
	});
	
	/** @type {bc.Mode} */
	this.mode = this.modes.SELECT;
	
	
	/* Undo/redo functionality
	 ======================================================================== */
	
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
 * @param {bc.model.Item} item
 * @private
 */
bc.model.Canvas.prototype.addItem = function(item) {
	this.items.push(item);
};

/**
 * @param {bc.model.Item} item
 * @private
 */
bc.model.Canvas.prototype.removeItem = function(item) {
	goog.array.remove(this.items, item);
};

/**
 * @param {Event} e
 * @return {goog.math.Coordinate}
 * @private
 */
bc.model.Canvas.prototype.eventToCoord = function(e) {
	var x = e.clientX,
		y = e.clientY,
		offset = goog.style.getPageOffset(this.client.gui.viewport);
	
	return new goog.math.Coordinate(x - offset.x, y - offset.y);
};

/**
 * @private
 */
bc.model.Canvas.prototype.initUndoData = function() {
	
};

/**
 * Start a batch of actions that should be undone as a unit.
 * @private
 */
bc.model.Canvas.prototype.startUndoBatch = function() {
	this.undoBatchLevel++;
};

/**
 * Put an action into the current undo history batch.
 * @param {bc.model.Action} a
 * @private
 */
bc.model.Canvas.prototype.addToUndoBatch = function(a) {
	this.undoBatch.unshift(a);
};

/**
 * End a batch of actions that should be undone as a unit
 * @private
 */
bc.model.Canvas.prototype.endUndoBatch = function() {	
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
bc.model.Canvas.prototype.canUndo = function() {
	return this.undoHistory.length > 0;
};

/**
 * @return {boolean} True if there is something in the redo history
 * @private
 */
bc.model.Canvas.prototype.canRedo = function() {
	return this.redoHistory.length > 0;
};

/**
 * Undoes the most recent batch in the undo history
 * @private
 */
bc.model.Canvas.prototype.undo = function() {
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
 * @private
 */
bc.model.Canvas.prototype.redo = function() {
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
 * Clears all undo and redo history
 * @private
 */
bc.model.Canvas.prototype.clearUndoHistory = function() {
	this.undoHistory = [];
	this.redoHistory = [];
};



/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * @param {bc.model.Action} action
 * @return {boolean} success
 */
bc.model.Canvas.prototype.runAction = function(action) {
	var item;
	switch (action.type) {
		case bc.model.ActionType.CreateStamp:
			switch (action.params.type) {
				case bc.model.ItemTypes.ANCHOR:
					item = new bc.model.stamp.Anchor(action.params);
					break;
				default:
					break;
			}
			
			if (item) {
				action.params.id = item.id;
				this.addItem(item);
			}
			else
				return false;
			
			break;
		case bc.model.ActionType.CreateLine:
			if (action.params.controlPoints && action.params.controlPoints.length > 1) {
				item = new bc.model.Line(action.params);
				action.params.id = item.id;
				this.addItem(item);
			}
			else {
				return false;
			}
			
			break;
		case bc.model.ActionType.EditItem:
			item = this.getItem(action.params.id);
			
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
		case bc.model.ActionType.DeleteLine:
			item = this.getItem(action.params.id);
			
			if (item)
				this.removeItem(item);
			else
				return false;
			
			break;
		default:
			return false;
	}
	
	this.startUndoBatch();
	
	if(!action.isUndo && !action.isRedo)
		this.addToUndoBatch(action);

	this.endUndoBatch();

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	
	return true;
};

/**
 * @param {bc.model.Item} item
 * @return {boolean}
 */
bc.model.Canvas.prototype.isItemSelected = function(item) {
	return this.selected == item.id;
};

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.selectItem = function(item) {
	this.selected = item.id;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @return {Array.<bc.model.Item>} items
 */
bc.model.Canvas.prototype.getSelectedItems = function() {
	if (!this.selected)
		return [];

	var item = this.getItem(this.selected);

	if (item)
		return [item];
	else
		return [];
};

/**
 */
bc.model.Canvas.prototype.deselectAll = function() {
	this.selected = null;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {string} id
 * @return {bc.model.Item|null}
 */
bc.model.Canvas.prototype.getItem = function(id) {
	return /** @type {bc.model.Item|null} */(goog.array.find(this.items, function(item) {
		return item.id == id;
	}));
};

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseDown = function(e) {
	this.mode.mouseDown(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseMove = function(e) {
	this.mode.mouseMove(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseUp = function(e) {
	this.mode.mouseUp(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.dblClick = function(e) {
	this.mode.dblClick(this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.keyDown = function(e) {
	return this.mode.keyDown(e);
};
