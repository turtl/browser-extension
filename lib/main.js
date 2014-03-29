(function() {
	var data		=	require('sdk/self').data;
	var win_util	=	require('sdk/window/utils');
	var chromewin	=	win_util.getMostRecentBrowserWindow();
	var { Hotkey }	=	require('sdk/hotkeys');
	var { on, once, off, emit }	=	require('sdk/event/core');

	// our own libs
	var pairing		=	require('pairing');
	var tb_button	=	require('toolbar-button-complete/toolbarbutton');

	// -------------------------------------------------------------------------
	// init section
	// -------------------------------------------------------------------------
	var reason	=	require('sdk/self').loadReason;

	exports.main	=	function(options, callbacks)
	{
		var reason	=	options.loadReason;

		// init the main button/menu
		var is_install	=	(['upgrade', 'downgrade', 'enable', 'install'].indexOf(reason) > -1);
		var button		=	tb_button.ToolbarButton({
			id: 'turtl_button',
			label: 'Turtl',
			tooltiptext: 'Bookmark this page in Turtl',
			image: data.url('images/favicon.png'),
			menu: false,
			onCommand: function(e, btn) {
				pairing.open(btn);
			}
		});
		console.log('turtl: reason: ', reason);
		if(is_install)
		{
			button.moveTo({
				toolbarID: "nav-bar",
				forceMove: false
			});
		}

		var mainkey	=	Hotkey({
			combo: 'accel-down',
			onPress: function() {
				pairing.open(button.button());
			}
		});

	};

	exports.onUnload	=	function(reason)
	{
		if(['upgrade', 'downgrade', 'disable', 'uninstall'].indexOf(reason) > -1)
		{
			//menu.uninstall();
		}
	};
})();
