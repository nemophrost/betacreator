goog.provide('bc.gui.Input');

/**
 * Interface for input elements
 * 
 * @interface
 */
bc.gui.Input = function() {}


/** @return {Element} */
bc.gui.Input.prototype.getContainer = function() {};

/**
 * Append the input to a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.appendTo = function(parent, width) {}

/**
 * @return {*}
 */
bc.gui.Input.prototype.getValue = function() {}

/**
 * enable the input
 * 
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.enable = function() {}

/**
 * disable the input
 * 
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.disable = function() {}
