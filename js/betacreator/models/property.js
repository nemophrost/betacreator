goog.provide('bc.property');
goog.provide('bc.properties');

goog.require('bc.model.Action');

/**
 * @type {bc.controller.Canvas|null}
 */
bc.property.canvas = null;

/**
 * @param {string} property
 * @param {*} val
 */
bc.property.set = function(property, val) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	var selection = canvas.getSelectedItems();

	if (selection.length > 0) {
		goog.array.forEach(selection, function(item, i) {
			// only change properties that exist
			if (item.properties[property] === undefined)
				return;

			var changed = {
				id: item.id
			};
			changed[property] = val;
			canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
		});
	}
	else {
		canvas.model.properties[property] = val;
	}
};

/**
 * @param {Array.<Array>} batch
 */
bc.property.setBatch = function(batch) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	canvas.startUndoBatch();

	goog.array.forEach(batch, function(data) {
		bc.property.set(data[0], data[1]);
	});

	canvas.endUndoBatch();
};

/**
 * @param {string} property
 * @return {*}
 */
bc.property.get = function(property) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	var selection = canvas.getSelectedItems(),
		ret;

	if (selection.length > 0) {
		goog.array.some(selection, function(item, i) {
			if (item.properties[property] !== undefined) {
				ret = item.properties[property];
				return true;
			}
			return false;
		});
	}
	else {
		ret = canvas.model.properties[property];
	}

	return ret;
};

/**
 * @param {string} property
 * @return {function(?=):?}
 */
bc.property.getterSetter = function(properties, property) {
	return function(val) {
		if (val !== undefined && properties[property] !== undefined)
			properties[property] = val;

		return properties[property];
	};
};

/**
 * @enum {string}
 */
bc.properties = {
	ITEM_TYPE: 'it',
	ITEM_COLOR: 'ic',
	ITEM_SCALE: 'is',
	ITEM_ALPHA: 'ia',
	ITEM_LINEWIDTH: 'lw',
	ITEM_X: 'x',
	ITEM_Y: 'y',
	ITEM_W: 'w',
	ITEM_H: 'h',
	TEXT_ALIGN: 'ta',
	LINE_CONTROLPOINTS: 'cp',
	LINE_CURVED: 'lc',
	LINE_OFFLENGTH: 'fl',
	LINE_ONLENGTH: 'nl',
	TEXT: 't',
	TEXT_BG: 'tb'
};
