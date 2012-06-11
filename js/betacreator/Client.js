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
goog.provide('bc.Client');

goog.require('bc.view.Line');
goog.require('bc.view.stamp.Anchor');

/**
 * @param {Image} image
 * @param {Object=} params
 *
 * @constructor
 */
bc.Client = function(image, params) {
	var anchorModel = new bc.model.stamp.Anchor({
		x: 300,
		y: 200
	});
	
	var anchorView = new bc.view.stamp.Anchor(anchorModel);
	anchorView.canvas.appendTo('body');
	anchorView.render();
	
	var lineModel = new bc.model.Line({
		isDashed: true,
		curved: true,
		color: '#003399'
	});
	lineModel.controlPoints = [
		new bc.math.Point(10,10),
		new bc.math.Point(100,100),
		new bc.math.Point(50,200),
		new bc.math.Point(200,300),
		new bc.math.Point(100,350)
	];
	var lineView = new bc.view.Line(lineModel);
	lineView.canvas.appendTo('body');
	lineView.render();
	
	$(document).mousemove(function(e) {
		var hit = lineModel.hitTest(e.clientX, e.clientY);
		$('body').css('background-color', hit ? 'palegoldenrod' : '#556688');
//		console.log(hit ? 'HIT' : 'NO HIT');
	});
}

goog.exportSymbol('bc.Client', bc.Client);
