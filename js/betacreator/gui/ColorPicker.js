goog.provide('bc.gui.ColorPicker');

goog.require('bc.Color');
goog.require('bc.domBuilder');
goog.require('goog.positioning');
goog.require('goog.dom.query');

/**
 * SIMPLE COLOR PICKER
 *
 * @constructor
 */
bc.gui.ColorPicker = function() {

	var me = this;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.visible = false;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.userIsTyping = false;

	/**
	 * @type {Element}
	 */
	this.userSwatchContainer = null;

	this.userPalette = [];
	this.userPaletteCount = 12;

	/**
	 * @type {Element}
	 */
	this.swatchContainer = null;

	/**
	 * @type {Element}
	 */
	this.container = bc.domBuilder({
		classes: 'callout hidden',
		children: [
			{
				classes: 'callout-bubble',
				create: function(dom) {
					me.bubble = dom;
				},
				children: [{
					classes: 'simple-color-picker',
					children: [
						{
							classes: 'preview-swatch',
							create: function(dom) {
								me.previewSwatch = dom;
							}
						},{
							classes: 'input-container',
							children: [{
								tag: 'input',
								type: 'text',
								classes: 'box-sizing-border',
								create: function(dom) {
									me.previewInput = dom;

									goog.events.listen(dom, goog.events.EventType.FOCUS, function(e) {
										me.userIsTyping = true;
									});

									goog.events.listen(dom, goog.events.EventType.BLUR, function(e) {
										me.userIsTyping = false;
									});

									goog.events.listen(dom, goog.events.EventType.KEYDOWN, function(e) {
										e.stopPropagation();
									});
								},
								change: function(event, dom) {
									try {
										var newColor = new bc.Color(bc.color.parse(dom.value).hex);
										me.setSelectedColor(newColor);
									}
									catch(e) {
										me.resetPreview();
									}
								}
							}]
						},{
							classes: 'button-container',
							children: [{
								tag: 'button',
								text: 'Done',
								click: function() {
									if (!me.callback || me.callback(me.selectedColor) != false)
										me.hide();
								}
							}]
						},{
							classes: 'spacer'
						},{
							classes: 'swatch-container',
							create: function(dom) {
								me.swatchContainer = dom;
							}
						}
					]
				}]
			},{
				classes: 'callout-pointer-border'
			},{
				classes: 'callout-pointer'
			}
		]
	});

	// prevent hide overlays when mousing down on bubble
	goog.events.listen(this.bubble, goog.events.EventType.MOUSEDOWN, function(e) {
		e.stopPropagation();
	});

	// on mouse out on bubble, reset the selected swatch
	goog.events.listen(this.bubble, goog.events.EventType.MOUSEOUT, function(e) {
		me.highlightSwatch(me.selectedSwatch);
		me.resetPreview();
	});

	/**
	 * keyed to hex string for each color
	 * value is the dom element for each swatch
	 * @type {Object.<string,Element>}
	 */
	this.swatches = {};

	/**
	 * @type {Element}
	 */
	this.selectedSwatch = null;

	/**
	 * @type {bc.Color}
	 */
	this.selectedColor = null;

	/**
	 * @type {?function(bc.Color)}
	 */
	this.callback = null;

	this.build();

	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.HIDE_OVERLAYS, function() {
		me.hide();
	});
};


/**
 * @param {?bc.Color} color
 * @private
 */
bc.gui.ColorPicker.prototype.previewColor = function(color) {
	if (color && color.rgba()[3] > 0) {
		goog.dom.classes.remove(this.previewSwatch, 'transparent');
		this.previewSwatch.style.backgroundColor = color.hex();

		if (!this.userIsTyping)
			this.previewInput.value = color.hex();
	}
	else {
		goog.dom.classes.add(this.previewSwatch, 'transparent');

		if (!this.userIsTyping)
			this.previewInput.value = 'transparent';
	}
};


/**
 * @private
 */
bc.gui.ColorPicker.prototype.resetPreview = function() {
	this.previewColor(this.selectedColor);
};


/**
 * @param {?Element=} swatch
 * @private
 */
bc.gui.ColorPicker.prototype.highlightSwatch = function(swatch) {
	goog.array.forEach(/** @type {Array} */(goog.dom.query('.selected', this.swatchContainer)), function(element) {
		goog.dom.classes.remove(element, 'selected');
	});

	if (swatch)
		goog.dom.classes.add(swatch, 'selected');
};


/**
 * @param {?bc.Color=} color
 * @private
 */
bc.gui.ColorPicker.prototype.setSelectedColor = function(color) {
	if (color) {
		this.selectedSwatch = this.swatches[color.hex().toLowerCase()] || null;
		this.selectedColor = new bc.Color(color.hex());

		if (this.selectedSwatch) {
			this.highlightSwatch(this.selectedSwatch);
		}

		this.previewColor(color);
	}
	else {
		this.selectedSwatch = null;
		this.selectedColor = null;
	}
};


/**
 * @private
 */
bc.gui.ColorPicker.prototype.build = function() {
	var me = this,
		i;

	this.swatches = {};

	/** @type {bc.Color} */
	var color = new bc.Color();
	
	// grayscale
	for (i = 0; i < 12; i++) {
		color.hsv([0, 0, (11 - i)/11]);
		me.addColor(color);
	}
	
	// colors
	for (var j = 0; j < 9; j++) {
		for (i = 0; i < 360; i+= 30) {
			color.hsl([i, 1, (9 - j)/10]);
			me.addColor(color);
		}
	}

	goog.dom.appendChild(this.swatchContainer, bc.domBuilder({
			classes: 'clear'
		}));
};


/**
 * Adds a color passed off a RGB color code to the available picker selection
 *
 * @param {Array.<number>} rgb
 */
bc.gui.ColorPicker.prototype.addElem = function(rgb) {
	var me = this;

	goog.dom.appendChild(this.swatchContainer, bc.domBuilder({
		classes: 'swatch' + (rgb ? '' : ' transparent'),
		css: {
			'backgroundColor': rgb ? 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')' : 'transparent'
		},
		create: function(dom) {
			var color = null;

			if (rgb) {
				color = new bc.Color(rgb);
				me.swatches[color.hex().toLowerCase()] = dom;
			}

			goog.events.listen(dom, goog.events.EventType.MOUSEOVER, function(e) {
				me.highlightSwatch(dom);
				me.previewColor(color);
			});

			goog.events.listen(dom, goog.events.EventType.CLICK, function(e) {
				if (!me.callback || me.callback(color) !== false)
					me.hide();
			});
		}
	}));
};


/**
 * Add the given colors to the available selection popup.
 *
 * @param {bc.Color=} color
 */
bc.gui.ColorPicker.prototype.addColor = function(color) {
	this.addElem(/** @type {Array.<number>} */ (color.rgb()));
};


/**
 * @param {number} x
 * @param {number} y
 * @param {function(?bc.Color)} callback
 * @param {?bc.Color=} selectedColor
 */
bc.gui.ColorPicker.prototype.show = function(x, y, callback, selectedColor) {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);

	// this.swatchContainer.find('.selected').removeClass('selected');

	this.callback = callback;

	this.setSelectedColor(selectedColor);

	this.visible = true;

	this.container.style.display = 'block';

	var parentOffset = goog.positioning.getOffsetParentPageOffset(this.container);
	
	goog.style.setPosition(this.container, x - parentOffset.x, y - parentOffset.y);
};


/**
 *
 */
bc.gui.ColorPicker.prototype.hide = function() {
	this.visible = false;

	this.container.style.display = 'none';
};
