const params = {
	currentWindow: true,
	active: true
}

chrome.commands.onCommand.addListener(command => {
	chrome.tabs.query(params, async tabs => {
		if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { event: 'command', command });
	});
});

chrome.runtime.onMessage.addListener(msg => {
	if (msg.event === 'status-changed') {
		chrome.runtime.sendMessage({ msg });
	} 
});