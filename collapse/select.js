var colors = ['black', 'red', 'green', 'blue', 'magenta', 'yellow', 'orange'];

function createSelect1(parent) {
	var newSel = document.createElement('select');
	var selectHTML = "<option selected value=''>Pick a color</option>";
	for(i = 0; i < colors.length; ++i) {
		selectHTML += "<option value='" + colors[i] + "' style='background-color:" + colors[i] + "'></option>";
	}
	newSel.innerHTML = selectHTML;
	parent.appendChild(newSel);
	newSel.onchange = changedSelect.bind(this);
}

function getList(selectRoot) {
	return selectRoot.getElementsByClassName("elementslist")[0];
}

function dropdownClicked(selectRoot) {
	getList(selectRoot).classList.toggle("hidden");
}

function itemSelected(it, selectRoot) {
	var span = selectRoot.getElementsByClassName("prompt")[0].getElementsByTagName("span")[0];
	var color = it.getAttribute("data-value");
	span.style = "background-color:" + color;
	span.innerHTML = '&nbsp;';
	span.setAttribute("data-value", color);
	getList(selectRoot).classList.add("hidden");
}

function onbodyclick(selectRoot, e) {
	var parent = e.target && e.target.parentElement && e.target.parentElement.parentElement && e.target.parentElement.parentElement.parentElement;
	if (!parent || !parent.classList.contains("dropdown")) {
		getList(selectRoot).classList.add("hidden");
	}
}

function createSelect(parent) {
	var selectRoot = document.createElement('dl');
	selectRoot.className = "dropdown";
	var selectHTML = "<dt><a class='prompt' href='#'><span data-value=''>Pick a color</span></a></dt><dd><ul class='elementslist hidden'>";
	for(i = 0; i < colors.length; ++i) {                                                                         
		selectHTML += "<li class='item' data-value='" + colors[i] + "' style='background-color:" + colors[i] + "'><a href='#'>&nbsp;</a></li>";
	}
	selectHTML += "</ul></dd></dl>";
	selectRoot.innerHTML = selectHTML;
	parent.appendChild(selectRoot);

	selectRoot.getElementsByClassName("prompt")[0].onclick = dropdownClicked.bind(this, selectRoot);
	var items = selectRoot.getElementsByClassName("item");
	for(var i = 0; i < items.length; ++i) {
		items[i].onclick = itemSelected.bind(this, items[i], selectRoot);
	}
	document.addEventListener("click", onbodyclick.bind(this, selectRoot));
	
        /*                
            function getSelectedValue(id) {
                return $("#" + id).find("dt a span.value").html();
            }
*/
}

function createSelectPair(parent) {
	var newDiv = document.createElement('div');
	parent.appendChild(newDiv);
	createSelect(newDiv);
	var span = document.createElement('span')
	span.className = "divisor";
	span.innerHTML = ' equals to ';
	newDiv.appendChild(span);
	createSelect(newDiv);
}