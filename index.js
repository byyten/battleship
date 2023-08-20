
const vessels = ['submarine','destroyer','cruiser','battleship','aircraft carrier']
class ship {
    constructor (length, prfx = 'nato_') {
        this._length = length
        this._hits = 0
        this._type = vessels[length - 1]
        this._id = prfx + parseInt(Date.now().toString().slice(-4) * Math.random())
        //let _grids = []
        //let grid = (ref) => _grids.push(ref)
        // return { length, hit, isSunk, hits, _id, _type, state } //, _grids, grid
    }  
    hit() { return this._hits += 1 }
    hits() { return this._hits }
    isSunk() { return this._hits === this._length ? true : false }
    state() { 
        return (`  
            ${this._id.padEnd(10, ' ')}  ${this._type.padEnd(20, ' ')} ${this._hits}/${this._length} 
            ${parseInt((1 - this._hits/this._length)*100).toString().padStart(8, ' ')}% 
        `) 
    }
}

class build {
    constructor() {
        this.cols = 'abcdefghij'
        this.rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]        
        this._deployment = []
        this._salvos = []
        this._hits = []
        this.board = {}
        for (let c = 0; c < 10; c++) {
            for (let r = 0; r < 10; r++) {
                // console.log(rc([c, r]))
                this.board[this.rc([r, c])] = { salvo: false, vessel: false }
            }
        }
    }
    deployment() { return this._deployment }
    salvos() { return this._salvos }
    hits() { return this._hits }
    reset() {
        this._salvos = []
        this._deployment = []
        this._hits = []
    }
    rc (coord)  {
        let c
        let r 
        let n
        if (coord instanceof Array) {  // arrays are coordinates in their conventional sense
            c = this.cols[coord[0]] == undefined ? false : this.cols[coord[0]]
            r = this.rows[coord[1]] == undefined ?  'invalid' : this.rows[coord[1]]  // console.log([c, r])
            return  c && r !== 'invalid' ? this.cols[coord[0]] + this.rows[coord[1]] : false
        } else {
            // strings are grid references that are translated to coordinates
            c = this.cols.indexOf(coord.slice(0,1)) == -1  ? 'invalid' : this.cols.indexOf(coord.slice(0,1))
            n = Number(coord.slice(1)) - 1 
            r = n >= 0 && n < 10 ? n : 'invalid' 
            return ((c !== 'invalid' && r !== 'invalid') ? [c, r] : false )      
        } 
    }  
    salvo (coords)  {
        let gridref
        if (coords instanceof Array) {
            gridref = this.rc(coords)
        } else {
            gridref = coords
        }
        if (this._salvos.includes(gridref)) { // if already hit that grid negate hit (for computer random shoots)
            return -1
        } else { // can mark the salvo
            this.board[gridref].salvo = true
            this._salvos.push(gridref)
        }
        if (this.board[gridref].vessel) { // .vessel == false | { length, hit, isSunk, ... }
            // add hit to ship
            this.board[gridref].vessel.hit()
            this._hits.push(gridref);
            return this.board[gridref].vessel.isSunk() ? [true, this.board[gridref].vessel.hits()] : [false, this.board[gridref].vessel.hits()]
        } else { 
            return [false, 0] 
        }
    }
    randomSalvo() { return  [parseInt(Math.random() * 10), parseInt(Math.random() * 10)] }
    randomOKSalvo() {
        let potShot = false
        let shot = ''
        while ( !potShot ) {
            shot = this.rc(this.randomSalvo())
            potShot = !this._salvos.includes(shot)
        }
        return shot
    }   
    areValid (start, end)  {
        // start = 'a1' ; end = 'a5'
        if (start instanceof Array || end instanceof Array) {
            return "invalid references: grid references are strings like 'a1'"
        }
        let st = this.rc(start) 
        let en = this.rc(end)
        if ( !(st && en) ) {
            return 'invalid grid references'
        } 
        let x = Math.abs(st[0] - en[0])
        let y = Math.abs(st[1] - en[1])
        let width = x == 0 ? x + 1 : y + 1
        let length = y == 0 ? y + 1 : x + 1
        if (length > 5 || width !== 1  ) {  return 'invalid vessel' }
        return true
    }
    vesselLength (start, end)  {
        // st = rc('d3'); en = rc('e3')    // st = rc('e9'); en = rc('e13') // st = rc('e9'); en = rc('e13')
        let st = this.rc(start) 
        let en = this.rc(end)
        let x = Math.abs(st[0] - en[0])
        let y = Math.abs(st[1] - en[1])
        let width = x == 0 ? x + 1 : y + 1
        let length = y == 0 ? x + 1 : y + 1 // : x + 1
        return [width, length]
    }
    placement (start, end, vessel){
        // start = 'j3'  // end = 'j7'
        let arevalid = this.areValid(start, end) 
        if (arevalid) {
            let st = this.rc(start) 
            let en = this.rc(end)
            // let width, len
            // [width, len] = vesselLength(start, end)
            // let vssl = ship(len) // v = ship(3)  v.grid('j5')  z = ship(1, 'nazi_') z.hit() 
    
            let xfrom = Math.min(st[0], en[0])
            let xto = Math.max(st[0], en[0])
            let yfrom = Math.min(st[1], en[1])
            let yto = Math.max(st[1], en[1])
    
            for (let r = xfrom; r <= xto; r++ ) {
                for (let c = yfrom; c <= yto; c++) {
                    let gridref = this.rc([r,c])
                    // vessel.grid(gridref)
                    this._deployment.push(gridref)
                    this.board[gridref].vessel = vessel
                }
            }
        }
    }    
    isGrid (gridref) { return (this.board[gridref].vessel === false ? false : true)  } // board['e10'].vessel   deployment('e10')
    isGridOccupied (gridrefs) { return gridrefs.map(ref => { return { ref: ref, occ: this._deployment.includes(ref) }}) }
}

class player {
    constructor (name, callSign) {
        this.name = name
        this.board = new build()
        this.ac = new ship(5, callSign)
        this.bs = new ship(4, callSign)
        this.cr = new ship(3, callSign)
        this.ds1 = new ship(2, callSign)
        this.ds2 = new ship(2, callSign)
        this.sb1 = new ship(1, callSign)
        this.sb2 = new ship(1, callSign)
        this.fleet = [ this.ac, this.bs, this.cr, this.ds1, this.ds2, this.sb1, this.sb2 ]    
    }
    redeploy() {
        this.board.placement('e5', 'e9', this.fleet[0]);
        this.board.placement('b3', 'b6', this.fleet[1]);
        this.board.placement('g6', 'g8', this.fleet[2]);
        this.board.placement('f2', 'f3', this.fleet[3]);
        this.board.placement('c8', 'c9', this.fleet[4]);
        this.board.placement('a10', 'a10', this.fleet[5]);
        this.board.placement('j10', 'j10', this.fleet[6]);
    }
    gameOver() { return (this.board.hits().length >= 18 ? true : false) }
    state() { 
        let msg = name + '\n' 
        msg += this.fleet.map(vss => vss.state() ).join('\n')
        msg += '\n\n  ' + parseInt((1 - this.board.hits().length / this.board.deployment().length) * 100) + '% force strength' 
        console.log( msg)
    }
}

let enemies = new player('Fachists', 'facha_')
enemies.redeploy(enemies)    

let allies = new player('Allies', 'nato_')
allies.redeploy(allies)

/* 
    // for jesting
    module.exports = { enemies, allies }

    // for internal testing
    play = (enemies, allies) => {
        boardReset()
        // for (let n = 0; n < rounds; n++) {
        while (!enemies.gameOver() && !allies.gameOver()) {
            enemies.board.salvo(enemies.board.randomOKSalvo());
            allies.board.salvo(allies.board.randomOKSalvo());  
        }
        winner = enemies.gameOver() ? 'allies' : 'enemies'
        allies.state()
        enemies.state()
        console.log('Winner is ' + winner + ' in rounds ' + enemies.board.salvos().length)
    }

 */


//  interface code    ---------------------------------------

class combatentUI { 
    constructor(combatent, combatentui, opposition, oppositionui) {
        this._combatent = combatent
        this._opposition = opposition   
        this._oppositionui = oppositionui
        this._ui = combatentui
        this._name = combatentui.querySelector('td.name')
        this._deployed = combatentui.querySelector('td.deployed')
        this._strength = combatentui.querySelector('td.strength')
        this._hits = combatentui.querySelector('td.hits')
        this._grids = combatentui.querySelectorAll('td.gridSq')
        this._deployment = {}
        this._salvosAt = combatentui.querySelector('table.grid')
        this._deployedTo = combatentui.querySelector('table.deploy')
        this.config()

    }
    updateStrength() { (this._strength.textContent = Math.round((1 - this._combatent.board.hits().length / 18) * 100) + '%')}
    updateHits() {(this._hits.textContent = this._combatent.board.hits().length + '/' + this._combatent.board.deployment().length)}
    updateDeployed(){ (this._deployed.textContent = Math.round((this._combatent.board.deployment().length / 18) * 100) + '%')}
    deployedTo() {
        this._combatent.board._deployment.forEach(grid => this._deployedTo.querySelector('.' + grid).classList.add('vessel'))
    }
    config() {
        this._name.textContent = this._combatent.name
        this.updateStrength()
        this.updateHits()
        this.updateDeployed()
        this.deployedTo()
        this._grids.forEach(grid => { 
            grid.addEventListener('click', (evt) => this.salvo(evt)) 
        })
    }
    reset() {
        this._combatent.board.reset()   
        this._combatent.redeploy()
        this._grids.forEach(grid => {
            grid.classList.remove('directhit', 'salvo')
        })
        this.updateStrength()
        this.updateHits()  
        this.updateDeployed() 
    } 
    salvo (evt) {
        let gridref = evt.target.classList[1]

        let result = this._opposition.board.salvo(gridref)
        console.log('salvo on ' + gridref + ' result' + result)

        let owngrid = this._salvosAt.querySelector('.' + gridref)
        // now attend to opposition
        let grid = this._oppositionui.querySelector('table.deploy').querySelector('.' + gridref)
        if (result[1] > 0) { // a hit 
            // evt.target.classList.add('directhit') // colour up square
            grid.classList.add('directhit')
            grid.innerHTML = '❌' // '✖'
            // update stats
            let _strength = this._oppositionui.querySelector('td.strength')// .textContent
            _strength.textContent = Math.round((1 - this._opposition.board.hits().length / 18) * 100) + '%'
            let _hits = this._oppositionui.querySelector('td.hits') // .textContent
            _hits.textContent =  this._opposition.board.hits().length + '/' + this._opposition.board.deployment().length // this._opposition.updateHits()    

            owngrid.classList.add('directhit')
            owngrid.innerHTML = '❌' // '✖'
        } else { // mark as a prior salvo
            // evt.target.classList.add('salvo') // colour up square
            owngrid.classList.add('salvo') // colour up square
            owngrid.innerHTML = '⛆'
            grid.classList.add('salvo') // colour up square
            grid.innerHTML = '⛆'

        }


    } 
}

let alliesui = document.querySelector('.combatent.good')
let enemiesui = document.querySelector('.combatent.evil')

let force_allies = new combatentUI(allies, alliesui, enemies, enemiesui)
let force_enemies = new combatentUI(enemies, enemiesui, allies, alliesui)

























/* 

destroyFleet = (navy) => {
    console.log(navy.board.salvo('a10'))
    console.log(navy.board.salvo('j10'))
    //
    console.log(navy.board.salvo('c8'))
    console.log(navy.board.salvo('c9'))
    //
    console.log(navy.board.salvo('f2'))
    console.log(navy.board.salvo('f3'))
    //
    console.log(navy.board.salvo('g6'))
    console.log(navy.board.salvo('g7'))
    console.log(navy.board.salvo('g8'))
    //
    console.log(navy.board.salvo('b3'))
    console.log(navy.board.salvo('b4'))
    console.log(navy.board.salvo('b5'))
    console.log(navy.board.salvo('b6'))
    // 
    console.log(navy.board.salvo('e5'))
    console.log(navy.board.salvo('e6'))
    console.log(navy.board.salvo('e7'))
    console.log(navy.board.salvo('e8'))
    console.log(navy.board.salvo('e9'))
    console.log(navy.fleet[6].isSunk())
    console.log(navy.fleet[5].isSunk())
    console.log(navy.fleet[4].isSunk())
    console.log(navy.fleet[3].isSunk())
    console.log(navy.fleet[2].isSunk())
    console.log(navy.fleet[1].isSunk())
    console.log(navy.fleet[0].isSunk())
    navy.state()
}
function evilReset() {
    enemies = player('Fachists', 'facha_')
    //enemies.redeploy(enemies)    
} 
function alliesReset ()  {
    // allies = player('Allies', 'nato_')
    //allies.redeploy(allies)
} 

 */


// combatentUI = (combatent, combatentui, oppositionui) => {
//     let _combatent = combatent
//     let _opposition = oppositionui
//     let _ui = combatentui
//     let _name = combatentui.querySelector('td.name')
//     let _deployed = combatentui.querySelector('td.deployed')
//     let _strength = combatentui.querySelector('td.strength')
//     let _hits = combatentui.querySelector('td.hits')
//     let _grids = combatentui.querySelectorAll('td.gridSq')
//     let _deployment = {}
//     function updateStrength() { (_strength.textContent = Math.round((1 - _combatent.board.hits().length / 18) * 100) + '%')}
//     function updateHits() {(_hits.textContent = _combatent.board.hits().length + '/' + _combatent.board.deployment().length)}
//     function updateDeployed(){ (_deployed.textContent = Math.round((_combatent.board.deployment().length / 18) * 100) + '%')}
//     function config() {
//         _name.textContent = _combatent.name
//         updateStrength()
//         updateHits()
//         updateDeployed()
//         _grids.forEach(grid => { 
//             grid.addEventListener('click', (evt) => salvo(evt)) 
//         })
//     }
//     function reset() {
//         _combatent.board.reset()   
//         _combatent.redeploy()
        
//         _grids.forEach(grid => {
//             grid.classList.remove('directhit', 'salvo')
//         })
//         updateStrength()
//         updateHits()  
//         updateDeployed() 
//     } 
//     function salvo (evt) {
//         gridref = evt.target.classList[1]
//         // let rc = _combatent.board.rc(gridref)
//         // let idx = rc[0] * 10 + rc[1]
//         _opposition.querySelector('.' + gridref).click()

//         // //force_allies._ui.querySelector('.a10').click()
//         // gridref = evt.target.classList[1]
//         // result = _combatent.board.salvo(gridref)
//         // console.log('salvo on ' + gridref + ' result' + result)
//         // if (result[1] > 0) { // a hit 
//         //     evt.target.classList.add('directhit') // colour up square
//         //     // update stats
//         //     updateStrength()
//         //     updateHits()    
//         // } else { // mark as a prior salvo
//         //     evt.target.classList.add('salvo') // colour up square
//         // }
        
//     } 
//     config()
//     return { _combatent, config, reset, salvo, updateDeployed, updateHits, updateStrength, _grids, _ui, _opposition }
// }

// alliesgrids = document.querySelector('.combatent.good')
// enemiesgrids = document.querySelector('.combatent.evil')

// force_allies = combatentUI(allies, alliesgrids, enemiesgrids)
// force_enemies = combatentUI(enemies, enemiesgrids, alliesgrids)




















// build = () => {
//     const cols = 'abcdefghij'
//     const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
//     let _deployment = []
//     let _salvos = []
//     let _hits = []
//     let board = {}
//     let deployment = () => _deployment
//     let salvos = () => _salvos
//     let hits = () => _hits
//     let reset = () => {
//         _salvos = []
//         _deployment = []
//         _hits = []
//     }
//     let rc = (coord) => {
//         let c
//         let r 
//         let n
//         if (coord instanceof Array) {  // arrays are coordinates in their conventional sense
//             c = cols[coord[0]] == undefined ? false : cols[coord[0]]
//             r = rows[coord[1]] == undefined ?  'invalid' : rows[coord[1]]  // console.log([c, r])
//             return  c && r !== 'invalid' ? cols[coord[0]] + rows[coord[1]] : false
//         } else {
//             // strings are grid references that are translated to coordinates
//             c = cols.indexOf(coord.slice(0,1)) == -1  ? 'invalid' : cols.indexOf(coord.slice(0,1))
//             n = Number(coord.slice(1)) - 1 
//             r = n >= 0 && n < 10 ? n : 'invalid' 
//             return ((c !== 'invalid' && r !== 'invalid') ? [c, r] : false )      
//         } 
//     }  
//     let salvo = (coords) => {
//         let gridref
//         if (coords instanceof Array) {
//             gridref = rc(coords)
//         } else {
//             gridref = coords
//         }
//         if (_salvos.includes(gridref)) { // if already hit that grid negate hit (for computer random shoots)
//             return -1
//         } else { // can mark the salvo
//             board[gridref].salvo = true
//             _salvos.push(gridref)
//         }
//         if (board[gridref].vessel) { // .vessel == false | { length, hit, isSunk, ... }
//             // add hit to ship
//             board[gridref].vessel.hit()
//             _hits.push(gridref);
//             return board[gridref].vessel.isSunk() ? [true, board[gridref].vessel.hits()] : [false, board[gridref].vessel.hits()]
//         } else { 
//             return [false, 0] 
//         }
//     }
//     let randomSalvo = () => [parseInt(Math.random() * 10), parseInt(Math.random() * 10)]
//     let randomOKSalvo = () => {
//         let potShot = false
//         let shot = ''
//         while ( !potShot ) {
//             shot = rc(randomSalvo())
//             potShot = !_salvos.includes(shot)
//         }
//         return shot
//     }
//     // let ship = ship
//     // let ship = (length, prfx = 'nato_') => {
//     //     let _length = length
//     //     let _hits = 0
//     //     let _type = vessels[length - 1]
//     //     let _id = prfx + parseInt(Date.now().toString().slice(-4) * Math.random())
//     //     //let _grids = []
//     //     //let grid = (ref) => _grids.push(ref)
//     //     let hit = () => _hits += 1
//     //     let hits = () => _hits
//     //     let isSunk = () => _hits === _length ? true : false 
//     //     let state = () => { return (`  ${_id.padEnd(10, ' ')}  ${_type.padEnd(20, ' ')} ${_hits}/${_length} ${parseInt((1 - _hits/_length)*100).toString().padStart(8, ' ')}% `) }
//     //     return { length, hit, isSunk, hits, _id, _type, state } //, _grids, grid
//     // }        
//     let areValid = (start, end) => {
//         // start = 'a1' ; end = 'a5'
//         if (start instanceof Array || end instanceof Array) {
//             return "invalid references: grid references are strings like 'a1'"
//         }
//         let st = rc(start) 
//         let en = rc(end)
//         if ( !(st && en) ) {
//             return 'invalid grid references'
//         } 
//         let x = Math.abs(st[0] - en[0])
//         let y = Math.abs(st[1] - en[1])
//         let width = x == 0 ? x + 1 : y + 1
//         let length = y == 0 ? y + 1 : x + 1
//         if (length > 5 || width !== 1  ) {  return 'invalid vessel' }
//         return true
//     }
//     let vesselLength = (start, end) => {
//         // st = rc('d3'); en = rc('e3')    // st = rc('e9'); en = rc('e13') // st = rc('e9'); en = rc('e13')
//         let st = rc(start) 
//         let en = rc(end)
//         let x = Math.abs(st[0] - en[0])
//         let y = Math.abs(st[1] - en[1])
//         let width = x == 0 ? x + 1 : y + 1
//         let length = y == 0 ? x + 1 : y + 1 // : x + 1
//         return [width, length]
//     }
//     let placement = (start, end, vessel) => {
//         // start = 'j3'  // end = 'j7'
//         let arevalid = areValid(start, end) 
//         if (arevalid) {
//             let st = rc(start) 
//             let en = rc(end)
//             // let width, len
//             // [width, len] = vesselLength(start, end)
//             // let vssl = ship(len) // v = ship(3)  v.grid('j5')  z = ship(1, 'nazi_') z.hit() 
    
//             let xfrom = Math.min(st[0], en[0])
//             let xto = Math.max(st[0], en[0])
//             let yfrom = Math.min(st[1], en[1])
//             let yto = Math.max(st[1], en[1])
    
//             for (let r = xfrom; r <= xto; r++ ) {
//                 for (let c = yfrom; c <= yto; c++) {
//                     let gridref = rc([r,c])
//                     // vessel.grid(gridref)
//                     _deployment.push(gridref)
//                     board[gridref].vessel = vessel
//                 }
//             }
//         }
//     }    
//     let isGrid = (gridref) => (board[gridref].vessel === false ? false : true)  // board['e10'].vessel   deployment('e10')
//     let isGridOccupied = (gridrefs) => gridrefs.map(ref => { return { ref: ref, occ: _deployment.includes(ref) }})
//     for (let c = 0; c < 10; c++) {
//         for (let r = 0; r < 10; r++) {
//             // console.log(rc([c, r]))
//             board[rc([r, c])] = { salvo: false, vessel: false }
//         }
//     }
//     return { board, deployment, isGrid, isGridOccupied, placement, salvo, salvos, hits, rc, areValid, vesselLength, randomOKSalvo, reset }  // ,ship
// } 
// player = (name, callSign) => {
//     let board = {} 
//     board = build()
//     let ac = new ship(5, callSign)
//     let bs = new ship(4, callSign)
//     let cr = new ship(3, callSign)
//     let ds1 = new ship(2, callSign)
//     let ds2 = new ship(2, callSign)
//     let sb1 = new ship(1, callSign)
//     let sb2 = new ship(1, callSign)
//     let fleet = [ ac, bs, cr, ds1, ds2, sb1, sb2 ]
//     // let _hits = []
//     redeploy = () => {
//         board.placement('e5', 'e9', fleet[0]);
//         board.placement('b3', 'b6', fleet[1]);
//         board.placement('g6', 'g8', fleet[2]);
//         board.placement('f2', 'f3', fleet[3]);
//         board.placement('c8', 'c9', fleet[4]);
//         board.placement('a10', 'a10', fleet[5]);
//         board.placement('j10', 'j10', fleet[6]);
//     }
//     gameOver = () => (board.hits().length >= 18 ? true : false)
//     state = () => { 
//         msg = name + '\n' 
//         msg += fleet.map(vss => vss.state() ).join('\n')
//         msg += '\n\n  ' + parseInt((1 - board.hits().length / board.deployment().length) * 100) + '% force strength' 
//         console.log( msg)
//     }
//     return { name, callSign, fleet, board, state, gameOver, redeploy }
// }

// placeFleet = (navy) => {navy.board.placement('e5', 'e9', navy.fleet[0]);navy.board.placement('b3', 'b6', navy.fleet[1]);navy.board.placement('g6', 'g8', navy.fleet[2]);navy.board.placement('f2', 'f3', navy.fleet[3]);navy.board.placement('c8', 'c9', navy.fleet[4]);navy.board.placement('a10', 'a10', navy.fleet[5]);navy.board.placement('j10', 'j10', navy.fleet[6]);}
// placeFleet2 = (navy) => {navy.board.placement('e6', 'e10', navy.fleet[0]);navy.board.placement('b2', 'b5', navy.fleet[1]);navy.board.placement('g5', 'g7', navy.fleet[2]);navy.board.placement('f1', 'f2', navy.fleet[3]);navy.board.placement('c7', 'c8', navy.fleet[4]);navy.board.placement('a9', 'a9', navy.fleet[5]);navy.board.placement('j8', 'j8', navy.fleet[6]);}

































// alliedUI = (allies, alliedui) => {
//     let _allies = allies
//     let _name = alliedui.querySelector('td.name')
//     let _strength = alliedui.querySelector('td.strength')
//     let _hits = alliedui.querySelector('td.hits')
//     let _grids = alliedui.querySelectorAll('td.gridSq')
//     let _deployment = {}
//     config = () => {
//         _name.textContent = _allies.name
//         _strength.textContent = Math.round((1 - allies.board.hits().length / allies.board.deployment().length) * 100) + '%'
//         _hits.textContent = _allies.board.hits().length + '/' + allies.board.deployment().length
//         _grids.forEach(grid => { 
//             grid.addEventListener('click', (evt) => salvo(evt)) 
//         })
//     }
//     salvo = (evt) => {
//         gridref = evt.target.classList[1]
//         result = _allies.board.salvo(gridref)
//         console.log('salvo on ' + gridref + ' result' + result)
//         if (result[1] > 0) { // a hit 
//             evt.target.classList.add('directhit') // colour up square
//             // update stats

//         } else { // mark as a prior salvo
//             evt.target.classList.add('salvo') // colour up square
//         }
        
//     } 
//     config()
//     return { allies, config, salvo }
// }

// alliedui = document.querySelector('.combatent.good')

// allied = alliedUI(allies, alliedui)

// alliedUI = {
//     ui: alliedui,
//     badge: alliedui.querySelector('td.name'),
//     strength: alliedui.querySelector('td.strength'),
//     hits: alliedui.querySelector('td.hits'),
//     grids: alliedui.querySelectorAll('td.gridSq'),
//     gridClick: (evt) => console.log(evt.target.classList[1])
// }

// alliedUI.badge.textContent = 'Nato Allies'
// alliedUI.hits.textContent = allies.board.hits().length + '/' + allies.board.deployment().length
// alliedUI.strength.textContent = Math.round((1 - allies.board.hits().length / allies.board.deployment().length) * 100) + '%'


// grids = document.querySelectorAll('td.gridSq')
// //   grid = grids[0]
// //   grid.addEventListener('click', (evt) => console.log(evt.target.classList[1]))
// gridClick = (evt) => {
//     console.log(evt.target.classList[1])

// }

// grids.forEach(grid => { 
//     // console.log(evt.target.classList[1])
//     grid.addEventListener('click', (evt) => gridClick(evt)) 
//     grid.click()
// })
    
