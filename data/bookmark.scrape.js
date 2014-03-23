// run the scrape
var do_bookmark	=	function(options)
{
	options || (options = {});

	var meta	=	document.getElementsByTagName('meta');
	var desc	=	false;
	var image	=	false;
	for(var x in meta)
	{
		if(meta[x].name != 'description') continue;
		desc = meta[x].content;
		break;
	}

	var og_image	=	null;
	for(var x in meta)
	{
		if(meta[x].getAttribute && meta[x].getAttribute('property') == 'og:image')
		{
			og_image	=	meta[x].content;
			break;
		}
	}

	var image_size_acceptable	=	function(width, height)
	{
		if(width < 150 || height < 150) return false;
		return true;
	};

	var do_check_images	=	function()
	{
		if(!image)
		{
			var images	=	document.getElementsByTagName('img');
			var divs	=	document.getElementsByTagName('div');

			var size	=	0;	// used to track largest image

			// check <img> tags
			for(var i = 0, n = images.length; i < n; i++)
			{
				var img		=	images[i];
				if(!image_size_acceptable(img.width, img.height)) continue;
				var isize	=	img.width * img.height;
				if(isize > size)
				{
					size	=	isize;
					image	=	img.src;
				}
			}

			// check <div> background images (a lot of sites user these instead of
			// <img> tags).
			for(var i = 0, n = divs.length; i < n; i++)
			{
				var div	=	divs[i];
				if(!div.style.width || !div.style.height) continue;
				if(!div.style.backgroundImage) continue;
				if(div.style.width < 200 || div.style.height < 200) continue;
				var img	=	new Image();
				img.src	=	div.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
				if(img.width < 150 || img.height < 150) continue;
				var isize	=	img.width * img.height;
				if(isize > size)
				{
					size	=	isize;
					image	=	img.src;
				}
			}
		}
	}

	var finish	=	function()
	{
		// if we have a good image, axe the description: it's NEVER helpful.
		// seriously, meta descriptions are incredibly worthless
		if(image) desc = '';

		// if og_image sucks but we couldn't find another image, use it anyway
		if(!image && og_image) image = og_image;

		// formulate our complete response LOL
		var send	=	{
			image: image,
			desc: desc
		};

		if(options.complete) options.complete(send);
	};

	if(og_image)
	{
		// we have an og:image ...is it big enough?
		var img			=	new Image();
		var loaded		=	false;
		var cancelled	=	false;	
		img.onload		=	function() {
			// we've been axed (probably took too long to load). do nothing
			if(cancelled) return false;
			loaded	=	true;
			img.onload = null;
			// if the og:image sucks, check our other options
			if(!image_size_acceptable(img.width, img.height))
			{
				do_check_images();
			}
			finish();
		};
		img.src	=	og_image;

		// if loading the image takes longer than a few seconds, fuck it, check the
		// images on the page
		setTimeout(function() {
			// if og:image loaded already, just forget it
			if(loaded) return false;
			cancelled	=	true;
			do_check_images();
			finish();
		}, 2000);
	}
	else
	{
		// no og:image? find a big image to use!
		do_check_images();
		finish();
	}
};

// listen for commands from ze extenstion
do_bookmark({
	complete: function(data) {
		if(self && self.port)
		{
			self.port.emit('bookmark-scrape', data);
		}
		else
		{
			chrome.runtime.sendMessage({type: 'bookmark-scrape', data: data});
		}
	}
});
