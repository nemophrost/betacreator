goog.provide('bc.gui.OptionBar');

goog.require('bc.gui.input.ColorWell');
goog.require('bc.gui.input.ButtonBar');
goog.require('bc.gui.input.Spinner');
goog.require('bc.property');
goog.require('bc.i18n');
goog.require('goog.array');

/**
 * @constructor
 */
bc.gui.OptionBar = function() {
	var me = this;

	// create the container
	this.container = goog.dom.createDom(goog.dom.TagName.DIV, 'option-bar');
	
	// create the viewport
	this.viewport = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.container, this.viewport);

	/** @type {Array.<function()>} */
	this.refreshFunctions = [];

	this.viewportSelection = null;

	this.createControls(this.container);

	this.mode = '';
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.MODE, function(mode) {
		me.mode = mode;
		me.refresh();
	});
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
};

/**
 */
bc.gui.OptionBar.prototype.init = function() {
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SELECTION_CHANGE, goog.bind(this.refresh, this));
};

/**
 * @param {Element} container
 * @return {Element}
 * @private
 */
bc.gui.OptionBar.prototype.getInputWrapper = function(container) {
	var ret = bc.domBuilder({
		classes: 'option-bar-input'
	});

	goog.dom.appendChild(container, ret);

	return ret;
};

/**
 * @param {Element} container
 * @private
 */
bc.gui.OptionBar.prototype.addDivider = function(container) {
	goog.dom.appendChild(container, bc.domBuilder({
		classes: 'option-bar-divider'
	}));
};

/**
 * @param {Element} container
 * @param {?string=} label
 * @param {?boolean=} left
 * @param {?boolean=} right
 * @param {?string=} icon
 * @private
 */
bc.gui.OptionBar.prototype.addLabel = function(container, label, left, right, icon) {
	goog.dom.appendChild(container, bc.domBuilder({
		classes: 'option-bar-label' + (left ? '-left' : (right ? '-right' : '')),
		text: label || null,
		children: icon ? [{classes: 'icon-13 icon-13-' + icon}] : null
	}));
};

/**
 * @param {bc.gui.Input} input
 * @param {string} property
 * @private
 */
bc.gui.OptionBar.prototype.standardInputRefresh = function(input, property) {
	var val = bc.property.get(property);
	if (val === undefined) {
		input.setValue(null);
		input.disable();
	}
	else {
		input.enable();
		input.setValue(val);
	}
};

/**
 * @param {Element} container
 * @private
 */
bc.gui.OptionBar.prototype.createControls = function(container) {
	var me = this;

	var createButtons = function(control) {
		var buttons = [];
		goog.array.forEach(control.buttons, function(button) {
			// this button set changes a property and acts like a radio button set
			if (control.property) {
				button.action = function() {
					bc.property.set(control.property, button.val);
				};
				button.selected = function() {
					return bc.property.get(control.property) == button.val;
				};
				button.disabled = function() {
					return bc.property.get(control.property) === undefined;
				};
			}
			// otherwise each button acts independently like a checkbox set
			else if (button.property) {
				button.action = function() {
					bc.property.set(button.property, !bc.property.get(button.property));
				};
				button.selected = function() {
					return !!bc.property.get(button.property);
				};
				button.disabled = function() {
					return bc.property.get(button.property) === undefined;
				};
			}

			buttons.push(button);
		});
		
		return buttons;
	};

	var createToolButton = function(icon, mode, tooltip) {
		return new bc.gui.input.ButtonBar(
			[{
				icon:icon,
				action: function() {
					bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, mode);
				},
				tooltip:bc.i18n(tooltip),
				selected: function() { return me.mode == mode; },
				disabled: function() { return false; }
			}],
			null,
			me.getInputWrapper(container)
		);
	};

	var selectButton = createToolButton('tool-select', bc.Client.modes.SELECT, 'Select Tool');
	var lineButton = createToolButton('tool-line', bc.Client.modes.LINE, 'Line Tool');
	var anchorButton = createToolButton('tool-anchor', bc.Client.modes.ANCHOR, 'Anchor Tool');
	var pitonButton = createToolButton('tool-piton', bc.Client.modes.PITON, 'Piton Tool');
	var rappelButton = createToolButton('tool-rappel', bc.Client.modes.RAPPEL, 'Rappel Tool');
	var belayButton = createToolButton('tool-belay', bc.Client.modes.BELAY, 'Belay Tool');
	var textButton = createToolButton('tool-text', bc.Client.modes.TEXT, 'Text Tool');

	this.addDivider(container);

	var colorWell = new bc.gui.input.ColorWell(
		{
			change: function(val, programmatic) {
				if (programmatic)
					return;

				bc.property.set(bc.properties.ITEM_COLOR, val.hex());
			}
		},
		this.getInputWrapper(container)
	);

	colorWell.refresh = goog.bind(this.standardInputRefresh, this, colorWell, bc.properties.ITEM_COLOR);

	this.addDivider(container);

	this.addLabel(container, 'Scale:', true);

	var scaleSpinner = new bc.gui.input.Spinner(
		{
			min:0.5,
			max:4,
			step:10,
			round:2,
			width:60,
			value:1,
			displayFactor: 100,
			suffix:'%',
			change: function(val, programmatic) {
				if (programmatic)
					return;

				bc.property.set(bc.properties.ITEM_SCALE, val);
			}
		},
		this.getInputWrapper(container),
		50
	);

	scaleSpinner.refresh = goog.bind(this.standardInputRefresh, this, scaleSpinner, bc.properties.ITEM_SCALE);

	this.addDivider(container);

	var textAlignButtonBar = new bc.gui.input.ButtonBar(
		createButtons({
			buttons: [
				{
					icon:'text-align-l',
					val: 'left',
					tooltip:bc.i18n('Left Align')
				},{
					icon:'text-align-c',
					val: 'center',
					tooltip:bc.i18n('Center Align')
				},{
					icon:'text-align-r',
					val:'right',
					tooltip:bc.i18n('Right Align')
				}
			],
			property: bc.properties.TEXT_ALIGN
		}),
		null,
		this.getInputWrapper(container)
	);

	this.addDivider(container);

	var lineStyleDisabled = function() {
		return !goog.isNumber(bc.property.get(bc.properties.LINE_OFFLENGTH));
	};

	var lineStyleButtonBar = new bc.gui.input.ButtonBar(
		[
			{
				icon:'line-solid',
				action: function() {
					bc.property.set(bc.properties.LINE_OFFLENGTH, 0);
				},
				tooltip:bc.i18n('Solid Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_OFFLENGTH)) === 0; },
				disabled: lineStyleDisabled
			},{
				icon:'line-dashed',
				action: function() {
					bc.property.set(bc.properties.LINE_OFFLENGTH, 10);
					bc.property.set(bc.properties.LINE_ONLENGTH, 10);
				},
				tooltip:bc.i18n('Dashed Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_ONLENGTH)) > 2; },
				disabled: lineStyleDisabled
			},{
				icon:'line-dotted',
				action: function() {
					bc.property.set(bc.properties.LINE_OFFLENGTH, 8);
					bc.property.set(bc.properties.LINE_ONLENGTH, 0.01);
				},
				tooltip:bc.i18n('Dotted Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_ONLENGTH)) > 0 && /** @type {number} */(bc.property.get(bc.properties.LINE_ONLENGTH)) <= 2; },
				disabled: lineStyleDisabled
			}
		],
		null,
		this.getInputWrapper(container)
	);

	this.addDivider(container);

	var lineCurveButton = new bc.gui.input.ButtonBar(
		createButtons({
			buttons: [{
				icon:'line-curved',
				property: bc.properties.LINE_CURVED,
				tooltip:bc.i18n('Toggle Line Curvature')
			}]
		}),
		null,
		this.getInputWrapper(container)
	);

	var lineEditButton = new bc.gui.input.ButtonBar(
		[{
			icon:'line-edit',
			action: function() {
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE_EDIT);
			},
			tooltip:bc.i18n('Edit Line Shape'),
			selected: function() { return me.mode == bc.Client.modes.LINE_EDIT; },
			disabled: function() { return false; }
		}],
		null,
		me.getInputWrapper(container)
	);

	var inputs = [
		selectButton,
		lineButton,
		anchorButton,
		pitonButton,
		rappelButton,
		belayButton,
		textButton,
		colorWell,
		scaleSpinner,
		textAlignButtonBar,
		lineStyleButtonBar,
		lineCurveButton,
		lineEditButton
	];

	this.refreshFunctions.push(function() {
		goog.array.forEach(inputs, function(input) {
			if(input.refresh) {
				input.refresh();
			}
		});
	});
};


/**
 * @private
 */
bc.gui.OptionBar.prototype.refresh = function() {
	goog.array.forEach(this.refreshFunctions, function(f) {
		f();
	});
};
