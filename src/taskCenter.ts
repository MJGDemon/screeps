import { ValueOf } from "utils"


export type MemoryPendingTaskList = MemoryPendingTaskItem[]

export type MemoryWorkingTaskList = MemoryWorkingTaskItem[]

export interface MemoryPendingTaskItem {
    id: string
    type: ValueOf<typeof taskEnumList>
}

interface MemoryWorkingTaskItem {
    id: string
    type: ValueOf<typeof taskEnumList>
    creep: string
}

export const enum taskEnumList {
    UPGRADE = 1,
    BUILD = 2,
    STORE_ENERGY = 3
}

const maxTaskCount = {
    [taskEnumList.STORE_ENERGY]: 1,
    [taskEnumList.UPGRADE]: 2,
    [taskEnumList.BUILD]: 2
}

const needStoreTask = (room: Room) => {
    let targets = room.find(FIND_STRUCTURES, {
        filter: (structure: any) => {
            return (
                (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });
    let pendingStoreTaskCount = Memory.taskList.pendingTaskList.filter(item => item.type === taskEnumList.STORE_ENERGY).length
    let workingStoreTaskCount = Memory.taskList.workingTaskList.filter(item => item.type === taskEnumList.STORE_ENERGY).length
    if (targets.length > 0 && workingStoreTaskCount < maxTaskCount[taskEnumList.STORE_ENERGY] && pendingStoreTaskCount === 0) {
        publishTask(taskEnumList.STORE_ENERGY)
    }
}

const needBuild = (room: Room) => {
    let constructSite = room.find(FIND_MY_CONSTRUCTION_SITES)
    let pendingBuildTaskCount = Memory.taskList.pendingTaskList.filter(item => item.type === taskEnumList.BUILD).length
    let workingBuildTaskCount = Memory.taskList.workingTaskList.filter(item => item.type === taskEnumList.BUILD).length
    if(constructSite.length > 0 && workingBuildTaskCount < maxTaskCount[taskEnumList.BUILD] && pendingBuildTaskCount === 0) {
        publishTask(taskEnumList.BUILD)
    }
}

const needUpgrade = (room: Room) => {
    let pendingUpgradeTaskCount = Memory.taskList.pendingTaskList.filter(item => item.type === taskEnumList.UPGRADE).length
    let workingUpgradeTaskCount = Memory.taskList.workingTaskList.filter(item => item.type === taskEnumList.UPGRADE).length
    if(pendingUpgradeTaskCount < maxTaskCount[taskEnumList.UPGRADE] && workingUpgradeTaskCount === 0) {
        publishTask(taskEnumList.UPGRADE)
    }
}

const publishTask = (type: ValueOf<typeof taskEnumList>) => {
    Memory.taskList.pendingTaskList.push({
        id: 'task' + Game.time,
        type,
    })
    console.log(`已发布任务,类型为${type}`)
}

export const initTaskCenter = (room: Room) => {
    if(Memory.taskList === undefined) {
        Memory.taskList = {
            pendingTaskList: [],
            workingTaskList: []
        }
    }
}

export const runTaskCenter = (room: Room) => {
    needStoreTask(room)
    needUpgrade(room)
    needBuild(room)
}
