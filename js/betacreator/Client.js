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
}

bc.Client.prototype.init = function(image) {
	goog.events.unlistenByKey(this.imageLoadHandle);
	
	this.canvas = new bc.model.Canvas(image);
	this.gui = new bc.GUI(this);
	
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': (this.params.w || image.width) + 'px',
		'height': (this.params.h || image.height) + 'px'
	});
	goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);
	
//	var anchorModel = new bc.model.stamp.Anchor({
//		x: 300,
//		y: 200
//	});
//	
//	var anchorView = new bc.view.stamp.Anchor(anchorModel);
//	anchorView.canvas.appendTo('body');
//	anchorView.render();
//	
//	var lineModel = new bc.model.Line({
//		isDashed: true,
//		curved: true,
//		color: '#003399'
//	});
//	lineModel.controlPoints = [
//		new bc.math.Point(10,10),
//		new bc.math.Point(100,100),
//		new bc.math.Point(50,200),
//		new bc.math.Point(200,300),
//		new bc.math.Point(100,350)
//	];
//	var lineView = new bc.view.Line(lineModel);
//	lineView.canvas.appendTo('body');
//	lineView.render();
//	
//	$(document).mousemove(function(e) {
//		var hit = lineModel.hitTest(e.clientX, e.clientY);
//		$('body').css('background-color', hit ? 'palegoldenrod' : '#556688');
////		console.log(hit ? 'HIT' : 'NO HIT');
//	});
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
	HIDE_OVERLAYS: 'ho'
};

goog.exportSymbol('bc.Client', bc.Client);
