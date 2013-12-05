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
goog.require('bc.view.stamp.Anchor');
goog.require('bc.view.stamp.Piton');
goog.require('bc.view.stamp.Rappel');
goog.require('bc.view.stamp.Belay');
goog.require('bc.view.Text');
goog.require('bc.view.Line');
goog.require('goog.dom');

/**
 * @param {bc.controller.Canvas} controller
 * @param {bc.model.Canvas} model
 * @constructor
 */
bc.view.Canvas = function(controller, model) {
	this.controller = controller;
	this.model = model;

	/**
	 * @type {number}
	 * @private
	 */
	this.scaleLastRender = 1;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.needsRender = true;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.needsCentering = false;
	
	this.container = goog.dom.createDom(goog.dom.TagName.DIV, 'canvas-container');
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
		this.render(this.model.scale);
		
	this.needsRender = false;
};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Canvas.prototype.render = function(pageScale) {
	var me = this,
		itemIdMap = {};
	
	this.model.eachItem(function(item) {
		me.renderItem(item, pageScale);
		itemIdMap[item.id] = true;
	}, true);
	
	// destroy the views for any deleted items
	for (var viewId in this.views) {
		if (!itemIdMap[viewId]) {
			this.views[viewId].destroy();
			delete this.views[viewId];
		}
	}

	// if the page scale has changed, change the image size and center when zooming
	if (this.model.scale != this.scaleLastRender || this.needsCentering) {
		goog.style.setStyle(this.container, {
			'width': Math.round(this.model.scale*this.model.w) + 'px',
			'height': Math.round(this.model.scale*this.model.h) + 'px'
		});

		if (this.needsCentering) {
			this.controller.setCenterOffset();

			this.needsCentering = false;
		}
		else {
			this.controller.setZoomOffset(this.model.scale/this.scaleLastRender);
		}

		this.container.style.left = this.controller.offset.x + 'px';
		this.container.style.top = this.controller.offset.y + 'px';
	}

	this.scaleLastRender = this.model.scale;
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
		switch (item.type()) {
			case bc.model.ItemTypes.ANCHOR:
				view = new bc.view.stamp.Anchor(/** @type {bc.model.stamp.Anchor} */(item));
				break;
			case bc.model.ItemTypes.PITON:
				view = new bc.view.stamp.Piton(/** @type {bc.model.stamp.Piton} */(item));
				break;
			case bc.model.ItemTypes.RAPPEL:
				view = new bc.view.stamp.Rappel(/** @type {bc.model.stamp.Rappel} */(item));
				break;
			case bc.model.ItemTypes.BELAY:
				view = new bc.view.stamp.Belay(/** @type {bc.model.stamp.Belay} */(item));
				break;
			case bc.model.ItemTypes.TEXT:
				view = new bc.view.Text(/** @type {bc.model.Text} */(item));
				break;
			case bc.model.ItemTypes.LINE:
				view = new bc.view.Line(/** @type {bc.model.Line} */(item));
				break;
			default:
				break;
		}
		
		// if for some reason there is still now view, return early
		if (!view)
			return;
		
		this.views[item.id] = view;
		goog.dom.appendChild(this.itemContainer, view.canvas);
	}
	
	view.render(pageScale, this.controller.isItemSelected(item), this.controller.mode.id);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

bc.view.Canvas.prototype.centerInViewport = function() {
	this.needsCentering = true;
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number=} scale
 */
bc.view.Canvas.prototype.renderToContext = function(ctx, scale) {
	var me = this;
	this.model.eachItem(function(item) {
		if (me.views[item.id])
			me.views[item.id].renderToContext(ctx, scale);
	});
};
