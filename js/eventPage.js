var makeRefresh = false;
chrome.alarms.onAlarm.addListener(function(alarm) {
	$.get('http://www.ktc-ua.com/news', function(data) {
		var currDate = $(data).find('.field-name-post-date').first().text();
		chrome.storage.local.get('lastDate', function(data) {
			if (currDate !== data.lastDate) {
				setBadge();
				makeRefresh = true;
			}
		});
	}).done(function() {
		$.get('http://www.ktc-ua.com', function(data) {
			var lastPic = $(data).find('.views-slideshow-cycle-main-frame-row-item.views-row.views-row-0.views-row-odd.views-row-first img').first().attr('src').match(/\w+-?\w+/g)[7];
			chrome.storage.local.get('lastPic', function(data) {
				if (lastPic !== data.lastPic) {
					setBadge();
					makeRefresh = true;
				}
			});
		});
	});
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.refresh == "refresh" && makeRefresh) {
			sendResponse({
				text: 'true'
			});
		}
	});

function setBadge() {
	chrome.browserAction.setBadgeBackgroundColor({
		color: '#00958F'
	});
	chrome.browserAction.setBadgeText({
		text: 'new'
	});
}