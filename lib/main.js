(function() {
	var data		=	require('sdk/self').data;
	var { on, once, off, emit }	=	require('sdk/event/core');

	// our own libs
	var bookmark	=	require('bookmark');
	var comm		=	require('comm');
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
				bookmark.scrape({
					complete: function(data) {
						comm.send('bookmark', data, {
							success: function(res) {
								console.log('bookmark: success: ', res);
							},
							error: function(err) {
								console.error('bookmark: send: ', err);
							}
						});
					}
				});
			}
		});
		if(is_install)
		{
			button.moveTo({
				toolbarID: "nav-bar",
				forceMove: false
			});
		}
	};

	exports.onUnload	=	function(reason)
	{
		if(['upgrade', 'downgrade', 'disable', 'uninstall'].indexOf(reason) > -1)
		{
			//menu.uninstall();
		}
	};
})();
