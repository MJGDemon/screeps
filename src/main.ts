import { ErrorMapper } from "utils/ErrorMapper";
import { gWorker, workers } from "./gworker";
import {run} from "./cree";
import { MemoryPendingTaskList, MemoryWorkingTaskList, initTaskCenter, runTaskCenter, taskEnumList } from "taskCenter";
import { ValueOf } from "utils";

declare global {
  interface Memory {
    uuid: number;
    log: any;
    taskList: {
      pendingTaskList: MemoryPendingTaskList
      workingTaskList: MemoryWorkingTaskList
    }
  }

  interface CreepMemory {
    srcTarget?: Id<Source>;
    status: number;
    working?: ValueOf<typeof taskEnumList>  | 0
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

function clear() {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
      // 如果creeps做任务做到一半噶了，就把任务取消
      let index = Memory.taskList.workingTaskList.findIndex(item => item.creep === name)
      if(index !== -1) {
        Memory.taskList.workingTaskList.splice(index, 1)
      }
    }
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  clear();
  gWorker();
  initTaskCenter(Game.rooms['E52N9'])
  runTaskCenter(Game.rooms['E52N9'])
  for (let worker of workers()) {
    run(worker);
  }
});
