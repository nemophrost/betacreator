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

goog.require('bc.mode.Anchor');
goog.require('bc.model.Action');

/**
 * @constructor
 */
bc.model.Canvas = function(image) {
	var me = this;
	
	this.image = image;
	
	this.h = image.height;
	this.w = image.width;
	
	/** @type {Array.<bc.model.Item>} */
	this.items = [];
	
	
	/* Modes
	 ======================================================================== */
	
	this.modes = {
		ANCHOR: new bc.mode.Anchor(this)
	};
	
	/** @type {bc.Mode} */
	this.mode = this.modes.ANCHOR;
	
	
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
}

/**
 * @param {bc.model.Item} item
 * @private
 */
bc.model.Canvas.prototype.addItem = function(item) {
	this.items.push(item);
}

/**
 * @param {Event} e
 * @return {bc.math.Point}
 * @private
 */
bc.model.Canvas.prototype.eventToCoord = function(e) {
	var x = e.clientX,
		y = e.clientY;
	
	return new bc.math.Point(x, y);
}

/**
 * @private
 */
bc.model.Canvas.prototype.initUndoData = function() {
	
}

/**
 * Start a batch of actions that should be undone as a unit.
 * @private
 */
bc.model.Canvas.prototype.startUndoBatch = function() {
	this.undoBatchLevel++;
}

/**
 * Put an action into the current undo history batch.
 * @param {bc.model.Action} a
 * @private
 */
bc.model.Canvas.prototype.addToUndoBatch = function(a) {
	this.undoBatch.unshift(a);
}

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
}

/**
 * @return {boolean} True if there is something in the undo history
 * @private
 */
bc.model.Canvas.prototype.canUndo = function() {
	return this.undoHistory.length > 0;
}

/**
 * @return {boolean} True if there is something in the redo history
 * @private
 */
bc.model.Canvas.prototype.canRedo = function() {
	return this.redoHistory.length > 0;
}

/**
 * Undoes the most recent batch in the undo history
 * @private
 */
bc.model.Canvas.prototype.undo = function() {
	if(this.undoHistory.length == 0)
		return;
	
	var oldBatch = this.undoHistory[0];
	var newBatch = [];
	
	var me = this;
	bc.array.map(oldBatch, function(a) {
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
}

/**
 * Redoes the most recent batch in the redo history
 * @private
 */
bc.model.Canvas.prototype.redo = function() {
	if(this.redoHistory.length == 0)
		return;
	
	var oldBatch = this.redoHistory[0];
	var newBatch = [];

	var me = this;
	bc.array.map(oldBatch, function(a) {
		a = bc.model.Action.getReverseAction(a);
		if(a != null) {
			a.isRedo = true;
			a.isUndo = false;
			newBatch.unshift(a);
			
			me.runAction(a);
		}
	})
	
	//Remove the old actionset from the start of the redo history.
	this.redoHistory.shift();
	
	//Add the new actionset to the undo history
	this.undoHistory.unshift(newBatch);
}

/**
 * Clears all undo and redo history
 * @private
 */
bc.model.Canvas.prototype.clearUndoHistory = function() {
	this.undoHistory = [];
	this.redoHistory = [];
}



/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * @param {bc.model.Action} action
 */
bc.model.Canvas.prototype.runAction = function(action) {
	switch (action.type) {
		case bc.model.ActionType.CreateStamp:
			var stamp;
			switch (action.params.type) {
				case 'anchor':
					stamp = new bc.model.stamp.Anchor(action.params);
					break;
				default:
					break;
			}
			
			if (stamp)
				this.addItem(stamp);
			
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVASRENDER);
			
			break;
		default:
			break;
	}
}

/**
 * @param {bc.model.Item} item
 * @return {boolean}
 */
bc.model.Canvas.prototype.isItemSelected = function(item) {
	return false;
}

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseDown = function(e) {
	this.mode.mouseDown(this.eventToCoord(e));
}

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseMove = function(e) {
	this.mode.mouseMove(this.eventToCoord(e));
}

/**
 * @param {Event} e
 */
bc.model.Canvas.prototype.mouseUp = function(e) {
	this.mode.mouseUp(this.eventToCoord(e));
}
