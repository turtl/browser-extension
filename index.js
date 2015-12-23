(function() {
	var data		=	require('sdk/self').data;
	var win_util	=	require('sdk/window/utils');
	var chromewin	=	win_util.getMostRecentBrowserWindow();
	var ui = require('sdk/ui');
	var { Hotkey }	=	require('sdk/hotkeys');
	var { on, once, off, emit }	=	require('sdk/event/core');

	// our own libs
	var pairing		=	require('pairing');

	// -------------------------------------------------------------------------
	// init section
	// -------------------------------------------------------------------------
	exports.main	=	function(options, callbacks)
	{
		var reason	=	options.loadReason;

		// init the main button/menu
		var is_install	=	(['upgrade', 'downgrade', 'enable', 'install'].indexOf(reason) > -1);
		var button = ui.ActionButton({
			id: 'turtl_button',
			label: 'Turtl',
			icon: data.url('images/favicon.png'),
			onClick: function(state) {
				pairing.open(button);
			}
		});

		var mainkey	=	Hotkey({
			combo: 'accel-down',
			onPress: function() {
				pairing.open(button);
			}
		});

	};
})();
