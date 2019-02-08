const get_popup = function() {
	return chrome.extension.getViews({type: 'tab', tabId: ext.pairtab.id})[0];
};

ext.pairing = {
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

	finish: function(pubkey)
	{
		var popup = get_popup();
		ext.comm.send('ping', 'hai', {
			pubkey: pubkey,
			success: function(res) {
				ext.pairing.set_key(pubkey);
				ext.pairing.close(function() {
					// finally, complete the action we set out to do
					ext.pairing.do_bookmark();
				});
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

	close: function(fn)
	{
		if(!ext.pairtab) return false;
		setTimeout(function() {
			chrome.tabs.remove(ext.pairtab.id, function() {
				fn();
			});
		}, 100);
	},

	set_key: function(key_hex)
	{
		var key = tcrypt.key_to_string(tcrypt.from_hex(key_hex));
		localStorage['pairing_key'] = key;
	},

	get_key: function(options)
	{
		options || (options = {});
		var key = localStorage.pairing_key;
		if(options.binary)
		{
			key = tcrypt.key_to_bin(key);
		}
		return key;
	},

	have_key: function()
	{
		return !!ext.pairing.get_key();
	}
};

