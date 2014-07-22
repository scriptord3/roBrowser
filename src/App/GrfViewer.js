/**
 * App/GrfViewer.js
 *
 * Start GRF Viewer instance using ROBrowser
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

// Errors Handler (hack)
require.onError = function (err)
{
	'use strict';

	if (require.defined('UI/Components/Error/Error')) {
		require('UI/Components/Error/Error').addTrace(err);
		return;
	}

	require(['UI/Components/Error/Error'], function (Errors)
	{
		Errors.addTrace(err);
	});
};

require({
	baseUrl: './src/',
	paths: {
		text: 'Vendors/text.require',
		jquery: 'Vendors/jquery-1.9.1'
	}
}, ['UI/Components/GrfViewer/GrfViewer'], function (GRFViewer)
{
	'use strict';

	GRFViewer.append();
});

// Avoid user from mistakenly leaving
window.onbeforeunload = function ()
{
	return 'GrfViewer';
};