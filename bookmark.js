var data		=	require('sdk/self').data;
var tabs		=	require('sdk/tabs');

var scrape	=	function(options)
{
    console.log("Scraping...")
	var tab		=	tabs.activeTab;
	var title	=	tab.title;
	var url		=	tab.url;
    console.log(url); // Testing
	var type	=	tab.contentType.match(/^image/) ? 'image' : 'link';

	// call this when we have all the data we need to open the panel and
	// populate the bookmarker form(s)
	var do_bookmark	=	function(tabdata)
	{
		var text	=	'';
		if(tabdata.image && tabdata.image != '')
		{
			text	+=	'![image]('+tabdata.image+')  \n';
		}
		else if(tabdata.desc)
		{
			text	+=	tabdata.desc;
		}
		var linkdata	=	{
			title: type == 'image' ? '' : tab.title,
			url: tab.url,
			type: type,
			text: text
		};

		if(options.complete) options.complete(linkdata);
	};

	if(type == 'image')
	{
		// if the page we're on is an image, we don't need to scrape any HTML
		// or anything, so open the panel with the info we already have
		do_bookmark({});
	}
	else
	{
		// we're scraping a page for meta description and images, attach our
		// scraper to the current tab and open the panel once the scrape is
		// complete
		var worker	=	tab.attach({
			contentScriptFile: data.url('bookmark.scrape.js')
		});
		worker.port.on('bookmark-scrape', function(data) {
			do_bookmark(data);
			// don't need this no more
			worker.destroy();
		});
	}
};

exports.scrape	=	scrape;

