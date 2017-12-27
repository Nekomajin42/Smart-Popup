"use strict";

/**
 * This file contains code to catch click events on the page
 * and get the user settings from the background script
 */

// get user settings from storage
console.log("Smart Popup: running");
chrome.storage.local.get(null, function(result)
{
	smartPopup.settings = result;
	smartPopup.setStyle();
});

// catch click events
document.body.addEventListener("click", function(e)
{
	// set event details
	smartPopup.selection.text = document.getSelection().toString();
	smartPopup.target.element = e.target;
	smartPopup.event.X = e.pageX;
	smartPopup.event.Y = e.pageY;
	smartPopup.event.clicks = e.detail;
	
	if (["button-copy", "button-paste", "button-search", "button-open"].indexOf(e.target.id) > -1) // outer buttons
	{
		// remove previous instance
		smartPopup.remove();
	}
	// INNER BUTTONS COME HERE
	else // anywhere on the page
	{
		// remove previous instance
		smartPopup.remove();
		
		// filter available functions
		if (smartPopup.selection.isSelection()) // selection
		{
			if (smartPopup.selection.isURL())
			{
				smartPopup.buttons.open = smartPopup.settings.functions.open;
			}
			else
			{
				smartPopup.buttons.search = smartPopup.settings.functions.search;
			}
			smartPopup.buttons.copy = smartPopup.settings.functions.copy;
		}
		if (smartPopup.target.isInput()) // input field
		{
			smartPopup.buttons.paste = smartPopup.settings.functions.paste;
		}
		
		// create new instance
		for (let key in smartPopup.buttons)
		{
			if (smartPopup.buttons[key] === true)
			{
				smartPopup.insert();
				break;
			}
		}
	}
});