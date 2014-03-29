var data		=	require('sdk/self').data;
var comm		=	require('comm');
var bookmark	=	require('bookmark');
var Panel		=	require('sdk/panel');
var tcrypt		=	require('tcrypt').tcrypt;
var ss			=	require('sdk/simple-storage');
var timer		=	require('timer');
var { on, once, off, emit }	=	require('sdk/event/core');

// makes it easier to share code with chrome
var localStorage	=	ss.storage;

var panel	=	null;
var get_btn	=	null;

var open	=	function(btn)
{
	get_btn		=	function() { return btn; };
	var do_open	=	function()
	{
		if(!have_key())
		{
			start();
		}
		else
		{
			panel.port.emit('switch-tab', 'load');
			do_bookmark();
		}
	};

	if(!panel)
	{
		panel	=	Panel.Panel({
			width: 40,
			height: 40,
			contentURL: data.url('pair/index.html')
		});

		panel.port.on('resize', function(width, height) { panel.resize(width, height); });
		panel.port.on('start', function() { start(); });
		panel.port.on('finish', function() { finish(); });
		panel.port.on('do-bookmark', function() { do_bookmark(); });
		panel.port.on('set-key', function(val) { set_key(val); });
		panel.port.on('loaded', function() {
			do_open();
		});
		panel.on('show', function() {
			panel.port.emit('show');
		});
	}
	else
	{
		panel.resize(40, 40);
		do_open();
	}
	panel.show(btn);
};

var start	=	function()
{
	// firefox annoyingly closes the panel if the FF window loses focus so what
	// we do here is listen for the inevitable close event and re-open the panel
	// manually when this happens.
	//
	// also, we wait 2 seconds and if the panel hasn't been closed in that time,
	// we remove the listener to reopen it. this should provide some amount of
	// forwards compatibility in case they change the way it works in the future
	// and we won't have panels randomly popping up when they shouldn't.
	var do_reopen	=	function()
	{
		panel.removeListener('hide', do_reopen);
		timer.setTimeout(function() {
			panel.show(get_btn());
		}, 100);
	};
	panel.on('hide', do_reopen);
	timer.setTimeout(function() { panel.removeListener('hide', do_reopen); }, 2000);

	comm.send('pair', null, {
		success: function(res) {
			if(panel)
			{
				panel.port.emit('switch-tab', 'pair');
			}
		},
		error: function(err, code) {
			console.error('pair: error: ', err, code);
			show_error(err, code);
		}
	});
};

var finish	=	function()
{
	comm.send('ping', 'hai', {
		success: function(res) {
			// finally, complete the action we set out to do
			do_bookmark();
			if(panel) panel.port.emit('switch-tab', 'load');
		},
		error: function(err, code) {
			console.error('pair: ping: ', err, code);
			show_error(err, code);
		}
	});

};

var do_bookmark	=	function()
{
	bookmark.scrape({
		complete: function(data) {
			comm.send('bookmark', data, {
				success: function() {
					close();
				},
				error: function(err, code) {
					console.error('error bookmarking: ', err);
					show_error(err, code);
				}
			});
		}
	});
};

var show_error	=	function(err, code)
{
	if(code == -1)
	{
		if(panel) panel.port.emit('switch-tab', 'connect_error');
	}
	else
	{
		if(panel)
		{
			panel.port.emit('set-error', err, code);
			panel.port.emit('switch-tab', 'error');
		}
	}
};

var close	=	function()
{
	panel.hide();
};

var set_key	=	function(key_hex)
{
	var key	=	tcrypt.key_to_string(tcrypt.from_hex(key_hex));
	localStorage['pairing_key']	=	key;
};

var get_key	=	function(options)
{
	options || (options = {});
	var key	=	localStorage.pairing_key;
	if(options.binary)
	{
		key	=	tcrypt.key_to_bin(key);
	}
	return key;
};

var have_key	=	function()
{
	return !!get_key();
};

var destroy	=	function()
{
	panel.destroy();
	panel	=	null;
};

exports.open		=	open;
exports.start		=	start;
exports.finish		=	finish;
exports.do_bookmark	=	do_bookmark;
exports.show_error	=	show_error;
exports.close		=	close;
exports.set_key		=	set_key;
exports.get_key		=	get_key;
exports.have_key	=	have_key;
exports.destroy		=	destroy;

