const getTower = (room:Room) => {
    let towers = room.find(FIND_STRUCTURES, {
        filter: (struct: Structure) => {
            return struct.structureType === 'tower'
        }
    })
    return towers as StructureTower[]
}

const getNeedRepairStructures = (room: Room) => {
    let neetRepaireStructures = room.find(FIND_STRUCTURES, {
        filter: (struct: Structure) => {
            return struct.hits < struct.hitsMax && struct.structureType !== 'constructedWall'
        }
    })
    return neetRepaireStructures
}

const getEnemys = (room: Room) => {
    let enemys = room.find(FIND_HOSTILE_CREEPS)
    return enemys
}

export const runTower = (room: Room) => {
    const towers = getTower(room)
    const enemys = getEnemys(room)
    const needRepaireStructures = getNeedRepairStructures(room)
    if(towers.length > 0) {
        if(enemys.length > 0) {
            towers.forEach(tower => tower.attack(enemys[0]))
        } else if(needRepaireStructures.length > 0) {
            towers.forEach(tower => tower.repair(needRepaireStructures[0]))
        }
    }
}
