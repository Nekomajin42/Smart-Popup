"use strict";

// do some stuff on install and update
chrome.runtime.onInstalled.addListener(function(details)
{
	if (details.reason === "install" || details.reason === "update")
	{
		// build user preferences
		chrome.storage.local.get(null, function(saved)
		{
			saved.functions = (saved.functions != undefined) ? saved.functions : {};
			saved.searches = (saved.searches != undefined) ? saved.searches : {};
			saved.style = (saved.style != undefined) ? saved.style : {};
			chrome.storage.local.set(
			{
				functions: {
					copy : (saved.functions.copy != undefined) ? saved.functions.copy : true,
					paste : (saved.functions.paste != undefined) ? saved.functions.paste : true,
					search : (saved.functions.search != undefined) ? saved.functions.search : true,
					open : (saved.functions.open != undefined) ? saved.functions.open : true,
					link : (saved.functions.link != undefined) ? saved.functions.link : false
				},
				searches: {
					engine: (saved.searches.engine != undefined) ? saved.searches.engine : "https://www.google.com/search?q="
				},
				style: {
					main : (saved.style.main != undefined) ? saved.style.main : "#8080ff",
					hover : (saved.style.hover != undefined) ? saved.style.hover : "#ffffff",
					shadow : (saved.style.shadow != undefined) ? saved.style.shadow : "#000080",
					mainText : (saved.style.mainText != undefined) ? saved.style.mainText : "#ffffff",
					hoverText : (saved.style.hoverText != undefined) ? saved.style.hoverText : "#8080ff",
					borderRadius : (saved.style.borderRadius != undefined) ? saved.style.borderRadius : 5
				}
			});
		});
		
		// throw notification
		var options = 
		{
			type : "basic",
			title: "Smart Popup has been " + ((details.reason === "install") ? "installed" : "updated"),
			message: "Click to see what's new!",
			iconUrl : "icons/icon48.png",
			isClickable: true
		};
		chrome.notifications.create("smart_popup", options, function(notificationID)
		{
			window.setTimeout(function()
			{
				chrome.notifications.clear("smart_popup");
			}, 5000);
		});
		chrome.notifications.onClicked.addListener(function()
		{
			chrome.runtime.openOptionsPage();
		});
	}
});

window.addEventListener("DOMContentLoaded", function()
{
	chrome.tabs.insertCSS({file: "popup.css"}, function()
	{
		if (chrome.runtime.lastError)
		{
			console.log("Smart Popup: can not run on internal pages");
		}
		else
		{
			chrome.tabs.executeScript({file: "index.js"});
			chrome.tabs.executeScript({file: "popup.js"});
		}
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, response)
{
	if (request.action === "jump")
	{
		chrome.tabs.update({
			url: request.text
		});
	}
	else if (request.action === "open")
	{
		chrome.tabs.create({
			url: request.text, 
			active: request.active
		});
	}
	else if (request.action === "search")
	{
		chrome.storage.local.get("searches", function(result)
		{
			chrome.tabs.create({
				url: result.searches.engine + request.text, 
				active: request.active
			});
		});
	}
});