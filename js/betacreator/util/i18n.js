goog.provide('bc.i18n');

/**
 * @param {string} str
 * @return {string}
 */
bc.i18n = function(str) {
    if (bc.i18n.data[str]) {
		var ret = str;
        if (bc.i18n.language != 'en')
            ret = bc.i18n.data[str][bc.i18n.language] || bc.i18n.data[str]['en'] || str;
        else
			ret = bc.i18n.data[str]['en'] || str;
		
		return ret;
    }
    else {
        return str;
    }
}

bc.i18n.language = 'en';

bc.i18n.data = {};
