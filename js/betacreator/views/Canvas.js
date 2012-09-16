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

goog.provide('bc.view.Canvas');

goog.require('bc.model.Canvas');
goog.require('bc.view.Line');
goog.require('bc.view.stamp.Anchor');
goog.require('goog.dom');

/**
 * @param {bc.model.Canvas} model
 * @constructor
 */
bc.view.Canvas = function(model) {
	this.model = model;
	
	this.container = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.container, this.model.image);
	
	this.itemContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.container, this.itemContainer);
	
	/** @type {Object.<string,bc.view.Item>} */
	this.views = {};
	
	setInterval(goog.bind(this.checkRender, this), 10);
	
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.CANVAS_RENDER, goog.bind(this.invalidate, this));
};

/**
 * @param {boolean=} force Force re-render
 * @private
 */
bc.view.Canvas.prototype.invalidate = function(force) {
	this.needsRender = true;
	
	if (force)
		this.checkRender();
};

/**
 * @private
 */
bc.view.Canvas.prototype.checkRender = function() {
	if (this.needsRender)
		this.render();
		
	this.needsRender = false;
};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Canvas.prototype.render = function(pageScale) {
	var itemIdMap = {};
	
	for (var i = 0, l = this.model.items.length; i < l; i++) {
		this.renderItem(this.model.items[i], pageScale);
		itemIdMap[this.model.items[i].id] = true;
	}
	
	// destroy the views for any deleted items
	for (var viewId in this.views) {
		if (!itemIdMap[viewId]) {
			this.views[viewId].destroy();
			delete this.views[viewId];
		}
	}
};

/**
 * @param {bc.model.Item} item
 * @param {number=} pageScale
 * @private
 */
bc.view.Canvas.prototype.renderItem = function(item, pageScale) {
	pageScale = pageScale || 1;
	
	var view = this.views[item.id];
	// if no view exists for the item, create it
	if (!view) {
		switch (item.type) {
			case 'line':
				view = new bc.view.Line(/** @type {bc.model.Line} */(item));
				break;
			case 'anchor':
				view = new bc.view.stamp.Anchor(/** @type {bc.model.stamp.Anchor} */(item));
				break;
			default:
				break;
		}
		
		// if for some reason there is still now view, return early
		if (!view)
			return;
		
		this.views[item.id] = view;
		goog.dom.appendChild(this.container, view.canvas);
	}
	
	view.render(pageScale, this.model.isItemSelected(item));
};

/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/
