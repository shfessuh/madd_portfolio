if (
  THREE.Quaternion &&
  THREE.Quaternion.prototype.invert &&
  !THREE.Quaternion.prototype.inverse
) {
  THREE.Quaternion.prototype.inverse = THREE.Quaternion.prototype.invert;
}
if (typeof GLTFLoader === 'function' && typeof THREE !== 'undefined') {
  THREE.GLTFLoader = GLTFLoader(THREE);
}
THREE.BufferGeometry.prototype.addAttribute = THREE.BufferGeometry.prototype.setAttribute;

const keyState = {};
window.addEventListener('keydown',  e => keyState[e.code] = true);
window.addEventListener('keyup',    e => keyState[e.code] = false);

// Globals
let scene, cssScene, camera, renderer, cssRenderer;
let controls, cube;
let monitorPrototype, monitors = [], dreamInjected = false;
let flyToPos = null, flyTarget = null;
const vidTextures = [];
let listener, bgSound, audioUnlocked = false, audioLoaded = false;
let isSpawning = false;
let rotationEnabled = false,
    spawnTime       = 0;
let haloGroup;
let isZooming = false;
let isZoomedIn = false;
let loadedVideos = 0;
let loadedModel  = false;

const manualOffsets = [
  // Top Line
  { x: -50, y: 25, z: 0 },
  { x: -25, y: 30, z: -10 },
  { x:   0, y: 25, z: -5 },
  { x:  25, y: 30, z: 10 },
  { x:  50, y: 25, z: 5 },

  // Middle Line
  { x: -50, y: 0, z: 10 },
  { x: -25, y: -5, z: 0 },
  { x:   0, y: 0, z: -10 },
  { x:  25, y: -5, z: -5 },
  { x:  50, y: 0, z: 10 },

  // Bottom Line
  { x: -50, y: -25, z: -5 },
  { x: -25, y: -30, z: 5 },
  { x:   0, y: -25, z: 15 },
  { x:  25, y: -30, z: 0 },
  { x:  50, y: -25, z: -10 }
];


const clock = new THREE.Clock();
const THERMAL_DISTANCE = 5;
const PROXIMITY_RADIUS  = THERMAL_DISTANCE * 4;
const FADE_START        = 35;
const FADE_END          = 45;
const AUDIO_MIN_VOLUME = 0.01;
const AUDIO_MAX_VOLUME = 0.09;

function reverse(str) {
  return str.split('').reverse().join('');
}

const faceMessages = [
  reverse("M Y   S H I E L D.    I T S    A B S E N C E    T I G H T E N S    M Y    C H E S T;    I T S    W E I G H T   C A L M S    M E.  "),
  reverse("I N   C H A O S,   H I S   H Y M N S   Q U I E T   M Y   S P I R I T   A N D   M A K E   M Y   H E A R T   W E E P   W I T H   J O Y  "),
  reverse("S U R R O U N D E D   B Y   G R I E F' S   A N G E L S,   Y E T   P E A C E   F I N D S   I T S   P L A C E  "),
  reverse("E A C H   B E A D,  A   G E N T L E   E C H O   O F   H E R   W I S D O M,   H E R   L O V E,   F O R E V E R   I N T E R T W I N E D   W I T H   M I N E   "),
  reverse("I N   H I S   H Y M N S,  I   H E A R   H E R   W A R M T H,   A   M E L O D Y   T H A T   S O O T H E S  A N D   C O N N E C T S   M E   T O   H O M E   "),
  reverse("B O R N   F R O M   P A I N,  L O S S ,   A N D    E N D L E S S   T E A R S,  I   W A N D E R   A S   A N   A S Y L U M   S E E K E R,  H O P I N G   F O R   T H E   D A Y   P E A C E    B R I N G S    M E   H O M E   ")
];

const labels    = [];
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

function setup() {
  const container = document.getElementById('container');
  scene    = new THREE.Scene();
  cssScene = new THREE.Scene();
  camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0.2, 0, 8.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position      = 'absolute';
  cssRenderer.domElement.style.top           = '0';
  cssRenderer.domElement.style.left          = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(cssRenderer.domElement);

  haloGroup = new THREE.Group();
  cssScene.add(haloGroup);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.enableRotate         = false;
  controls.staticMoving         = false;
  controls.dynamicDampingFactor = 0.4;
  controls.zoomSpeed            = 0.5;
  controls.panSpeed             = 1.0;
  controls.maxDistance          = 90;

  listener = new THREE.AudioListener();
  camera.add(listener);
  bgSound  = new THREE.Audio(listener);
  new THREE.AudioLoader().load('videos/sound.mp4', buf => {
    bgSound.setBuffer(buf);
    bgSound.setLoop(true);
    bgSound.setVolume(0);
    audioLoaded = true;
  });

  scene.add(new THREE.AmbientLight(0x0d0b0b));
  const spot = new THREE.SpotLight(0xffffff, 1.5);
  spot.position.set(5, 10, 5);
  spot.angle    = Math.PI / 8;
  spot.penumbra = 0.3;
  spot.decay    = 2;
  spot.distance = 50;
  spot.castShadow            = true;
  spot.shadow.mapSize.width  = 102;
  spot.shadow.mapSize.height = 102;
  spot.shadow.camera.near    = 0.5;
  spot.shadow.camera.far     = 50;
  spot.shadow.camera.fov     = 30;
  scene.add(spot);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b })
  );
  sphere.position.set(-9, 0, 0);
  sphere.castShadow    = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b })
  );
  ground.rotation.x    = -Math.PI / 2;
  ground.position.y    = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  const imgFolder = 'Images/';
  const imgs = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
    'image5.jpg',
    'image6.jpg'
  ].map(name => imgFolder + name);
  const texLoader = new THREE.TextureLoader();
  const mats = imgs.map(src => new THREE.MeshBasicMaterial({ map: texLoader.load(src) }));
  const geo  = new THREE.BoxGeometry(1,1,1).toNonIndexed();
  cube = new THREE.Mesh(geo, mats);
  cube.position.set(0, -3, 0);
  cube.scale.set(1.8, 1.8, 1.8);
  scene.add(cube);
  geo.clearGroups(); for (let i = 0; i < 6; i++) geo.addGroup(i * 6, 6, i);

  // 1) Set up all 15 video elements as VideoTextures, wait for canplay
  for (let i = 1; i <= 15; i++) {
    const v = document.getElementById(`v${i}`);
    v.muted       = true;
    v.loop        = true;
    v.autoplay    = true;      // allow muted autoplay
    v.playsInline = true;
    v.preload     = 'auto';
    v.src         = `videos/video${i}.mp4`;
  
    // kick off playback; if it's blocked, unlock on first click
    v.play().catch(() =>
      document.addEventListener('click', () => v.play(), { once: true })
    );
  
    // only once the browser can actually supply a frame…
    v.addEventListener('canplay', () => {
      console.log(`▶ video #${i} canplay, readyState=${v.readyState}`);
      const vt = new THREE.VideoTexture(v);
      vt.minFilter = THREE.LinearFilter;
      vt.magFilter = THREE.LinearFilter;
      vt.encoding  = THREE.sRGBEncoding;
      vt.flipY     = false;
  
      vidTextures[i - 1] = vt;    // store in correct slot 0–14
      loadedVideos++;
  
      // if the model is already loaded *and* all videos are ready, build monitors
      if (loadedVideos === 15 && loadedModel) {
        createMonitorField();
      }
    }, { once: true });
  }
  
  // 2) Load the CRT model
  new THREE.GLTFLoader().load(
    'models/CRT_monitor.glb',
  
    // onLoad
    gltf => {
      // your existing material‐override logic…
      gltf.scene.traverse(node => {
        if (!node.isMesh) return;
        const mat = new THREE.MeshBasicMaterial({
          map        : node.material.map || null,
          side       : THREE.DoubleSide,
          toneMapped : false,
          transparent: node.material.transparent,
          opacity    : node.material.opacity
        });
        switch (node.name) {
          case 'Node-Mesh_2': mat.color.set(0x191a1f); break; // screen
          case 'Node-Mesh':   mat.color.set(0xa4de31); break; // frame
          case 'Node-Mesh_1': mat.color.set(0x1a1213); break; // side
          case 'Node-Mesh_3': mat.color.set(0x2e2728); break; // buttons
          default:            mat.color.set(0x140f10);
        }
        node.material = mat;
        node.material.needsUpdate = true;
      });
  
      monitorPrototype = gltf.scene;
      console.log('CRT model loaded');
      loadedModel = true;
  
      // if all videos have already fired canplay, build monitors now
      if (loadedVideos === 15) {
        createMonitorField();
      }
    },
  
    // onProgress
    undefined,
  
    // onError
    err => console.error('CRT_monitor.glb failed to load:', err)
  );

  // UI elements setup
  const ui = document.createElement('div');
  ui.style.position = 'absolute';
  ui.style.bottom   = '10px';
  ui.style.right    = '10px';
  ui.style.zIndex   = '100';
  ui.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <button id="pan-up"    style="padding:4px">↑</button>
      <div>
        <button id="pan-left"  style="padding:4px">←</button>
        <button id="zoom-in"   style="padding:4px">+</button>
        <button id="pan-right" style="padding:4px">→</button>
      </div>
      <button id="pan-down"  style="padding:4px">↓</button>
      <button id="zoom-out"  style="padding:4px">-</button>
    </div>
  `;
  container.appendChild(ui);

  document.getElementById('zoom-in').addEventListener('click', () => {
    camera.position.z -= 1;
  });
  document.getElementById('zoom-out').addEventListener('click', () => {
    camera.position.z += 1;
    isZoomedIn = false;
    isZooming  = false;
  });
  const panStep = 1;
  function pan(dx, dy) {
    camera.position.x += dx;
    camera.position.y += dy;
    controls.target.x   += dx;
    controls.target.y   += dy;
  }
  document.getElementById('pan-up').addEventListener('click',    () => pan(0, panStep));
  document.getElementById('pan-down').addEventListener('click',  () => pan(0, -panStep));
  document.getElementById('pan-left').addEventListener('click',  () => pan(-panStep, 0));
  document.getElementById('pan-right').addEventListener('click', () => pan(panStep, 0));

  animate();
}

function createMonitorField() {
  monitors.forEach(m => scene.remove(m)); 
  monitors.length = 0;
  
  vidTextures.forEach((tex, i) => {
    const m = monitorPrototype.clone();
    // Don't set visibility here - we'll handle it in animate()
    
    m.traverse(n => {
      if (!n.isMesh || n.name !== 'Node-Mesh_2') return;
      const g = n.geometry;
      if (!g.attributes.uv) {
        g.computeBoundingBox(); 
        const bb = g.boundingBox, sz = new THREE.Vector3(); 
        bb.getSize(sz);
        const pos = g.attributes.position, uvs = [];
        for (let j = 0; j < pos.count; j++) { 
          uvs.push((pos.getX(j) - bb.min.x) / sz.x, (pos.getY(j) - bb.min.y) / sz.y); 
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      }
      n.material = new THREE.MeshBasicMaterial({
        map: tex, 
        side: THREE.DoubleSide,
        toneMapped: false
      }); 
      n.material.needsUpdate = true;
    });
    
    scene.add(m); 
    monitors.push(m);
    
    // Initially hide monitors until positioned
    m.visible = false;
  });
  
  console.log(`Created ${monitors.length} monitors`);
  
  // Immediately try to position monitors if conditions are met
  positionMonitors();
}

function positionMonitors() {
  // Only position if we haven't already done so and all components are ready
  if (!dreamInjected && monitors.length > 0 && loadedVideos === 15 && loadedModel) {
    console.log("Positioning monitors...");
    
    const fwd   = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2).negate();
    const base  = camera.position.clone().addScaledVector(fwd, 12);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up    = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    monitors.forEach((m, i) => {
      const o = manualOffsets[i] || { x: 0, y: 0, z: 0 };
      m.position.copy(base)
       .addScaledVector(right, o.x)
       .addScaledVector(up, o.y)
       .add(new THREE.Vector3(0, 0, o.z || 0));
       
      m.quaternion.copy(camera.quaternion);
      m.rotateY(Math.PI);
      m.scale.set(18, 18, 18);
      m.visible = true; // Make monitors visible
    });
    
    dreamInjected = true;
    console.log("Monitors positioned and made visible");
    return true;
  }
  return false;
}

function onPointerDown(evt) {
  if (isSpawning) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hitM = raycaster.intersectObjects(monitors, true);
  if (hitM.length) {
    listener.context.resume().then(() => {
      audioUnlocked = true;
      if (audioLoaded && !bgSound.isPlaying) bgSound.play();
    });

    let m = hitM[0].object;
    while (!monitors.includes(m)) m = m.parent;
    flyTarget = m;
    const fwd = new THREE.Vector3().copy(m.getWorldDirection(new THREE.Vector3())).negate();
    flyToPos = m.getWorldPosition(new THREE.Vector3())
               .add(fwd.multiplyScalar(16))
               .add(new THREE.Vector3(0,4,1));

    isZooming  = true;
    isZoomedIn = false;
    return;
  }

  if (isZoomedIn) {
    flyToPos   = null;
    isZooming  = false;
    isZoomedIn = false;
    return;
  }
  const hitC = raycaster.intersectObject(cube);
  if (!hitC.length) return;

  let idx = 0, v0 = hitC[0].faceIndex * 3;
  for (const g of cube.geometry.groups) {
    if (v0 >= g.start && v0 < g.start + g.count) {
      idx = g.materialIndex;
      break;
    }
  }

  haloGroup.rotation.y = 0;
  rotationEnabled      = false;
  spawnTime            = performance.now();
  setTimeout(() => spawnWord(idx), 600);
}

function animate() {
  requestAnimationFrame(animate);
  const dt    = clock.getDelta();
  const speed = isZoomedIn ? 30 : 10;
  const delta = new THREE.Vector3();

  // camera panning
  if (keyState["ArrowUp"])    delta.y += speed * dt;
  if (keyState["ArrowDown"])  delta.y -= speed * dt;
  if (keyState["ArrowLeft"])  delta.x -= speed * dt;
  if (keyState["ArrowRight"]) delta.x += speed * dt;
  if (!delta.equals(new THREE.Vector3())) {
    camera.position.add(delta);
    controls.target.add(delta);
  }

  // cube rotation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  // fly‐to logic
  if (flyToPos) {
    camera.position.lerp(flyToPos, 0.1);
    controls.target.lerp(flyTarget.position, 0.1);
    if (camera.position.distanceTo(flyToPos) < 0.05) {
      flyToPos   = null;
      isZoomedIn = true;
    }
  }

  controls.update();

  // audio volume based on distance
  if (audioUnlocked && audioLoaded && monitors.length) {
    const d = Math.min(...monitors.map(m => camera.position.distanceTo(m.position)));
    if (d < PROXIMITY_RADIUS) {
      const rawV     = 1 - d / PROXIMITY_RADIUS;
      const clampedV = THREE.MathUtils.clamp(rawV, AUDIO_MIN_VOLUME, AUDIO_MAX_VOLUME);
      bgSound.setVolume(clampedV);
      if (clampedV > AUDIO_MIN_VOLUME) {
        if (!bgSound.isPlaying) bgSound.play();
      } else if (bgSound.isPlaying) {
        bgSound.pause();
      }
    } else if (bgSound.isPlaying) {
      bgSound.pause();
    }
  }

  // background fade
  const f = THREE.MathUtils.clamp(
    (camera.position.z - FADE_START) / (FADE_END - FADE_START),
    0, 1
  );
  renderer.setClearColor(0x0a0a0a, 0);
  document.getElementById("gradient-bg").style.opacity = f.toFixed(2);

  // Try to position monitors if not done yet
  if (!dreamInjected) {
    positionMonitors();
  }

  // animate spawned words
  const now     = performance.now() * 0.001;
  const EXP_DUR = 1.5, FADE_DUR = 35.0;
  for (let i = labels.length - 1; i >= 0; i--) {
    const L   = labels[i];
    const age = now - L.startTime;
    if (age < EXP_DUR) {
      L.obj.position.addScaledVector(L.velocity, dt);
    } else if (age < EXP_DUR + FADE_DUR) {
      const t = (age - EXP_DUR) / FADE_DUR;
      L.obj.position.lerp(L.target, 0.01);
      L.obj.element.style.opacity = `${1 - t}`;
    } else {
      haloGroup.remove(L.obj);
      labels.splice(i, 1);
      continue;
    }
  }

  if (isSpawning && labels.length === 0) isSpawning = false;

  // enable halo rotation after spawn delay
  const nowMs = performance.now();
  if (!rotationEnabled && nowMs > spawnTime + 1000) {
    rotationEnabled = true;
  }
  if (rotationEnabled) {
    haloGroup.rotation.y -= dt * 0.5;
  }

  // keep CSS3D labels facing camera
  const inv = haloGroup.quaternion.clone().invert();
  haloGroup.children.forEach(child => {
    child.quaternion.copy(inv).multiply(camera.quaternion);
    const el = child.element;
    const m  = getComputedStyle(el).transform.match(/matrix3d\(([^)]+)\)/);
    if (m) {
      const vals = m[1].split(",").map(parseFloat);
      vals[12] = Math.round(vals[12]);
      vals[13] = Math.round(vals[13]);
      el.style.transform = `matrix3d(${vals.join(",")})`;
    }
  });

  // Update video textures only when the video has data
  vidTextures.forEach((tex, i) => {
    const vid = document.getElementById(`v${i + 1}`);
    if (vid && vid.readyState >= vid.HAVE_CURRENT_DATA) {
      tex.needsUpdate = true;
    }
  });

  // final render
  renderer.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}

function spawnWord(faceIdx) {
  if (isSpawning) return;
  isSpawning = true;

  const msg = faceMessages[faceIdx] || "";
  if (!msg) return;
  //attempting to reverse the letters
  const orig      = reverse(msg);                    
  const origChars = orig.split("");
  const firstOrig = origChars.findIndex(ch => ch.trim() !== "");
  const letters   = msg.split("");
  const highlightIndex = (letters.length - 1) - firstOrig;
  const now        = performance.now() * 0.001;
  const half       = 0.8 * cube.scale.y;
  const center     = cube.position.clone().add(new THREE.Vector3(0, half + 0.5, 0));
  const ringRadius = cube.scale.x * 2.0;
  const baseScale  = 0.15;
  const startAngle = -Math.PI / 2; 
  letters.forEach((c, i) => {
    const angle = startAngle + (i / letters.length) * Math.PI * 2;
    const div = document.createElement("div");
    div.textContent = c;
    Object.assign(div.style, {
      fontSize:          "3px",
      color:             "white",
      pointerEvents:     "none",
      fontWeight:        "900",
      opacity:           1,
      fontFamily:        "ERECTL, sans-serif",
      textShadow:        "1px 3px 5px rgb(252,248,239)",
      backfaceVisibility:"hidden",
      transformStyle:    "preserve-3d",
    });
    if (i === highlightIndex) {
      div.style.color = "#FFD700";
    }

    const cssO = new THREE.CSS3DObject(div);
    cssO.scale.set(baseScale, baseScale, baseScale);
    cssO.position.copy(center);
    haloGroup.add(cssO);
    const spawnDist  = camera.position.distanceTo(cssO.position);
    const spawnScale = baseScale;
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const velocity = dir.multiplyScalar(8 + Math.random() * 4);
    const target = cube.position.clone().add(new THREE.Vector3(
      Math.cos(angle) * ringRadius,
      half + 1.0,
      Math.sin(angle) * ringRadius
    ));

    labels.push({
      obj:        cssO,
      startTime:  now,
      velocity,
      target,
      spawnDist,
      spawnScale
    });
  });
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
}

// Debug function to check monitor status - can be called from console
function debugMonitors() {
  console.log({
    loadedVideos,
    loadedModel,
    dreamInjected,
    monitorCount: monitors.length,
    monitorVisibility: monitors.map(m => m.visible),
    cameraPosition: camera.position.clone()
  });
  
  // Force position monitors if needed
  if (!dreamInjected && monitors.length > 0) {
    console.log("Attempting to force position monitors");
    positionMonitors();
  }
}

window.addEventListener('load', setup);
window.addEventListener('resize', resize);
