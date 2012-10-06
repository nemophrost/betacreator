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
goog.provide('bc.gui.TextArea');

goog.require('bc.domBuilder');

/**
 * Text Area for inputing text content
 *
 * @constructor
 */
bc.gui.TextArea = function() {

	var me = this;

	/**
	 * @type {boolean}
	 */
	this.visible = false;

	/**
	 * @type {Element}
	 * @private
	 */
	this.textarea = null;

	/**
	 * @type {Element}
	 */
	this.container = bc.domBuilder({
		classes: 'text-area-container',
		children: [
			{
				classes: 'overlay'
			},{
				classes: 'wrapper',
				children: [
					{
						classes: 'heading',
						text: bc.i18n('Edit Text Content')
					},{
						tag: 'textarea',
						create: function(dom) {
							me.textarea = dom;

							goog.events.listen(dom, goog.events.EventType.KEYDOWN, function(e) {
								e.stopPropagation();
							});
						}
					},{
						tag: 'button',
						classes: 'cancel',
						text: bc.i18n('Cancel'),
						click: function() {
							me.hide();
						}
					},{
						tag: 'button',
						classes: 'save',
						text: bc.i18n('Save'),
						click: function() {
							me.save();
						}
					}
				]
			}
		]
	});

	/**
	 * @type {?function(string)}
	 * @private
	 */
	this.callback = null;
};


/**
 *
 */
bc.gui.TextArea.prototype.save = function() {
	if (!this.callback || this.callback(this.textarea.value) !== false)
		this.hide();
};


/**
 * @param {function(string)} callback
 * @param {?string=} defaultText
 */
bc.gui.TextArea.prototype.show = function(callback, defaultText) {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);

	this.visible = true;

	this.callback = callback;

	this.textarea.value = defaultText || '';

	this.container.style.display = 'block';

	// timeout to wait for mouse up
	setTimeout(goog.bind(function() {
		if (this.textarea.select)
			this.textarea.select();
	}, this), 250);
};


/**
 *
 */
bc.gui.TextArea.prototype.hide = function() {
	this.visible = false;

	this.callback = null;

	this.container.style.display = 'none';
};
