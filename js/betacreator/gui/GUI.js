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

goog.require('bc.domBuilder');
goog.require('bc.gui.ColorPicker');
goog.require('bc.gui.OptionBar');
goog.require('bc.gui.TextArea');
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');

/**
 * @param {bc.Client} client
 * @param {Object} config
 *
 * @constructor
 */
bc.GUI = function(client, config) {
	var me = this;

	this.client = client;
	this.config = config;
	
	this.wrapper = bc.domBuilder({
		id: 'betacreator',
		children: [
			{
				classes: 'fullsize viewport',
				create: function(dom) {
					me.viewport = dom;
				}
			},{
				classes: 'fullsize hitdiv',
				create: function(dom) {
					me.hitTestDiv = dom;
				}
			},{
				classes: 'bc-gui',
				create: function(dom) {
					me.uiContainer = dom;
				}
			},{
				create: function(dom) {
					me.modalContainer = dom;
				}
			}
		]
	});
	
	// add the canvas view to the viewport
	/** @type {bc.controller.Canvas} */
	this.canvasController = this.client.canvasController;
	goog.dom.appendChild(this.viewport, this.canvasController.view.container);

	// create the option bar and add it to the ui container
	/** @type {bc.gui.OptionBar} */
	this.optionBar = new bc.gui.OptionBar(this.config);
	goog.dom.appendChild(this.uiContainer, this.optionBar.container);

	// create the color picker and add it to the ui container
	/** @type {bc.gui.ColorPicker} */
	this.colorPicker = new bc.gui.ColorPicker();
	goog.dom.appendChild(this.uiContainer, this.colorPicker.container);
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SHOW_COLOR_PICKER, function(x, y, callback, color) {
		me.colorPicker.show(
			/** @type {number} */(x),
			/** @type {number} */(y),
			/** @type {function(?bc.Color)} */(callback),
			/** @type {null|bc.Color} */(color)
		);
	});

	// create textarea for inputing text content
	this.textArea = new bc.gui.TextArea();
	goog.dom.appendChild(this.modalContainer, this.textArea.container);
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SHOW_TEXT_AREA, function(callback, defaultText) {
		me.textArea.show(
			/** @type {function(string)} */(callback),
			/** @type {?string|undefined} */(defaultText)
		);
	});
};

/**
 * Called after the gui has been added to the DOM
 */
bc.GUI.prototype.init = function() {
	// bind all mouse event listeners
	this.bindEventListeners();

	this.optionBar.init();
};

/**
 * Bind mouse and keyboard event listeners to hitTestDiv and document respectively
 * @private
 */
bc.GUI.prototype.bindEventListeners = function() {
	var me = this;
	
	// mousedown on everything to hide overlays
	goog.events.listen(this.wrapper, goog.events.EventType.MOUSEDOWN, function(e) {
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);
	});

	// mouse down
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEDOWN, function(e) {
		me.canvasController.mouseDown(e);
	});
	
	// mouse move
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEMOVE, function(e) {
		me.canvasController.mouseMove(e);
	});
	
	// mouse up
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEUP, function(e) {
		me.canvasController.mouseUp(e);
	});

	// double click
	goog.events.listen(this.hitTestDiv, goog.events.EventType.DBLCLICK, function(e) {
		me.canvasController.dblClick(e);
	});
	
	// key down
	goog.events.listen(document, goog.events.EventType.KEYDOWN, function(e) {
		e.stopPropagation();

		if (me.canvasController.keyDown(e))
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
			case goog.events.KeyCodes.T:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.TEXT);
				break;
			case goog.events.KeyCodes.V:
			case goog.events.KeyCodes.ESC:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
				break;
			case goog.events.KeyCodes.Y:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.redo();
				}
				break;
			case goog.events.KeyCodes.Z:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					if (e.shiftKey)
						me.canvasController.redo();
					else
						me.canvasController.undo();
				}
				break;
			case goog.events.KeyCodes.BACKSPACE:
			case goog.events.KeyCodes.DELETE:
				preventDefault = false;
				me.canvasController.startUndoBatch();
				goog.array.forEach(me.canvasController.getSelectedItems(), function(item) {
					var properties = null;
					if (item.isStamp) {
						preventDefault = true;
						properties = bc.model.Stamp.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteStamp, properties));
					}
					else if (item.isLine) {
						preventDefault = true;
						properties = bc.model.Line.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteLine, properties));
					}
					else if (item.isText) {
						preventDefault = true;
						properties = bc.model.Text.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteText, properties));
					}
				});
				me.canvasController.endUndoBatch();
				me.canvasController.deselectAll();
				break;
			case goog.events.KeyCodes.DASH:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.zoomOut();
				}
				break;
			case goog.events.KeyCodes.EQUALS:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.zoomIn();
				}
				break;
			default:
				break;
		}
		
		if (preventDefault)
			e.preventDefault();
	});
};
