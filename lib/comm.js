var request	=	require('sdk/request').Request;

var send	=	function(cmd, data, options)
{
	options || (options = {});

	var req_options	=	{
		url: 'http://127.0.0.1:7471/'+cmd,
		content: {data: JSON.stringify(data)},
		onComplete: function(res) {
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
				if(options.error) options.error(obj.error);
			}
			else
			{
				options.success(obj);
			}
		}
	};
	request(req_options).get();
}

exports.send	=	send;

