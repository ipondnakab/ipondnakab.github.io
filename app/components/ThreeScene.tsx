"use client";

import { GameState } from "@/interfaces/game-state";
import { Button, Card, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MdRestartAlt } from "react-icons/md";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const backToIntroRef = useRef<() => void>(() => {});
  const gameStateRef = useRef<GameState>(GameState.INTRO);
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [showHint, setShowHint] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Mobile Controls Refs/State
  const mobileJumpRef = useRef<() => void>(() => {});
  const mobileStartRef = useRef<() => void>(() => {});
  const [joystickActive, setJoystickActive] = useState(false);
  const [visualPos, setVisualPos] = useState({ x: 0, y: 0 });
  const joystickData = useRef({ forward: 0, turn: 0 });

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountNode = mountRef.current;

    // =====================
    // SCENE
    // =====================
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountNode.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    scene.add(new THREE.GridHelper(30, 30));

    // =====================
    // CAMERA TARGET & CONFIG
    // =====================
    const cameraTarget = new THREE.Vector3();
    let cameraAngle = 0;
    const camRotationSpeed = 2.0;

    // =====================
    // GAME STATE
    // =====================
    let introProgress = 0;
    let introFinished = false;
    let returningToIntro = false;
    let autoProgressIntro = false;

    // =====================
    // INTRO TEXT & UI
    // =====================
    let introTextGroup: THREE.Group;
    let helloSprite: THREE.Sprite;
    let titleSprite: THREE.Sprite;
    let descSprite: THREE.Sprite;
    let hintSprite: THREE.Sprite;
    let startBtnSprite: THREE.Sprite;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // =====================
    // CHARACTER / ANIMATION
    // =====================

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setIsLoading(false);
    };

    const loader = new GLTFLoader(manager);

    let character: THREE.Object3D;
    let mixer: THREE.AnimationMixer;
    let activeAction: THREE.AnimationAction | null = null;
    const actions: Record<string, THREE.AnimationAction> = {};

    // =====================
    // INTRO CONFIG
    // =====================
    const introStartY = 6;
    const introEndY = 0;
    const spawnPosition = new THREE.Vector3(0, 0, 0);
    const camIntroStart = new THREE.Vector3(0, 7, -2.4);
    camera.position.copy(camIntroStart);

    // =====================
    // MOVEMENT
    // =====================
    const keyCodes: Record<string, boolean> = {};
    const walkSpeed = 1.5;
    const runSpeed = 3.5;
    const rotationSpeed = 2.5;

    let isJumping = false;
    let velocityY = 0;
    const gravity = -20;
    const jumpForce = 7;

    // =====================
    // INPUT
    // =====================
    const onKeyDown = (e: KeyboardEvent) => {
      keyCodes[e.code] = true;
      if (
        e.code === "Space" &&
        !isJumping &&
        gameStateRef.current === GameState.GAME
      ) {
        startJump();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keyCodes[e.code] = false;
    };

    const onScroll = (e: WheelEvent) => {
      if (gameStateRef.current !== GameState.INTRO || returningToIntro) return;
      introProgress += e.deltaY * 0.003;
      introProgress = THREE.MathUtils.clamp(introProgress, 0, 1);
      if (introProgress === 1) introFinished = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (gameStateRef.current !== GameState.INTRO) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Safety check for startBtnSprite
      if (!startBtnSprite) return;

      const intersects = raycaster.intersectObject(startBtnSprite);
      if (intersects.length > 0) autoProgressIntro = true;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onScroll);
    window.addEventListener("pointerdown", onPointerDown);

    // =====================
    // ANIMATION HELPERS
    // =====================
    const play = (name: string, fade = 0.15) => {
      const action = actions[name];
      if (!action || activeAction === action) return;
      activeAction?.crossFadeTo(action, fade, false);
      action.reset().play();
      activeAction = action;
    };

    const startJump = () => {
      if (isJumping) return;
      isJumping = true;
      velocityY = jumpForce;
      if (keyCodes["KeyS"] || joystickData.current.forward < -0.1)
        play("jumpBack");
      else if (keyCodes["KeyW"] || joystickData.current.forward > 0.1)
        play("jump");
      else play("idleJump");
    };

    // =====================
    // MOBILE ACTIONS
    // =====================
    mobileJumpRef.current = startJump;
    mobileStartRef.current = () => {
      autoProgressIntro = true;
    };

    // =====================
    // BACK TO INTRO
    // =====================
    backToIntroRef.current = () => {
      if (gameStateRef.current !== GameState.GAME || !character) return;
      if (introTextGroup) introTextGroup.visible = true;
      if (startBtnSprite) startBtnSprite.visible = isMobile;
      returningToIntro = true;
      autoProgressIntro = false;
      gameStateRef.current = GameState.INTRO;
      setGameState(GameState.INTRO);
      introFinished = false;
      introProgress = 1;
      isJumping = false;
      velocityY = 0;
      cameraAngle = 0;
      Object.values(actions).forEach((a) => a.stop());
      activeAction = null;
    };

    // =====================
    // TEXT SPRITE CREATION
    // =====================
    const createTextSprite = (
      text: string,
      options: Partial<CanvasRenderingContext2D>,
      isButton = false,
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      if (isButton) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.roundRect(362, 86, 300, 84, 64);
        ctx.fill();
        ctx.fillStyle = "black";
      } else {
        ctx.fillStyle = "white";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      Object.assign(ctx, options);
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(4, 1, 1);
      return sprite;
    };

    // =====================
    // LOAD MODELS
    // =====================
    loader.load("/models/character.glb", (gltf) => {
      character = gltf.scene;
      character.position.set(spawnPosition.x, introStartY, spawnPosition.z);
      scene.add(character);

      introTextGroup = new THREE.Group();
      helloSprite = createTextSprite("Kittipat's mini project", {
        font: "48px Arial",
      });
      titleSprite = createTextSprite("Next.js + Three.js", {
        font: "Bold 59px Arial",
      });
      descSprite = createTextSprite("A simple 3D character controller.", {
        font: "28px Arial",
      });
      hintSprite = createTextSprite(
        isMobile ? "Click START to begin" : "Scroll to begin",
        { font: "28px Arial" },
      );
      startBtnSprite = createTextSprite(
        "START GAME",
        { font: "Bold 32px Arial" },
        true,
      );

      helloSprite.position.set(0, 2.9, -2.2);
      titleSprite.position.set(0, 2.6, -2.2);
      descSprite.position.set(0, 2.35, -2.2);
      hintSprite.position.set(0, 2, -2.2);
      startBtnSprite.position.set(0, 1.7, -2.2);

      introTextGroup.add(helloSprite);
      introTextGroup.add(titleSprite);
      introTextGroup.add(descSprite);
      introTextGroup.add(hintSprite);
      if (isMobile) introTextGroup.add(startBtnSprite);
      scene.add(introTextGroup);

      character.traverse((o) => {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) o.frustumCulled = false;
      });

      mixer = new THREE.AnimationMixer(character);
      const loadAnim = (name: string, path: string, once = false) => {
        loader.load(path, (g) => {
          const action = mixer.clipAction(g.animations[0]);
          if (once) {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
          }
          actions[name] = action;
        });
      };

      loadAnim("idle", "/models/idle.glb");
      loadAnim("walk", "/models/walk.glb");
      loadAnim("run", "/models/run.glb");
      loadAnim("walkBack", "/models/walk-back.glb");
      loadAnim("spainDancing", "/models/spain-dancing.glb");
      loadAnim("hiphopDancing", "/models/hiphop-dancing.glb");
      loadAnim("jump", "/models/jump.glb", true);
      loadAnim("jumpBack", "/models/jump-back.glb", true);
      loadAnim("idleJump", "/models/idle-jump.glb", true);
    });

    // =====================
    // LOOP
    // =====================
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1); // Cap delta for safety
      mixer?.update(delta);

      if (!character) return renderer.render(scene, camera);

      if (gameStateRef.current === GameState.INTRO) {
        if (introTextGroup) {
          introTextGroup.position.copy(character.position);
          introTextGroup.position.y += 0.7;
          introTextGroup.lookAt(camera.position);
        }
        if (autoProgressIntro && !returningToIntro) {
          introProgress += delta * 1.5;
          if (introProgress >= 1) {
            introProgress = 1;
            introFinished = true;
          }
        }
        if (returningToIntro) {
          character.position.lerp(
            new THREE.Vector3(spawnPosition.x, introStartY, spawnPosition.z),
            0.05,
          );
          character.rotation.y += delta * 0.4;
          camera.position.lerp(camIntroStart, 0.05);
          if (
            character.position.distanceTo(
              new THREE.Vector3(spawnPosition.x, introStartY, spawnPosition.z),
            ) < 0.05
          ) {
            character.position.set(
              spawnPosition.x,
              introStartY,
              spawnPosition.z,
            );
            introProgress = 0;
            returningToIntro = false;
          }
        } else {
          character.position.y =
            introStartY - introProgress * (introStartY - introEndY);
          if (character.position.y > 0.1)
            character.position.y += Math.sin(clock.elapsedTime * 1.5) * 0.15;
          character.rotation.y += delta * 0.5;
          camera.position.lerpVectors(
            camIntroStart,
            character.position.clone().add(new THREE.Vector3(0, 1.6, -3)),
            introProgress,
          );
        }
        cameraTarget.lerp(
          character.position.clone().add(new THREE.Vector3(0, 1, 0)),
          0.15,
        );
        camera.lookAt(cameraTarget);

        if (introFinished && character.position.y <= 0) {
          if (introTextGroup) introTextGroup.visible = false;
          if (startBtnSprite) startBtnSprite.visible = false;
          character.position.y = 0;
          gameStateRef.current = GameState.GAME;
          setGameState(GameState.GAME);
          play("idle");
        }
      }

      if (gameStateRef.current === GameState.GAME) {
        if (isJumping) {
          velocityY += gravity * delta;
          character.position.y += velocityY * delta;
          if (character.position.y <= 0) {
            character.position.y = 0;
            isJumping = false;
          }
        }

        let speed = 0;
        let dirZ = 0;

        const moveForward =
          keyCodes["KeyW"] || joystickData.current.forward > 0.1;
        const moveBackward =
          keyCodes["KeyS"] || joystickData.current.forward < -0.1;
        const turnLeft = keyCodes["KeyA"] || joystickData.current.turn < -0.1;
        const turnRight = keyCodes["KeyD"] || joystickData.current.turn > 0.1;

        if (keyCodes["ArrowLeft"]) cameraAngle += camRotationSpeed * delta;
        if (keyCodes["ArrowRight"]) cameraAngle -= camRotationSpeed * delta;

        const spainDance =
          keyCodes["KeyQ"] && !isJumping && !moveForward && !moveBackward;
        const hiphopDance =
          keyCodes["KeyE"] && !isJumping && !moveForward && !moveBackward;

        if (spainDance) play("spainDancing");
        if (hiphopDance) play("hiphopDancing");

        if (moveForward) {
          dirZ = 1;
          const isRunning =
            keyCodes["ShiftLeft"] || joystickData.current.forward > 0.8;
          speed = isRunning ? runSpeed : walkSpeed;
          if (!isJumping) play(isRunning ? "run" : "walk");
        }
        if (moveBackward) {
          dirZ = -1;
          speed = walkSpeed;
          if (!isJumping) play("walkBack");
        }
        if (
          !moveForward &&
          !moveBackward &&
          !isJumping &&
          activeAction !== actions.idle &&
          !spainDance &&
          !hiphopDance
        )
          play("idle");

        if (turnLeft)
          character.rotation.y +=
            rotationSpeed *
            delta *
            (joystickActive ? Math.abs(joystickData.current.turn) : 1);
        if (turnRight)
          character.rotation.y -=
            rotationSpeed *
            delta *
            (joystickActive ? Math.abs(joystickData.current.turn) : 1);

        if (speed !== 0) {
          const dir = new THREE.Vector3(0, 0, dirZ);
          dir.applyQuaternion(character.quaternion);
          const finalSpeed = joystickActive
            ? speed * Math.abs(joystickData.current.forward)
            : speed;
          character.position.addScaledVector(dir, finalSpeed * delta);
        }

        const camOffset = new THREE.Vector3(0, 1.6, -3);
        const totalRotation = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          character.rotation.y + cameraAngle,
        );
        camOffset.applyQuaternion(totalRotation);

        camera.position.lerp(character.position.clone().add(camOffset), 0.1);
        cameraTarget.lerp(
          character.position.clone().add(new THREE.Vector3(0, 1, 0)),
          0.15,
        );
        camera.lookAt(cameraTarget);
      }
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
      renderer.dispose();
      mountNode.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoystickMove = (e: React.PointerEvent) => {
    if (!joystickActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2;
    if (dist > maxRadius) {
      dx *= maxRadius / dist;
      dy *= maxRadius / dist;
    }
    setVisualPos({ x: dx, y: dy });
    joystickData.current = { forward: -dy / maxRadius, turn: dx / maxRadius };
  };

  return (
    <Card className="relative w-screen h-[calc(100vh-64px)] bg-background rounded-none overflow-hidden font-sans select-none ">
      {/* Full screen loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background z-[200] flex flex-col items-center justify-center  ">
          <Spinner size="lg" color="white" />
          <p className="mt-4 text-sm font-medium animate-pulse">
            Loading Model...
          </p>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* Desktop Hint UI */}
      {!isMobile && gameState === GameState.GAME && showHint && !isLoading && (
        <Card
          isBlurred
          className="fixed top-20 left-5 z-[100] min-w-[240px] p-5 rounded-[15px] border border-white/20"
        >
          <h3 className="m-0 mb-2.5 text-base font-bold">🎮 Controls</h3>
          <ul className="m-0 p-0 list-none text-sm leading-[1.8]">
            <li>
              <span className="font-bold">← →</span> - Rotate Camera
            </li>
            <li>
              <span className="font-bold">W, A, S, D</span> - Move Character
            </li>
            <li>
              <span className="font-bold">Space</span> - Jump
            </li>
            <li>
              <span className="font-bold">Shift</span> - Run
            </li>
            <li>
              <span className="font-bold">Q, E</span> - Dance Moves
            </li>
          </ul>
          <Button
            onClick={() => setShowHint(false)}
            className="mt-[15px] w-full p-2 bg-white/20 hover:bg-white/30  font-bold rounded-lg transition-colors cursor-pointer"
          >
            Got it!
          </Button>
        </Card>
      )}

      {/* Only show controls if game started AND loading is done */}
      {gameState === GameState.GAME && !isLoading && (
        <>
          <Button
            onClick={() => backToIntroRef.current()}
            className="fixed top-20 right-5 z-10 cursor-pointer"
          >
            <MdRestartAlt className="text-xl" />
            Restart
          </Button>

          {isMobile && (
            <>
              {/* Mobile Dance Buttons */}
              <Card
                onPointerDown={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { code: "KeyQ" }),
                  )
                }
                onPointerUp={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keyup", { code: "KeyQ" }),
                  )
                }
                className="fixed bottom-[140px] right-[60px] z-10 !w-10 !h-10 p-0 rounded-full font-bold flex items-center justify-center"
              >
                Q
              </Card>
              <Card
                onPointerDown={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { code: "KeyE" }),
                  )
                }
                onPointerUp={() =>
                  window.dispatchEvent(
                    new KeyboardEvent("keyup", { code: "KeyE" }),
                  )
                }
                className="fixed bottom-[120px] right-[120px] z-10 !w-10 !h-10 p-0 !max-h-10 rounded-full font-bold flex items-center justify-center"
              >
                E
              </Card>
              {/* Mobile Jump Button */}
              <Card
                onPointerDown={() => mobileJumpRef.current()}
                className="fixed bottom-10 right-10 z-10 w-20 h-20 rounded-full font-bold flex items-center justify-center"
              >
                JUMP
              </Card>

              {/* Joystick */}
              <div
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setJoystickActive(true);
                }}
                onPointerMove={handleJoystickMove}
                onPointerUp={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                  setJoystickActive(false);
                  setVisualPos({ x: 0, y: 0 });
                  joystickData.current = { forward: 0, turn: 0 };
                }}
                className="fixed bottom-5 left-5 z-10 w-[120px] h-[120px] bg-white/10 rounded-full flex items-center justify-center touch-none"
              >
                <div
                  className="w-[50px] h-[50px] bg-white rounded-full pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${visualPos.x}px, ${visualPos.y}px)`,
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
