import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as ImageManipulator from "expo-image-manipulator";

const SCREEN_W = Dimensions.get("window").width;
const IMAGE_H = Dimensions.get("window").height * 0.46;
const HANDLE_SIZE = 24;
const EDGE_THICKNESS = 24;

type DragTarget = "tl" | "tr" | "bl" | "br" | "top" | "bottom" | "left" | "right" | null;

export default function ImageEditor() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [currentUri] = useState(imageUri ?? "");
  const [brightness, setBrightness] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"crop" | "rotate" | "brightness">("crop");
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 1, h: 1 });

  const cropBoxRef = useRef(cropBox);
  cropBoxRef.current = cropBox;
  const dragTarget = useRef<DragTarget>(null);
  const imageLayout = useRef({ x: 0, y: 0, width: SCREEN_W, height: IMAGE_H });
  const naturalSize = useRef({ width: 0, height: 0 });
  const layoutReady = useRef(false);
  const sliderW = useRef(SCREEN_W - 64);
  const sliderPageX = useRef(0);

  // 줌/패닝 shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  function resetCropToPhoto(areaW?: number, areaH?: number) {
    const { width: natW, height: natH } = naturalSize.current;
    if (!natW || !natH) return;
    const iw = areaW ?? imageLayout.current.width;
    const ih = areaH ?? imageLayout.current.height;
    if (!iw || !ih) return;
    const imgRatio = natW / natH;
    const areaRatio = iw / ih;
    let imgW: number, imgH: number;
    if (imgRatio > areaRatio) { imgW = iw; imgH = iw / imgRatio; }
    else { imgH = ih; imgW = ih * imgRatio; }
    const offsetX = (iw - imgW) / 2 / iw;
    const offsetY = (ih - imgH) / 2 / ih;
    setCropBox({ x: offsetX, y: offsetY, w: imgW / iw, h: imgH / ih });
  }

  // 자르기 핸들 감지
  function getDragTarget(lx: number, ly: number): DragTarget {
    const b = cropBoxRef.current;
    const iw = imageLayout.current.width;
    const ih = imageLayout.current.height;
    const px = { left: b.x * iw, top: b.y * ih, right: (b.x + b.w) * iw, bottom: (b.y + b.h) * ih };
    const E = EDGE_THICKNESS;
    const nearLeft = lx >= px.left - E && lx <= px.left + E;
    const nearRight = lx >= px.right - E && lx <= px.right + E;
    const nearTop = ly >= px.top - E && ly <= px.top + E;
    const nearBottom = ly >= px.bottom - E && ly <= px.bottom + E;
    const insideX = lx >= px.left - E && lx <= px.right + E;
    const insideY = ly >= px.top - E && ly <= px.bottom + E;
    if (nearTop && nearLeft) return "tl";
    if (nearTop && nearRight) return "tr";
    if (nearBottom && nearLeft) return "bl";
    if (nearBottom && nearRight) return "br";
    if (nearTop && insideX) return "top";
    if (nearBottom && insideX) return "bottom";
    if (nearLeft && insideY) return "left";
    if (nearRight && insideY) return "right";
    return null;
  }

  // 자르기 PanResponder
  const cropPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        if (activeTab !== "crop") return false;
        const lx = e.nativeEvent.pageX - imageLayout.current.x;
        const ly = e.nativeEvent.pageY - imageLayout.current.y;
        const target = getDragTarget(lx, ly);
        dragTarget.current = target;
        return target !== null;
      },
      onMoveShouldSetPanResponder: () => activeTab === "crop" && dragTarget.current !== null,
      onPanResponderMove: (e) => {
        const iw = imageLayout.current.width;
        const ih = imageLayout.current.height;
        const { width: natW, height: natH } = naturalSize.current;
        const imgRatio = natW && natH ? natW / natH : 1;
        const areaRatio = iw / ih;
        let imgW: number, imgH: number;
        if (imgRatio > areaRatio) { imgW = iw; imgH = iw / imgRatio; }
        else { imgH = ih; imgW = ih * imgRatio; }
        const minX = (iw - imgW) / 2 / iw;
        const minY = (ih - imgH) / 2 / ih;
        const maxX = minX + imgW / iw;
        const maxY = minY + imgH / ih;
        const lx = Math.max(minX, Math.min(maxX, (e.nativeEvent.pageX - imageLayout.current.x) / iw));
        const ly = Math.max(minY, Math.min(maxY, (e.nativeEvent.pageY - imageLayout.current.y) / ih));
        const b = cropBoxRef.current;
        const MIN = 0.05;
        setCropBox((prev) => {
          switch (dragTarget.current) {
            case "tl": {
              const nx = Math.max(minX, Math.min(lx, b.x + b.w - MIN));
              const ny = Math.max(minY, Math.min(ly, b.y + b.h - MIN));
              return { x: nx, y: ny, w: prev.x + prev.w - nx, h: prev.y + prev.h - ny };
            }
            case "tr": {
              const ny = Math.max(minY, Math.min(ly, b.y + b.h - MIN));
              return { ...prev, y: ny, w: Math.min(maxX - prev.x, Math.max(MIN, lx - prev.x)), h: prev.y + prev.h - ny };
            }
            case "bl": {
              const nx = Math.max(minX, Math.min(lx, b.x + b.w - MIN));
              return { ...prev, x: nx, w: prev.x + prev.w - nx, h: Math.min(maxY - prev.y, Math.max(MIN, ly - prev.y)) };
            }
            case "br":
              return { ...prev, w: Math.min(maxX - prev.x, Math.max(MIN, lx - prev.x)), h: Math.min(maxY - prev.y, Math.max(MIN, ly - prev.y)) };
            case "top": {
              const ny = Math.max(minY, Math.min(ly, b.y + b.h - MIN));
              return { ...prev, y: ny, h: prev.y + prev.h - ny };
            }
            case "bottom":
              return { ...prev, h: Math.min(maxY - prev.y, Math.max(MIN, ly - prev.y)) };
            case "left": {
              const nx = Math.max(minX, Math.min(lx, b.x + b.w - MIN));
              return { ...prev, x: nx, w: prev.x + prev.w - nx };
            }
            case "right":
              return { ...prev, w: Math.min(maxX - prev.x, Math.max(MIN, lx - prev.x)) };
            default: return prev;
          }
        });
      },
      onPanResponderRelease: () => { dragTarget.current = null; },
    })
  ).current;

  // 핀치 줌 제스처
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedX.value = 0;
        savedY.value = 0;
      } else {
        // 줌 후 위치가 범위 밖이면 보정
        const { width: natW, height: natH } = naturalSize.current;
        const areaW = imageLayout.current.width || SCREEN_W;
        const areaH = imageLayout.current.height || IMAGE_H;
        const imgRatio = natW && natH ? natW / natH : areaW / areaH;
        const areaRatio = areaW / areaH;
        let imgW: number, imgH: number;
        if (imgRatio > areaRatio) { imgW = areaW; imgH = areaW / imgRatio; }
        else { imgH = areaH; imgW = areaH * imgRatio; }
        const scaledW = imgW * scale.value;
        const scaledH = imgH * scale.value;
        const maxTX = Math.max(0, (scaledW - areaW) / 2);
        const maxTY = Math.max(0, (scaledH - areaH) / 2);
        translateX.value = withSpring(Math.max(-maxTX, Math.min(maxTX, translateX.value)));
        translateY.value = withSpring(Math.max(-maxTY, Math.min(maxTY, translateY.value)));
        savedX.value = translateX.value;
        savedY.value = translateY.value;
      }
    });

  // 패닝 제스처 (확대된 상태에서만)
  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onUpdate((e) => {
      if (savedScale.value <= 1) return;

      // 사진이 contain으로 표시되는 실제 크기 계산
      const { width: natW, height: natH } = naturalSize.current;
      const areaW = imageLayout.current.width || SCREEN_W;
      const areaH = imageLayout.current.height || IMAGE_H;
      const imgRatio = natW && natH ? natW / natH : areaW / areaH;
      const areaRatio = areaW / areaH;
      let imgW: number, imgH: number;
      if (imgRatio > areaRatio) { imgW = areaW; imgH = areaW / imgRatio; }
      else { imgH = areaH; imgW = areaH * imgRatio; }

      // 확대된 사진 크기 기준으로 최대 이동 범위 계산
      const scaledW = imgW * savedScale.value;
      const scaledH = imgH * savedScale.value;
      const maxTX = Math.max(0, (scaledW - areaW) / 2);
      const maxTY = Math.max(0, (scaledH - areaH) / 2);

      translateX.value = Math.max(-maxTX, Math.min(maxTX, savedX.value + e.translationX));
      translateY.value = Math.max(-maxTY, Math.min(maxTY, savedY.value + e.translationY));
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // 슬라이더
  const sliderPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderPageX.current) / sliderW.current));
        setBrightness(Math.round(ratio * 200 - 100));
      },
      onPanResponderMove: (e) => {
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderPageX.current) / sliderW.current));
        setBrightness(Math.round(ratio * 200 - 100));
      },
    })
  ).current;

  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  const applyAndDone = async () => {
    setIsProcessing(true);
    try {
      const actions: ImageManipulator.Action[] = [];
      const iw = imageLayout.current.width;
      const ih = imageLayout.current.height;
      if (cropBox.x > 0.01 || cropBox.y > 0.01 || cropBox.w < 0.99 || cropBox.h < 0.99) {
        actions.push({
          crop: {
            originX: Math.round(cropBox.x * iw),
            originY: Math.round(cropBox.y * ih),
            width: Math.round(cropBox.w * iw),
            height: Math.round(cropBox.h * ih),
          },
        });
      }
      if (rotation !== 0) actions.push({ rotate: rotation });
      const result = await ImageManipulator.manipulateAsync(
        currentUri, actions,
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      router.replace({
        pathname: "/image-preview",
        params: { imageUri: result.uri },
      } as any);
    } catch {
      Alert.alert("오류", "이미지 처리 중 문제가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const brightnessRatio = (brightness + 100) / 200;
  const overlayOpacity = Math.abs(brightness) / 200;
  const overlayColor = brightness > 0 ? "white" : "black";
  const iw = imageLayout.current.width;
  const ih = imageLayout.current.height;
  const cpx = {
    left: cropBox.x * iw,
    top: cropBox.y * ih,
    width: cropBox.w * iw,
    height: cropBox.h * ih,
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerCancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사진 편집</Text>
        <TouchableOpacity onPress={applyAndDone} disabled={isProcessing}>
          <Text style={[styles.headerDone, isProcessing && { color: "#aaa" }]}>
            {isProcessing ? "처리 중" : "완료"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 이미지 영역 */}
      <GestureDetector gesture={composed}>
        <View
          style={styles.imageArea}
          {...cropPan.panHandlers}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            imageLayout.current = { ...imageLayout.current, width, height };
            layoutReady.current = true;
            if (naturalSize.current.width) resetCropToPhoto(width, height);
          }}
          ref={(ref: any) => {
            if (ref) {
              ref.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
                imageLayout.current = { x: pageX, y: pageY, width: w, height: h };
              });
            }
          }}
        >
          <Animated.Image
            source={{ uri: currentUri }}
            style={[styles.previewImage, { transform: [{ rotate: `${rotation}deg` }] }, animatedStyle]}
            onLoad={(e: any) => {
              const { width, height } = e.nativeEvent.source;
              naturalSize.current = { width, height };
              if (layoutReady.current) resetCropToPhoto();
            }}
          />

          {brightness !== 0 && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor, opacity: overlayOpacity }]} />
          )}

          {activeTab === "crop" && (
            <>
              <View pointerEvents="none" style={[styles.mask, { top: 0, left: 0, right: 0, height: cpx.top }]} />
              <View pointerEvents="none" style={[styles.mask, { top: cpx.top + cpx.height, left: 0, right: 0, bottom: 0 }]} />
              <View pointerEvents="none" style={[styles.mask, { top: cpx.top, left: 0, width: cpx.left, height: cpx.height }]} />
              <View pointerEvents="none" style={[styles.mask, { top: cpx.top, left: cpx.left + cpx.width, right: 0, height: cpx.height }]} />
              <View pointerEvents="none" style={[styles.cropBorder, { left: cpx.left, top: cpx.top, width: cpx.width, height: cpx.height }]} />
              <View pointerEvents="none" style={[styles.gridLine, { left: cpx.left + cpx.width / 3, top: cpx.top, width: 1, height: cpx.height }]} />
              <View pointerEvents="none" style={[styles.gridLine, { left: cpx.left + (cpx.width / 3) * 2, top: cpx.top, width: 1, height: cpx.height }]} />
              <View pointerEvents="none" style={[styles.gridLine, { left: cpx.left, top: cpx.top + cpx.height / 3, width: cpx.width, height: 1 }]} />
              <View pointerEvents="none" style={[styles.gridLine, { left: cpx.left, top: cpx.top + (cpx.height / 3) * 2, width: cpx.width, height: 1 }]} />
              <View pointerEvents="none" style={[styles.handle, { left: cpx.left - HANDLE_SIZE / 2, top: cpx.top - HANDLE_SIZE / 2 }]} />
              <View pointerEvents="none" style={[styles.handle, { left: cpx.left + cpx.width - HANDLE_SIZE / 2, top: cpx.top - HANDLE_SIZE / 2 }]} />
              <View pointerEvents="none" style={[styles.handle, { left: cpx.left - HANDLE_SIZE / 2, top: cpx.top + cpx.height - HANDLE_SIZE / 2 }]} />
              <View pointerEvents="none" style={[styles.handle, { left: cpx.left + cpx.width - HANDLE_SIZE / 2, top: cpx.top + cpx.height - HANDLE_SIZE / 2 }]} />
            </>
          )}
        </View>
      </GestureDetector>

      {/* 하단 툴 */}
      <View style={styles.toolArea}>
        <View style={styles.tabs}>
          {(["crop", "rotate", "brightness"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === "crop" ? "자르기" : tab === "rotate" ? "회전" : "밝기"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "crop" && (
          <View style={styles.toolContent}>
            <Text style={styles.cropGuide}>모서리 또는 실선을 드래그해서 영역을 조절하세요.{"\n"}두 손가락으로 확대할 수 있어요.</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => resetCropToPhoto()}>
              <Text style={styles.secondaryButtonText}>선택 초기화</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "rotate" && (
          <View style={styles.toolContent}>
            <View style={styles.rotateOptions}>
              {[0, 90, 180, 270].map((deg) => (
                <TouchableOpacity
                  key={deg}
                  style={[styles.rotateOption, rotation === deg && styles.rotateOptionActive]}
                  onPress={() => setRotation(deg)}
                >
                  <Text style={[styles.rotateOptionText, rotation === deg && styles.rotateOptionTextActive]}>
                    {deg}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={rotate}>
              <Text style={styles.secondaryButtonText}>↻  90° 회전</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "brightness" && (
          <View style={styles.toolContent}>
            <View style={styles.brightnessRow}>
              <Text style={styles.brightnessLabel}>밝기</Text>
              <Text style={styles.brightnessValue}>
                {brightness > 0 ? `+${brightness}` : brightness}
              </Text>
            </View>
            <View
              style={styles.sliderWrap}
              {...sliderPan.panHandlers}
              onLayout={(e) => { sliderW.current = e.nativeEvent.layout.width; }}
              ref={(ref: any) => {
                if (ref) {
                  ref.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
                    sliderPageX.current = pageX;
                  });
                }
              }}
            >
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${brightnessRatio * 100}%` }]} />
              </View>
              <View style={[styles.sliderThumb, { left: `${brightnessRatio * 100}%`, marginLeft: -11 }]} />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>어둡게</Text>
              <Text style={styles.sliderLabelText}>밝게</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setBrightness(0);
            setRotation(0);
            resetCropToPhoto();
            scale.value = withSpring(1);
            savedScale.value = 1;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedX.value = 0;
            savedY.value = 0;
          }}
        >
          <Text style={styles.resetText}>전체 초기화</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f5f7" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: "#f3f5f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerCancel: { color: "#555", fontSize: 16 },
  headerTitle: { color: "#222", fontSize: 16, fontWeight: "bold" },
  headerDone: { color: "#222", fontSize: 16, fontWeight: "bold" },
  imageArea: {
    width: SCREEN_W,
    height: IMAGE_H,
    backgroundColor: "#ddd",
    position: "relative",
    overflow: "hidden",
  },
  previewImage: { width: SCREEN_W, height: IMAGE_H, resizeMode: "contain" },
  mask: { position: "absolute", backgroundColor: "rgba(0,0,0,0.45)" },
  cropBorder: { position: "absolute", borderWidth: 1.5, borderColor: "white" },
  gridLine: { position: "absolute", backgroundColor: "rgba(255,255,255,0.35)" },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: 4,
    backgroundColor: "white",
    zIndex: 10,
  },
  toolArea: { flex: 1, backgroundColor: "#f3f5f7", paddingTop: 8, paddingBottom: 24 },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginBottom: 20,
    backgroundColor: "white",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#222" },
  tabText: { color: "#999", fontSize: 14, fontWeight: "bold" },
  activeTabText: { color: "#222" },
  toolContent: { paddingHorizontal: 24 },
  cropGuide: { color: "#777", fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  secondaryButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  secondaryButtonText: { color: "#222", fontWeight: "bold", fontSize: 15 },
  rotateOptions: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 16 },
  rotateOption: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5e5",
    justifyContent: "center", alignItems: "center",
  },
  rotateOptionActive: { backgroundColor: "#222", borderColor: "#222" },
  rotateOptionText: { color: "#555", fontSize: 13, fontWeight: "bold" },
  rotateOptionTextActive: { color: "white" },
  brightnessRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  brightnessLabel: { color: "#555", fontSize: 14 },
  brightnessValue: { color: "#222", fontSize: 14, fontWeight: "bold" },
  sliderWrap: { height: 44, justifyContent: "center", marginBottom: 8, position: "relative" },
  sliderTrack: { height: 4, backgroundColor: "#ddd", borderRadius: 2, overflow: "hidden" },
  sliderFill: { height: 4, backgroundColor: "#222", borderRadius: 2 },
  sliderThumb: { position: "absolute", width: 22, height: 22, borderRadius: 11, backgroundColor: "white", borderWidth: 2, borderColor: "#222", top: 11 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
  sliderLabelText: { color: "#999", fontSize: 12 },
  resetButton: { marginTop: 20, alignItems: "center", padding: 10 },
  resetText: { color: "#999", fontSize: 14 },
});
