goog.provide('bc.domBuilder');

/**

This utility function takes Javascript data structures and turns them into
a DOM Element.  These may directly describe the tags that make up the
object, like this:

{
	tag:'span', // defaults to 'div' if you don't specify a tag
	classes:'one two three',
	attr:{rows:40,cols:20},
	children:[{these objects}]
}

Or they can just be strings--these will be created as spans, so you can put
them into the "children" array.

 * @param {Object|string} data
 * @return {Element}
*/
bc.domBuilder = function(data) {	
	if(goog.isString(data)) {
		var span = goog.dom.createDom(goog.dom.TagName.SPAN);
		goog.dom.setTextContent(span, /** @type {string} */(data));
		return span;
	}
	
	data.tag = data.tag || goog.dom.TagName.DIV;

	var ret = goog.dom.createDom(data.tag),
		key,
		allAttributes = {
			'id':		data.id,
			'class':	data.classes,
			'type':		data.type,
			'src':		data.src,
			'href':		data.href,
			'title':	data.title,
			'name':		data.name,
			'target':	data.target,
			'checked':	data.checked,
			'value':	data.value
		},
		attributes = {},
		doSetAttributes = false;

	for (key in allAttributes) {
		if (allAttributes[key] !== undefined) {
			attributes[key] = allAttributes[key];
			doSetAttributes = true;
		}
	}
	if(data.attr) {
		for(key in data.attr) {
			attributes[key] = data.attr[key];
			doSetAttributes = true;
		}
	}

	if (doSetAttributes)
		goog.dom.setProperties(ret, attributes);

	if(data.html)		ret.innerHTML = data.html;
	if(data.text)		goog.dom.setTextContent(ret, data.text);
	
	if(data.css) {
		for (key in data.css) {
			ret.style[key] = data.css[key];
		}
	}
	
	if(data.children) {
		for(var i = 0; i < data.children.length; i++) {
			if (data.children[i])
				goog.dom.appendChild(ret, bc.domBuilder(data.children[i]));
		}
	}
	
	if(data.create)
		data.create(ret);
	
	if(data.click)
		goog.events.listen(ret, goog.events.EventType.CLICK, function(e) {
			data.click(e,ret);
		});

	if(data.change)
		goog.events.listen(ret, goog.events.EventType.CHANGE, function(e) {
			data.change(e,ret);
		});

	return ret;
}
