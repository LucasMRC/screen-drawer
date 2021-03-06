function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
	  r: parseInt(result[1], 16),
	  g: parseInt(result[2], 16),
	  b: parseInt(result[3], 16)
	} : null;
}

const allowedKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ", "z", "x", "c", "v", "b", "n", "m", "backspace"];
const allowedColors = [
	{ labels: ['red', 'rojo'], value: '#ff0000' },
	{ labels: ['green', 'verde'], value: '#008000' },
	{ labels: ['blue', 'azul'], value: '#0000ff' },
	{ labels: ['black', 'negro'], value: '#000000' },
	{ labels: ['orange', 'naranja'], value: '#ffa500' },
	{ labels: ['pink', 'rosa'], value: '#ffc0cb' },
	{ labels: ['white', 'blanco'], value: '#ffffff' },
	{ labels: ['brown', 'marron'], value: '#8b4513' },
	{ labels: ['yellow', 'amarillo'], value: '#ffff00' },
	{ labels: ['erase', 'borrar'] }
];

const Sketch = sketch => {

	const history = {
		redo_list: [],
		undo_list: []
	}

	let color;
	let canvas;
	let cursor;
	let listenDiv;
	let activeElement;
	let status = false;
	let listening = false;
	let colorName = '';
	let erase = false;

	sketch.setup = () => {
		canvas = sketch.createCanvas(document.documentElement.scrollWidth, document.documentElement.scrollHeight);
		listenDiv = document.createElement('div', { id: 'listening-div' });
		listenDiv.style.position = 'fixed';
		listenDiv.style.zIndex = '2000';
		listenDiv.style.bottom = '7rem';
		listenDiv.style.left = '50%';
		listenDiv.style.transform = 'translateX(-50%)';
		listenDiv.style.display = 'none';
		listenDiv.style.opacity = '0.4';
		listenDiv.style.textShadow = '0px 0px 250px #fff';
		listenDiv.innerHTML = '<h1 style="font-size: 45px !important;">Comando:<span id="color-name"><span></h1>';
		document.body.appendChild(listenDiv);
		document.body.addEventListener('keydown', e => {
			if (!listening || !allowedKeys.includes(e.key.toLowerCase()) || (e.key === 'Backspace' && colorName.length <= 0)) return;
			else if (e.key === 'Backspace') colorName = colorName.slice(0, colorName.length - 1);
			else {
				colorName += e.key;
				if (colorName.length > 7) colorName = colorName.slice(1);
				if (allowedColors.find(colorGroup => colorGroup.labels.includes(colorName))) {
					if (['erase', 'borrar'].includes(colorName)) {
						erase = !erase;
					} else {
						erase = false;
						const chosenColor = allowedColors.find(colorGroup => colorGroup.labels.includes(colorName));
						color = hexToRgb(chosenColor.value);
						chrome.storage.sync.set({ color: chosenColor.value });
						chrome.runtime.sendMessage({ event: 'status-changed', color: chosenColor.value });
					}
					colorName = '';
					setTimeout(() => {
						if (activeElement) {
							activeElement.focus();
							activeElement = null;
						}
						listening = false;
					}, 300);
				}
				document.getElementById('color-name').innerHTML = `&nbsp;${colorName}`;
			}
		});
		canvas.position(0, 0);
		canvas.style('z-index', '99999');
		canvas.style('pointer-events', 'none');
	}
	
	sketch.draw = () => {
		if (status) {
			cursor = erase
				? chrome.runtime.getURL('square.png')
				: chrome.runtime.getURL('cursor.png');
			document.body.style.userSelect = 'none';
			document.body.style.cursor = `url(${cursor}), auto`;
		} else {
			document.body.style.userSelect = 'auto';
			document.body.style.cursor = 'auto';
		}
		if (listening) {
			listenDiv.style.display = 'block';
		} else {
			listenDiv.style.display = 'none';
		}
		Array.from(document.getElementsByTagName('*'))
			.filter(el => el.tagName !== 'BODY' && el.id !== 'listening-div')
			.forEach(el => el.style.cursor = 'inherit');
		if (sketch.mouseIsPressed && status) {
			if (color) {
				const { r, g, b } = color;
				sketch.stroke(r, g, b);
			} else {
				sketch.stroke(0);
			}
			
			if (!erase) {
				sketch.strokeWeight(4);
				history.undo_list.push(sketch.line(sketch.mouseX, sketch.mouseY, sketch.pmouseX, sketch.pmouseY));
			} else {
				sketch.strokeWeight(20);
				sketch.erase();
				sketch.line(sketch.mouseX + 10, sketch.mouseY + 10, sketch.pmouseX + 10, sketch.pmouseY + 10);
				sketch.noErase();
			}

		}
	}

	chrome.runtime.onMessage.addListener(async (msg, _sender, _sendResponse) => {
		if (msg.event === 'color-change') {
			chrome.storage.sync.set({ color: msg.color });
			color = hexToRgb(msg.color);
		} else if (msg.event === 'status-changed') {
			chrome.storage.sync.set({ status: msg.status });
			status = msg.status;
		} else if (msg.event === 'command') {
			if (msg.command === 'toggle-extension') {
				chrome.storage.sync.set({ status: !status });
				chrome.runtime.sendMessage({event: 'status-changed', status: !status });
				status = !status;
			} else if (msg.command === 'toggle-listening') {
				if (listening && activeElement) {
					activeElement.focus();
					activeElement = null;
				} else {
					activeElement = document.activeElement;
					activeElement.blur();
				}
				chrome.storage.sync.set({ listening: !listening });
				chrome.runtime.sendMessage({event: 'listening-state-changed', listening: !listening });
				listening = !listening;
			} else if (msg.command === 'clear') {
				console.log('borradoo!');
				sketch.clear();
			}
		}
	});
}

const myP5 = new p5(Sketch);