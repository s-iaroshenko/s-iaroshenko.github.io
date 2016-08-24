var VectorSVG = {
	root: null,
	dragTarget: null,
	prevMouse: null,
	radius: 20,
        gridSize: 45,
	timeout: 300,
	
	init: function(root) {
		this.root = root;

		this.root.onmousedown = this.mouseDown.bind(this);
		this.root.onmousemove = this.mouseMove.bind(this);
		this.root.onmouseup = this.mouseUp.bind(this);

		this.createBlueprints();
	},

	createBlueprints: function() {
                var startX = this.gridSize * 14, startY = this.gridSize;

		var colors = ['black', 'red', 'green', 'blue', 'magenta', 'yellow', 'orange'];
                var currX = startX, currY = startY;
		var rootWidth = this.root.getAttribute('width');
                for(var i = 0; i < colors.length; ++i) {
			this.addCircle(currX, currY, colors[i], 'blueprint');
			currX += this.gridSize;
			if (currX + this.gridSize > rootWidth) {
				currX = startX;
				currY += this.gridSize
			}
                } 
        },

        collapse: function(fallDown) {
		var points = [];
		for(var i = 0; i < this.root.childNodes.length; ++i) {
			var elem = this.root.childNodes[i];
			if (elem._tag !== 'blueprint') {
				var posX = Math.round(elem._translateX / this.gridSize) | 0,
				    posY = Math.round(elem._translateY / this.gridSize) | 0;
				points.push( {color: elem._color, x: posX, y: posY, elem: elem} );
			}
                }
		if (points.length > 0) {			
			if (fallDown) {
				var maxX = -10000, minX = 10000, maxY = -10000;
				for(var j = 0; j < points.length; ++j) {
					if (points[j].x > maxX) maxX = points[j].x;
					if (points[j].x < minX) minX = points[j].x;
					if (points[j].y > maxY) maxY = points[j].y;
				}
				var hasChanges = false;
				do {
					hasChanges = false;
					for(var a = 0; a < points.length; ++a) {
						var ap = points[a];
						var stays = false;
						for(var b = 0; b < points.length; ++b) {
							var bp = points[b];
							if (ap.y === maxY || ((ap.y === bp.y - 1) && (ap.x === bp.x))) {
								stays = true;
								break;
							}
						}
						if (!stays) {
							ap.elem._translateY += this.gridSize;
							ap.y += 1;
							this.applyTransforms(ap.elem);
							hasChanges = true;
						}
					}
					for(var t = minX + 1; t < maxX; ++t) {
						var hasColumn = false;
						for(var a = 0; a < points.length; ++a) {
							var ap = points[a];
							if (ap.x === t) {
								hasColumn = true;
								break;
							}
						}
						if (!hasColumn) {
							for(var a = 0; a < points.length; ++a) {
								var ap = points[a];
								if (ap.x < t) {
									ap.elem._translateX += this.gridSize;
									ap.x += 1;
									this.applyTransforms(ap.elem);
									hasChanges = true;
								}
							}						
						}
					}
				} while (hasChanges);
				setTimeout(this.collapse.bind(this, false), this.timeout);
			} else {
				var pairs = this.getAllColorPairs();
				var hasChanges = false;
				for(var a = 0; a < points.length; ++a) {
					var ap = points[a];
					for(var b = a + 1; b < points.length; ++b) {
						var bp = points[b];
						if (this.areColorsEqual(ap.color, bp.color, pairs) && 
						   ((((ap.x === bp.x - 1) && (ap.y === bp.y    )) || 
						     ((ap.x === bp.x + 1) && (ap.y === bp.y    )) || 
						     ((ap.x === bp.x    ) && (ap.y === bp.y - 1)) || 
						     ((ap.x === bp.x    ) && (ap.y === bp.y + 1))))) {
							hasChanges = true;
							this.root.removeChild(ap.elem);
							this.root.removeChild(bp.elem);
							break;
						}
					}
					if (hasChanges) {
						setTimeout(this.collapse.bind(this, true), this.timeout);
						break;
					}
				}
			}
		}
        },

        getAllColorPairs: function() {
		var pairs = [];
		var equations = document.getElementById("equations");
		var selects = equations.getElementsByTagName("select");
		for(var i = 0; i < selects.length; i += 2) {
			if (selects[i].value !== selects[i + 1].value &&
			   selects[i].value !== '' &&
			   selects[i + 1].value !== '') {
				pairs.push( { left: selects[i].value, right: selects[i + 1].value });
			}
		}
		return pairs;
        },

	areColorsEqual: function(colorA, colorB, pairs) {
		if (colorA === colorB) return true;
		for (var i = 0; i < pairs.length; ++i) {
			var p = pairs[i];
			if (p.left === colorA && p.right === colorB) return true;
			if (p.left === colorB && p.right === colorA) return true;
		}
		return false;
	},

	clear: function() {
		while (this.root.childElementCount > 0) {
			this.root.removeChild(this.root.childNodes[0]);
                }
		this.createBlueprints();
	},

	mouseDown: function(e) {
		if (e.target !== this.root && e.button === 0) {
			this.dragTarget = e.target;
			if (this.dragTarget._tag === 'blueprint') {
				var clone = this.dragTarget.cloneNode(true);
				clone._tag = '';
				clone._color = this.dragTarget._color;
				clone._translateX = this.dragTarget._translateX;
				clone._translateY = this.dragTarget._translateY;
				this.root.appendChild(clone);
				this.dragTarget = clone;
			}
			this.prevMouse = getMouseCoords(e, this.root);
			this.applyTransforms(this.dragTarget);

			// also move it on top (that's to the end of DOM)
			this.moveOnTop(this.dragTarget);
		}
		e.preventDefault();
	},

	findAtSamePositions: function(dragged) {
		for(var i = 0; i < this.root.childNodes.length; ++i) {
			var elem = this.root.childNodes[i];
			if (elem !== dragged && 
			    elem._translateX === dragged._translateX && 
			    elem._translateY === dragged._translateY) {
				return elem;
			}
		}
		return null;
        },
	
	mouseUp: function(e) {
		if (this.dragTarget && e.button === 0) {
			this.dragTarget._translateX = (Math.round(this.dragTarget._translateX / this.gridSize) | 0) * this.gridSize;
			this.dragTarget._translateY = (Math.round(this.dragTarget._translateY / this.gridSize) | 0) * this.gridSize;
			
			while(this.findAtSamePositions(this.dragTarget)) {
				this.dragTarget._translateX += this.gridSize;
                        }
			this.applyTransforms(this.dragTarget);

			if (this.dragTarget._translateX >= this.gridSize * 14) {
				this.root.removeChild(this.dragTarget);
                        }
			this.dragTarget = null;
                }
		e.preventDefault();
	},

	mouseMove: function(e) {
		var mouse = getMouseCoords(e, this.root);

		if (this.dragTarget) {
			this.dragTarget._translateX += mouse.x - this.prevMouse.x;
			this.dragTarget._translateY += mouse.y - this.prevMouse.y;
			this.applyTransforms(this.dragTarget);
		}
		this.prevMouse = mouse;
		e.preventDefault();
	},

	moveOnTop: function(elem) {
		this.root.appendChild(elem);
	},
	
	applyTransforms: function(elem) {
		elem.setAttribute('transform', 'translate(' + elem._translateX + ',' + elem._translateY + ')');
	},

	addCircle: function(x, y, color, tag) {
		var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('style', 'fill:' + color);
		circle.setAttribute('r', this.radius);

		circle._color = color;
		circle._tag = tag || '';
		circle._translateX = x || 0;
		circle._translateY = y || 0;
		this.applyTransforms(circle);

		this.root.appendChild(circle);
	}
};
