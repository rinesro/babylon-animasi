// src/main.js
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

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
let scene;
let animationGroup;
let playForward = true;
let animating = false;

const createScene = async () => {
  scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sun.position = new Vector3(20, 40, 20);

  const result = await SceneLoader.ImportMeshAsync("", "models/", "nathan.glb", scene);
  animationGroup = result.animationGroups[0];

  loopBackAndForth();
};

function loopBackAndForth() {
  if (!animationGroup) return;

  animationGroup.stop();
  animationGroup.speedRatio = playForward ? 1 : -1;
  animationGroup.goToFrame(playForward ? animationGroup.from : animationGroup.to);
  const anim = animationGroup.play(false);
  animating = true;

  anim.onAnimationEndObservable.addOnce(() => {
    playForward = !playForward;
    if (animating) loopBackAndForth();
  });
}

createScene().then(() => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener('resize', () => engine.resize());

// Button controls
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
