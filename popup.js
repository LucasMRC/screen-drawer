window.addEventListener('DOMContentLoaded', () => {

	const statusInput = document.getElementById('toggle');
	const colorPickerContainer = document.getElementsByClassName('half')[0];
	const colorPicker = document.getElementsByClassName('colorPicker')[0];
	const colorBtn = document.getElementById('color-btn');
	colorPickerContainer.style.cssText = 'overflow:hidden;margin:0;height:0px;';
	let colorPickerShown = false;
	colorPicker.style.opacity = 0;
	
	colorBtn.addEventListener('click', () => {
		if (!colorPickerShown) {
			colorPickerContainer.style.cssText = 'height:150px;margin:2rem 0;';
			setTimeout(() => {
				colorPickerContainer.style.overflow = 'visible';
				colorPickerShown = !colorPickerShown;
				colorPicker.style.opacity = 1;
			}, 300);
		} else {
			colorPicker.style.opacity = 0;
			setTimeout(() => {
				colorPickerShown = !colorPickerShown;
				colorPickerContainer.style.cssText = 'overflow:hidden;height:0px;';
			}, 300);
		}
	});

	chrome.storage.sync.get('status', data => {
		if (data.status) {
			statusInput.checked = data.status;
		}
	});

	statusInput.addEventListener('change', ({ target }) => {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, async tabs => {
			if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { event: 'status-changed', status: target.checked });
		});
	});

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.event === 'status-changed') {
			statusInput.checked = msg.status;
		}
	});
});
