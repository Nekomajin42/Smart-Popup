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
			saved.colors = (saved.colors != undefined) ? saved.colors : {};
			chrome.storage.local.set(
			{
				functions: {
					copy : (saved.functions.copy != undefined) ? saved.functions.copy : true,
					paste : (saved.functions.paste != undefined) ? saved.functions.paste : true,
					search : (saved.functions.search != undefined) ? saved.functions.search : true,
					open : (saved.functions.open != undefined) ? saved.functions.open : true
				},
				searches: {
					engine: (saved.searches.engine != undefined) ? saved.searches.engine : "https://www.google.com/search?q=",
					custom: false
				},
				colors: {
					main : (saved.colors.main != undefined) ? saved.colors.main : "#8080ff",
					hover : (saved.colors.hover != undefined) ? saved.colors.hover : "#00ffff",
					shadow : (saved.colors.shadow != undefined) ? saved.colors.shadow : "#000080",
					mainText : (saved.colors.mainText != undefined) ? saved.colors.mainText : "#ffffff",
					hoverText : (saved.colors.hoverText != undefined) ? saved.colors.hoverText : "#000080"
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
	if (request.action === "open")
	{
		chrome.tabs.create({url: request.selection});
	}
	else if (request.action === "search")
	{
		chrome.storage.local.get("searches", function(result)
		{
			console.log(result);
			chrome.tabs.create({url: result.searches.engine + request.selection});
		});
	}
});