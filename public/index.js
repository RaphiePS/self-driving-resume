var N = 50000;
var speed = 3;
var size = 4;
var color = 0x2ecc71;

var WIDTH, HEIGHT, renderer, camera, scene;
var pointsGeometry, points;
var snapping = false;
var snappingDests;

var setup = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

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


	var $container = $("#container");
	$container.append(renderer.domElement);
}

var rand = function(size) {
	return Math.random() * size - (size / 2)
}

var createPoints = function() {
	for (var i = 0; i < N; i++) {
		pointsGeometry.vertices.push(new THREE.Vector3(rand(500), rand(500), rand(500)));
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

		pointsGeometry.vertices[i] = new THREE.Vector3(v.x + dX, v.y + dY, Math.min(500, v.z + dZ));
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

		snappingDests.push({x: offsetX, y: offsetY})
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

setup();
createPoints();
requestAnimationFrame(animate);
render();
attachHandlers();
