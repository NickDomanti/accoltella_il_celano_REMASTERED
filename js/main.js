import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup basic ThreeJS stuff
const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 300000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);

document.body.appendChild(renderer.domElement);

// Add the game field to the scene
const fieldDepth = 10;
const fieldDiameter = 70;
const fieldPadding = 20;
const fieldInnerDiameter = fieldDiameter - fieldPadding;

const fieldGeometry = new THREE.BoxGeometry(fieldDiameter, fieldDiameter, fieldDepth);
const fieldMaterial = new THREE.MeshStandardMaterial({ color: 0x101010 });
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
scene.add(field);

// Add portals where Celano will spawn
const portalRadius = 5;
const portalsPerRow = 3;
const portalsNumber = portalsPerRow ** 2;
const portalPoints = [];

const portalVideo = $('video').get(0);
const portalTexture = new THREE.VideoTexture(portalVideo);
const portalGeometry = new THREE.CircleGeometry(portalRadius, 30);
const portalMaterial = new THREE.MeshStandardMaterial({ map: portalTexture });

for (let i = 0; i < portalsPerRow; i++) {
	// TODO: get better math
	let point = (i + 1 * (i + 0.5) / portalsPerRow) / portalsPerRow * fieldInnerDiameter - fieldInnerDiameter / 2;
	portalPoints.push(point);
}

function addPortal(index) {
	const row = Math.ceil(index / portalsPerRow);
	const column = index % portalsPerRow || portalsPerRow;
	const portal = new THREE.Mesh(portalGeometry, portalMaterial);

	portal.position.setX(portalPoints[column - 1]);
	portal.position.setY(portalPoints[row - 1]);
	portal.position.setZ(fieldDepth / 2 + 0.01);

	scene.add(portal);
}

for (let i = 1; i <= portalsNumber; i++) {
	addPortal(i);
}

// Add some lights
const pointLight = new THREE.PointLight(0xFFFFFF, 1.3);
pointLight.position.set(0, 0, 100);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
scene.add(ambientLight);

// Add some stars in the background
const starSpread = 250;

function addStar() {
	const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
	const starMaterial = new THREE.MeshStandardMaterial();
	const star = new THREE.Mesh(starGeometry, starMaterial);

	const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(starSpread));

	star.position.set(x, y, z);
	scene.add(star);
}

Array(starSpread * 2).fill().forEach(addStar);

// Setup user interactions
$('#start-game').click(function () {
	const startingTime = 2500;

	$(this).css('cursor', 'auto');
	$(this).css('color', 'var(--clr-neon-hover)');

	$('#overlay').fadeOut(startingTime / 2);

	let movingCameraInterval = setInterval(function () {
		camera.position.y -= .5;
		camera.position.z -= .25;
		camera.lookAt(0, 0, 0);
	}, 15);

	setTimeout(function () {
		clearInterval(movingCameraInterval);
	}, startingTime);
});

// Render and animate everything
const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

animate();