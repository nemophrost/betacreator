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
goog.provide('bc.gui.input.ButtonBar');

goog.require('bc.gui.Input');
goog.require('bc.ClassSet');
goog.require('goog.array');


/**
 * Represents a button bar (set of buttons)
 * 
 * @param {Array.<Object>} buttons
 * @param {?Object.<string, boolean|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.ButtonBar = function(buttons, options, parent, width) {
	options = options || {};
	
	/** @type {Array.<Object>} */
	this.buttonsAr = buttons;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'button-bar' + (options.classes ? ' ' + options.classes : ''),
		css: options.css || null
	});
	this.containerClasses = new bc.ClassSet(this.container);
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/**
	 * @type {Array.<*>}
	 * @private
	 */
	this.value = [];


	/** @type {Array.<function(*=, boolean=)>} */
	this.changeCallbacks = [];

	if (options.change)
		this.changeCallbacks.push(options.change);

	if (parent)
		this.appendTo(parent, width);
	
	// build it initially
	this.build();
	
	// disable it if options.disabled is true
	if (this._disabled)
		this.disable();
};

/**
 * Set a new value
 *
 * @param {number} newValue
 * @private
 */
bc.gui.input.ButtonBar.prototype._setValue = function(newValue) {
	this.value.push(newValue);
};

/**
 * Trigger change callbacks
 *
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ButtonBar.prototype.onChange = function(programmatic) {
	var me = this;

	goog.array.forEach(this.changeCallbacks, function(f) {
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
 * Append the button bar do a dom element and adjust width (optional)
 *
 * @param {Element} parent
 * @param {?number=} width
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : 'auto');
	goog.dom.appendChild(parent, this.container);
	
	return this;
};

/**
 * @private
 */
bc.gui.input.ButtonBar.prototype.build = function() {
	var me = this;
	
	this.value = [];
	
	goog.array.forEach(this.buttonsAr, function(button) {
		var selected = button.selected && button.selected(),
			disabled = me._disabled || (button.disabled && button.disabled());
		
		if (selected && (button.value || button.value === 0 || button.value === false))
			me._setValue(button.value);
		
		goog.dom.appendChild(me.container, bc.domBuilder({
			classes: 'button-bar-item' +
				(selected ? ' selected' : '') +
				(disabled && !me._disabled ? ' disabled' : ''),
			title: button.tooltip || null,
			click: function(event) {
				disabled = me._disabled || (button.disabled && button.disabled());
				if(!disabled) {
					button.action();
					me.refresh(true);
				}
			},
			children: [{
				classes: 'icon-13 icon-13-' + button.icon
			}]
		}));
	});
};

/**
 * Refresh the DOM (rebuild the buttons)
 *
 * @param {boolean=} resultOfClick
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.refresh = function(resultOfClick) {
	var me = this;
	
	this.value = [];
	
	goog.array.forEach(this.buttonsAr, function(button, idx) {
		var selected = button.selected && button.selected(),
			disabled = me._disabled || (button.disabled && button.disabled());
		
		if (selected && (button.value || button.value === 0 || button.value === false))
			me._setValue(button.value);
		
		goog.dom.getChildren(me.container)[idx].className = 'button-bar-item' +
			(selected ? ' selected' : '') +
			(disabled && !me._disabled ? ' disabled' : '');
	});
	
	this.onChange(!resultOfClick || false);
	
	return this;
};

/**
 * @return {Array.<*>}
 */
bc.gui.input.ButtonBar.prototype.getValue = function() {
	return this.value;
};

/**
 * enable the button bar
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');
		this._disabled = false;
	}
	
	return this.refresh();
};

/**
 * disable the button bar
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');
		this._disabled = true;
	}
	
	return this.refresh();
};

/**
 * @return {Element}
 */
bc.gui.input.ButtonBar.prototype.getContainer = function() {
	return this.container;
};
