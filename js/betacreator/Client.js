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
goog.provide('bc.Client');

//goog.require('bc.view.Line');
//goog.require('bc.view.stamp.Anchor');
goog.require('bc.GUI');
goog.require('bc.model.Canvas');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.pubsub.PubSub');

/**
 * @param {Image} sourceImg
 * @param {Object=} params
 *
 * @constructor
 */
bc.Client = function(sourceImg, params) {
	var me = this;
	
	params = params || {};
	
	this.params = {
		w: params['width'] || null, // null for auto
		h: params['height'] || null, // null for auto
		imageScale: params['imageScale'] || 1,
		zoom: params['zoom'] || null, // null for auto
		replaceImg: params['replaceImg'] || false
	};
	
	this.sourceImage = sourceImg;
	
	// load the image url into a new img element and call init on completion
	var image = goog.dom.createElement('img');
	this.imageLoadHandle = goog.events.listen(image, goog.events.EventType.LOAD, function() {
		me.init(image);
	});
	image.src = this.sourceImage.src;
};

bc.Client.prototype.init = function(image) {
	goog.events.unlistenByKey(this.imageLoadHandle);
	
	this.canvas = new bc.model.Canvas(this, image);
	this.gui = new bc.GUI(this);
	
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': (this.params.w || image.width) + 'px',
		'height': ((this.params.h || image.height) + 29) + 'px'
	});
	goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);

	this.gui.init();
};

/**
 * @type {goog.pubsub.PubSub}
 */
bc.Client.pubsub = new goog.pubsub.PubSub();

/**
 * @enum {string}
 */
bc.Client.pubsubTopics = {
	CANVAS_RENDER: 'cr',
	SELECTION_CHANGE: 'sc',
	SHOW_COLOR_PICKER: 'scp',
	SHOW_TEXT_AREA: 'sta',
	HIDE_OVERLAYS: 'ho',
	MODE: 'm',
	ACTION: 'a'
};

/**
 * @enum {number}
 */
bc.Client.modes = {
	SELECT: 0,
	LINE: 1,
	STAMP: 2,
	TEXT: 3,
	LINE_EDIT: 4
};

goog.exportSymbol('bc.Client', bc.Client);
