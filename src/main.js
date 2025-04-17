import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

console.log("🚀 App started");

const canvas = document.getElementById('renderCanvas');
if (!canvas) {
  console.error("❌ Canvas 'renderCanvas' tidak ditemukan di HTML.");
  throw new Error("Canvas element not found");
}

const engine = new Engine(canvas, true);
let scene;
let animationGroup;
let playForward = true;
let animating = true;

const createScene = async () => {
  scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sun.position = new Vector3(20, 40, 20);

  try {
    const result = await SceneLoader.ImportMeshAsync("", "/models/", "nathan.glb", scene);
    console.log("✅ Model loaded");
    animationGroup = result.animationGroups[0];
    loopBackAndForth();
  } catch (err) {
    console.error("❌ Gagal load model nathan.glb:", err);
  }
};

function loopBackAndForth() {
  if (!animationGroup) return;

  animationGroup.stop();
  animationGroup.speedRatio = playForward ? 1 : -1;
  const from = playForward ? animationGroup.from : animationGroup.to;
  animationGroup.goToFrame(from);

  const anim = animationGroup.play(false);
  anim.onAnimationEndObservable.addOnce(() => {
    playForward = !playForward;
    if (animating) loopBackAndForth();
  });
}

createScene().then(() => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener('resize', () => engine.resize());

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');

playBtn?.addEventListener('click', () => {
  if (animationGroup && !animationGroup.isPlaying) {
    animating = true;
    loopBackAndForth();
  }
});

stopBtn?.addEventListener('click', () => {
  if (animationGroup) {
    animating = false;
    animationGroup.stop();
    animationGroup.reset();
  }
});
