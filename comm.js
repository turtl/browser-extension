/**
 * Desktop <--> extension communication module
 */
var data		=	require('sdk/self').data;
var pairing		=	require('pairing');
var tcrypt		=	require('tcrypt').tcrypt;
var win_util	=	require('sdk/window/utils');
var { XMLHttpRequest }	=	require('sdk/net/xhr');

var send	=	function(cmd, data, options)
{
	options || (options = {});

	var req		=	new XMLHttpRequest();
	req.onload	=	function()
	{
		var res	=	this.responseText;
		try
		{
			var obj	=	JSON.parse(res);
		}
		catch(e)
		{
			if(options.error) options.error('comm: error parsing json: '+ res);
			return;
		}

		if(obj.error)
		{
			if(options.error) options.error(obj.error, obj.code);
		}
		else
		{
			if(options.success) options.success(obj);
		}
	};
	req.onerror	=	function()
	{
		// signal a timeout
		if(options.error) options.error(null, -1);
	};

	process_data(cmd, data, {
		success: function(data) {
			req.open('get', 'http://127.0.0.1:7471/'+cmd+'?data='+encodeURIComponent(data), true);
			req.send();
		},
		error: options.error
	});
}

/**
 * process the data we're sending. if we're doing a simple pair request,
 * just JSON encode it.
 *
 * for any other outgoing request, we're going to encrypt the data via the
 * public key the desktop app sent us.
 */
var process_data	=	function(cmd, data, options)
{
	options || (options = {});

	var str	=	data ? JSON.stringify(data) : '';
	if(cmd == 'pair')
	{
		if(options.success) options.success(str);
		return;
	}

	var key	=	pairing.get_key({binary: true});
	if(!key)
	{
		if(options.error) options.error('This extension has not been paired.', 4);
		return;
	}

	encrypt([key, str], {
		complete: function(data) {
			if(data)
			{
				if(options.success) options.success(tcrypt.to_base64(data));
			}
			else
			{
				if(options.error) options.error('There was a problem communicating with the desktop app.', 3);
			}
		}
	});
};

var encrypt	=	function(args, options)
{
	options || (options = {});

	var chromewin	=	win_util.getMostRecentBrowserWindow();
	if(typeof(Worker) == 'undefined')
	{
		var Worker		=	chromewin.Worker;
	}

	var seed		=	new Uint32Array(32);
	if(typeof(crypto) == 'undefined')
	{
		// generate a random seed for sjcl
		chromewin.crypto.getRandomValues(seed);
	}

	var worker		=	new Worker(data.url('tcrypt.thread.js'));
	worker.postMessage({
		cmd: 'asym.encrypt',
		args: args,
		seed: seed
	});
	worker.addEventListener('message', function(e) {
		var res	=	e.data;
		if(res.type != 'success')
		{
			var dec	=	false;
			console.error('tcrypt.thread: err: ', res, e.stack);
		}
		else
		{
			var dec	=	res.data;
		}
		if(options.complete) options.complete(dec);

		// clean up
		worker.terminate();
	});
};

exports.send	=	send;

