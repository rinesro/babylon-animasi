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
let animatable;
let playForward = true;

const createScene = async () => {
  scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sun.position = new Vector3(20, 40, 20);

  const result = await SceneLoader.ImportMeshAsync("", "models/", "nathan.glb", scene);
  animationGroup = result.animationGroups[0];

  playDirectional(true); // start initial loop
};

function playDirectional(forward = true) {
  if (!animationGroup) return;

  animationGroup.stop();
  animationGroup.speedRatio = forward ? 1 : -1;
  animationGroup.goToFrame(forward ? animationGroup.from : animationGroup.to);

  animatable = animationGroup.play(false);
  animatable.onAnimationEndObservable.addOnce(() => {
    playForward = !playForward;
    playDirectional(playForward);
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
    playDirectional(playForward);
  }
});

stopBtn?.addEventListener('click', () => {
  if (animationGroup) {
    animationGroup.stop();
    animationGroup.reset();
  }
});
