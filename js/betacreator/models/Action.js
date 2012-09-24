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
goog.provide('bc.model.Action');
goog.provide('bc.model.ActionType');

goog.require('bc.object');

/**
 * The set of kinds of actions that can be taken on a canvas.
 * @enum {number}
 */
bc.model.ActionType = {
	CreateStamp:	1,
	CreateLine:		2,
	CreateText:		3,
	EditItem:		4,
	DeleteStamp:	5,
	DeleteLine:		6,
	DeleteText:		7
};

/**
 * Represents one action in the undo history of a canvas.
 *
 * @param {bc.model.ActionType} type Type of action taken
 * @param {Object} params Further parameters for this action
 *
 * @constructor
 */
bc.model.Action = function(type, params) {
	/**
	 * The type of action taken
	 * @type {bc.model.ActionType}
	 */
	this.type = type;
	
	/**
	 * @type {Object}
	 */
	this.params = params;
	
	/**
	 * @type {?Object}
	 */
	this.oldParams = null;
	
	/**
	 * @type {boolean}
	 */
	this.isRedo = false;
	
	/**
	 * @type {boolean}
	 */
	this.isUndo = false;
};

/**
 * Return a copy of an action
 * 
 * @return {bc.model.Action}
 */
bc.model.Action.prototype.copy = function() {
	return new bc.model.Action(this.type, bc.object.copy(this.params));
};

/**
 * Given an action, return the action that undoes that action.
 * @param {bc.model.Action} action Original action
 * @return {bc.model.Action} The reverse of that action
 */
bc.model.Action.getReverseAction = function(action) {
	var ret = action.copy();
	
	switch(action.type) {
		case bc.model.ActionType.CreateStamp:
			ret.type = bc.model.ActionType.DeleteStamp;
			break;

		case bc.model.ActionType.CreateLine:
			ret.type = bc.model.ActionType.DeleteLine;
			break;

		case bc.model.ActionType.CreateText:
			ret.type = bc.model.ActionType.DeleteText;
			break;

		case bc.model.ActionType.EditItem:
			ret.params = bc.object.copy(action.oldParams);
			break;

		case bc.model.ActionType.DeleteStamp:
			ret.type = bc.model.ActionType.CreateStamp;
			break;

		case bc.model.ActionType.DeleteLine:
			ret.type = bc.model.ActionType.CreateLine;
			break;

		case bc.model.ActionType.DeleteText:
			ret.type = bc.model.ActionType.CreateText;
			break;

		default:
			return null;
	}
	
	return ret;
};
