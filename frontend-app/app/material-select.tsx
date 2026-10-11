import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

type Area =
  | "allWalls"
  | "wall1"
  | "wall2"
  | "wall3"
  | "wall4"
  | "floor"
  | "moldingTop"
  | "moldingBottom";

// 공간 조건 기반 추천 더미 데이터 — 서버 연동 시 API 호출로 교체
const RECOMMENDATIONS = [
  {
    id: "bright",
    tag: "밝은 공간 추천",
    desc: "채광이 좋은 공간에 어울리는 따뜻한 조합",
    colors: {
      allWalls: "#eee3ce", wall1: "#eee3ce", wall2: "#eee3ce",
      wall3: "#eee3ce", wall4: "#eee3ce",
      floor: "#b98b5b", moldingTop: "#f7f4ee", moldingBottom: "#f7f4ee",
    },
    preview: ["#eee3ce", "#b98b5b", "#f7f4ee"],
  },
  {
    id: "cozy",
    tag: "아늑한 공간 추천",
    desc: "좁은 공간을 넓어 보이게 하는 밝은 조합",
    colors: {
      allWalls: "#ffffff", wall1: "#ffffff", wall2: "#ffffff",
      wall3: "#ffffff", wall4: "#ffffff",
      floor: "#c8b89a", moldingTop: "#f4efe4", moldingBottom: "#f4efe4",
    },
    preview: ["#ffffff", "#c8b89a", "#f4efe4"],
  },
  {
    id: "modern",
    tag: "모던 스타일 추천",
    desc: "세련된 느낌의 대비감 있는 조합",
    colors: {
      allWalls: "#cfcfc9", wall1: "#cfcfc9", wall2: "#cfcfc9",
      wall3: "#cfcfc9", wall4: "#cfcfc9",
      floor: "#4a4a4a", moldingTop: "#ffffff", moldingBottom: "#ffffff",
    },
    preview: ["#cfcfc9", "#4a4a4a", "#ffffff"],
  },
];

// 시안 이력 여부 더미 — 서버 연동 시 DB 조회로 교체
const HAS_PREVIOUS_DESIGNS = true; // false로 바꾸면 취향 알아보기 화면 확인 가능

// 사용자 취향 학습 기반 추천 더미 데이터 — 서버 연동 시 사용자 이력 기반으로 교체
const USER_PREFERENCE = {
  tone: "웜톤",
  style: "내추럴",
  frequentColors: ["#eee3ce", "#b98b5b", "#f7f4ee"],
};

const USER_RECOMMENDATIONS = [
  {
    id: "user1",
    tag: "자주 선택한 색상 기반",
    desc: "웜톤 계열을 선호하는 취향에 맞춘 조합",
    colors: {
      allWalls: "#e8dcc8", wall1: "#e8dcc8", wall2: "#e8dcc8",
      wall3: "#e8dcc8", wall4: "#e8dcc8",
      floor: "#a07850", moldingTop: "#f5f0e8", moldingBottom: "#f5f0e8",
    },
    preview: ["#e8dcc8", "#a07850", "#f5f0e8"],
  },
  {
    id: "user2",
    tag: "내추럴 스타일 추천",
    desc: "선호 스타일 기반의 자연스러운 조합",
    colors: {
      allWalls: "#f0ebe0", wall1: "#f0ebe0", wall2: "#f0ebe0",
      wall3: "#f0ebe0", wall4: "#f0ebe0",
      floor: "#c4a882", moldingTop: "#faf7f2", moldingBottom: "#faf7f2",
    },
    preview: ["#f0ebe0", "#c4a882", "#faf7f2"],
  },
  {
    id: "user3",
    tag: "최근 저장 시안 기반",
    desc: "이전에 저장한 시안과 비슷한 톤의 조합",
    colors: {
      allWalls: "#ddd5c4", wall1: "#ddd5c4", wall2: "#ddd5c4",
      wall3: "#ddd5c4", wall4: "#ddd5c4",
      floor: "#8b6f4e", moldingTop: "#eeebe4", moldingBottom: "#eeebe4",
    },
    preview: ["#ddd5c4", "#8b6f4e", "#eeebe4"],
  },
];

const colorOptions = [
  { name: "퓨어 화이트", value: "#ffffff" },
  { name: "오프화이트", value: "#f7f4ee" },
  { name: "웜 화이트", value: "#f4efe4" },
  { name: "아이보리", value: "#eee3ce" },
  { name: "크림", value: "#eadcc2" },
  { name: "라이트 베이지", value: "#d6c2a1" },
  { name: "샌드 베이지", value: "#c9ad8a" },
  { name: "오트밀", value: "#c8b79a" },
  { name: "그레이지", value: "#b8afa2" },
  { name: "토프", value: "#9c8f83" },
  { name: "라이트 그레이", value: "#cfcfc9" },
  { name: "미디엄 그레이", value: "#9f9f9a" },
  { name: "차콜", value: "#4a4a4a" },
  { name: "세이지", value: "#9fb3a8" },
  { name: "올리브", value: "#7f8a5f" },
  { name: "포레스트", value: "#3f5f4a" },
  { name: "스카이 블루", value: "#b8d3df" },
  { name: "더스티 블루", value: "#7f9baa" },
  { name: "네이비", value: "#26384f" },
  { name: "오크", value: "#b98b5b" },
  { name: "애쉬 우드", value: "#c8b28e" },
  { name: "티크", value: "#9a6b43" },
  { name: "월넛", value: "#6f4a2f" },
  { name: "블랙", value: "#222222" },
];

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; overflow: hidden; background: #f8f8f8; }
    canvas { display: block; touch-action: none; }
  </style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.166.0/build/three.module.js"
  }
}
</script>

<script type="module">
import * as THREE from "three";

const objects = {};
const outlines = {};

const ROOM_W = 5.0;
const ROOM_D = 5.2;
const ROOM_H = 2.6;

const DOOR_W = 0.9;
const DOOR_H = 1.9;
const FRAME = 0.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f8f8f8");

const camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.25, 0.3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.4));

const light = new THREE.DirectionalLight(0xffffff, 1.4);
light.position.set(3, 6, 2);
scene.add(light);

const light2 = new THREE.DirectionalLight(0xffeedd, 0.5);
light2.position.set(-4, 2, -3);
scene.add(light2);

function makeMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0.03,
    side: THREE.DoubleSide
  });
}

function addToMap(map, area, item) {
  if (!map[area]) map[area] = [];
  map[area].push(item);
}

function makeBox(area, size, position, color, selectable = true, makeOutline = true) {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = makeMat(color);
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(position.x, position.y, position.z);
  mesh.userData.area = area;
  mesh.userData.selectable = selectable;

  scene.add(mesh);
  addToMap(objects, area, mesh);

  if (makeOutline) {
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x333333 });
    const outline = new THREE.LineSegments(edgeGeo, edgeMat);
    outline.position.copy(mesh.position);
    outline.scale.set(1.004, 1.004, 1.004);
    outline.visible = false;

    scene.add(outline);
    addToMap(outlines, area, outline);
  }

  return mesh;
}

makeBox("floor", { x: ROOM_W, y: 0.08, z: ROOM_D }, { x: 0, y: 0, z: 0 }, "#b98b5b");

makeBox("ceilingHidden", { x: ROOM_W, y: 0.06, z: ROOM_D }, { x: 0, y: ROOM_H, z: 0 }, "#f4efe4", false, false);

makeBox("wall1", { x: 0.08, y: ROOM_H, z: ROOM_D }, { x: -ROOM_W / 2, y: ROOM_H / 2, z: 0 }, "#eee3ce");

makeBox("wall3", { x: 0.08, y: ROOM_H, z: ROOM_D }, { x: ROOM_W / 2, y: ROOM_H / 2, z: 0 }, "#eee3ce");

makeBox("wall4", { x: ROOM_W, y: ROOM_H, z: 0.08 }, { x: 0, y: ROOM_H / 2, z: ROOM_D / 2 }, "#eee3ce");

const frontZ = -ROOM_D / 2;
const sideW = (ROOM_W - DOOR_W) / 2;

makeBox("wall2", { x: sideW, y: ROOM_H, z: 0.08 }, { x: -(DOOR_W / 2 + sideW / 2), y: ROOM_H / 2, z: frontZ }, "#eee3ce");

makeBox("wall2", { x: sideW, y: ROOM_H, z: 0.08 }, { x: DOOR_W / 2 + sideW / 2, y: ROOM_H / 2, z: frontZ }, "#eee3ce");

makeBox("wall2", { x: DOOR_W, y: ROOM_H - DOOR_H, z: 0.08 }, { x: 0, y: DOOR_H + (ROOM_H - DOOR_H) / 2, z: frontZ }, "#eee3ce");

const frameMat = makeMat("#7a5637");
const frameZ = frontZ + 0.18;

const topFrame = new THREE.Mesh(
  new THREE.BoxGeometry(DOOR_W + FRAME * 2, FRAME, 0.16),
  frameMat
);
topFrame.position.set(0, DOOR_H + FRAME / 2, frameZ);
scene.add(topFrame);

const leftFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME, DOOR_H + FRAME, 0.16),
  frameMat
);
leftFrame.position.set(-(DOOR_W / 2 + FRAME / 2), DOOR_H / 2, frameZ);
scene.add(leftFrame);

const rightFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FRAME, DOOR_H + FRAME, 0.16),
  frameMat
);
rightFrame.position.set(DOOR_W / 2 + FRAME / 2, DOOR_H / 2, frameZ);
scene.add(rightFrame);

// 문 안쪽 흰색으로 채워서 바닥/벽이 비쳐 보이지 않도록
const doorFillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
const doorFill = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.01, DOOR_H - 0.01, 0.1), doorFillMat);
doorFill.position.set(0, DOOR_H / 2, frontZ - 0.02);
scene.add(doorFill);

makeBox("wall4", { x: 1.2, y: 2.1, z: 0.08 }, { x: 0, y: 1.05, z: frontZ - 1.25 }, "#f4efe4", true, false);

makeBox("floor", { x: 1.2, y: 0.06, z: 1.0 }, { x: 0, y: 0.03, z: frontZ - 0.7 }, "#c8a26a", true, false);

const GAP = 0.18;
const TOP_Y = ROOM_H - 0.1;
const BOTTOM_Y = 0.14;
const MOLD_Z_FRONT = frontZ + 0.16;
const MOLD_Z_BACK = ROOM_D / 2 - 0.16;
const MOLD_X_LEFT = -ROOM_W / 2 + 0.16;
const MOLD_X_RIGHT = ROOM_W / 2 - 0.16;

makeBox("moldingTop", { x: ROOM_W - GAP * 2, y: 0.06, z: 0.06 }, { x: 0, y: TOP_Y, z: MOLD_Z_FRONT }, "#f7f4ee");

makeBox("moldingTop", { x: ROOM_W - GAP * 2, y: 0.06, z: 0.06 }, { x: 0, y: TOP_Y, z: MOLD_Z_BACK }, "#f7f4ee");

makeBox("moldingTop", { x: 0.06, y: 0.06, z: ROOM_D - GAP * 2 }, { x: MOLD_X_LEFT, y: TOP_Y, z: 0 }, "#f7f4ee");

makeBox("moldingTop", { x: 0.06, y: 0.06, z: ROOM_D - GAP * 2 }, { x: MOLD_X_RIGHT, y: TOP_Y, z: 0 }, "#f7f4ee");

makeBox("moldingBottom", { x: sideW - 0.18, y: 0.08, z: 0.07 }, { x: -(DOOR_W / 2 + sideW / 2), y: BOTTOM_Y, z: MOLD_Z_FRONT }, "#d8d4ca");

makeBox("moldingBottom", { x: sideW - 0.18, y: 0.08, z: 0.07 }, { x: DOOR_W / 2 + sideW / 2, y: BOTTOM_Y, z: MOLD_Z_FRONT }, "#d8d4ca");

makeBox("moldingBottom", { x: ROOM_W - GAP * 2, y: 0.08, z: 0.07 }, { x: 0, y: BOTTOM_Y, z: MOLD_Z_BACK }, "#d8d4ca");

makeBox("moldingBottom", { x: 0.07, y: 0.08, z: ROOM_D - GAP * 2 }, { x: MOLD_X_LEFT, y: BOTTOM_Y, z: 0 }, "#d8d4ca");

makeBox("moldingBottom", { x: 0.07, y: 0.08, z: ROOM_D - GAP * 2 }, { x: MOLD_X_RIGHT, y: BOTTOM_Y, z: 0 }, "#d8d4ca");

let yaw = 0;
let pitch = 0;
let fov = 62;

let isDragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

let lastTapTime = 0;
let lastTappedArea = "";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateCamera() {
  pitch = Math.max(-0.5, Math.min(0.5, pitch));

  camera.fov = fov;
  camera.updateProjectionMatrix();

  const direction = new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch)
  );

  camera.lookAt(camera.position.clone().add(direction));
}

function hideOutlines() {
  Object.values(outlines).flat().forEach((outline) => {
    outline.visible = false;
  });
}

function showOutline(area) {
  hideOutlines();

  if (area === "allWalls") return;
  if (area === "wall2") return;
  if (area === "floor") return;
  if (area === "moldingTop") return;
  if (area === "moldingBottom") return;
  if (area === "ceilingHidden") return;

  if (outlines[area]) {
    outlines[area].forEach((outline) => {
      outline.visible = true;
    });
  }
}

function selectObject(area) {
  showOutline(area);
  window.ReactNativeWebView.postMessage(area);
}

window.setAreaColor = function(area, color) {
  if (area === "allWalls") {
    ["wall1", "wall2", "wall3", "wall4"].forEach((wallName) => {
      if (objects[wallName]) {
        objects[wallName].forEach((obj) => obj.material.color.set(color));
      }
    });
    return;
  }

  if (objects[area]) {
    objects[area].forEach((obj) => obj.material.color.set(color));
  }
};

window.selectArea = function(area) {
  selectObject(area);
};

// wall2 박스들의 전체 앞벽 기준 UV 오프셋 계산
// wall2는 3개 박스: 왼쪽(sideW x ROOM_H), 오른쪽(sideW x ROOM_H), 위(DOOR_W x (ROOM_H-DOOR_H))
// 전체 앞벽 크기(ROOM_W x ROOM_H)에서 각 박스 위치를 비율로 환산해 UV 보정
function applyTextureWithUV(obj, texture, repeat, wallName) {
  const cloned = texture.clone();
  cloned.wrapS = THREE.RepeatWrapping;
  cloned.wrapT = THREE.RepeatWrapping;
  cloned.needsUpdate = true;

  if (wallName === "wall2") {
    const totalW = ROOM_W;
    const totalH = ROOM_H;
    const px = obj.position.x;
    const py = obj.position.y;
    const geo = obj.geometry;
    const params = geo.parameters;
    const boxW = params.width;
    const boxH = params.height;

    // 전체 벽 기준 반복 스케일
    cloned.repeat.set(repeat * (boxW / totalW), repeat * (boxH / totalH));
    // 전체 벽 기준 오프셋 (왼쪽 하단이 0,0)
    cloned.offset.set(
      ((px - boxW / 2) + totalW / 2) / totalW * repeat,
      (py - boxH / 2) / totalH * repeat
    );
  } else {
    cloned.repeat.set(repeat, repeat);
    cloned.offset.set(0, 0);
  }

  obj.material.map = cloned;
  obj.material.color.set("#ffffff");
  obj.material.needsUpdate = true;
}

// 텍스처 적용 — base64 이미지 + 반복 횟수
window.setAreaTexture = function(area, base64, repeat) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(base64, function() {
    const applyTexture = function(wallName) {
      if (objects[wallName]) {
        objects[wallName].forEach(function(obj) {
          applyTextureWithUV(obj, texture, repeat, wallName);
        });
      }
    };

    if (area === "allWalls") {
      ["wall1", "wall2", "wall3", "wall4"].forEach(applyTexture);
    } else {
      applyTexture(area);
    }
  });
};

// 텍스처 반복 크기만 변경
window.setTextureRepeat = function(area, repeat) {
  const updateRepeat = function(wallName) {
    if (objects[wallName]) {
      objects[wallName].forEach(function(obj) {
        if (obj.material.map) {
          applyTextureWithUV(obj, obj.material.map.source ? obj.material.map : obj.material.map, repeat, wallName);
          obj.material.needsUpdate = true;
        }
      });
    }
  };

  if (area === "allWalls") {
    ["wall1", "wall2", "wall3", "wall4"].forEach(updateRepeat);
  } else {
    updateRepeat(area);
  }
};

function trySelect(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const clickable = Object.values(objects).flat().filter(
    (obj) => obj.userData.selectable !== false
  );

  const intersects = raycaster.intersectObjects(clickable);

  if (intersects.length > 0) {
    const area = intersects[0].object.userData.area;
    const now = Date.now();

    if (area === lastTappedArea && now - lastTapTime < 360) {
      selectObject(area);
    }

    lastTappedArea = area;
    lastTapTime = now;
  }
}

window.addEventListener("pointerdown", (event) => {
  isDragging = true;
  moved = false;
  startX = event.clientX;
  startY = event.clientY;
  lastX = event.clientX;
  lastY = event.clientY;
});

window.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;

  if (Math.abs(event.clientX - startX) > 6 || Math.abs(event.clientY - startY) > 6) {
    moved = true;
  }

  yaw += dx * 0.011;
  pitch -= dy * 0.0025;

  lastX = event.clientX;
  lastY = event.clientY;

  updateCamera();
});

window.addEventListener("pointerup", (event) => {
  if (!moved) {
    trySelect(event);
  }

  isDragging = false;
});

window.addEventListener("wheel", (event) => {
  fov += event.deltaY * 0.02;
  fov = Math.max(52, Math.min(68, fov));
  updateCamera();
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

updateCamera();
window.selectArea("allWalls");
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>
</body>
</html>
`;

export default function MaterialSelect() {
  const webViewRef = useRef<WebView>(null);
  const { detectedWalls, wallpaperArea, wallpaperBase64, wallpaperRepeat } =
    useLocalSearchParams<{
      detectedWalls?: string;
      wallpaperArea?: string;
      wallpaperBase64?: string;
      wallpaperRepeat?: string;
    }>();

  // wallpaper-analyze에서 돌아왔을 때 텍스처 자동 적용
  useEffect(() => {
    if (!wallpaperArea || !wallpaperBase64) return;
    const repeat = Number(wallpaperRepeat ?? "4");
    setWallTextures((prev) => ({ ...prev, [wallpaperArea]: wallpaperBase64 }));
    setTextureRepeat((prev) => ({ ...prev, [wallpaperArea]: repeat }));
    setModeTab("wallpaper");

    const timer = setTimeout(() => {
      webViewRef.current?.injectJavaScript(`
        window.setAreaTexture("${wallpaperArea}", "${wallpaperBase64}", ${repeat});
        true;
      `);
    }, 800);
    return () => clearTimeout(timer);
  }, [wallpaperArea, wallpaperBase64, wallpaperRepeat]);

  const wallCount = Math.min(3, Math.max(1, Number(detectedWalls ?? "3") || 3));
  const maxPointWalls = wallCount === 1 ? 0 : wallCount === 2 ? 1 : 2;

  const detectedWallAreas: Area[] =
    wallCount === 1 ? ["wall1"] : wallCount === 2 ? ["wall1", "wall2"] : ["wall1", "wall2", "wall3"];

  const areaList: Area[] = [
    "allWalls",
    ...detectedWallAreas,
    "floor",
    "moldingTop",
    "moldingBottom",
  ];

  const [selectedArea, setSelectedArea] = useState<Area>("allWalls");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [modeTab, setModeTab] = useState<"color" | "wallpaper" | "recommend">("color");
  const [quizStep, setQuizStep] = useState<"idle" | "tone" | "style" | "result">("idle");
  const [quizTone, setQuizTone] = useState<string>("");
  const [quizStyle, setQuizStyle] = useState<string>("");
  const [wallTextures, setWallTextures] = useState<Partial<Record<Area, string>>>({});

  // 설문 결과 기반 추천 조합 생성
  const getQuizRecommendations = () => {
    const isWarm = quizTone === "웜톤";
    const isCool = quizTone === "쿨톤";
    if (quizStyle === "모던") {
      return [
        { id: "q1", tag: "모던 그레이", desc: "세련된 대비감의 모던 조합", colors: { allWalls: "#cfcfc9", wall1: "#cfcfc9", wall2: "#cfcfc9", wall3: "#cfcfc9", wall4: "#cfcfc9", floor: "#4a4a4a", moldingTop: "#ffffff", moldingBottom: "#ffffff" }, preview: ["#cfcfc9", "#4a4a4a", "#ffffff"] },
        { id: "q2", tag: "모던 화이트", desc: "깔끔한 화이트 베이스 모던 조합", colors: { allWalls: "#f0f0f0", wall1: "#f0f0f0", wall2: "#f0f0f0", wall3: "#f0f0f0", wall4: "#f0f0f0", floor: "#b0a898", moldingTop: "#f8f8f8", moldingBottom: "#f8f8f8" }, preview: ["#f0f0f0", "#b0a898", "#f8f8f8"] },
      ];
    }
    if (quizStyle === "빈티지") {
      return [
        { id: "q3", tag: "빈티지 웜톤", desc: "레트로한 따뜻한 빈티지 조합", colors: { allWalls: "#ddd5c4", wall1: "#ddd5c4", wall2: "#ddd5c4", wall3: "#ddd5c4", wall4: "#ddd5c4", floor: "#8b6f4e", moldingTop: "#eeebe4", moldingBottom: "#eeebe4" }, preview: ["#ddd5c4", "#8b6f4e", "#eeebe4"] },
      ];
    }
    // 내추럴 or 기본
    return isWarm
      ? [{ id: "q4", tag: "내추럴 웜톤", desc: "따뜻한 베이지 내추럴 조합", colors: { allWalls: "#eee3ce", wall1: "#eee3ce", wall2: "#eee3ce", wall3: "#eee3ce", wall4: "#eee3ce", floor: "#b98b5b", moldingTop: "#f7f4ee", moldingBottom: "#f7f4ee" }, preview: ["#eee3ce", "#b98b5b", "#f7f4ee"] }]
      : [{ id: "q5", tag: "내추럴 쿨톤", desc: "시원하고 차분한 내추럴 조합", colors: { allWalls: "#e8e8e4", wall1: "#e8e8e4", wall2: "#e8e8e4", wall3: "#e8e8e4", wall4: "#e8e8e4", floor: "#9a9a90", moldingTop: "#f5f5f3", moldingBottom: "#f5f5f3" }, preview: ["#e8e8e4", "#9a9a90", "#f5f5f3"] }];
  };
  const [textureRepeat, setTextureRepeat] = useState<Record<string, number>>({});

  const pickWallpaper = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      const repeat = textureRepeat[selectedArea] ?? 3;

      setWallTextures({ ...wallTextures, [selectedArea]: base64 });

      webViewRef.current?.injectJavaScript(`
        window.setAreaTexture("${selectedArea}", "${base64}", ${repeat});
        true;
      `);
    }
  };

  const changeRepeat = (delta: number) => {
    const current = textureRepeat[selectedArea] ?? 3;
    const next = Math.max(1, Math.min(8, current + delta));
    setTextureRepeat({ ...textureRepeat, [selectedArea]: next });

    if (wallTextures[selectedArea]) {
      webViewRef.current?.injectJavaScript(`
        window.setTextureRepeat("${selectedArea}", ${next});
        true;
      `);
    }
  };
  const [pointWalls, setPointWalls] = useState<Area[]>([]);

  const [colors, setColors] = useState<Record<Area, string>>({
    allWalls: "#eee3ce",
    wall1: "#eee3ce",
    wall2: "#eee3ce",
    wall3: "#eee3ce",
    wall4: "#eee3ce",
    floor: "#b98b5b",
    moldingTop: "#f7f4ee",
    moldingBottom: "#f7f4ee",
  });

  const isWallArea = (area: Area) => area.startsWith("wall");
  const isDetectedWall = (area: Area) => detectedWallAreas.includes(area);

  const getAreaName = (area: Area) => {
    if (area === "allWalls") return "전체 벽";
    if (area === "wall1") return "벽지 1";
    if (area === "wall2") return "벽지 2";
    if (area === "wall3") return "벽지 3";
    if (area === "wall4") return "벽지 4";
    if (area === "floor") return "바닥";
    if (area === "moldingTop") return "몰딩 1";
    return "몰딩 2";
  };

  const resetPreviewSelection = () => {
    webViewRef.current?.injectJavaScript(`
      window.selectArea("allWalls");
      true;
    `);
  };

  const changeArea = (area: Area) => {
    if (isWallArea(area) && !isDetectedWall(area)) {
      Alert.alert("안내", `현재 사진에서는 ${getAreaName(area)}가 인식되지 않았습니다.`);
      setSelectedArea("allWalls");
      resetPreviewSelection();
      return;
    }

    setSelectedArea(area);

    webViewRef.current?.injectJavaScript(`
      window.selectArea("${area}");
      true;
    `);
  };

  const handlePreviewSelect = (area: Area) => {
    if (isWallArea(area) && !isDetectedWall(area)) {
      Alert.alert(
        "안내",
        `현재 사진에서는 ${getAreaName(area)}가 인식되지 않았습니다.`
      );
      setSelectedArea("allWalls");
      resetPreviewSelection();
      return;
    }

    setSelectedArea(area);
  };

  const applyRecommendation = (rec: typeof RECOMMENDATIONS[0]) => {
    setColors(rec.colors as any);
    setPointWalls([]);
    setSelectedArea("allWalls");
    webViewRef.current?.injectJavaScript(`
      window.setAreaColor("allWalls", "${rec.colors.allWalls}");
      window.setAreaColor("wall1", "${rec.colors.allWalls}");
      window.setAreaColor("wall2", "${rec.colors.allWalls}");
      window.setAreaColor("wall3", "${rec.colors.allWalls}");
      window.setAreaColor("wall4", "${rec.colors.allWalls}");
      window.setAreaColor("floor", "${rec.colors.floor}");
      window.setAreaColor("moldingTop", "${rec.colors.moldingTop}");
      window.setAreaColor("moldingBottom", "${rec.colors.moldingBottom}");
      true;
    `);
  };

  const selectColor = (color: string) => {
    if (selectedArea === "allWalls") {
      setColors({
        ...colors,
        allWalls: color,
        wall1: color,
        wall2: color,
        wall3: color,
        wall4: color,
      });

      setPointWalls([]);

      webViewRef.current?.injectJavaScript(`
        window.setAreaColor("allWalls", "${color}");
        true;
      `);

      return;
    }

    if (isWallArea(selectedArea)) {
      if (!isDetectedWall(selectedArea)) {
        Alert.alert(
          "안내",
          `현재 사진에서는 ${getAreaName(selectedArea)}가 인식되지 않았습니다.`
        );
        return;
      }

      const alreadyPointWall = pointWalls.includes(selectedArea);

      if (!alreadyPointWall && pointWalls.length >= maxPointWalls) {
        Alert.alert(
          "선택 제한",
          `벽지 ${wallCount}개 구조에서는 포인트 벽지를 최대 ${maxPointWalls}개까지만 선택할 수 있습니다.`
        );
        return;
      }

      if (!alreadyPointWall) {
        setPointWalls([...pointWalls, selectedArea]);
      }
    }

    setColors({
      ...colors,
      [selectedArea]: color,
    });

    webViewRef.current?.injectJavaScript(`
      window.setAreaColor("${selectedArea}", "${color}");
      true;
    `);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>직접 마감재 조합</Text>
        <Text style={styles.subtitle}>
          전체 벽 색상을 먼저 고르고, 포인트 벽지는 최대 {maxPointWalls}개까지 선택할 수 있어요.
        </Text>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>공간 미리보기</Text>
            <Text style={styles.detectText}>
              벽지 {wallCount}개 · 바닥 1개 · 몰딩 2개 인식
            </Text>
          </View>

          <View style={styles.webViewBox}>
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html }}
              javaScriptEnabled
              domStorageEnabled
              onTouchStart={() => setScrollEnabled(false)}
              onTouchEnd={() => {
                setTimeout(() => setScrollEnabled(true), 150);
              }}
              onTouchCancel={() => {
                setTimeout(() => setScrollEnabled(true), 150);
              }}
              onMessage={(event) => {
                const area = event.nativeEvent.data as Area;
                handlePreviewSelect(area);
              }}
              style={styles.webView}
            />
          </View>

          <Text style={styles.helpText}>
            화면을 드래그하면 회전하고, 같은 영역을 두 번 누르면 개별 선택됩니다.
          </Text>
        </View>

        <View style={styles.areaTabs}>
          {areaList.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.areaTab,
                selectedArea === area && styles.activeAreaTab,
              ]}
              onPress={() => changeArea(area)}
            >
              <Text
                style={[
                  styles.areaTabText,
                  selectedArea === area && styles.activeAreaTabText,
                ]}
              >
                {getAreaName(area)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 모드 탭 */}
        <View style={styles.modeTabs}>
          {[
            { key: "color", label: "색상" },
            { key: "wallpaper", label: "벽지 사진" },
            { key: "recommend", label: "추천" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.modeTab, modeTab === tab.key && styles.modeTabActive]}
              onPress={() => setModeTab(tab.key as any)}
            >
              <Text style={[styles.modeTabText, modeTab === tab.key && styles.modeTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 색상 탭 */}
        {modeTab === "color" && (
          <View style={styles.modeContent}>
            <Text style={styles.sectionTitle}>{getAreaName(selectedArea)} 색상 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color.name}
                  style={styles.colorItem}
                  onPress={() => selectColor(color.value)}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.value },
                      colors[selectedArea] === color.value && styles.selectedColor,
                    ]}
                  />
                  <Text style={styles.colorName}>{color.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 벽지 사진 탭 */}
        {modeTab === "wallpaper" && (
          <View style={styles.modeContent}>
            <Text style={styles.sectionTitle}>벽지 사진으로 적용하기</Text>
            <Text style={styles.wallpaperDesc}>사진을 올리면 AI가 패턴을 분석해 벽면에 적용해요.</Text>
            <TouchableOpacity
              style={styles.wallpaperUploadBtn}
              onPress={() =>
                router.push({
                  pathname: "/wallpaper-analyze",
                  params: { area: selectedArea, detectedWalls: String(wallCount) },
                } as any)
              }
            >
              <Text style={styles.wallpaperUploadText}>
                {wallTextures[selectedArea] ? "다른 벽지 사진으로 변경" : "+ 벽지 사진 올리기"}
              </Text>
            </TouchableOpacity>
            {wallTextures[selectedArea] && (
              <View style={styles.repeatControl}>
                <Text style={styles.repeatLabel}>패턴 크기</Text>
                <View style={styles.repeatButtons}>
                  <TouchableOpacity style={styles.repeatBtn} onPress={() => changeRepeat(1)}>
                    <Text style={styles.repeatBtnText}>작게 −</Text>
                  </TouchableOpacity>
                  <Text style={styles.repeatValue}>{textureRepeat[selectedArea] ?? 3}</Text>
                  <TouchableOpacity style={styles.repeatBtn} onPress={() => changeRepeat(-1)}>
                    <Text style={styles.repeatBtnText}>크게 +</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.wallpaperResetBtn}
                  onPress={() => {
                    const newTextures = { ...wallTextures };
                    delete newTextures[selectedArea];
                    setWallTextures(newTextures);
                    selectColor(colors[selectedArea]);
                  }}
                >
                  <Text style={styles.wallpaperResetText}>색상으로 되돌리기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 추천 탭 */}
        {modeTab === "recommend" && (
          <View style={styles.modeContent}>
            <Text style={styles.sectionTitle}>추천 조합</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {RECOMMENDATIONS.map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  style={styles.recCard}
                  onPress={() => applyRecommendation(rec)}
                >
                  <Text style={styles.recTag}>{rec.tag}</Text>
                  <Text style={styles.recDesc}>{rec.desc}</Text>
                  <View style={styles.recPreview}>
                    {rec.preview.map((c, i) => (
                      <View key={i} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" ? "#ddd" : c }]} />
                    ))}
                    <Text style={styles.recApply}>적용 →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {HAS_PREVIOUS_DESIGNS ? (
              <>
                {/* 시안 이력 있는 사용자 — 취향 기반 추천 */}
                <View style={styles.preferenceHeader}>
                  <Text style={styles.sectionTitle}>내 취향 기반 추천</Text>
                  <View style={styles.preferenceBadgeRow}>
                    <View style={styles.preferenceBadge}>
                      <Text style={styles.preferenceBadgeText}>{USER_PREFERENCE.tone}</Text>
                    </View>
                    <View style={styles.preferenceBadge}>
                      <Text style={styles.preferenceBadgeText}>{USER_PREFERENCE.style}</Text>
                    </View>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {USER_RECOMMENDATIONS.map((rec) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recCard}
                      onPress={() => applyRecommendation(rec)}
                    >
                      <Text style={styles.recTag}>{rec.tag}</Text>
                      <Text style={styles.recDesc}>{rec.desc}</Text>
                      <View style={styles.recPreview}>
                        {rec.preview.map((c, i) => (
                          <View key={i} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" ? "#ddd" : c }]} />
                        ))}
                        <Text style={styles.recApply}>적용 →</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {/* 내 취향 더 알아보기 */}
                <TouchableOpacity
                  style={styles.quizLinkBtn}
                  onPress={() => { setQuizStep("tone"); }}
                >
                  <Text style={styles.quizLinkText}>내 취향 더 알아보기 →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* 시안 이력 없는 사용자 — 취향 설문 */}
                <View style={styles.quizBox}>
                  <Text style={styles.quizTitle}>내 취향 알아보기</Text>
                  <Text style={styles.quizDesc}>간단한 선택으로 나에게 맞는 마감재를 추천해드려요.</Text>

                  {quizStep === "idle" && (
                    <TouchableOpacity style={styles.quizStartBtn} onPress={() => setQuizStep("tone")}>
                      <Text style={styles.quizStartText}>시작하기</Text>
                    </TouchableOpacity>
                  )}

                  {quizStep === "tone" && (
                    <View>
                      <Text style={styles.quizQuestion}>선호하는 색상 계열은?</Text>
                      <View style={styles.quizOptions}>
                        {["웜톤", "쿨톤", "무채색"].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.quizOption, quizTone === t && styles.quizOptionActive]}
                            onPress={() => { setQuizTone(t); setQuizStep("style"); }}
                          >
                            <Text style={[styles.quizOptionText, quizTone === t && styles.quizOptionTextActive]}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {quizStep === "style" && (
                    <View>
                      <Text style={styles.quizQuestion}>좋아하는 인테리어 스타일은?</Text>
                      <View style={styles.quizOptions}>
                        {["내추럴", "모던", "빈티지"].map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.quizOption, quizStyle === s && styles.quizOptionActive]}
                            onPress={() => { setQuizStyle(s); setQuizStep("result"); }}
                          >
                            <Text style={[styles.quizOptionText, quizStyle === s && styles.quizOptionTextActive]}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {quizStep === "result" && (
                    <View>
                      <Text style={styles.quizResultLabel}>"{quizTone} · {quizStyle}" 취향에 맞는 추천이에요</Text>
                      {getQuizRecommendations().map((rec) => (
                        <TouchableOpacity
                          key={rec.id}
                          style={styles.quizRecCard}
                          onPress={() => applyRecommendation(rec as any)}
                        >
                          <View style={styles.quizRecInfo}>
                            <Text style={styles.recTag}>{rec.tag}</Text>
                            <Text style={styles.recDesc}>{rec.desc}</Text>
                            <View style={styles.recPreview}>
                              {rec.preview.map((c, i) => (
                                <View key={i} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" ? "#ddd" : c }]} />
                              ))}
                            </View>
                          </View>
                          <Text style={styles.recApply}>적용 →</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={styles.quizRetryBtn} onPress={() => { setQuizStep("tone"); setQuizTone(""); setQuizStyle(""); }}>
                        <Text style={styles.quizRetryText}>다시 선택하기</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* 취향 더 알아보기 모달형 설문 — 시안 있는 사용자 */}
            {HAS_PREVIOUS_DESIGNS && quizStep !== "idle" && (
              <View style={styles.quizBox}>
                <Text style={styles.quizTitle}>취향 더 알아보기</Text>
                {quizStep === "tone" && (
                  <View>
                    <Text style={styles.quizQuestion}>선호하는 색상 계열은?</Text>
                    <View style={styles.quizOptions}>
                      {["웜톤", "쿨톤", "무채색"].map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.quizOption, quizTone === t && styles.quizOptionActive]}
                          onPress={() => { setQuizTone(t); setQuizStep("style"); }}
                        >
                          <Text style={[styles.quizOptionText, quizTone === t && styles.quizOptionTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {quizStep === "style" && (
                  <View>
                    <Text style={styles.quizQuestion}>좋아하는 인테리어 스타일은?</Text>
                    <View style={styles.quizOptions}>
                      {["내추럴", "모던", "빈티지"].map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.quizOption, quizStyle === s && styles.quizOptionActive]}
                          onPress={() => { setQuizStyle(s); setQuizStep("result"); }}
                        >
                          <Text style={[styles.quizOptionText, quizStyle === s && styles.quizOptionTextActive]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {quizStep === "result" && (
                  <View>
                    <Text style={styles.quizResultLabel}>"{quizTone} · {quizStyle}" 추가 추천이에요</Text>
                    {getQuizRecommendations().map((rec) => (
                      <TouchableOpacity
                        key={rec.id}
                        style={styles.quizRecCard}
                        onPress={() => applyRecommendation(rec as any)}
                      >
                        <View style={styles.quizRecInfo}>
                          <Text style={styles.recTag}>{rec.tag}</Text>
                          <Text style={styles.recDesc}>{rec.desc}</Text>
                          <View style={styles.recPreview}>
                            {rec.preview.map((c, i) => (
                              <View key={i} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" ? "#ddd" : c }]} />
                            ))}
                          </View>
                        </View>
                        <Text style={styles.recApply}>적용 →</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.quizRetryBtn} onPress={() => { setQuizStep("idle"); setQuizTone(""); setQuizStyle(""); }}>
                      <Text style={styles.quizRetryText}>닫기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>선택한 마감재</Text>
          <Text style={styles.summarySubtitle}>
            포인트 벽지 {pointWalls.length}/{maxPointWalls}개 · 벽지 {wallCount}개 구조
          </Text>
          {[
            { label: "전체 벽", area: "allWalls" as Area },
            { label: "바닥", area: "floor" as Area },
            { label: "몰딩 상단", area: "moldingTop" as Area },
            { label: "몰딩 하단", area: "moldingBottom" as Area },
          ].map(({ label, area }) => (
            <View key={area} style={styles.summaryRow}>
              <View style={[styles.summaryColorBox, { backgroundColor: colors[area] || "#eee", borderColor: colors[area] === "#ffffff" ? "#ddd" : "transparent" }]} />
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>
                {colorOptions.find((c) => c.value === colors[area])?.name ?? colors[area]}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            router.push({
              pathname: "/result",
              params: {
                detectedWalls: String(wallCount),
              },
            } as any)
          }
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f3f5f7",
  },
  backButton: {
    marginTop: 38,
    width: 42,
    height: 42,
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 22,
    lineHeight: 21,
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  detectText: {
    fontSize: 12,
    color: "#777",
  },
  webViewBox: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#eee",
  },
  webView: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  helpText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
  },
  areaTabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  areaTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeAreaTab: {
    backgroundColor: "#222",
  },
  areaTabText: {
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    color: "#777",
  },
  activeAreaTabText: {
    color: "white",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },
  colorItem: {
    alignItems: "center",
    marginRight: 16,
    marginBottom: 20,
  },
  colorCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 6,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: "#222",
  },
  colorName: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  summaryBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    color: "#555",
    marginBottom: 5,
  },
  preferenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  preferenceBadgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  preferenceBadge: {
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  preferenceBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  recCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  recTag: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  recDesc: {
    fontSize: 11,
    color: "#777",
    marginBottom: 10,
    lineHeight: 16,
  },
  recPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
  },
  recApply: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
  },
  summarySubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  summaryColorBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#555",
    width: 70,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#222",
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#999",
  },
  modeTabTextActive: {
    color: "white",
  },
  modeContent: {
    marginBottom: 8,
  },
  quizLinkBtn: {
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 8,
  },
  quizLinkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  quizBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  quizDesc: {
    fontSize: 12,
    color: "#777",
    marginBottom: 14,
    lineHeight: 18,
  },
  quizStartBtn: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  quizStartText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  quizOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  quizOption: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#f3f5f7",
  },
  quizOptionActive: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  quizOptionText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#555",
  },
  quizOptionTextActive: {
    color: "white",
  },
  quizResultLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
    fontWeight: "bold",
  },
  quizRecCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  quizRecInfo: {
    flex: 1,
  },
  quizRetryBtn: {
    alignItems: "center",
    padding: 10,
    marginTop: 4,
  },
  quizRetryText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  wallpaperSection: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  wallpaperTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  wallpaperDesc: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  wallpaperUploadBtn: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  wallpaperUploadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  repeatControl: {
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 12,
  },
  repeatLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "bold",
    marginBottom: 10,
  },
  repeatButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 10,
  },
  repeatBtn: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  repeatBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
  },
  repeatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    minWidth: 30,
    textAlign: "center",
  },
  wallpaperResetBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  wallpaperResetText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  nextButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});