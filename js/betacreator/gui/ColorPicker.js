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
	 */
	this.visible = false;

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

								// dom.mouseleave(function() {
								// 	dom.find('.selected').removeClass('selected');

								// 	if (me.selectedSwatch)
								// 		me.selectedSwatch.addClass('selected');

								// 	me.resetPreview();
								// });
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

	goog.events.listen(this.container, goog.events.EventType.MOUSEDOWN, function(e) {
		e.stopPropagation();
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
		this.previewInput.value = color.hex();
	}
	else {
		goog.dom.classes.add(this.previewSwatch, 'transparent');
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
 * @param {?bc.Color=} color
 * @private
 */
bc.gui.ColorPicker.prototype.setSelectedColor = function(color) {
	if (color) {
		this.selectedSwatch = this.swatches[color.hex().toLowerCase()] || null;
		this.selectedColor = new bc.Color(color.hex());

		if (this.selectedSwatch) {
			bc.array.map(/** @type {Array} */(goog.dom.query('>.selected', goog.dom.getParentElement(this.selectedSwatch))), function(elem) {
				goog.dom.classes.remove(this.selectedSwatch, 'selected');
			});
			goog.dom.classes.add(this.selectedSwatch, 'selected');
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

	// transperent
	me.addElem(null);
	
	// grayscale
	for (i = 0; i < 11; i++) {
		color.hsv([0, 0, (10 - i)/10]);
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

			// dom.mouseover(function() {
			// 	dom.addClass('selected').siblings('.selected').removeClass('selected');
			// 	me.previewColor(color);
			// }).click(function() {
			// 	if (!me.callback || me.callback(color) != false)
			// 		me.hide();
			// }).mousedown(function(e) {
			// 	// prevent CLOSE_OVERLAYS
			// 	e.stopPropagation();
			// });
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
