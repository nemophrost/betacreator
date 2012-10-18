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
goog.require('bc.controller.Canvas');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.string');
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

/**
 * @private
 */
bc.Client.prototype.init = function(image) {
	goog.events.unlistenByKey(this.imageLoadHandle);
	
	this.canvasController = new bc.controller.Canvas(this, image);
	this.gui = new bc.GUI(this);

	this.viewportWidth = this.params.w || image.width;
	this.viewportHeight = this.params.h || image.height;
	
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': this.viewportWidth + 'px',
		'height': (this.viewportHeight + 29) + 'px'
	});
	goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);

	this.gui.init();
};

/**
 * @param {Object} data
 * @private
 */
bc.Client.prototype.loadData = function(data) {
	var me = this;

	// each ordered item so that we don't remove the tempLine
	this.canvasController.model.eachOrderedItem(function(item) {
		me.canvasController.model.removeItem(item);
	});

	goog.array.forEach(data['items'] || [], function(itemData) {
		var item = null;
		switch(itemData[bc.properties.ITEM_TYPE]) {
			case bc.model.ItemTypes.ANCHOR:
				item = new bc.model.stamp.Anchor(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.PITON:
				item = new bc.model.stamp.Piton(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.RAPPEL:
				item = new bc.model.stamp.Rappel(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.BELAY:
				item = new bc.model.stamp.Belay(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.LINE:
				item = new bc.model.Line(bc.model.Line.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.TEXT:
				item = new bc.model.Text(bc.model.Text.parseParams(itemData), me.canvasController.model.properties);
				break;
			default:
				break;
		}

		if (item)
			me.canvasController.model.addItem(item);
	});

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {boolean=} escape
 * @return {string}
 * @private
 */
bc.Client.prototype.getData = function(escape) {
	var items = [];

	this.canvasController.model.eachOrderedItem(function(item) {
		items.push(item.serializeParams());
	});

	if (escape)
		return goog.string.stripQuotes(goog.string.quote(goog.json.serialize({
			'items': items
		})), '"');
	else
		return goog.json.serialize({
			'items': items
		});
};

/**
 * @param {boolean=} includeSource
 * @return {string}
 * @private
 */
bc.Client.prototype.getImage = function(includeSource) {
	return '';
};

/**
 * @param {Image} sourceImg
 * @param {Object=} options
 * @return {Object}
 */
bc.Client.go = function(sourceImg, options) {
	var client = new bc.Client(sourceImg, options),
		onError = options['onError'] || function(er) { alert (er); };

	return {
		'loadData': function(data) {
			try {
				data = goog.json.parse(data);
				client.loadData(data);
			}
			catch(e) {
				onError(bc.i18n("Invalid data."));
			}
		},
		'getData': function(escape) {
			return client.getData(escape);
		},
		'getImage': function(includeSource) {
			return client.getImage(includeSource);
		}
	};
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

goog.exportSymbol('BetaCreator', bc.Client.go);
