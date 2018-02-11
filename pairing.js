var get_popup = function()
{
	var popup = chrome.extension.getViews({type: 'popup'})[0];
	if(popup) return popup;

	// vivaldi hax
	var windows = chrome.extension.getViews();
	return windows
		.filter(function(win) { return win.is_popup; })[0];
};

ext.pairing	=	{
	start: function()
	{
		var popup = get_popup();
		ext.comm.send('pair', null, {
			success: function(res) {
				console.log('success!', popup);
				if(popup) popup.switch_tab('pair');
			},
			error: function(err, code) {
				console.error('pair: error: ', err, code);
				ext.pairing.show_error(err, code);
			}
		});
	},

	finish: function()
	{
		var popup = get_popup();
		ext.comm.send('ping', 'hai', {
			success: function(res) {
				// finally, complete the action we set out to do
				ext.pairing.do_bookmark();
				if(popup) popup.switch_tab('load');
			},
			error: function(err, code) {
				console.error('pair: ping: ', err, code);
				ext.pairing.show_error(err, code);
			}
		});

	},

	do_bookmark: function()
	{
		ext.bookmarker.scrape({
			complete: function(data) {
				ext.comm.send('bookmark', data, {
					success: function() {
						ext.pairing.close();
					},
					error: function(err, code) {
						console.error('error bookmarking: ', err);
						ext.pairing.show_error(err, code);
					}
				});
			}
		});
	},

	show_error: function(err, code)
	{
		var popup = get_popup();
		if(code == -1)
		{
			if(popup) popup.switch_tab('connect_error');
		}
		else
		{
			if(popup)
			{
				popup.set_error(err, code);
				popup.switch_tab('error');
			}
		}
	},

	close: function()
	{
		var popup = get_popup();
		if(!popup) return false;
		popup.close();
	},

	set_key: function(key_hex)
	{
		var key	=	tcrypt.key_to_string(tcrypt.from_hex(key_hex));
		localStorage['pairing_key']	=	key;
	},

	get_key: function(options)
	{
		options || (options = {});
		var key	=	localStorage.pairing_key;
		if(options.binary)
		{
			key	=	tcrypt.key_to_bin(key);
		}
		return key;
	},

	have_key: function()
	{
		return !!ext.pairing.get_key();
	}
};

