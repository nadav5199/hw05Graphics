import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// create a white line in the middle of the court
function createCenterLine() {
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const centerLineGeometry = new THREE.BoxGeometry(0.1, 0.01, 15);
  const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
  centerLine.position.y = 0.105; // Slightly above the court to prevent z-fighting
  scene.add(centerLine);
}

// create a white circle in the middle of the court
function createCenterCircle() {
  const geometry = new THREE.RingGeometry(1.75, 1.8, 64);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const circle = new THREE.Mesh(geometry, material);
  circle.position.y = 0.11;
  circle.rotation.x = -Math.PI / 2;
  scene.add(circle);
}

// create a three point line
function createThreePointLine(x_pos, rotation_z) {
  const radius = 6.75;
  const lineWidth = 0.05;
  const arc = Math.PI;

  const geometry = new THREE.RingGeometry(radius - lineWidth, radius + lineWidth, 64, 1, -Math.PI / 2, arc);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const threePointArc = new THREE.Mesh(geometry, material);

  threePointArc.position.y = 0.115;
  threePointArc.position.x = x_pos;

  threePointArc.rotation.x = -Math.PI / 2;
  threePointArc.rotation.z = rotation_z;

  scene.add(threePointArc);
}

// creates the court lines
function createCourtLines() {
  createCenterLine();
  createCenterCircle();

  const hoopPosX = 15 - 1.575; // Position of the hoop from the center

  // Create three-point lines for both sides
  createThreePointLine(hoopPosX, Math.PI);
  createThreePointLine(-hoopPosX, 0);
}

function createBackboard() {
  const backboardMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
  });
  const backboardGeometry = new THREE.BoxGeometry(0.05, 1.2, 1.8); // depth, height, width
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.y = 3.35; // Centered above the rim
  backboard.castShadow = true;
  backboard.receiveShadow = true;
  return backboard;
}

function createRim() {
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xffa500, shininess: 90 });
  const rimGeometry = new THREE.TorusGeometry(0.2286, 0.025, 16, 100);
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.y = 3.05; // Regulation height
  rim.position.x = 0.2286 + 0.025; // In front of backboard
  rim.rotation.x = Math.PI / 2; // Corrected rotation to be parallel to the court
  rim.castShadow = true;
  rim.receiveShadow = true;
  return rim;
}

function createNet(rimPositionX) {
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const points = [];
  const segments = 12;
  const topRadius = 0.2286;
  const bottomRadius = 0.18;
  const height = 0.4;
  const startY = 3.05;

  // Vertical lines
  for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * topRadius + rimPositionX, startY, Math.sin(angle) * topRadius));
      points.push(new THREE.Vector3(Math.cos(angle) * bottomRadius + rimPositionX, startY - height, Math.sin(angle) * bottomRadius));
  }

  // Horizontal rings
  const rings = 4;
  for (let j = 0; j <= rings; j++) {
      const ratio = j / rings;
      const currentRadius = topRadius - (topRadius - bottomRadius) * ratio;
      const currentY = startY - height * ratio;
      for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const nextAngle = ((i + 1) / segments) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(angle) * currentRadius + rimPositionX, currentY, Math.sin(angle) * currentRadius));
          points.push(new THREE.Vector3(Math.cos(nextAngle) * currentRadius + rimPositionX, currentY, Math.sin(nextAngle) * currentRadius));
      }
  }
  const netGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const net = new THREE.LineSegments(netGeometry, netMaterial);
  return net;
}

function createSupportStructure(backboardPosition) {
    const supportGroup = new THREE.Group();
    // Support Pole
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4.0, 32);
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2.0;
    pole.position.x = -0.5; // Behind backboard
    pole.castShadow = true;
    pole.receiveShadow = true;
    supportGroup.add(pole);

    // Support Arm
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const armGeometry = new THREE.BoxGeometry(0.55, 0.1, 0.1);
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.y = backboardPosition.y;
    arm.position.x = pole.position.x / 2; // Position between pole and backboard
    arm.castShadow = true;
    arm.receiveShadow = true;
    supportGroup.add(arm);
    return supportGroup;
}

// create a single basketball hoop
function createHoop(x_pos, rotation_y) {
  const hoopGroup = new THREE.Group();

  const backboard = createBackboard();
  hoopGroup.add(backboard);

  const rim = createRim();
  hoopGroup.add(rim);

  const net = createNet(rim.position.x);
  hoopGroup.add(net);

  const support = createSupportStructure(backboard.position);
  hoopGroup.add(support);

  hoopGroup.position.x = x_pos;
  hoopGroup.rotation.y = rotation_y;
  scene.add(hoopGroup);
}

// Create both basketball hoops
function createHoops() {
  const hoopX = 15 - 1.2; // 1.2m from the baseline
  createHoop(hoopX, Math.PI);
  createHoop(-hoopX, 0);
}

// Create a static basketball
function createBasketball() {
    const ballGroup = new THREE.Group();
    const ballRadius = 0.122; // Regulation size
    const seamThickness = 0.004;
    const seamRadius = ballRadius + 0.001; // Place seams slightly above the ball's surface

    // Ball
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xD35400, shininess: 50 });
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
    basketball.castShadow = true;
    basketball.receiveShadow = true;
    ballGroup.add(basketball);

    // Seams
    const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const seamGeometry = new THREE.TorusGeometry(seamRadius, seamThickness, 8, 100);

    // Seam in XZ plane (horizontal)
    const seamXZ = new THREE.Mesh(seamGeometry.clone(), seamMaterial);
    seamXZ.rotation.x = Math.PI / 2;
    ballGroup.add(seamXZ);

    // Rotated vertical seams
    for (let i = 0; i < 3; i++) {
        const seam = new THREE.Mesh(seamGeometry.clone(), seamMaterial);
        seam.rotation.y = (i * Math.PI) / 3;
        ballGroup.add(seam);
    }
    
    ballGroup.position.y = ballRadius + 0.1;
    scene.add(ballGroup);
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  court.castShadow = true;
  scene.add(court);
  createCourtLines();
  createHoops();
  createBasketball();
  
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}

// Create all elements
createBasketballCourt();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();