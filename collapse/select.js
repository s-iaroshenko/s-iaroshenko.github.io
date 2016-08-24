var colors = ['black', 'red', 'green', 'blue', 'magenta', 'yellow', 'orange'];

function changedSelect(e) {
	e.target.style = "background-color:" + e.target.value;
}

function createSelect(parent) {
	var newSel = document.createElement('select');
	var selectHTML = "<option selected value=''>Pick a color</option>";
	for(i = 0; i < colors.length; ++i) {
		selectHTML += "<option value='" + colors[i] + "' style='background-color:" + colors[i] + "'></option>";
	}
	newSel.innerHTML = selectHTML;
	parent.appendChild(newSel);
	newSel.onchange = changedSelect.bind(this);
}

function createSelectPair(parent) {
	var newDiv = document.createElement('div');
	parent.appendChild(newDiv);
	createSelect(newDiv);
	newDiv.appendChild(document.createTextNode(' equals to '));
	createSelect(newDiv);
}