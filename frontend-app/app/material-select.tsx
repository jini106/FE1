import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
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

camera.position.set(0, 1.25, 0.9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));

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
  const { detectedWalls } = useLocalSearchParams<{ detectedWalls?: string }>();

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
        <Text style={styles.title}>마감재 선택</Text>
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

        <Text style={styles.sectionTitle}>
          {getAreaName(selectedArea)} 마감재 선택
        </Text>

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

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>선택한 마감재</Text>
          <Text style={styles.summaryText}>
            포인트 벽지: {pointWalls.length} / {maxPointWalls}개 선택
          </Text>
          <Text style={styles.summaryText}>
            벽지 {wallCount}개 구조 기준 적용
          </Text>
          <Text style={styles.summaryText}>
            바닥 · 몰딩 1 · 몰딩 2 선택 가능
          </Text>
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