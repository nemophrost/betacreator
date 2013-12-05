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
goog.require('bc.properties');
goog.require('bc.controller.Canvas');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.string');
goog.require('goog.pubsub.PubSub');

/**
 * @param {Image} sourceImg
 * @param {?Function=} onReady
 * @param {Object=} params
 *
 * @constructor
 */
bc.Client = function(sourceImg, onReady, params) {
	params = params || {};
	
	this.params = {
		w: params['width'] || null, // null for auto
		h: params['height'] || null, // null for auto
		zoom: params['zoom'] || 'contain',
		parent: params['parent'] || null, // null to replace image
		onChange: params['onChange'] || null,
		scaleFactor: params['scaleFactor'] || 1
	};

	this.defaultProperties = {};
	this.defaultProperties[bc.properties.ITEM_SCALE] = this.params.scaleFactor;

	this.guiConfig = {
		scaleFactor: this.params.scaleFactor
	};
	
	this.minWidth = 556;

	this.sourceImage = sourceImg;

	this.initialized = false;

	/**
	 * @type {Array.<Function>}
	 */
	this.postInitializeCallbacks = [];

	if (onReady) {
		this.postInitializeCallbacks.push(onReady);
	}
	
	// load the image url into a new img element and call init on completion
	var image = goog.dom.createElement('img');
	this.imageLoadHandle = goog.events.listen(image, goog.events.EventType.LOAD, function() {
		this.init(image);
	}, false, this);

	image.src = this.sourceImage.src;

	if (this.params.onChange) {
		bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.ACTION, function() {
			this.params.onChange();
		}, this);
	}
};

/**
 * @private
 */
bc.Client.prototype.init = function(image) {
	goog.events.unlistenByKey(this.imageLoadHandle);
	
	this.canvasController = new bc.controller.Canvas(this, image, this.defaultProperties);
	this.gui = new bc.GUI(this, this.guiConfig);

	this.viewportWidth = this.params.w || image.width;
	this.viewportHeight = this.params.h || image.height;

	if (goog.isNumber(this.viewportWidth) && this.viewportWidth < this.minWidth)
		this.viewportWidth = this.minWidth;

	var optionbarHeight = 29;
	
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': goog.isNumber(this.viewportWidth) ? (this.viewportWidth + 'px') : this.viewportWidth,
		'height': goog.isNumber(this.viewportHeight) ? ((this.viewportHeight + optionbarHeight) + 'px') : this.viewportHeight
	});

	if (this.params.parent)
		goog.dom.appendChild(this.params.parent, this.gui.wrapper);
	else
		goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);

	if (!goog.isNumber(this.viewportWidth))
		this.viewportWidth = goog.style.getBorderBoxSize(this.gui.wrapper).width - 2;
	if (!goog.isNumber(this.viewportHeight))
		this.viewportHeight = goog.style.getBorderBoxSize(this.gui.wrapper).height - optionbarHeight - 2;

	this.gui.init();

	this.canvasController.setZoom(this.params.zoom);
	this.canvasController.view.centerInViewport();

	this.initialized = true;
	goog.array.forEach(this.postInitializeCallbacks, function(f) {
		f();
	});
	this.postInitializeCallbacks = [];
};

/**
 * @param {Object} data
 * @private
 */
bc.Client.prototype.loadData = function(data) {
	var me = this;

	this.canvasController.model.removeAllItems();

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

	this.canvasController.model.eachItem(function(item) {
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
 * @param {string=} type
 * @param {?number=} width
 * @param {Image=} srcImage
 * @return {string}
 * @private
 */
bc.Client.prototype.getImage = function(includeSource, type, width, srcImage) {
	return this.canvasController.getImage(includeSource, type, width, srcImage);
};

/**
 * @param {Image} sourceImg
 * @param {?Function=} onReady
 * @param {Object=} options
 * @return {Object}
 */
bc.Client.go = function(sourceImg, onReady, options) {
	var ret,
		client = new bc.Client(sourceImg, onReady ? function() { onReady.call(ret); } : null, options),
		onError = options['onError'] || function(er) { alert (er); };

	ret = {
		'loadData': function(data) {
			try {
				data = goog.json.parse(data);
				if (!client.initialized) {
					client.postInitializeCallbacks.push(function() {
						client.loadData(data);
					});
				}
				else {
					client.loadData(data);
				}
			}
			catch(e) {
				onError(bc.i18n("Invalid data."));
			}
		},
		'getData': function(escape) {
			try {
				return client.getData(escape);
			}
			catch(e) {
				onError(bc.i18n("Editor hasn't been initialized yet, make calls in onReady callback."));
			}
		},
		'getImage': function(includeSource, type, width, srcImage) {
			try {
				return client.getImage(includeSource, type, parseInt(width, 10) || null, srcImage);
			}
			catch(e) {
				onError(bc.i18n("Editor hasn't been initialized yet, make calls in onReady callback."));
			}
		}
	};

	return ret;
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
