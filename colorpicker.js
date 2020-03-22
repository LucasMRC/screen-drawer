// Create a new color picker instance
// https://iro.js.org/guide.html#getting-started

var colorPicker = new iro.ColorPicker(".colorPicker", {
	width: 140,
	color: "rgb(255, 0, 0)",
	borderWidth: 1,
	borderColor: "#fff",
});

chrome.runtime.onMessage.addListener(msg => {
	if (msg.event === 'color-changed') {
		colorPicker.Color = msg.color;
	}
});

colorPicker.on(["color:change"], function(color){
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, async tabs => {
		if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { event: 'color-change', color: color.hexString });
	});
});

colorPicker.on(["color:init"], () => {
	chrome.storage.sync.get('color', data => {
		console.log({ data });
		if (data.color) {
			colorPicker.color.hexString = data.color;
		}
	});
});