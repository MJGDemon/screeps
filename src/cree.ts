import { creepsConstant } from "./constant";
import { MemoryPendingTaskItem, taskEnumList } from './taskCenter'

export const run = (creep: Creep) => {

  if (creep.memory.status === undefined) {
    creep.memory.status = creepsConstant.STATUS_WAIT;
  }

  switch (creep.memory.status) {
    case creepsConstant.STATUS_WAIT: {
      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.status = creepsConstant.STATUS_REDUCE;
      } else {
        creep.memory.status = creepsConstant.STATUS_INC;
      }
      break;
    }
    case creepsConstant.STATUS_INC: {
      if (creep.store.getFreeCapacity() == 0) {
        reset(creep)
        run(creep)
        break;
      }

      if (creep.memory.working == undefined) {
        creep.memory.working = 0;
      }
      working(creep);
      break;
    }
    case creepsConstant.STATUS_REDUCE: {
      if (creep.store.energy == 0) {
        reset(creep)
        run(creep)
        break;
      }

      if (creep.memory.working === undefined) {
        // 无脑升级
        // creep.memory.working = 2;
        let pendingTask = Memory.taskList.pendingTaskList
        if(pendingTask.length > 0) {
          const task = pendingTask.shift() as MemoryPendingTaskItem
          Memory.taskList.workingTaskList.push({
            id: task.id,
            type: task.type,
            creep: creep.name
          })
          creep.memory.working = task.type
          console.log(`任务已被 ${creep.id} 接受 任务类型为 ${task.type}`)
        } else {
          creep.memory.working = taskEnumList.BUILD
          console.log(123)
        }
      }
      working(creep);
      break;
    }
  }
}

const reset = (creep: Creep) => {
  let workingTaskIndex = Memory.taskList.workingTaskList.findIndex(item => item.creep === creep.name)
  if(workingTaskIndex !== -1) {
    Memory.taskList.workingTaskList.splice(workingTaskIndex, 1)
    console.log(`任务已完成,任务类型 ${creep.memory.working}, 剩余能量 ${creep.store.energy}`)
  }
  creep.memory.working = undefined;
  creep.memory.srcTarget = undefined;
  creep.memory.status = creepsConstant.STATUS_WAIT;
}

const working = (creep: Creep) => {
  switch (creep.memory.working) {
    case 0:
      harvester(creep)
      creep.say("挖矿挖矿！")
      break;
    case 1:
      upgrade(creep)
      creep.say("升级升级！")
      break
    case 2:
      build(creep)
      creep.say("造家造家！")
      break
    case 3:
      transfer(creep)
      creep.say("存矿存矿！")
      break
  }
}

const harvester = (creep: Creep) => {
  if (creep.memory.srcTarget != undefined && creep.memory.srcTarget != '') {
    moveAndHarvest(creep, Game.getObjectById(creep.memory.srcTarget) as Source)
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

  let min: Id<Source> = '' as Id<Source>
  m.forEach((value, key) => {
    if (min == '') {
      min = key
      return
    }

    if (value < (m.get(min) as number)) {
      min = key
    }
  });

  moveAndHarvest(creep, Game.getObjectById(min) as Source);
  creep.memory.srcTarget = (Game.getObjectById(min) as Source).id;
}

const moveAndHarvest = (creep: Creep, src: Source) => {
  if (creep.harvest(src) == ERR_NOT_IN_RANGE) {
    creep.moveTo(src, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
}

const transfer = (creep: Creep) => {
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

const build = (creep: Creep) => {
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

const upgrade = (creep: Creep) => {
  if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller as StructureController, { visualizePathStyle: { stroke: "#ffffff" } });
  }
}
