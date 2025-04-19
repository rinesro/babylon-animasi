import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SpotLight,
  ShadowGenerator,
  Color3,
  MeshBuilder,
  StandardMaterial,
  Texture,
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

let group;
let playing = true;

const createScene = async () => {
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 2.5,
    10,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  const hemiLight = new HemisphericLight(
    'hemiLight',
    new Vector3(0, 1, 0),
    scene
  );
  hemiLight.intensity = 0.3;

  const spotLight = new SpotLight(
    'spotLight',
    new Vector3(-3, 5, 0),
    new Vector3(1, -1, 0),
    Math.PI / 4,
    10,
    scene
  );
  spotLight.diffuse = new Color3(1, 1, 1);
  spotLight.specular = new Color3(1, 1, 1);

  const shadowGenerator = new ShadowGenerator(1024, spotLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 1000, height: 1000 },
    scene
  );
  const groundMaterial = new StandardMaterial('groundMat', scene);
  groundMaterial.diffuseTexture = new Texture('textures/floor.jpg', scene);
  groundMaterial.diffuseTexture.uScale = 100;
  groundMaterial.diffuseTexture.vScale = 100;
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  const result = await SceneLoader.ImportMeshAsync(
    '',
    'models/',
    'nathan.glb',
    scene
  );

  result.meshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh, true);
  });

  group = result.animationGroups[0];
  group.start(true);

  scene.onBeforeRenderObservable.add(() => {
    const direction = Vector3.Zero().subtract(spotLight.position).normalize();
    spotLight.direction = direction;
  });

  return scene;
};

createScene().then((scene) => {
  engine.runRenderLoop(() => engine.scenes[0].render());
});

window.addEventListener('resize', () => engine.resize());

const toggleBtn = document.getElementById('toggleAnimation');
toggleBtn?.addEventListener('click', () => {
  if (!group) return;
  playing = !playing;
  if (!playing) {
    group.pause();
    toggleBtn.textContent = '▶ Lanjutkan';
  } else {
    group.play();
    toggleBtn.textContent = '⏸ Hentikan';
  }
});
