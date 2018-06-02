"use strict";

/**
 * This file contains code to make the popup work
 */

let smartPopup = {
	// event clone
	event: {
		pageX: 0,
		pageY: 0,
		clientX: 0,
		clientY: 0,
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
		},
		isLink: function() {
			let current = this.element;
			while (1)
			{
				if (current.tagName === "HTML")
				{
					return false;
				}
				if (current.tagName === "A")
				{
					this.element = current;
					return true;
				}
				current = current.parentNode;
			}
		}
	},
	
	// which buttons to show
	buttons: {
		jump: false,
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
		
		// open link in current tab
		if (smartPopup.buttons.jump === true)
		{
			let jump = document.createElement("input");
			jump.type = "button";
			jump.value = "Jump";
			jump.id = "button-jump";
			jump.addEventListener("click", function()
			{
				chrome.runtime.sendMessage({
					text: smartPopup.target.element.href, 
					action: "jump"
				});
			});
			jump.addEventListener("contextmenu", function(e)
			{
				e.preventDefault();
			});
			smartPopup.popup.appendChild(jump);
		}
		
		// open link in new tab
		if (smartPopup.buttons.open === true)
		{
			let text = (smartPopup.target.isLink()) ? smartPopup.target.element.href : smartPopup.selection.text;
			let open = document.createElement("input");
			open.type = "button";
			open.value = "Open";
			open.id = "button-open";
			open.addEventListener("click", function()
			{
				chrome.runtime.sendMessage({
					text: text, 
					action: "open", 
					active: true
				});
			});
			open.addEventListener("contextmenu", function(e)
			{
				e.preventDefault();
				chrome.runtime.sendMessage({
					text: text, 
					action: "open", 
					active: false
				});
			});
			smartPopup.popup.appendChild(open);
		}
		
		// open new tab with selection for search
		if (smartPopup.buttons.search === true)
		{
			let search = document.createElement("input");
			search.type = "button";
			search.value = "Search";
			search.id = "button-search";
			search.addEventListener("click", function()
			{
				chrome.runtime.sendMessage({
					text: smartPopup.selection.text, 
					action: "search", 
					active: true
				});
			});
			search.addEventListener("contextmenu", function(e)
			{
				e.preventDefault();
				chrome.runtime.sendMessage({
					text: smartPopup.selection.text, 
					action: "search", 
					active: false
				});
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
			copy.addEventListener("contextmenu", function(e)
			{
				e.preventDefault();
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
			paste.addEventListener("contextmenu", function(e)
			{
				e.preventDefault();
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
			smartPopup.buttons.jump = false;
			smartPopup.buttons.open = false;
			smartPopup.buttons.search = false;
			smartPopup.buttons.copy = false;
			smartPopup.buttons.paste = false;
			document.body.removeChild(smartPopup.popup);
		}
		catch (e) {}
	},
	
	// set position to mouse cursor
	setPosition: function()
	{
		// horizontal position
		if (smartPopup.event.clientX < (smartPopup.popup.clientWidth / 2 + 20)) // on the left side
		{
			smartPopup.popup.style.left = "10px";
		}
		else if ((window.innerWidth - smartPopup.event.clientX) < (smartPopup.popup.clientWidth / 2 + 20)) // on the right side
		{
			smartPopup.popup.style.right = "10px";
		}
		else // in the middle
		{
			smartPopup.popup.style.left = smartPopup.event.pageX - (smartPopup.popup.clientWidth / 2) + "px";
		}
		
		// vertical position
		if ((window.innerHeight - smartPopup.event.clientY) < 80) // bottom of the screen
		{
			smartPopup.popup.style.top = smartPopup.event.pageY - (smartPopup.popup.clientHeight + 32) + "px";
			smartPopup.popup.classList.add("upside-down");
		}
		else // anywhere else
		{
			smartPopup.popup.style.top = smartPopup.event.pageY + 28 + "px";
			smartPopup.popup.classList.add("upside-up");
		}
	},
	
	// apply custom user stylesheet
	// TODO: do something with it
	setStyle: function()
	{
		let style = document.createElement("style");
		style.type = "text/css";
		style.id = "smart-popup-style";
		style.innerHTML = "#smart-popup {background-color: " + smartPopup.settings.style.main + ";}\n";
		style.innerHTML += "#smart-popup {border-radius: " + smartPopup.settings.style.borderRadius + "px;}\n";
		style.innerHTML += "#smart-popup.upside-down {box-shadow: 0 2px " + smartPopup.settings.style.shadow + ";}\n";
		style.innerHTML += "#smart-popup.upside-up {box-shadow: 0 -2px " + smartPopup.settings.style.shadow + ";}\n";
		style.innerHTML += "#smart-popup::before {background-color: " + smartPopup.settings.style.main + ";}\n";
		style.innerHTML += "#smart-popup.upside-down::before {box-shadow: 2px -2px " + smartPopup.settings.style.shadow + ";}\n";
		style.innerHTML += "#smart-popup.upside-up::before {box-shadow: 2px -2px " + smartPopup.settings.style.shadow + ";}\n";
		style.innerHTML += "#smart-popup input[type='button'] {border: 2px solid " + smartPopup.settings.style.main + ";}\n";
		style.innerHTML += "#smart-popup input[type='button'] {border-radius: " + smartPopup.settings.style.borderRadius + "px;}\n";
		style.innerHTML += "#smart-popup input[type='button'] {color: " + smartPopup.settings.style.mainText + ";}\n";
		style.innerHTML += "#smart-popup input[type='button']:hover {color: " + smartPopup.settings.style.hoverText + ";}\n";
		style.innerHTML += "#smart-popup input[type='button']:hover {background-color: " + smartPopup.settings.style.hover + ";}";
		document.querySelector("head").appendChild(style);
	}
};