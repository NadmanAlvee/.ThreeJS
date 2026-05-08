import { State } from "yuka";

const IDLE = "IDLE";
const WALK = "WALK";
const RUN = "RUN";
const SWORD_SLASH = "SWORD_SLASH";

class IdleState extends State {
  enter(astro) {
    const idle = astro.animations.get(IDLE);
    idle.reset().fadeIn(astro.crossFadeDuration);
  }
  execute(astro) {
    if (!astro.isRunning && astro.isWalking) {
      astro.stateMachine.changeTo(WALK);
    }
    if (astro.isRunning && !astro.isWalking) {
      astro.stateMachine.changeTo(RUN);
    }

    // automatic energy regen
    astro.energy += astro.deltaTime;

    // temp
    if (astro.energy >= 3) {
      astro.stateMachine.changeTo(WALK);
    }
  }
  exit(astro) {
    const idle = astro.animations.get(IDLE);
    idle.fadeOut(astro.crossFadeDuration);
  }
}

class walkState extends State {
  enter(astro) {
    const walk = astro.animations.get(WALK);
    walk.reset().fadeIn(astro.crossFadeDuration);
  }
  execute(astro) {
    if (astro.isIdle) {
      astro.stateMachine.changeTo(IDLE);
    }
    if (astro.isRunning && !astro.isWalking) {
      astro.stateMachine.changeTo(RUN);
    }

    // switch to idle when low energy
    astro.energy -= astro.deltaTime;
    if (astro.energy <= 0) {
      astro.stateMachine.changeTo(IDLE);
    }
  }
  exit(astro) {
    const walk = astro.animations.get(WALK);
    walk.fadeOut(astro.crossFadeDuration);
  }
}

class runState extends State {
  enter(astro) {
    const run = astro.animations.get(RUN);
    run.reset().fadeIn(astro.crossFadeDuration);
  }
  execute(astro) {
    if (astro.isIdle) {
      astro.stateMachine.changeTo(IDLE);
    }
    if (!astro.isRunning && astro.isWalking) {
      astro.stateMachine.changeTo(WALK);
    }
  }
  exit(astro) {
    const run = astro.animations.get(RUN);
    run.fadeOut(astro.crossFadeDuration);
  }
}

class swordSlashState extends State {
  enter(astro) {
    const swordSlash = astro.animations.get(SWORD_SLASH);
    swordSlash.reset().fadeIn(astro.crossFadeDuration);
  }
  execute(astro) {}
  exit(astro) {
    const swordSlash = astro.animations.get(SWORD_SLASH);
    swordSlash.fadeOut(astro.crossFadeDuration);
  }
}

export { IdleState, walkState, runState, swordSlashState };
