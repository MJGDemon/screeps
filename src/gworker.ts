import { creepsConstant } from "./constant";

export const _workerPrefix = "worker";

export function workerCount() {
  let cnt = 0;
  for (let name in Game.creeps) {
    if (/^worker/.test(name)) {
      cnt++;
    }
  }
  return cnt;
}

export function workers() {
  let creeps: Creep[] = [];
  for (let name in Game.creeps) {
    if (/^worker/.test(name)) {
      creeps.push(Game.creeps[name]);
    }
  }
  return creeps;
}

export function gWorker() {
  if (workerCount() >= 6) {
    return;
  }

  let spawn = Game.spawns["Spawn1"];
  let energy = spawn.store.energy;

  let body: BodyPartConstant[] = [];
  let name = _workerPrefix + "-" + Game.time;

  if (energy >= 200 && energy < 300 && Object.keys(Game.creeps).length < 2) {
    body = [WORK, CARRY, MOVE];
  } else if (energy >= 300) {
    body = [WORK, CARRY, CARRY, MOVE, MOVE];
  }

  if (body.length == 0) {
    return;
  }

  spawn.spawnCreep(body, name, {
    memory: {
      srcTarget: null,
      status: creepsConstant.STATUS_WAIT
    }
  });
}
