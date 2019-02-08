/**
 * This is the main extension object. Not only does it hold a number of function
 * and data to make the addon work, it's also the scope the other pieces of the
 * addon load themselves into. This gives the extension a single namespace for
 * all its libraries.
 */
ext.main = {
	activetab: null,
	pairtab: null,
	/**
	 * Called on extension init.
	 */
	setup: function() {
		chrome.browserAction.onClicked.addListener(function(tab){
			if(ext.pairing.have_key()) {
				ext.pairing.do_bookmark();
				return;
			}
			if(ext.pairtab) {
				chrome.tabs.update(ext.pairtab.id, {highlighted: true});
				return;
			}
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				ext.activetab = tabs[0];
				chrome.tabs.create({url: chrome.extension.getURL('data/pair/index.html')}, function(tab) {
					ext.pairtab = tab;
				});
			});
		});
		chrome.tabs.onRemoved.addListener(function(tabid) {
			if(!ext.pairtab || tabid != ext.pairtab.id) return;
			ext.pairtab = null;
		});
	}
};

// vivaldi hack
var is_background = true;

ext.main.setup();

// determine what kind of run we're doing
var cur_version = chrome.runtime.getManifest().version;
if(!localStorage.version) {
	ext.load_reason = 'install';
} else {
	var last_version = localStorage.version;
	var comp = compare_versions(cur_version, last_version);
	if(comp > 0) ext.load_reason = 'upgrade';
	if(comp < 0) ext.load_reason = 'downgrade';
	if(comp == 0) ext.load_reason = 'open';
}
console.log('load reason: ', ext.load_reason);
localStorage.version = cur_version;

