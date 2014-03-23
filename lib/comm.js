/**
 * Desktop <--> extension communication module
 */
var { XMLHttpRequest }	=	require('sdk/net/xhr');
var pairing	=	require('pairing');
var tcrypt	=	require('tcrypt').tcrypt;

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

	data	=	process(cmd, data);
	req.open('get', 'http://127.0.0.1:7471/'+cmd+'?data='+encodeURIComponent(data), true);
	req.send();
}

/**
 * process the data we're sending. if we're doing a simple pair request,
 * just JSON encode it.
 *
 * for any other outgoing request, we're going to encrypt the data via the
 * public key the desktop app sent us.
 */
var process	=	function(cmd, data)
{
	var str	=	JSON.stringify(data);
	if(cmd == 'pair') return str;

	var key	=	pairing.get_key({binary: true});
	if(!key) return false;

	data	=	tcrypt.asym.encrypt(key, str);
	return tcrypt.to_base64(data);
};

exports.send	=	send;

