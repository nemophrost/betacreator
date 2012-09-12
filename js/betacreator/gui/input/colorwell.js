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
goog.provide('bc.gui.input.ColorWell');

goog.require('bc.gui.Input');
goog.require('bc.array');
goog.require('bc.domBuilder');
goog.require('goog.style');

/**
 * Represents a color well
 * 
 * @param {?Object.<string, boolean|number|string|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.ColorWell = function(options, parent, width) {
	options = options || {};

	var me = this;

	/** @type {Element} */
	this.swatch = null;
	
	/** @type {Element} */
	this.swatchCanvas = null;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'color-well',
		children: [{
			classes: 'color-well-wrapper',
			children: [{
				classes: 'swatch-container',
				click: function(e, dom) {
					if(me._disabled)
						return;
					
					var offset = goog.style.getPageOffset(dom),
						size = goog.style.getSize(dom);

					bc.Client.pubsub.publish(
						bc.Client.pubsubTopics.SHOW_COLOR_PICKER,
						offset.x + size.width/2,
						offset.y + size.height + 2,
						function(newColor) {
							me._setValue(newColor);
						},
						me.value || null
					);
				},
				children: [
					{
						classes: 'swatch',
						create: function(dom) {
							me.swatch = dom;
						},
						children: [{
							tag: 'canvas',
							css: {'position': 'absolute'},
							create: function(dom) {
								me.swatchCanvas = dom;
							}
						}]
					},{
						classes: 'border'
					}
				]
			}]
		}]
	});
	
	this.containerClasses = new bc.ClassSet(this.container);

	/** 
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/** 
	 * @type {?bc.Color}
	 * @private 
	 */
	this.value = options.value || new bc.Color('#fff');


	/** @type {Array.<function(*=, boolean=)>} */
	this.changeCallbacks = [];

	if (options.change)
		this.changeCallbacks.push(options.change);

	if (parent)
		this.appendTo(parent, width);
	
	// disable it if options.disabled is true
	if (this._disabled)
		this.disable();
};

/**
 * Render the color or gradient in the swatch
 *
 * @param {boolean=} force render whether it's hidden or not
 */
bc.gui.input.ColorWell.prototype.render = function(force) {
	if (!this.swatchCanvasSetup) {
		var size = goog.style.getSize(this.swatch);
		if(size.width == 0 && !force)
			return;
		
		this.swatchCanvas.width = size.width;
		this.swatchCanvas.height = size.height;
		this.swatchCanvasSetup = true;
	}
	
	var ctx = this.swatchCanvas.getContext('2d'),
		fillColor = this.value;

	this.containerClasses.removeClass('no-fill');

	if (this._disabled)
		fillColor = new bc.Color('#ccccccff');
	
	if (!fillColor)
		this.containerClasses.addClass('no-fill');
	
	var x = 0,
		y = 0,
		w = ctx.canvas.width,
		h = ctx.canvas.height,
		bb = new bc.math.Box(x,y,w,h);
	
	ctx.clearRect(x,y,w,h);
	
	if (!fillColor)
		return;
	
	ctx.save();
	ctx.fillStyle = fillColor.rgbaStyle();
	ctx.fillRect(x,y,w,h);
	ctx.restore();
};

/**
 * Set a new value
 * 
 * @param {?bc.Color} newValue
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ColorWell.prototype._setValue = function(newValue, programmatic) {
	this.value = newValue;
	
	this.render();
	
	this.onChange(!!programmatic);
};

/**
 * Trigger change callbacks
 * 
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ColorWell.prototype.onChange = function(programmatic) {
	var me = this;
	var valid = true, errorMessage = null;

	bc.array.map(this.changeCallbacks, function(f) {
		f.call(me, me.value, !!programmatic);
	});
};


/*======================================================================
 =======================================================================
 ==
 ==
 ==                         PUBLIC INTERFACE
 ==
 ==
 =======================================================================
 =====================================================================*/

/**
 * Append the input do a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : '');
	goog.dom.appendChild(parent, this.container);

	return this;
};

/**
 * @return {?bc.Color}
 */
bc.gui.input.ColorWell.prototype.getValue = function() {
	return this.value;
};

/**
 * Set a new value (public)
 * 
 * @param {?string|Object.<string,string|number|Array.<Object.<string, string|number>>>|bc.Color} newValue
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.setValue = function(newValue) {
	this._setValue(new bc.Color(newValue), true);
	
	return this;
};

/**
 * Add a change callback
 * 
 * @param {function((?bc.Color)=, boolean=)} changeCallback
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.addChangeCallback = function(changeCallback) {
	this.changeCallbacks.push(changeCallback);
	
	return this;
};

/**
 * enable the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');

		this._disabled = false;
		this.render();
	}
	
	return this;
};

/**
 * disable the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');

		this._disabled = true;
		this.render();
	}
	
	return this;
};

/**
 * reset the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.reset = function() {
	this._setValue(null, true);
	
	return this;
};

/**
 * @return {Element}
 * */
bc.gui.input.ColorWell.prototype.getContainer = function() {
	return this.container;
};
