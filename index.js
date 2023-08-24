
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

// class RowCol {
//     constructor() {
//         this.cols = 'abcdefghij'
//         this.rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]        
//     }
//     rc (coord)  {
//         let c
//         let r 
//         let n
//         if (coord instanceof Array) {  // arrays are coordinates in their conventional sense
//             c = this.cols[coord[0]] == undefined ? false : this.cols[coord[0]]
//             r = this.rows[coord[1]] == undefined ?  'invalid' : this.rows[coord[1]]  // console.log([c, r])
//             return  c && r !== 'invalid' ? this.cols[coord[0]] + this.rows[coord[1]] : false
//         } else {
//             // strings are grid references that are translated to coordinates
//             c = this.cols.indexOf(coord.slice(0,1)) == -1  ? 'invalid' : this.cols.indexOf(coord.slice(0,1))
//             n = Number(coord.slice(1)) - 1 
//             r = n >= 0 && n < 10 ? n : 'invalid' 
//             return ((c !== 'invalid' && r !== 'invalid') ? [c, r] : false )      
//         } 
//     }
// }
class RowCol {
    constructor() {
      this.cols = 'abcdefghij'
      this.rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]        
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
  }
  

class Board extends RowCol {
    constructor() {
        super(RowCol)
        // this.cols = 'abcdefghij'
        // this.rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]        
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
        // this.rowcol = new RowCol()
        // this.rc = this.rowcol
    }
    deployment() { return this._deployment }
    salvos() { return this._salvos }
    hits() { return this._hits }
    reset() {
        this._salvos = []
        this._deployment = []
        this._hits = []
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
        this.board = new Board()
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
    reset() {
        this.board.reset()
        // this.redeploy()
    }
    gameOver() { return (this.board.hits().length >= 18 ? true : false) }
    state() { 
        let msg = name + '\n' 
        msg += this.fleet.map(vss => vss.state() ).join('\n')
        msg += '\n\n  ' + parseInt((1 - this.board.hits().length / this.board.deployment().length) * 100) + '% force strength' 
        console.log( msg)
    }
}

let attacker = new player('attacker', 'facha_')
// attacker.redeploy(attacker)    

let defender = new player('defender', 'nato_')
// defender.redeploy(defender)

/* 
    // for jesting
    module.exports = { attacker, defender }

    // for internal testing
    play = (attacker, defender) => {
        boardReset()
        // for (let n = 0; n < rounds; n++) {
        while (!attacker.gameOver() && !defender.gameOver()) {
            attacker.board.salvo(attacker.board.randomOKSalvo());
            defender.board.salvo(defender.board.randomOKSalvo());  
        }
        winner = attacker.gameOver() ? 'defender' : 'attacker'
        defender.state()
        attacker.state()
        console.log('Winner is ' + winner + ' in rounds ' + attacker.board.salvos().length)
    }

 */


//  interface code    ---------------------------------------

const defenderDeployed = new Event('defenderDeployed', { bubbles: true})
const attackerDeployed = new Event('attackerDeployed', { bubbles: true})


class combatentUI { 
    constructor(combatent, combatentui, opposition, oppositionui) {
        this._combatent = combatent
        this._combatentui = combatentui
        this._opposition = opposition   
        this._oppositionui = oppositionui
        this._name = combatentui.querySelector('td.name')
        this._deployed = combatentui.querySelector('td.deployed')
        this._strength = combatentui.querySelector('td.strength')
        this._hits = combatentui.querySelector('td.hits')
        this._deployment = false
        this._salvosAt = combatentui.querySelector('table.grid')
        this._attackGrids = this._salvosAt.querySelectorAll('td.gridSq')
        this._deployedTo = combatentui.querySelector('table.deploy')
        this._deployGrids = this._deployedTo.querySelectorAll('td.gridSq')
        this._deployGrids.forEach(grid => {
            grid.addEventListener('click',  (evt) => { 
                this.deployingVessel(evt) 
                if (this._combatent.board._deployment.length === 18) {     
                    this._deployFleet.disabled = true
                    this._deployment = true
                    this.toggleDeployment()
                    this._deployedTo.classList.replace('viz', 'hid')
                    alert('Force deployment complete')
                    if (this._name === 'defender') {
                        this._deployedTo.dispatchEvent( defenderDeployed)
                    } else {
                        this._deployedTo.dispatchEvent(attackerDeployed)
                    }
                    // this._deployedTo.dispatchEvent(this._deployed)
                }
            } )
          })
        this._fleet = combatentui.querySelector('table.fleet')                                         
        console.log(this._fleet)                                                
        this._fleet_vessels = combatentui.querySelectorAll('tr.vessel')
        this._fleet_vessels.forEach((vssl, idx) => {
            vssl.setAttribute('data-idx', idx)
            vssl.addEventListener('click', (evt) => { this.startDeployVessel(vssl) }) 
        })
        this._deployFleet = this._fleet.querySelector('button.deploy')
        this._deployFleet.addEventListener('click', (evt) => {
            this.toggleDeployment(evt)
        })
        this.turn = false
        this._name.textContent = this._combatent.name
        this.updateStrength()
        this.updateHits()
        this.updateDeployed()
        // this.deployedTo()
        this._attackGrids.forEach(grid => grid.addEventListener('click', (evt) => this.salvo(evt))) 
        // this._deployGrids.forEach(grid => grid.addEventListener('click', (evt) => this.deployto(evt)))
        this._vesselToDeploy = {
            _element: {},
            _vgrids: [],
            _vidx: -1,
            _type: '',
            _targetlength: 0,
            _gridrefs: []
        }


    }
    toggleDeployment =() => {
        if (this._deployedTo.classList.contains('hid')) {
            this._deployedTo.classList.replace('hid', 'viz')
        } else {
            this._deployedTo.classList.replace('viz', 'hid')
        }
    }
    updateStrength() { (this._strength.textContent = Math.round((1 - this._combatent.board.hits().length / 18) * 100) + '%')}
    updateHits() {(this._hits.textContent = this._combatent.board.hits().length + '/' + this._combatent.board.deployment().length)}
    updateDeployed(){ (this._deployed.textContent = Math.round((this._combatent.board.deployment().length / 18) * 100) + '%')}
    // deployedTo() {
    //     this._combatent.board._deployment.forEach(grid => this._deployedTo.querySelector('.' + grid).classList.add('vessel'))
    // }    
    deployto = (evt) => {
        if (_game.combatents.defender._combatent.board._deployment > 18) { return }
        evt.target.classList.add('vessel')
        let gridref = evt.target.classList[1]
        this._combatent.board._deployment.push(gridref)  // placing a vessel by clicking grid 
        this.updateDeployed()
    }
    startDeployVessel(vssl) {
        this._vesselToDeploy = {
            _element: vssl,
            _vgrids: vssl.querySelectorAll('td.vgrid'),
            _vidx: Number(vssl.getAttribute('data-idx')),
            _type: vssl.querySelector('.type').textContent,
            _targetlength: Number(vssl.querySelector('.length').textContent),
            _gridrefs: []
        }
        alert(`Deploying vessel\n------------------------------------\n ${this._vesselToDeploy._type} length: ${this._vesselToDeploy._targetlength}\n\n click on ${this._vesselToDeploy._targetlength} consecutive squares\n vertically or horizontally to deploy vessel`)
    }
    deployingVessel(evt) { // old style declarati on to maintain this context
        if (this._vesselToDeploy._vidx === -1 ) { return }
        let gridref = evt.target.classList[1]
        if (isValid(gridref, this._vesselToDeploy._gridrefs)) {
          this._vesselToDeploy._gridrefs.push(gridref)
          evt.target.classList.add('vessel')
          
          this._vesselToDeploy._vgrids[this._vesselToDeploy._gridrefs.length - 1].classList.add('opacityLo')
        //   this._vesselToDeploy._vidx = Number(evt.target.getAttribute('data-idx'))
            // link board gridref to fleet vessel for targeting
          this._combatent.board.board[gridref].vessel = this._combatent.fleet[this._vesselToDeploy._vidx]  
          this._combatent.board._deployment.push(gridref)
          this.updateDeployed()
          this.updateHits()
          //this._vesselToDeploy._gridrefs.length
          if (this._vesselToDeploy._targetlength === this._vesselToDeploy._gridrefs.length) {
            console.log('complete') 
            // reset everything for next deployment
            this._vesselToDeploy._element.classList.add('opacityLo')

            this._vesselToDeploy = {
              _element: {},
              _vgrids: [],
              _vidx: -1,
              _type: '',
              _targetlength: 0,
              _gridrefs: []
            }
          }
        }
        console.log(this._vesselToDeploy)

    }    
    reset() {
        // this._combatent.board.reset()   
        this._combatent.reset() //.redeploy()
        this._attackGrids.forEach(grid => {
            grid.classList.remove('directhit', 'salvo')
            grid.textContent = ''
        })
        this._salvosAt.classList.replace('opacityHi','opacityLo')
        if (this._combatent._name == 'attacker') {
            this._salvosAt.classList.replace('opacityLo','opacityHi')
        }
        this._salvosAt.classList.replace('viz', 'hid')

        this.updateStrength()
        this.updateHits()  
        this.updateDeployed() 
    } 
    salvo (evt) {
        evt.preventDefault()
        if (this.turn) { 
            let gridref = evt.target.classList[1]

            let result = this._opposition.board.salvo(gridref)
            console.log('salvo on ' + gridref + ' result' + result)

            let owngrid = this._salvosAt.querySelector('.' + gridref)
            // now attend to opposition
            let grid = this._oppositionui.querySelector('table.deploy').querySelector('.' + gridref)
            if (result[1] > 0) { // a hit 
                // evt.target.classList.add('directhit') // colour up square
                grid.classList.add('directhit')
                grid.innerHTML = '❌' // ''
                // update stats
                let _strength = this._oppositionui.querySelector('td.strength')// .textContent
                _strength.textContent = Math.round((1 - this._opposition.board.hits().length / 18) * 100) + '%'
                let _hits = this._oppositionui.querySelector('td.hits') // .textContent
                _hits.textContent =  this._opposition.board.hits().length + '/' + this._opposition.board.deployment().length // this._opposition.updateHits()    

                owngrid.classList.add('directhit')
                owngrid.innerHTML = '❌' // ''
            } else { // mark as a prior salvo
                // evt.target.classList.add('salvo') // colour up square
                owngrid.classList.add('salvo') // colour up square
                owngrid.innerHTML = '⛆'
                grid.classList.add('salvo') // colour up square
                grid.innerHTML = '⛆'
            }
        }
    } 
}

let defenderui = document.querySelector('.combatent.defender')
let attackerui = document.querySelector('.combatent.attacker')

let force_defender = new combatentUI(defender, defenderui, attacker, attackerui)
let force_attacker = new combatentUI(attacker, attackerui, defender, defenderui)
let combatentuis = { defender: force_defender, attacker: force_attacker }

class game {
    constructor(combatentuis) {
        this.combatents = combatentuis // ['attacker', 'defender']
        this._game = document.querySelector('div.game')
        this._plays = this._game.querySelector('td.plays')
        this._play = this._game.querySelector('td.play')
        this._status = this._game.querySelector('td.status')
        // this.turns = 0
        // this.turn = 'attacker'
        // this.notturn = 'defender'
        // this._plays.textContent = 'none - deployment required' // 0 
        // this._play.textContent = '' // 'Attacker'
        // this._status.textContent = 'Setup: No force deployments'
        // this.combatents[this.turn].turn = true
        // this.combatents[this.notturn]._combatentui.querySelector('table.grid').classList.replace('opacityHi','opacityLo')

        this.init()
        this._game.addEventListener('defenderDeployed', (evt) => {
            this._status.textContent = 'Defender forces deployed'
            this.combatents.defender._deployment = true
            if (this.combatents.attacker._deployment && this.combatents.defender._deployment ) {
                this._status.textContent = "Forces deployed - commence battle" 
                this.combatents.attacker._salvosAt.classList.replace('hid', 'viz')
                this.combatents.defender._salvosAt.classList.replace('hid', 'viz')
                this._plays.textContent = 0
                this._play.textContent = this.turn
            }
        })
        this._game.addEventListener('attackerDeployed', (evt) => {
            this._status.textContent = 'Attacker forces deployed'
            this.combatents.attacker._deployment = true
            if (this.combatents.attacker._deployment && this.combatents.defender._deployment ) {
                this._status.textContent = "Forces deployed - commence battle" 
                this.combatents.attacker._salvosAt.classList.replace('hid', 'viz')
                this.combatents.defender._salvosAt.classList.replace('hid', 'viz')
                this._plays.textContent = 0
                this._play.textContent = this.turn
            }
        })
        
        this.combatents.defender._attackGrids.forEach(grid => grid.addEventListener('click', (evt) => { 
            // if () { return} // if no defender click do nothing
            this.switchBoard() 
        }))
        this.combatents.attacker._attackGrids.forEach(grid => grid.addEventListener('click', (evt) => { 
            // if () { return} // if no attacker click do nothing
            this.switchBoard() 
        }))
        
    }
    init = () => {
        this.turns = 0
        this.turn = 'attacker'
        this.notturn = 'defender'
        this._plays.textContent = 'none - deployment required' // 0 
        this._play.textContent = '' // 'Attacker'
        this._status.textContent = 'Setup: No force deployments'
        this.combatents[this.turn].turn = true
        this.combatents[this.notturn]._combatentui.querySelector('table.grid').classList.replace('opacityHi','opacityLo')

    }
    nextTurn() {
        this.turn = this.turn === 'attacker' ? 'defender' : 'attacker'
        this.notturn = this.turn === 'attacker' ? 'defender' : 'attacker'
        this.turns++
        this._play.textContent = this.turn.toUpperCase()
        this._plays.textContent = this.turns
    }
    switchDeployment(evt) {
        let _this = this.combatents.defender
        let _that = this.combatents.attacker
        if (evt.target.classList[1] === 'defender' ) {
            _this._deployedTo.classList.replace('hid', 'viz')
            _that._deployedTo.classList.replace('viz', 'hid')
            // if (_this._combatent.board._deployment.length == 18) {  // already deployed - toggle vis && _this.board._deployment.length == 18
            //     // let _state = _this._deployedTo.classList.contains('viz')
            //     // if (_state) {
            //         // _this._deployedTo.classList.replace('viz', 'hid')
            //     // } else {
            //         _this._deployedTo.classList.replace('hid', 'viz')
            //     // }
        // }
        } else { // attacker
            _that._deployedTo.classList.replace('hid', 'viz')
            _this._deployedTo.classList.replace('viz', 'hid')
            // if (_that._combatent.board._deployment.length == 18) {  // already deployed - toggle vis && _this.board._deployment.length == 18
            //     // let _state = _that._deployedTo.classList.contains('viz')
            //     // if (_state) {
            //         // _that._deployedTo.classList.replace('viz', 'hid')
            //     // } else {
            //         _that._deployedTo.classList.replace('hid', 'viz')
            //     // }

            // }
        }

        
        // // if has been deployed toggle vizible
        // // else 
        // _this._deployedTo.classList.replace('hid', 'viz')
        // _that._deployedTo.classList.replace('viz', 'hid')
    }
    switchBoard() {
        let gameover = this.combatents[this.notturn]._combatent.gameOver()
        if (gameover) {
            this.combatents[this.turn]._salvosAt.classList.replace('opacityLo','opacityHi')
            this.combatents[this.notturn]._salvosAt.classList.replace('opacityLo','opacityHi')

            let hits = _game.combatents[this.notturn]._combatent.board.hits().length
            let msghdr = `Game Over\n--------------------------------------\n `
            let msg = `Battle won by ${this.turn} in ${parseInt(this.turns/2)} salvos\ncausing ${hits} direct hits `
            this._status.textContent = msg
            this._play.textContent = ''
            console.log(msghdr + msg)
            alert (msghdr + msg)
             
        } else {
            this.nextTurn()
            this.combatents[this.turn].turn = true
            this.combatents[this.notturn].turn = false
            this.combatents[this.turn]._salvosAt.classList.replace('opacityLo','opacityHi')
            this.combatents[this.notturn]._salvosAt.classList.replace('opacityHi','opacityLo')
    
            console.log([this.turns, gameover, this.turn])      
        }
    } 

    resetCombatent(_this) {
        _this._fleet_vessels.forEach(vssl => {
            vssl.classList.remove('opacityLo')
            vssl.querySelectorAll('td.vgrid').forEach(vgrid=> vgrid.classList.remove('opacityLo'))
        })
        _this.reset()
        _this._combatent.board.board = new Board()
        _this._deployGrids.forEach(grid => {
            grid.classList.remove('vessel', 'salvo', 'directhit')
            grid.innerHTML = ''
        })
    }
    resetGame()  {
        let _this = this.combatents.defender
        this.resetCombatent(_this)
        let _that = this.combatents.attacker
        this.resetCombatent(_that)   
        this.init()     
      }
}


_game = new game(combatentuis)
// _game.combatents[_game.turn].turn = true
// _game.combatents[_game.notturn]._combatentui.querySelector('table.grid').classList.replace('opacityHi','opacityLo')

// _game.combatents.defender._attackGrids.forEach(grid => grid.addEventListener('click', (evt) => { _game.switchBoard() }))
// _game.combatents.attacker._attackGrids.forEach(grid => grid.addEventListener('click', (evt) => { _game.switchBoard() }))


// // on a attacker deploy button click
// _game._status.textContent = 'Attacker (the initiator) to deploy forces first'
// _game.switchDeployment( _that, _this)
// // deploy attacker forces
// // update status board
// _game._status.textContent = 'Attacker forces deployed - Defender to deploy'
// _game.switchDeployment(  _this, _that)
// // deploy defender forces
// // update status board
// _game._status.textContent = 'Attacker & Defender forces are deployed - commence battle'

// // play - make attack grids visible
// _this._salvosAt.classList.replace('hid','viz')
// _that._salvosAt.classList.replace('hid','viz')



// in development for vessel deployment
const _board = new RowCol()  
// console.log(_board)

isComplete = (array, targetLength) => (array.length === targetLength)	
isSequence = (val, array) => {
    copyAddedSort = array.slice(0)
    copyAddedSort.push(val)
    copyAddedSort.sort((a,b) => a-b)
    return (copyAddedSort.at(-1) - copyAddedSort[0] + 1 === copyAddedSort.length)
}
isUniform = (array) => (array.reduce((prev, next) => prev += next, 0) / array.length === array[0])
isAdjacent = (val, array) => (val >= array[0] - 1 && val <= array.at(-1) + 1)
isIndeterminate = (array) => (array.length < 2 ? true : false)
contains = (val, array) => (array.includes(val))

decompose = (array) => {
    // console.log(_board)
    // if (!_board.rc) { console.log('must pass in the board.rc function'); return }
    let _rowcols = array.map(_gridref => _board.rc(_gridref) )  // rows are letters, cols are numbers in gridrefs
    let _rows = _rowcols.map(_coord => _coord[0]).sort((a,b) => a-b)
    let _cols = _rowcols.map(_coord => _coord[1]).sort((a,b) => a-b)    
    return [ _rows, _cols ] // x ,y  
}
isHoriz = (array) => {
    let _rows
    let _cols
    if (array.length >= 2) {
        res = decompose(array)
        _rows = res[0]  
        _cols = res[1] 
        let _rowuniform = isUniform(_rows)
        let _coluniform = isUniform(_cols)
        let _rowsequence =  _rows.at(-1) - _rows[0] + 1 === _rows.length  //isSequence(_rows)
        let _colsequence =  _cols.at(-1) - _cols[0] + 1 === _cols.length // isSequence(_cols)
        
        if (_rowuniform && !_coluniform ) { // && _rowsequence
            return true // is horizontal
        } else if (!_rowuniform && _coluniform ) { // && _colsequence
            return false // is vertical
        } else {
            return -2 // is invalid
        }
    } else {
        return -1 // is indeterminate i.e < length 2 
    }
}
isValid = (gridref, array) => {
    let valid = false
    if (array.length == 0) {
      	console.log('zero length true')
        valid = true
    }
    let _contains = array.includes(gridref)
    let _isComplete = isComplete(array, _targetlength)
    let row
    let col
    [row, col] = _board.rc(gridref)
    // console.log(` isValid row ${row}    col ${col}  `)

    // [_rows, _cols]
    res = decompose(array)
    let _rows = res[0] //._rows
    let _cols = res[1] // ._cols

    // let _rowcols = array.map(_gr => _board.rc(_gr))
    // let _rows = _rowcols.map(_c => _c[0]).sort((a,b) => a-b)
    // let _cols = _rowcols.map(_c => _c[1]).sort((a,b) => a-b) 
    // [row, col] = _board.rc(gridref)
     let _isAdjCols = isAdjacent(col, _cols)
     let _isSeqCols = isSequence(col, _cols)
        let _isUniformCols = isUniform(_cols)
     let _isAdjRows = isAdjacent(row, _rows)
     let _isSeqRows = isSequence(row, _rows)
    let _isUniformRows = isUniform(_rows)

    // console.log(` isValid row ${row} _isAdjRows ${_isAdjRows}    col ${col} _isAdjCols ${_isAdjCols}  _rows ${_rows}  _cols ${_cols} `)

    if (array.length == 1) {
        if (!_contains && ((_isSeqRows && _isAdjRows && !_isSeqCols && _cols[0] === col) || ( _isSeqCols && _isAdjCols && !_isSeqRows && _rows[0] === row))) {
	      	console.log('length one and is adjacent true')
            valid = true
        } else {
          console.log('length one and not adjacent false')
					valid = false
        }
    } else if (array.length >= 2) {
      	let _isHoriz = isHoriz(array)
      	console.log('horizontal ' + _isHoriz)
      	if ( !_contains && _isHoriz > -1) { // i.e. true (horizontal) or false (vertical)
        //   if (_isHoriz && _isAdjCols && !_isUniformCols && _isSeqCols && !_isSeqRows && _isUniformRows && _isAdjRows ) { // && _isHoriz && _isAdjCols && _isUniformCols && _isSeqRows 
            if (_isHoriz && _isSeqCols && _isUniformRows && _rows[0] === row ) { // && _isHoriz && _isAdjCols && _isUniformCols && _isSeqRows 
				      console.log('horizontal, not in, isadjacent true ' )
              valid = true
          } else if ( !_isHoriz && _isSeqRows && _isUniformCols && _cols[0] === col) { //  && !_isHoriz && _isAdjRows && _isSeqCols && _isUniformRows 
				      console.log('vertical, not in, isadjacent true ' )
              valid = true
          } else {
            console.log(' drop thru invalid false ' )
              valid = false
          }
        } else { // 
          console.log('invalid for whatever reason (non adjacent or impossible (diagonal or width > 1))')
          valid = false
        }
    }
    return valid
}

let _targetlength
let _vesselToDeploy = {
  _element: {},
  _vgrids: [],
  _type: '',
  _targetlength: 0,
  _gridrefs: []
}
deployingVessel = (evt) => {
    let gridref = evt.target.classList[1]
    if (isValid(gridref, _vesselToDeploy._gridrefs)) {
      _vesselToDeploy._gridrefs.push(gridref)
      evt.target.classList.add('vessel')
      if (_vesselToDeploy._targetlength === _vesselToDeploy._gridrefs.length) {
        console.log('complete') 
        // reset everything for next deployment
        _vesselToDeploy = {
          _element: {},
          _vgrids: [],
          _type: '',
          _targetlength: 0,
          _gridrefs: []
        }
      }
    
    }
    console.log(_vesselToDeploy)
}



res = isAdjacent(2, [4,5])
console.log([' isAdjacent(2, [4,5])', res])
res = isAdjacent(2, [3,4,5])
console.log(['isAdjacent(2, [3,4,5])', res])


res = isUniform([1,2,3,2,1]) 
console.log(['isUniform([1,2,3,2,1]) ', res])
res = isUniform([0,0,0,0,1]) 
console.log(['isUniform([0,0,0,0,1]) ', res])
res = isUniform([1,1,1,1,1]) 
console.log(['isUniform([1,1,1,1,1])', res])

res = isSequence(1, [2,3,4,5,6,7,9])
console.log(['isSequence(1, [2,3,4,5,6,7,9])', res])
res = isSequence(1, [2,3,5,6,7,9])
console.log(['isSequence(1, [2,3,5,6,7,9])', res])
res = isSequence(1, [2,3,4,5,6,7])
console.log(['isSequence(1, [2,3,4,5,6,7])', res])


res = isHoriz(['d3','d4']) // true
console.log(["isHoriz(['d3','d4'])", res])
res = isHoriz(['d3','e3']) // false (is vertical)
console.log(["isHoriz(['d3','e3'])", res])
res = isHoriz(['d3','e5']) // -2 (invalid)
console.log(["isHoriz(['d3','e5'])", res])
res = isHoriz(['d3','f3']) // -1 (non contiguous)
console.log(["isHoriz(['d3','f3'])", res])


_this = _game.combatents.defender
_vesselToDeploy = _this._fleet_vessels[4]
_type = _vesselToDeploy.querySelector('.type').textContent
_targetlength = _len =Number(_vesselToDeploy.querySelector('.length').textContent)
// empty vessel
vssl = []
gridref = 'f4'
isValid(gridref, vssl) // true

// single vessel
vssl = ['f4']
gridref = 'f4' 
isValid(gridref, vssl) // false

gridref = 'f5' 
isValid(gridref, vssl) // true

gridref = 'e4' 
isValid(gridref, vssl) // true

gridref = 'g4' 
isValid(gridref, vssl) // true

gridref = 'f3' 
isValid(gridref, vssl) // true

gridref = 'e5' 
isValid(gridref, vssl) // false  

gridref = 'b5' 
isValid(gridref, vssl) // false 

gridref = 'g5' 
isValid(gridref, vssl) // false 


// vertical
vssl = ['c4','d4' ]
gridref = 'e5'
isValid(gridref, vssl ) // false 

gridref = 'b4'
isValid(gridref, vssl ) // true 

gridref = 'e4'
isValid(gridref, vssl) // true 
gridref = 'e7'
isValid(gridref, vssl) // false

// horizontal
vssl = ['c4','c5' ]
gridref = 'c6'
isValid(gridref, vssl ) // true

gridref = 'c3'
isValid(gridref, vssl) // true  

gridref = 'b6'
isValid(gridref, vssl ) // false 

gridref = 'e4'
isValid(gridref, vssl) // false 


/* deployment development

_this = _game.combatents.defender

_board = _this._combatent.board  // cols, rows, rc
_vesselToDeploy = _this._fleet_vessels[4]
_type = _vesselToDeploy.querySelector('.type').textContent
_len = 4 // Number(_vesselToDeploy.querySelector('.length').textContent)




let _isIndeterminate
let _rowcols
let _rows
let _cols
let _isHoriz
let _contains

checks = () => {
  _isComplete = isComplete(vssl, _len)  
  _isIndeterminate = vssl.length < 2 ? true : false
  _rowcols = vssl.map(gridref => board.rc(gridref) )  
  _rows = _rowcols.map(coord => coord[0]).sort((a,b) => a-b)
  _cols = _rowcols.map(coord => coord[1]).sort((a,b) => a-b)
  _isHoriz = _rows.reduce((prev, next) => prev += next, 0) / _rows.length === _rows[0]
  _contains = vssl.includes(gridref)
  console.log(_isIncomplete,_contains,_isIndeterminate,_isHoriz,_rows,_cols)
}

// isHorizAdjacent = (col, _cols) => col >= _cols[0] - 1 && col <= _cols.at(-1) + 1
// isVertAdjacent = (row, _rows) => row >= _rows[0] - 1 && row <= _rows.at(-1) + 1


isComplete = (array, targetLength) => (array.length === targetLength)	
isSequence = (array) => array.at(-1) - array[0] + 1 === array.length
isUniform = (array) => array.reduce((prev, next) => prev += next, 0) / array.length === array[0]
isAdjacent = (val, array) => val >= array[0] - 1 && val <= array.at(-1) + 1

decompose = (array, board) => {
    if (!rc) { console.log('must pass in the board.rc function'); return }
    _rowcols = array.map(gridref => board.rc(gridref) )  // rows are letters, cols are numbers in gridrefs
    _rows = _rowcols.map(coord => coord[0]).sort((a,b) => a-b)
    _cols = _rowcols.map(coord => coord[1]).sort((a,b) => a-b)    
    return [_rows, _cols] // x ,y  
}
isHoriz = (array) => {
    if (array.length >= 2) {
        [_rows, _cols] = decompose(array, board)
        _rowuniform = isUniform(_rows)
        _coluniform = isUniform(_cols)
        if (_rowuniform && !_coluniform) {
            return true // is horizontal
        } else if (!_rowuniform && _coluniform) {
            return false // is vertical
        } else {
            return -2 // is invalid
        }
    } else {
        return -1 // is indeterminate i.e < length 2 
    }
}

// isHoriz(['d3','d4'])
// isAdjacent(2, [4,5])
// isUniform([1,2,3,2,1]) isUniform([1,1,1,1,1]) isUniform([0,0,0,0,1]) 
// isSequence([2,3,4,5,6,7,9])

isContiguous = (row, col) => {
    if (vssl.length + 1 <= _len && !_contains) { // is not already contained and by adding will not make vessel larger than permitted
        if (_isHoriz) { // is horizontal and col is variant
            if (isHorizAdjacent(col, _cols)) {
                console.log('horiz is adjacent adding')
                vssl.push(gridref)
            } else {
                console.log('horiz not adjacent ')
            }
        } else { // is vertical (row is variant) or perhaps indeterminate
            if (isVertAdjacent(row, _rows)) {
                console.log('vert is adjacent ')
                vssl.push(gridref)
            } else {
                console.log('vert not adjacent ')
            }
        }
    }
    if (vssl.length === _len) {
        console.log('have completed deploying vessel')
        vssl = []
    } else {
        console.log('continue to deploy vessel')
    }
}


_len
vssl
row, col
gridref





















vssl = []
vssl = ['a4']
vssl = ['a4','a5']
// vssl = ['c4','d4' ]

let _isIndeterminate
let _rcs
let _rs
let _cs
let _isHoriz
let _contains

checks = () => {
	_isIndeterminate = vssl.length < 2 ? true : false
  _rcs = vssl.map(gr => _board.rc(gr) )  
  _rs = _rcs.map(coord => coord[0]).sort((a,b) => a-b)
  _cs = _rcs.map(coord => coord[1]).sort((a,b) => a-b)
  _isHoriz = _rs.reduce((pr, nx) => pr += nx, 0) / _rs.length === _rs[0]
  _contains = vssl.includes(gridref)
}
// isIndeterminate = vssl.length < 2 ? true : false
// _rcs = vssl.map(gr => _board.rc(gr) )  
// _rs = _rcs.map(coord => coord[0]).sort((a,b) => a-b)
// _cs = _rcs.map(coord => coord[1]).sort((a,b) => a-b)
// _isHoriz = _rs.reduce((pr, nx) => pr += nx, 0) / _rs.length === _rs[0]

// contains = vssl.includes(gridref)

checks()

gridref = 'a5' // evt.target.classList[1]
gridref = 'a3' // evt.target.classList[1]
[r,c] = _board.rc(gridref)

isContiguous(r,c)
vssl
isContiguous = (r,c) => {
  if (vssl.length + 1 <= _len) {
    if (isHoriz) { // is horizontal and col is variant
        if (c >= 0 && c <= 9 && c >= _cs[0]-1 && c <= _cs.at(-1) + 1) {
          console.log('horiz is adjacent ')
          vssl.push(gridref)
      } else {
          console.log('horiz not adjacent ')
      }
    } else { // is vertical (row is variant) or perhaps indeterminate
      if (r >= 0 && r <= 9 && r >= _rs[0]-1 && r <= _rs.at(-1) + 1) {
        console.log('vert is adjacent ')
        vssl.push(gridref)
      }else {
          console.log('vert not adjacent ')
      }    
    } 
  } 
    if (vssl.length === _len) {
	    console.log('have completed deploying vessel')
    	vssl = []
    } else {
          console.log('continue to deploy vessel')
    }  
}



































_this = _game.combatents.defender

_board = _this._combatent.board  // cols, rows, rc
_vesselToDeploy = _this._fleet_vessels[4]
_type = _vesselToDeploy.querySelector('.type').textContent
_len = Number(_vesselToDeploy.querySelector('.length').textContent)

vssl = []
vssl = ['a4']
vssl = ['a4','a5']
// vssl = ['c4','d4' ]

isIndeterminate = vssl.length < 2 ? true : false
_rcs = vssl.map(gr => _board.rc(gr) )  
_rs = _rcs.map(coord => coord[0]).sort((a,b) => a-b)
_cs = _rcs.map(coord => coord[1]).sort((a,b) => a-b)
_isHoriz = _rs.reduce((pr, nx) => pr += nx, 0) / _rs.length === _rs[0]

contains = vssl.includes(gridref)


gridref = 'a1' // evt.target.classList[1]
gridref = 'a3' // evt.target.classList[1]
[r,c] = _board.rc(gridref)
isContiguous(r,c)


isContiguous = (r,c) => {
  if (vssl.length + 1 <= _len) {
    if (isHoriz) { // is horizontal and col is variant
        if (c >= 0 && c <= 9 && c >= _cs[0]-1 && c <= _cs.at(-1) + 1) {
          console.log('is adjacent ')
          return true
      }
    } else { // is vertical (row is variant) or perhaps indeterminate
      if (r >= 0 && r <= 9 && r >= _rs[0]-1 && r <= _rs.at(-1) + 1) {
        console.log('is adjacent ')
        return true
      }    
    } 
  } else {
    vssl.push(gridref)
    if (vssl.length === _len) {
	    console.log('have completed deploying vessel')
    	vssl = []
    } else {
          console.log('continue to deploy vessel')
    }  
  }
}





*/



// class EventObserver {
//     constructor() {
//         this.observers = [];
//     }
//     subscribe(fn) {
//         this.observers.push(fn);
//     }
//     unsubscribe(fn) {
//         this.observers = this.observers.filter((subscriber) => subscriber !== fn);
//     }
//     broadcast(data) {
//         this.observers.forEach((subscriber) => subscriber(data));
//     }
// }

// observer = new EventObserver();

// // linker = (_game) => { 
//     _game.switchBoard()
//     _game.combatents[_game.turn].turn = true
//     _game.combatents[_game.notturn].turn = false
    
//     // _game.turns++
//     // res = _game.combatents[_game.turn]._combatent.gameOver()
//     // console.log([_game.turns, res])
// // }
// // observer.subscribe(linker)


// observer.broadcast(_game)

/*

// user Event if no 'data' as argument
playerTurn = new CustomEvent("playerTurn", { data: 23 });


htmlelem.addEventListener('playerTurn', (evt) => {

})

*/








/* 
class EventObserver {
    constructor() {
        this.observers = [];
    }
    subscribe(fn) {
        this.observers.push(fn);
    }
    unsubscribe(fn) {
        this.observers = this.observers.filter((subscriber) => subscriber !== fn);
    }
    broadcast(data) {
        this.observers.forEach((subscriber) => subscriber(data));
    }
}




// Arrange
const observer = new EventObserver();
const fn = () => {};

// Act
observer.subscribe(fn);

// Assert
assert.strictEqual(observer.observers.length, 1);

// Act
observer.unsubscribe(fn);

// Assert
assert.strictEqual(observer.observers.length, 0);









 // topics should only be modified from the eventRouter itself, any violation to the pattern will reflect misbehave
  window.pubSub = (() => {
    const topics = {}
    const hOP = topics.hasOwnProperty

    return {
      publish: (topic, info) => {
        // No topics
        if(!hOP.call(topics, topic)) return

        // Emit the message to any of the receivers
        topics[topic].forEach(item => {
          // Send any arguments if specified
          item(info !== undefined ? info : {})
        })
      },
      subscribe: (topic, callback) => {
        // Create the array of topics if not initialized yet
        if(!hOP.call(topics, topic)) topics[topic] = []

        // We define the index where this receiver is stored in the topics array
        const index = topics[topic].push(callback) - 1

        // When we subscribe we return an object to later remove the subscription
        return {
          remove: () => {
            delete topics[topic][index]
          },
        }
      },
    }
  })()



 let subscriber1 = pubSub.subscribe('hello', myArg => console.warn('hello', myArg))
  let subscriber2 = pubSub.subscribe('hello', myArg => console.warn('bye', myArg))


 // Executing
  pubSub.publish('hello', 'world')

  // Will output  "hello world"   "bye world"


 // This remove the subscription to the channel/topic we subscribed to
  subscriber1.remove()

















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
    attacker = player('Fachists', 'facha_')
    //attacker.redeploy(attacker)    
} 
function defenderReset ()  {
    // defender = player('defender', 'nato_')
    //defender.redeploy(defender)
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
//     let _attackGrids = combatentui.querySelectorAll('td.gridSq')
//     let _deployment = {}
//     function updateStrength() { (_strength.textContent = Math.round((1 - _combatent.board.hits().length / 18) * 100) + '%')}
//     function updateHits() {(_hits.textContent = _combatent.board.hits().length + '/' + _combatent.board.deployment().length)}
//     function updateDeployed(){ (_deployed.textContent = Math.round((_combatent.board.deployment().length / 18) * 100) + '%')}
//     function config() {
//         _name.textContent = _combatent.name
//         updateStrength()
//         updateHits()
//         updateDeployed()
//         _attackGrids.forEach(grid => { 
//             grid.addEventListener('click', (evt) => salvo(evt)) 
//         })
//     }
//     function reset() {
//         _combatent.board.reset()   
//         _combatent.redeploy()
        
//         _attackGrids.forEach(grid => {
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

//         // //force_defender._ui.querySelector('.a10').click()
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
//     return { _combatent, config, reset, salvo, updateDeployed, updateHits, updateStrength, _attackGrids, _ui, _opposition }
// }

// defendergrids = document.querySelector('.combatent.good')
// attackergrids = document.querySelector('.combatent.evil')

// force_defender = combatentUI(defender, defendergrids, attackergrids)
// force_attacker = combatentUI(attacker, attackergrids, defendergrids)




















// Board = () => {
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
//     //     //let _attackGrids = []
//     //     //let grid = (ref) => _attackGrids.push(ref)
//     //     let hit = () => _hits += 1
//     //     let hits = () => _hits
//     //     let isSunk = () => _hits === _length ? true : false 
//     //     let state = () => { return (`  ${_id.padEnd(10, ' ')}  ${_type.padEnd(20, ' ')} ${_hits}/${_length} ${parseInt((1 - _hits/_length)*100).toString().padStart(8, ' ')}% `) }
//     //     return { length, hit, isSunk, hits, _id, _type, state } //, _attackGrids, grid
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
//     board = Board()
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

































// alliedUI = (defender, alliedui) => {
//     let _defender = defender
//     let _name = alliedui.querySelector('td.name')
//     let _strength = alliedui.querySelector('td.strength')
//     let _hits = alliedui.querySelector('td.hits')
//     let _attackGrids = alliedui.querySelectorAll('td.gridSq')
//     let _deployment = {}
//     config = () => {
//         _name.textContent = _defender.name
//         _strength.textContent = Math.round((1 - defender.board.hits().length / defender.board.deployment().length) * 100) + '%'
//         _hits.textContent = _defender.board.hits().length + '/' + defender.board.deployment().length
//         _attackGrids.forEach(grid => { 
//             grid.addEventListener('click', (evt) => salvo(evt)) 
//         })
//     }
//     salvo = (evt) => {
//         gridref = evt.target.classList[1]
//         result = _defender.board.salvo(gridref)
//         console.log('salvo on ' + gridref + ' result' + result)
//         if (result[1] > 0) { // a hit 
//             evt.target.classList.add('directhit') // colour up square
//             // update stats

//         } else { // mark as a prior salvo
//             evt.target.classList.add('salvo') // colour up square
//         }
        
//     } 
//     config()
//     return { defender, config, salvo }
// }

// alliedui = document.querySelector('.combatent.good')

// allied = alliedUI(defender, alliedui)

// alliedUI = {
//     ui: alliedui,
//     badge: alliedui.querySelector('td.name'),
//     strength: alliedui.querySelector('td.strength'),
//     hits: alliedui.querySelector('td.hits'),
//     grids: alliedui.querySelectorAll('td.gridSq'),
//     gridClick: (evt) => console.log(evt.target.classList[1])
// }

// alliedUI.badge.textContent = 'Nato defender'
// alliedUI.hits.textContent = defender.board.hits().length + '/' + defender.board.deployment().length
// alliedUI.strength.textContent = Math.round((1 - defender.board.hits().length / defender.board.deployment().length) * 100) + '%'


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
    
