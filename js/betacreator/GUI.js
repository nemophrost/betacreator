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
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');

/**
 * @param {bc.Client} client
 *
 * @constructor
 */
bc.GUI = function(client) {
	this.client = client;
	
	// create the wrapper
	this.wrapper = goog.dom.createDom(goog.dom.TagName.DIV);
	
	// create the viewport
	this.viewport = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.wrapper, this.viewport);
	
	// create the hit test div
	this.hitTestDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.wrapper, this.hitTestDiv);
	
	// create the ui container div
	this.uiContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'absolute');
	goog.dom.appendChild(this.wrapper, this.uiContainer);
	
	// create the canvas view and add it to the viewport
	this.canvas = new bc.view.Canvas(this.client.canvas);
	goog.dom.appendChild(this.viewport, this.canvas.container);
	
	// bind all mouse event listeners
	this.bindEventListeners();
}

/**
 * bind mouse and keyboard event listeners to hitTestDiv and document respectively
 */
bc.GUI.prototype.bindEventListeners = function() {
	var me = this;
	
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
	
	// key down
	goog.events.listen(document, goog.events.EventType.KEYDOWN, function(e) {
		var preventDefault = false;
		switch (e.keyCode) {
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
		
		e.stopPropagation();
	});
}
