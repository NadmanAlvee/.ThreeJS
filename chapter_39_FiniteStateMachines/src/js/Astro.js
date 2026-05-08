import { GameEntity, StateMachine } from "yuka";
import { IdleState, walkState, runState, swordSlashState } from "./States";

class Astro extends GameEntity {
  constructor(mixer, animations) {
    super();
    this.mixer = mixer;
    this.animations = animations;

    this.stateMachine = new StateMachine(this);

    this.stateMachine.add("IDLE", new IdleState());
    this.stateMachine.add("WALK", new walkState());
    this.stateMachine.add("RUN", new runState());
    this.stateMachine.add("SWORD_SLASH", new swordSlashState());

    this.stateMachine.changeTo("IDLE");

    this.crossFadeDuration = 1;

    this.isIdle = false;
    this.isWalking = false;
    this.isRunning = false;
    this.playingSwordSlash = false;

    this.energy = 0;
    this.deltaTime = 0;
  }

  update(delta) {
    this.mixer.update(delta);

    this.stateMachine.update();

    this.deltaTime = delta;

    return this;
  }
}

export { Astro };
