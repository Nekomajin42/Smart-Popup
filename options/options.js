// stuff to do on page load
window.addEventListener("DOMContentLoaded", function()
{
	// load user settings
	chrome.storage.local.get(null, function(saved)
	{
		document.getElementById("copyFunction").checked = saved.functions.copy;
		document.getElementById("pasteFunction").checked = saved.functions.paste;
		document.getElementById("searchFunction").checked = saved.functions.search;
		document.getElementById("openFunction").checked = saved.functions.open;
		document.getElementById("linkFunction").checked = saved.functions.link;
		
		document.getElementById("engineSearch").value = saved.searches.engine;
		
		document.getElementById("mainColor").value = saved.colors.main;
		document.getElementById("hoverColor").value = saved.colors.hover;
		document.getElementById("shadowColor").value = saved.colors.shadow;
		document.getElementById("mainTextColor").value = saved.colors.mainText;
		document.getElementById("hoverTextColor").value = saved.colors.hoverText;
	});
	
	// save user settings
	document.querySelector("#functions").addEventListener("change", function()
	{
		chrome.storage.local.set(
		{
			functions: {
				copy: document.getElementById("copyFunction").checked,
				paste: document.getElementById("pasteFunction").checked,
				search: document.getElementById("searchFunction").checked,
				open: document.getElementById("openFunction").checked,
				link: document.getElementById("linkFunction").checked
			}
		});
	});
	document.querySelector("#searches").addEventListener("change", function()
	{
		chrome.storage.local.set(
		{
			searches: {
				engine: document.getElementById("engineSearch").value
			}
		});
	});
	document.querySelector("#colors").addEventListener("change", function()
	{
		chrome.storage.local.set(
		{
			colors: {
				main: document.getElementById("mainColor").value,
				hover: document.getElementById("hoverColor").value,
				shadow: document.getElementById("shadowColor").value, 
				mainText: document.getElementById("mainTextColor").value,
				hoverText: document.getElementById("hoverTextColor").value
			}
		});
	});
	
	// load subpage from URL hash
	var hash = (location.hash) ? location.hash : "#settings";
	document.querySelector(hash).classList.add("visible");
	document.querySelector(hash + "-nav").classList.add("selected");
	
	// make the menu work
	var subpages = document.querySelectorAll("article");
	var menuitems = document.querySelectorAll("nav ul li a");
	for (var i=0; i<menuitems.length; i++)
	{
		menuitems[i].addEventListener("click", function(e)
		{
			e.preventDefault();
			for (j=0; j<menuitems.length; j++)
			{
				if (this.id == menuitems[j].id)
				{
					subpages[j].classList.add("visible");
					menuitems[j].classList.add("selected");
				}
				else
				{
					subpages[j].classList.remove("visible");
					menuitems[j].classList.remove("selected");
				}
			}
		}, false);
	}
}, false);