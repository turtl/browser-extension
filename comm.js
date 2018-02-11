/**
 * Desktop <--> extension communication module
 */
ext.comm = {
	send: function(cmd, data, options)
	{
		options || (options = {});

		var req = new XMLHttpRequest();
		req.onload = function() {
			var res = this.responseText;
			try {
				var obj = JSON.parse(res);
			} catch(e) {
				if(options.error) options.error('comm: error parsing json: '+ res);
				return;
			}

			if(obj.error) {
				if(options.error) options.error(obj.error, obj.code);
			} else {
				if(options.success) options.success(obj);
			}
		};
		req.onerror = function() {
			// signal a timeout
			if(options.error) options.error(null, -1);
		};

		data = ext.comm.process(cmd, data, options.pubkey);
		var url = 'http://127.0.0.1:7471/'+cmd+'?data='+encodeURIComponent(data);
		req.open('get', url, true);
		req.send();
	},

	/**
	 * process the data we're sending. if we're doing a simple pair request,
	 * just JSON encode it.
	 *
	 * for any other outgoing request, we're going to encrypt the data via the
	 * public key the desktop app sent us.
	 */
	process: function(cmd, data, optional_pubkey)
	{
		var str = JSON.stringify(data);
		if(cmd == 'pair') return str;

		if(optional_pubkey) {
			var key = sjcl.codec.hex.toBits(optional_pubkey);
		} else {
			var key = ext.pairing.get_key({binary: true});
		}
		if(!key) return false;

		data = tcrypt.asym.encrypt(key, str);
		return tcrypt.to_base64(data);
	}
};
