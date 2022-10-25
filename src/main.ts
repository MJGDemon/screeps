import { ErrorMapper } from "utils/ErrorMapper";
import { gWorker, workers } from "./gworker";
import cree from "./cree";

declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    srcTarget?: Id<Source>;
    status: number;
    working?: (creep: Creep) => void;
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
    }
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  clear();
  gWorker();
  for (let worker of workers()) {
    cree.run(worker);
  }
});
