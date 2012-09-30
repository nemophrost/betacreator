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
goog.provide('bc.GUI');

goog.require('bc.view.Canvas');
goog.require('bc.domBuilder');
goog.require('bc.gui.ColorPicker');
goog.require('bc.gui.OptionBar');
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');

/**
 * @param {bc.Client} client
 *
 * @constructor
 */
bc.GUI = function(client) {
	var me = this;

	this.client = client;
	
	this.wrapper = bc.domBuilder({
		id: 'betacreator',
		children: [
			{
				classes: 'fullsize viewport',
				create: function(dom) {
					me.viewport = dom;
				}
			},{
				classes: 'fullsize viewport',
				create: function(dom) {
					me.hitTestDiv = dom;
				}
			},{
				classes: 'bc-gui',
				create: function(dom) {
					me.uiContainer = dom;
				}
			}
		]
	});
	
	// create the canvas view and add it to the viewport
	this.canvas = new bc.view.Canvas(this.client.canvas);
	goog.dom.appendChild(this.viewport, this.canvas.container);

	// create the option bar and add it to the ui container
	this.optionBar = new bc.gui.OptionBar();
	goog.dom.appendChild(this.uiContainer, this.optionBar.container);

	// create the color picker and add it to the ui container
	this.colorPicker = new bc.gui.ColorPicker();
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SHOW_COLOR_PICKER, function(x, y, callback, color) {
		me.colorPicker.show(
			/** @type {number} */(x),
			/** @type {number} */(y),
			/** @type {function(?bc.Color)} */(callback),
			/** @type {null|bc.Color} */(color)
		);
	});
	goog.dom.appendChild(this.uiContainer, this.colorPicker.container);
	
	// bind all mouse event listeners
	this.bindEventListeners();

	this.optionBar.init();
};

/**
 * bind mouse and keyboard event listeners to hitTestDiv and document respectively
 */
bc.GUI.prototype.bindEventListeners = function() {
	var me = this;
	
	// mousedown on everything to hide overlays
	goog.events.listen(this.wrapper, goog.events.EventType.MOUSEDOWN, function(e) {
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);
	});

	// mouse down
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEDOWN, function(e) {
		me.canvas.model.mouseDown(e);
	});
	
	// mouse move
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEMOVE, function(e) {
		me.canvas.model.mouseMove(e);
	});
	
	// mouse up
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEUP, function(e) {
		me.canvas.model.mouseUp(e);
	});

	// double click
	goog.events.listen(this.hitTestDiv, goog.events.EventType.DBLCLICK, function(e) {
		me.canvas.model.dblClick(e);
	});
	
	// key down
	goog.events.listen(document, goog.events.EventType.KEYDOWN, function(e) {
		e.stopPropagation();

		if (me.canvas.model.keyDown(e))
			return;

		var preventDefault = false;
		switch (e.keyCode) {
			case goog.events.KeyCodes.A:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.ANCHOR);
				break;
			case goog.events.KeyCodes.B:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.BELAY);
				break;
			case goog.events.KeyCodes.L:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE);
				break;
			case goog.events.KeyCodes.P:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.PITON);
				break;
			case goog.events.KeyCodes.R:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.RAPPEL);
				break;
			case goog.events.KeyCodes.V:
			case goog.events.KeyCodes.ESC:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
				break;
			case goog.events.KeyCodes.Y:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.client.canvas.redo();
				}
				break;
			case goog.events.KeyCodes.Z:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					if (e.shiftKey)
						me.client.canvas.redo();
					else
						me.client.canvas.undo();
				}
				break;
			default:
				break;
		}
		
		if (preventDefault)
			e.preventDefault();
	});
};
