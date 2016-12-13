var N = 50000;
var speed = 3;
var size = 4;
var color = 0x2ecc71;

var WIDTH, HEIGHT, renderer, camera, scene;
var pointsGeometry, points;
var snapping = false;
var snappingDests;

var appended = false;

var setup = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	CUBESIZE = WIDTH > 500 ? 500 : 200;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);

	camera = new THREE.OrthographicCamera(
		WIDTH / - 2,
		WIDTH / 2,
		HEIGHT / 2,
		HEIGHT / - 2,
		1,
		1300
	);
	camera.position.z = 1000;

	scene = new THREE.Scene();
	scene.add(camera);

	pointsMaterial = new THREE.PointsMaterial({  
	  color: color,
	  size: size
	});

	pointsGeometry = new THREE.Geometry();    

	points = new THREE.Points(  
	  pointsGeometry,
	  pointsMaterial
	);
	scene.add(points);

	controls = new THREE.OrthographicTrackballControls(camera);
	controls.zoomSpeed = 0.1;
	controls.addEventListener("change", render);

	if (appended) {
		$("#container").empty();
	}

	var $container = $("#container");
	$container.append(renderer.domElement);
	appended = true;
}

var rand = function(size) {
	return Math.random() * size - (size / 2)
}

var createPoints = function() {
	pointsGeometry.vertices = [];
	for (var i = 0; i < N; i++) {
		pointsGeometry.vertices.push(new THREE.Vector3(rand(CUBESIZE), rand(CUBESIZE), rand(CUBESIZE)));
	}
}

var updatePoints = function() {
	for (var i = 0; i < N; i++) {
		var v = pointsGeometry.vertices[i];

		if (snapping) {
			dX = 0.05 * (snappingDests[i].x - v.x);
			dY = 0.05 * (snappingDests[i].y - v.y);
		} else {
			dX = rand(speed);
			dY = rand(speed);
		}

		dZ = rand(speed);

		pointsGeometry.vertices[i] = new THREE.Vector3(v.x + dX, v.y + dY, Math.min(CUBESIZE, v.z + dZ));
	}

	pointsGeometry.verticesNeedUpdate = true;
}

var snapTo = function(pixels) {
	snapping = true;
	controls.reset();

	var maxX = 0;
	var maxY = 0;
	pixels.forEach(function(pixel) {
		maxX = Math.max(maxX, pixel.x)
		maxY = Math.max(maxY, pixel.y)
	});

	snappingDests = [];

	for (var i = 0; i < N; i++) {
		var pixel = pixels[i % pixels.length];
		var offsetX = pixel.x - (maxX / 2);
		var offsetY = pixel.y - (maxY / 2);

		var scaleFactor = CUBESIZE == 500 ? 1 : 0.37;

		snappingDests.push({x: offsetX * scaleFactor, y: offsetY * scaleFactor})
	}
}

var render = function() {
	renderer.render(scene, camera);
}

var animate = function(time) {
	requestAnimationFrame(animate);
    updatePoints();
    controls.update();
    render();
}

var attachHandlers = function() {
	$(".category").click(function() {
		snapTo(categories[this.id]);
		$("#return").show();
	});

	$("#return").click(function() {
		snapping = false;
		$("#return").hide();
	});
}

// Underscore.js's debounce function
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

window.addEventListener("resize", debounce(function() {
	setup();
	createPoints();
}, 250));

setup();
createPoints();
requestAnimationFrame(animate);
render();
attachHandlers();
