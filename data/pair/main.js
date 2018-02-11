var app	=	chrome.extension.getBackgroundPage();

// vivaldi hack
var is_popup = true;

function switch_tab(classname)
{
	var main	=	$('main');
	if(!main) return false;

	main.className	=	classname;
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
	if(!app.ext.pairing.have_key())
	{
		app.ext.pairing.start();
	}
	else
	{
		switch_tab('load');
		app.ext.pairing.do_bookmark();
	}

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
				app.ext.pairing.set_key(val);
				app.ext.pairing.finish();
			}, 0);
		};

		form.addEvent('submit', function(e) {
			s.stop();
			onchange();
		}, false);
		inp.addEvent('change', onchange, false);
		inp.addEvent('paste', onchange, false);
	}
}
window.addEvent('domready', init);

