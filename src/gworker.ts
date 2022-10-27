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

const getAvailableEnergy = (room: Room) => {
  const containEnergyStructures = room.find<StructureExtension | StructureSpawn>(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      return structure.structureType === 'extension' || structure.structureType === 'spawn'
    }
  })

  let energy = 0
  containEnergyStructures.forEach(item => {
    energy += item.store.energy
  })

  return energy
}

export function gWorker(room: Room) {
  if (workerCount() >= 6) {
    return;
  }

  let spawn = Game.spawns["Spawn1"];
  let energy = getAvailableEnergy(room);
  let miniBody = [WORK, CARRY, MOVE]
  let body: BodyPartConstant[] = [];
  let name = _workerPrefix + "-" + Game.time;

  for (let i = 0; i<Math.floor(energy / 200); i++) {
    body.push(...miniBody)
  }
  // if (energy >= 200 && energy < 300 && Object.keys(Game.creeps).length < 2) {
  //   body = [WORK, CARRY, MOVE];
  // } else if (energy >= 300) {
  //   body = [WORK, CARRY, CARRY, MOVE, MOVE];
  // }

  if (body.length == 0) {
    return;
  }

  spawn.spawnCreep(body, name, {
    memory: {
      status: creepsConstant.STATUS_WAIT
    }
  });

  console.log(`正在生产Creep，body为${JSON.stringify(body)}`)
}
