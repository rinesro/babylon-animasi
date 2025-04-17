import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight } from '@babylonjs/core';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
let currentAnimGroup;

document.getElementById('playBtn').onclick = () => {
  if (currentAnimGroup) currentAnimGroup.start(true);
};

document.getElementById('stopBtn').onclick = () => {
  if (currentAnimGroup) {
    currentAnimGroup.stop();
    currentAnimGroup.animatables.forEach(anim => anim.animationStarted = false);
  }
};

const createScene = async () => {
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const sunlight = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sunlight.position = new Vector3(20, 40, 20);

  
  const result = await SceneLoader.ImportMeshAsync("", "models/", "nathan.glb", scene);
  console.log("Model loaded:", result);
  result.animationGroups.forEach(group => group.start(true));

  return scene;
};

createScene().then(scene => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener('resize', () => engine.resize());
