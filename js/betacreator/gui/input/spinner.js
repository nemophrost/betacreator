goog.provide('bc.gui.input.Spinner');

goog.require('bc.gui.Input');
goog.require('bc.array');
goog.require('bc.math');
goog.require('bc.ClassSet');

/**
 * Represents a spinner input control
 * 
 * @param {?Object.<string, boolean|number|string|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.Spinner = function(options, parent, width) {
	options = options || {};

	var me = this;

	/** @type {Element} */
	this.input = null;

	/** @type {Element} */
	this.upButton = null;

	/** @type {Element} */
	this.downButton = null;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'spinner',
		css: options.css || null,
		children: [
			{
				classes: 'spinner-textbox',
				children: [{
					tag: 'input',
					type: 'text',
					create: function(dom) {
						me.input = dom;
					}
				}]
			},{
				classes: 'spinner-buttons',
				children: [
					{
						classes: 'spinner-up',
						create: function(dom) {
							me.upButton = dom;
						},
						children: [{
							classes: 'icon-13 icon-13-spinner-arrows'
						}]
					},{
						classes: 'spinner-down',
						create: function(dom) {
							me.downButton = dom;
						},
						children: [{
							classes: 'icon-13 icon-13-spinner-arrows'
						}]
					}
				]
			}
		]
	});
	this.containerClasses = new bc.ClassSet(this.container);

	/** 
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/** @type {number} */
	this.min = options.min || 0;

	/** @type {number} */
	this.max = options.max === undefined ? 100 : options.max;

	/** @type {number} */
	this.step = options.step || 1;
	
	/** @type {number} */
	this.round = options.round || 0;
	
	/** @type {boolean} */
	this.loop = !!options.loop;

	/** @type {string} */
	this.suffix = options.suffix || '';
	
	/** @type {string|number} */
	this.defaultVal = options.defaultVal || 0;
	
	/** @type {number} */
	this.displayFactor = options.displayFactor || 1;
	
	/** @type {number} */
	this.displayRound = options.displayRound === undefined ? this.round : options.displayRound;

	/** 
	 * @type {number|string}
	 * @private 
	 */
	this.value = 0;
	this._setValue(options.value || this.defaultVal || 0, true);


	/** @type {Array.<function(number=, boolean=)>} */
	this.changeCallbacks = [];
	
	/** @type {Array.<function(number=)>} */
	this.focusCallbacks = [];
	
	/** @type {Array.<function()>} */
	this.blurCallbacks = [];

	if (options.change)
		this.changeCallbacks.push(options.change);
	
	if (options.focus)
		this.focusCallbacks.push(options.focus);
	
	if (options.blur)
		this.blurCallbacks.push(options.blur);


	if (parent)
		this.appendTo(parent, width);


	/* bind event handlers
	==================================================================*/

	goog.events.listen(this.input, goog.events.EventType.CHANGE, function(e) {
		if (me._disabled)
			return;

		var newVal = parseFloat($(this).val());
		if (goog.isNumber(newVal))
			newVal /= me.displayFactor;
		me._setValue(bc.array.coalesce([newVal, me.defaultVal, me.value]));
	});

	goog.events.listen(this.input, goog.events.EventType.KEYDOWN, function(e) {
		if (me._disabled)
			return;

		var keyCode = e.keyCode;

		// up
		if (keyCode == 38) {
			me.stepUp();
			e.preventDefault();
		}

		// down
		else if (keyCode == 40) {
			me.stepDown();
			e.preventDefault();
		}
		
		// enter
		else if (keyCode == 13) {
			me.input.change();
			e.preventDefault();
		}
	});

	goog.events.listen(this.input, goog.events.EventType.FOCUS, function(e) {
		me.onFocus();
	});

	goog.events.listen(this.input, goog.events.EventType.BLUR, function(e) {
		me.onBlur();
	});

	goog.events.listen(this.upButton, goog.events.EventType.CLICK, function(e) {
		if (me._disabled)
			return;

		me.stepUp();
	});

	goog.events.listen(this.downButton, goog.events.EventType.CLICK, function(e) {
		if (me._disabled)
			return;

		me.stepDown();
	});
	
	// disable it if options.disabled is true
	if (this._disabled) {
		this._disabled = false;
		this.disable();
	}
};

/**
 * Step up to the next stepping value
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.stepUp = function() {
	if(!goog.isNumber(this.value) && this.lastValidValue != null)
		this.value = this.lastValidValue;

	var newVal = (Math.round(this.displayFactor*this.value/this.step) + 1)*this.step/this.displayFactor;
	
	if (this.loop && newVal > this.max)
		newVal = this.min + (newVal - (this.max + 1));
	
	this._setValue(newVal);
}

/**
 * Step down to the next stepping value
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.stepDown = function() {
	if(!goog.isNumber(this.value) && this.lastValidValue != null)
		this.value = this.lastValidValue;

	var newVal = (Math.round(this.displayFactor*this.value/this.step) - 1)*this.step/this.displayFactor;

	if (this.loop && newVal < this.min)
		newVal = (this.max + 1) - (this.min - newVal);

	this._setValue(newVal);
}

/**
 * Set a new value
 * 
 * @param {string|number} newValue
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.Spinner.prototype._setValue = function(newValue, programmatic) {
	var changed = false;

	if (newValue !== this.value || programmatic) {
		newValue = parseFloat(newValue);

		// if it's NaN set it to default if applicable. Otherwise it stays unchanged
		if (isNaN(newValue)) {
			if (this.defaultVal !== null)
				this.value = this.defaultVal;
		}
		else {
			this.value = (newValue > this.max) ? this.max : ((newValue < this.min) ? this.min : newValue);

			this.value = 1*this.value.toFixed(this.round);
			this.lastValidValue = this.value;
		}
		
		this.onChange(!!programmatic);

		changed = true;
	}
	
	// make sure the input has the suffix on it
	if (!programmatic || changed || this.input.value === "")
		this.input.value = goog.isString(this.value) ? this.value : (bc.math.toFixed(this.value*this.displayFactor, this.displayRound) + this.suffix);
};

/**
 * Trigger change callbacks
 * 
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.Spinner.prototype.onChange = function(programmatic) {
	var me = this;
	var valid = true,
		errorMessage = null;

	bc.array.map(this.changeCallbacks, function(f) {
		f.call(me, me.value, !!programmatic);
	});
};

/**
 * Trigger focus callbacks
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.onFocus = function() {
	var me = this;

	// timeout or else the mousedown will set the caret after focus is called
	// and the text will get unselected
	setTimeout(function() {
		me.input.select();
	}, 10);

	bc.array.map(this.focusCallbacks, function(f) {
		f.call(me, me.value);
	});
};

/**
 * Trigger blur callbacks
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.onBlur = function() {
	var me = this;
	
	bc.array.map(this.blurCallbacks, function(f) {
		f.call(me);
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
 * Append the spinner do a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : 'auto');
	goog.dom.appendChild(parent, this.container);

	return this;
};

/**
 * Set a new value (public)
 * 
 * @param {number} newValue
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.setValue = function(newValue) {
	if (this._disabled)
		return this;

	this._setValue(newValue, true);
	
	return this;
};

/**
 * @return {number|string}
 */
bc.gui.input.Spinner.prototype.getValue = function() {
	return this.value;
};

/**
 * @return {boolean}
 */
bc.gui.input.Spinner.prototype.isDefault = function() {
	return (this.defaultVal !== null && this.value == this.defaultVal);
};

/**
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.reset = function() {
	if (this.defaultVal !== null)
		this._setValue(this.defaultVal, true);
	
	return this;
};

/**
 * focus the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.focus = function() {
	this.input.focus();
	
	return this;
};

/**
 * blur the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.blur = function() {
	this.input.blur();
	
	return this;
};

/**
 * enable the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');
		this.input.disabled = false;

		this._disabled = false;
	}
	
	return this;
};

/**
 * disable the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');
		this.input.disabled = true;

		this._disabled = true;
	}
	
	return this;
};

/**
 * @return {Element}
 * */
bc.gui.input.Spinner.prototype.getContainer = function() {
	return this.container;
};
