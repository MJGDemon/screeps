import { creepsConstant } from "./constant";

let creepsBuilder = {
  run: function (creep: Creep) {
    if (creep.memory.status === undefined) {
      creep.memory.status = creepsConstant.STATUS_WAIT;
    }

    switch (creep.memory.status) {
      case creepsConstant.STATUS_WAIT: {
        if (creep.store.getFreeCapacity() == 0) {
          creep.memory.status = creepsConstant.STATUS_REDUCE;
        } else {
          creep.memory.working = harvester;
          creep.memory.srcTarget = null;
          creep.memory.status = creepsConstant.STATUS_INC;
        }
        break;
      }
      case creepsConstant.STATUS_INC: {
        if (creep.store.getFreeCapacity() == 0) {
          creep.memory.working = undefined;
          creep.memory.srcTarget = null;
          creep.memory.status = creepsConstant.STATUS_WAIT;
          break;
        }

        if (creep.memory.working == undefined) {
          creep.memory.working = harvester;
        }
        creep.memory.working(creep);
        break;
      }
      case creepsConstant.STATUS_REDUCE: {
        if (creep.store.energy == 0) {
          creep.memory.working = undefined;
          creep.memory.srcTarget = null;
          creep.memory.status = creepsConstant.STATUS_WAIT;
          break;
        }
        if (creep.memory.working == undefined) {
          // 无脑升级
          creep.memory.working = upgrader;
        }
        creep.memory.working(creep);
        break;
      }
    }
  }
};

function harvester(creep: Creep) {
  if (creep.memory.srcTarget != null) {
    if (creep.harvest(Game.getObjectById(creep.memory.srcTarget) as Source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.getObjectById(creep.memory.srcTarget) as Source, {
        visualizePathStyle: { stroke: "#ffaa00" }
      });
    }
    return;
  }

  let m = new Map<Id<Source>, number>();

  for (let src of creep.room.find(FIND_SOURCES)) {
    m.set(src.id, 0);
  }

  for (let name in Game.creeps) {
    let key = Game.creeps[name].memory.srcTarget as Id<Source>;
    if (key == undefined) {
      continue
    }
    m.set(key, (m.get(key) as number) + 1);
  }

  m.forEach((value, key) => {
    if (value < 3) {
      move(creep, Game.getObjectById(key) as Source);
      creep.memory.srcTarget = (Game.getObjectById(key) as Source).id;
    }
  });
}

function move(creep: Creep, src: Source) {
  if (creep.harvest(src) == ERR_NOT_IN_RANGE) {
    creep.moveTo(src, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

function transfer(creep: Creep) {
  var targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure: any) => {
      return (
        (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    }
  });
  if (targets.length > 0) {
    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}

function build(creep: Creep) {
  const constructSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
  if (constructSite.length > 0) {
    if (creep.build(constructSite[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(constructSite[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
    return true;
  } else {
    var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure: any) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    if (targets.length > 0) {
      if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return true;
    }
    return false;
  }
}

function upgrader(creep: Creep) {
  if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller as StructureController, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

export default creepsBuilder;
