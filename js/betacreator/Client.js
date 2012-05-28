goog.provide('bc.Client');

goog.require('bc.model.Line');
goog.require('bc.model.Anchor');

/**
 * @param {Image} image
 * @param {Object=} params
 *
 * @constructor
 */
bc.Client = function(image, params) {
	var anchor = new bc.model.Anchor();
	anchor.canvas.appendTo('body');
	anchor.x = 300;
	anchor.y = 200;
	anchor.render();
	
	var line = new bc.model.Line({
		isDashed: true,
		curved: true,
		color: '#003399'
	});
	line.canvas.appendTo('body');
	line.controlPoints = [
		new bc.math.Point(10,10),
		new bc.math.Point(100,100),
		new bc.math.Point(50,200),
		new bc.math.Point(200,300),
		new bc.math.Point(100,350)
	];
	line.render();
	
	$(document).mousemove(function(e) {
		var hit = line.hitTest(e.clientX, e.clientY);
		$('body').css('background-color', hit ? 'palegoldenrod' : '#556688');
//		console.log(hit ? 'HIT' : 'NO HIT');
	});
}

goog.exportSymbol('bc.Client', bc.Client);
