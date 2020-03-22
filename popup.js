window.addEventListener('DOMContentLoaded', () => {

	const statusInput = document.getElementById('status-input');
	const colorPicker = document.getElementById('color-picker');

	chrome.storage.sync.get('color', data => {
		if (data.color) {
			colorPicker.setAttribute('value', data.color);
		}
	});

	chrome.storage.sync.get('status', data => {
		if (data.status) {
			statusInput.checked = data.status;
		}
	});

	const params = {
		active: true,
		currentWindow: true
	};

	statusInput.addEventListener('change', ({ target }) => {
		chrome.tabs.query(params, async tabs => {
			if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { event: 'status-changed', status: target.checked });
		});
	});

	colorPicker.addEventListener('change', e => {
		const color = e.target.value;

		chrome.tabs.query(params, async tabs => {
			if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { event: 'color-change', color });
		});
	});

	chrome.runtime.onMessage.addListener(msg => {
		if (msg.event === 'status-changed') {
			statusInput.checked = msg.status;
		}
	});
});
