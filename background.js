function onload() {
	chrome.browserAction.setBadgeBackgroundColor({color:[102,204,0,255]});
	chrome.browserAction.setBadgeText({text:""});
	checkPrefs();
	var intDelay = Math.floor(Math.random()*1000) + 1000 
	setTimeout ( "checkStatus()", intDelay ); // http://www.sean.co.uk/a/webdesign/javascriptdelay.shtm
	setInterval ( "checkStatus()", iytTimer );
	}

chrome.browserAction.onClicked.addListener(function(tab) {
	showSite();
	});