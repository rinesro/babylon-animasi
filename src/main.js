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
  Animation,
  TransformNode,
} from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

let scene;
let group = null;
let targetMesh = null;
let rootNode = null;

const createScene = async () => {
  scene = new Scene(engine);

  const camera = new ArcRotateCamera('camera', 0, Math.PI / 2, 10, Vector3.Zero(), scene);
  camera.setPosition(new Vector3(0.02, 2.66, -9.64));
  camera.attachControl(canvas, true);
  camera.setTarget(Vector3.Zero());

  const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.3;

  const spotLight = new SpotLight('spotLight', new Vector3(-3, 5, 0), new Vector3(1, -1, 0), Math.PI / 4, 10, scene);
  spotLight.diffuse = new Color3(1, 1, 1);
  spotLight.specular = new Color3(1, 1, 1);

  const shadowGenerator = new ShadowGenerator(1024, spotLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  const ground = MeshBuilder.CreateGround('ground', { width: 1000, height: 1000 }, scene);
  const groundMaterial = new StandardMaterial('groundMat', scene);
  groundMaterial.diffuseTexture = new Texture('textures/floor.jpg', scene);
  groundMaterial.diffuseTexture.uScale = 100;
  groundMaterial.diffuseTexture.vScale = 100;
  ground.material = groundMaterial;
  ground.receiveShadows = true;
  ground.isPickable = true;

  const result = await SceneLoader.ImportMeshAsync('', 'models/', 'robot_walk_animation.glb', scene);
  targetMesh = result.meshes[0];

  rootNode = new TransformNode("rootNode", scene);
  rootNode.position = targetMesh.position.clone();
  targetMesh.parent = rootNode;
  targetMesh.position = Vector3.Zero();

  result.meshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh, true);
  });

  group = result.animationGroups[0];
  group.stop(true);
  group.speedRatio = 0.5;

  scene.onBeforeRenderObservable.add(() => {
    const direction = Vector3.Zero().subtract(spotLight.position).normalize();
    spotLight.direction = direction;
  });

  return scene;
};

createScene().then(() => {
  engine.runRenderLoop(() => scene.render());
});

let currentDirection = 'S';
const directionAngles = {
  W: Math.PI,
  D: -Math.PI / 2,
  S: 0,
  A: Math.PI / 2,
};

let isMoving = false;

function rotateSmoothly(fromAngle, toAngle) {
  const animation = new Animation('rotationAnim', 'rotation.y', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);

  // Normalize angles
  let delta = toAngle - fromAngle;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;

  const frames = [
    { frame: 0, value: fromAngle },
    { frame: 15, value: fromAngle + delta },
  ];

  animation.setKeys(frames);
  rootNode.animations = [animation];
  scene.beginAnimation(rootNode, 0, 15, false);
}

window.addEventListener('keydown', (evt) => {
  if (!rootNode || !group) return;

  const moveDistance = 0.05;
  const key = evt.code.replace('Key', '');
  if (!['W', 'A', 'S', 'D'].includes(key)) return;

  const angleNow = directionAngles[currentDirection];
  const angleNext = directionAngles[key];

  rotateSmoothly(angleNow, angleNext);
  currentDirection = key;

  if (key === 'S') rootNode.position.z -= moveDistance;
  if (key === 'W') rootNode.position.z += moveDistance;
  if (key === 'A') rootNode.position.x -= moveDistance;
  if (key === 'D') rootNode.position.x += moveDistance;

  if (!isMoving) {
    group.play(true);
    isMoving = true;
  }
});

window.addEventListener('keyup', (evt) => {
  if (!group || !isMoving) return;

  if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(evt.code)) {
    group.stop();
    isMoving = false;
  }
});

window.addEventListener('resize', () => engine.resize());
