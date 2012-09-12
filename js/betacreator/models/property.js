goog.provide('bc.property');
goog.provide('bc.properties');

goog.require('bc.model.Action');

/**
 * @param {string} property
 * @param {*} val
 * @private
 */
bc.property._set = function(property, val) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	var cleanProperty = bc.property._clean(property),
		isTextProperty = bc.property._forText(property);

	// if (lucid.CanvasEditor.active) {
	// 	if (!isTextProperty)
	// 		return;

	// 	lucid.CanvasEditor.active.setStyle(cleanProperty, val);
	// }
	// else if (canvas.selection && isTextProperty) {
	// 	canvas.selection.editor.select();
	// 	canvas.selection.editor.setStyle(cleanProperty, val);
	// 	canvas.selection.dirty = true;
	// }
	// else if (canvas.selection) {
	// 	canvas.selection.properties[property] = val;
	// 	canvas.selection.dirty = true;
	// }
	// else {
	// 	canvas.document.properties[property] = val;
	// }
};

/**
 * @param {string} property
 * @return {string}
 * @private
 */
bc.property._clean = function(property) {
	if (property.search(/^text\./) === 0)
		return property.substr(5);

	return property;
};

/**
 * @param {string} property
 * @return {boolean}
 * @private
 */
bc.property._forText = function(property) {
	if (property.search(/^text\./) === 0)
		return true;

	return false;
};

/**
 * @type {bc.model.Canvas|null}
 */
bc.property.canvas = null;

/**
 * @param {string} property
 * @param {*} val
 */
bc.property.set = function(property, val) {
	// var canvas = bc.property.canvas;
	// if (!canvas)
	// 	return;

	var oldProp = bc.property.get(property),
		isTextProperty = bc.property._forText(property);

	// // setting text properties will run an action elsewhere
	// if (isTextProperty) {
	// 	bc.property._set(property, val);
	// }
	// // for non-text properties we need to run the action ourselves
	// else {
	// 	lucid.pressit.run(new lucid.pressit.Action(function() {
	// 		bc.property._set(property, val);
	// 	}, function() {
	// 		bc.property._set(property, oldProp);
	// 	}));
	// }
};

/**
 * @param {string} property
 * @return {*}
 */
bc.property.get = function(property) {
	// var canvas = bc.property.canvas;
	// if (!canvas)
		return undefined;

	// var cleanProperty = bc.property._clean(property),
	// 	isTextProperty = bc.property._forText(property);

	// if (lucid.CanvasEditor.active) {
	// 	if (!isTextProperty)
	// 		return undefined;

	// 	return lucid.CanvasEditor.active.getSelectedStyle()[cleanProperty] || null;
	// }
	// else if (canvas.selection && isTextProperty) {
	// 	if (!canvas.selection.editor)
	// 		return undefined;

	// 	canvas.selection.editor.select();
	// 	return canvas.selection.editor.getSelectedStyle()[cleanProperty] || null;
	// }
	// else if (canvas.selection) {
	// 	return canvas.selection.properties[property];
	// }
	// else {
	// 	if (isTextProperty)
	// 		return undefined;
	// 	return canvas.document.properties[property];
	// }
};

/**
 * @enum {string}
 */
bc.properties = {
	ITEM_COLOR: 'ic',
	ITEM_SCALE: 'is',
	TEXT_ALIGN: 'ta',
	LINE_CURVED: 'lc',
	LINE_STYLE: 'ls'
};
