function switch_tab(classname)
{
	var main	=	$('main');
	if(!main) return false;

	main.className	=	classname;
	var coords	=	document.body.getElement('#main > div').getCoordinates();
	addon.port.emit('resize', coords.width + 24, coords.height + 24);
}

function set_error(msg, code)
{
	var el_code	=	$('errcode');
	var el_msg	=	$('errmsg');
	if(el_code) el_code.set('html', code + '');
	if(el_msg) el_msg.set('html', msg);
}

function init()
{
	var form	=	$('form_code');
	var inp		=	$('inp_code');
	if(form && inp)
	{
		var val_set		=	false;
		var onchange	=	function(e)
		{
			setTimeout(function() {
				var val	=	inp.value;
				if(val_set || !val || val == '') return false;
				val_set	=	true;
				addon.port.emit('set-key', val);
				addon.port.emit('finish');
			}, 0);
		};

		form.addEvent('submit', function(e) {
			e.stop();
			onchange();
		}, false);
		inp.addEvent('change', onchange, false);
		inp.addEvent('paste', onchange, false);
	}
	addon.port.emit('loaded');
	$('inp_code').focus();
}
window.addEvent('domready', init);

addon.port.on('switch-tab', function(tab) { switch_tab(tab); });
addon.port.on('set-error', function(err, code) { set_error(err, code); });
addon.port.on('show', function() { $('inp_code').focus(); });

