function getMouseCoords(e, parent) {
	var x = e.pageX - (parent.offsetLeft || 0),
	    y = e.pageY - (parent.offsetTop || 0);
	return { x: x, y: y }
}
