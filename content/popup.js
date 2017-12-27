"use strict";

/**
 * This file contains code to make the popup work
 */

let smartPopup = {
	// event clone
	event: {
		X: 0,
		Y: 0,
		clicks: 0
	},
	
	// reference to DOM node
	popup: null,
	
	// settings loaded from storage
	settings: {},
	
	// selected text
	selection: {
		text: "",
		isSelection: function() {
			if ((smartPopup.event.clicks >= 1 && smartPopup.event.clicks <= 3) && smartPopup.selection.text.length > 0)
			{
				return true;
			}
			return false;
		},
		isURL: function() {
			// regex from: https://gist.github.com/dperini/729294
			// see: https://mathiasbynens.be/demo/url-regex
			let pattern = new RegExp(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
			return pattern.test(this.text);
		}
	},
	
	// selection target
	target: {
		element: null,
		isInput: function() {
			if (this.element.tagName === "TEXTAREA")
			{
				return true;
			}
			else if (this.element.tagName === "INPUT")
			{
				let types = ["text", "search", "number", "email", "url", "password"];
				if (types.indexOf(this.element.type) > -1)
				{
					return true;
				}
			}
			return false;
		}
	},
	
	// which buttons to show
	buttons: {
		open: false,
		search: false,
		copy: false,
		paste: false
	},
	
	// create new instance and insert into DOM
	insert: function()
	{
		// create new element
		smartPopup.popup = document.createElement("form");
		smartPopup.popup.id = "smart-popup";
		
		// open new tab with selection
		if (smartPopup.buttons.open === true)
		{
			let open = document.createElement("input");
			open.type = "button";
			open.value = "Open";
			open.id = "button-open";
			open.addEventListener("click", function()
			{
				chrome.runtime.sendMessage({selection: smartPopup.selection.text, action: "open"});
			});
			smartPopup.popup.appendChild(open);
		}
		
		// open new tab with selection
		if (smartPopup.buttons.search === true)
		{
			let search = document.createElement("input");
			search.type = "button";
			search.value = "Search";
			search.id = "button-search";
			search.addEventListener("click", function()
			{
				chrome.runtime.sendMessage({selection: smartPopup.selection.text, action: "search"});
			});
			smartPopup.popup.appendChild(search);
		}
		
		// copy selection
		if (smartPopup.buttons.copy === true)
		{
			let copy = document.createElement("input");
			copy.type = "button";
			copy.value = "Copy";
			copy.id = "button-copy";
			copy.addEventListener("click", function()
			{
				document.execCommand("copy");
			});
			smartPopup.popup.appendChild(copy);
		}
		
		// paste to input field
		if (smartPopup.buttons.paste === true)
		{
			let paste = document.createElement("input");
			paste.type = "button";
			paste.value = "Paste";
			paste.id = "button-paste";
			paste.addEventListener("click", function()
			{
				smartPopup.target.element.focus();
				document.execCommand("paste");
			});
			smartPopup.popup.appendChild(paste);
		}
		
		// insert into DOM
		document.body.appendChild(smartPopup.popup);
		smartPopup.setPosition();
		smartPopup.popup.classList.add("visible");
	},
	
	// remove current instance from the DOM
	remove: function()
	{
		try
		{
			document.body.removeChild(smartPopup.popup);
			smartPopup.buttons.open = false;
			smartPopup.buttons.search = false;
			smartPopup.buttons.copy = false;
			smartPopup.buttons.paste = false;
		}
		catch (e) {}
	},
	
	// set position to mouse cursor
	setPosition: function()
	{
		// horizontal position
		if (smartPopup.popup.clientWidth > smartPopup.event.X) // on the left side
		{
			smartPopup.popup.style.left = "10px";
		}
		else if ((document.body.clientWidth - smartPopup.event.X) < smartPopup.popup.clientWidth) // on the right side
		{
			smartPopup.popup.style.right = "10px";
		}
		else // in the middle
		{
			smartPopup.popup.style.left = smartPopup.event.X - (smartPopup.popup.clientWidth / 2) + "px";
			smartPopup.popup.classList.add("upside-up");
		}
		
		// vertical position
		if ((document.body.scrollHeight - smartPopup.event.Y) < 100) // bottom of the page
		{
			smartPopup.popup.style.top = smartPopup.event.Y - (smartPopup.popup.clientHeight + 24) + "px";
			smartPopup.popup.classList.add("upside-down");
		}
		else // anywhere else
		{
			smartPopup.popup.style.top = smartPopup.event.Y + 24 + "px";
		}
	},
	
	// apply custom user stylesheet
	// TODO: do something with it
	setStyle: function()
	{
		let style = document.createElement("style");
		style.type = "text/css";
		style.id = "smart-popup-style";
		style.innerHTML = "#smart-popup {background-color: " + smartPopup.settings.colors.main + ";}\n";
		style.innerHTML += "#smart-popup {border: 2px solid " + smartPopup.settings.colors.main + ";}\n";
		style.innerHTML += "#smart-popup {box-shadow: 0 2px " + smartPopup.settings.colors.shadow + ";}\n";
		style.innerHTML += "#smart-popup::before {border-top: 10px solid " + smartPopup.settings.colors.main + ";}\n";
		style.innerHTML += "#smart-popup::before {border-right: 10px solid " + smartPopup.settings.colors.main + ";}\n";
		style.innerHTML += "#smart-popup.upside-down::before {box-shadow: 2px -2px " + smartPopup.settings.colors.shadow + ";}\n";
		style.innerHTML += "#smart-popup input[type='button'] {color: " + smartPopup.settings.colors.mainText + ";}\n";
		style.innerHTML += "#smart-popup input[type='button']:hover {color: " + smartPopup.settings.colors.hoverText + ";}\n";
		style.innerHTML += "#smart-popup input[type='button']:hover {background-color: " + smartPopup.settings.colors.hover + ";}";
		document.querySelector("head").appendChild(style);
	}
};