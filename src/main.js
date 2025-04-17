import {
  Engine, Scene, ArcRotateCamera, Vector3,
  HemisphericLight, DirectionalLight
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
let scene;
let walkAnimGroup;

const createScene = async () => {
  scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const sunlight = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sunlight.position = new Vector3(20, 40, 20);

  const result = await SceneLoader.ImportMeshAsync("", "models/", "nathan.glb", scene);

  walkAnimGroup = result.animationGroups[0]; // simpan animasi utama
  walkAnimGroup.start(true); // jalan otomatis
};

createScene().then(() => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener('resize', () => engine.resize());

// Kontrol tombol play/pause
document.getElementById('playBtn').onclick = () => {
  if (walkAnimGroup) {
    walkAnimGroup.start(true);
  }
};

document.getElementById('stopBtn').onclick = () => {
  if (walkAnimGroup) {
    walkAnimGroup.stop();
    walkAnimGroup.animatables.forEach(a => a.reset()); // reset ke frame awal (diam tegak)
  }
};
