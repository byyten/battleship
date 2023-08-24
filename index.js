
const vessels = ['submarine','destroyer','cruiser','battleship','aircraft carrier']
class Ship {
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
        
    isComplete = (array, targetLength) => (array.length === targetLength)	
    isSequence = (val, array) => {
        let copyAddedSort = array.slice(0)
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
        let _rowcols = array.map(_gridref => this.rc(_gridref) )  // rows are letters, cols are numbers in gridrefs
        let _rows = _rowcols.map(_coord => _coord[0]).sort((a,b) => a-b)
        let _cols = _rowcols.map(_coord => _coord[1]).sort((a,b) => a-b)    
        return [ _rows, _cols ] // x ,y  
    }
    isHoriz = (array) => {
        let _rows
        let _cols
        if (array.length >= 2) {
            let res = this.decompose(array)
            _rows = res[0]  
            _cols = res[1] 
            let _rowuniform = this.isUniform(_rows)
            let _coluniform = this.isUniform(_cols)
            // let _rowsequence =  _rows.at(-1) - _rows[0] + 1 === _rows.length  //isSequence(_rows)
            // let _colsequence =  _cols.at(-1) - _cols[0] + 1 === _cols.length // isSequence(_cols)
            
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
        let _isComplete = this.isComplete(array, _targetlength)
        let row
        let col
        [row, col] = this.rc(gridref)
        // console.log(` isValid row ${row}    col ${col}  `)

        // [_rows, _cols]
        let res = this.decompose(array)
        let _rows = res[0] //._rows
        let _cols = res[1] // ._cols

        // let _rowcols = array.map(_gr => _board.rc(_gr))
        // let _rows = _rowcols.map(_c => _c[0]).sort((a,b) => a-b)
        // let _cols = _rowcols.map(_c => _c[1]).sort((a,b) => a-b) 
        // [row, col] = _board.rc(gridref)
        let _isAdjCols = this.isAdjacent(col, _cols)
        let _isSeqCols = this.isSequence(col, _cols)
        let _isUniformCols = this.isUniform(_cols)
        let _isAdjRows = this.isAdjacent(row, _rows)
        let _isSeqRows = this.isSequence(row, _rows)
        let _isUniformRows = this.isUniform(_rows)

        if (array.length == 1) {
            if (!_contains && ((_isSeqRows && _isAdjRows && !_isSeqCols && _cols[0] === col) || ( _isSeqCols && _isAdjCols && !_isSeqRows && _rows[0] === row))) {
                console.log('length one and is adjacent true')
                valid = true
            } else {
                console.log('length one and not adjacent false')
                valid = false
            }
        } else if (array.length >= 2) {
            let _isHoriz = this.isHoriz(array)
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

class Player {
    constructor (name, callSign) {
        this.name = name
        this.board = new Board()
        this.ac = new Ship(5, callSign)
        this.bs = new Ship(4, callSign)
        this.cr = new Ship(3, callSign)
        this.ds1 = new Ship(2, callSign)
        this.ds2 = new Ship(2, callSign)
        this.sb1 = new Ship(1, callSign)
        this.sb2 = new Ship(1, callSign)
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

let attacker = new Player('attacker', 'facha_')
// attacker.redeploy(attacker)    

let defender = new Player('defender', 'nato_')
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


class CombatentUI { 
    constructor(combatent, CombatentUI, opposition, oppositionui) {
        this._combatent = combatent
        this._combatentui = CombatentUI
        this._opposition = opposition   
        this._oppositionui = oppositionui
        this._name = CombatentUI.querySelector('td.name')
        this._deployed = CombatentUI.querySelector('td.deployed')
        this._strength = CombatentUI.querySelector('td.strength')
        this._hits = CombatentUI.querySelector('td.hits')
        this._deployment = false
        this._salvosAt = CombatentUI.querySelector('table.grid')
        this._attackGrids = this._salvosAt.querySelectorAll('td.gridSq')
        this._deployedTo = CombatentUI.querySelector('table.deploy')
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
        this._fleet = CombatentUI.querySelector('table.fleet')                                         
        console.log(this._fleet)                                                
        this._fleet_vessels = CombatentUI.querySelectorAll('tr.vessel')
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
        if (this._combatent.board.isValid(gridref, this._vesselToDeploy._gridrefs)) {
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
        this._deployFleet.disabled = false
        this.updateStrength()
        this.updateHits()  
        this.updateDeployed() 
    } 
    salvo (evt) {
        // evt.preventDefault()
        if (!this.inplay) { return } // not correct!
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

let force_defender = new CombatentUI(defender, defenderui, attacker, attackerui)
let force_attacker = new CombatentUI(attacker, attackerui, defender, defenderui)
let combatentuis = { defender: force_defender, attacker: force_attacker }

class Game {
    constructor(combatentuis) {
        this.combatents = combatentuis // ['attacker', 'defender']
        this._game = document.querySelector('div.game')
        this._plays = this._game.querySelector('td.plays')
        this._play = this._game.querySelector('td.play')
        this._status = this._game.querySelector('td.status')
        this._reset = this._game.querySelector('button.reset')
        this._reset.addEventListener('click', () => this.resetGame() ) 
    
        this.init()
 
        this._game.addEventListener('defenderDeployed', (evt) => {
            this._status.textContent = 'Defender forces deployed'
            this.combatents.defender._deployment = true
            if (this.combatents.attacker._deployment && this.combatents.defender._deployment ) {
                this.commencePlay()
                // this._status.textContent = "Forces deployed - commence battle" 
                // this.combatents.attacker._salvosAt.classList.replace('hid', 'viz')
                // this.combatents.defender._salvosAt.classList.replace('hid', 'viz')
                // this._plays.textContent = 0
                // this._play.textContent = this.turn
                // this.inplay = true
            }
        })
        this._game.addEventListener('attackerDeployed', (evt) => {
            this._status.textContent = 'Attacker forces deployed'
            this.combatents.attacker._deployment = true
            if (this.combatents.attacker._deployment && this.combatents.defender._deployment ) {
                this.commencePlay()
                // this._status.textContent = "Forces deployed - commence battle" 
                // this.combatents.attacker._salvosAt.classList.replace('hid', 'viz')
                // this.combatents.defender._salvosAt.classList.replace('hid', 'viz')
                // this._plays.textContent = 0
                // this._play.textContent = this.turn
                // this.inplay = true
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
    commencePlay () {
        this._status.textContent = "Forces deployed - commence battle" 
        this.combatents.attacker._salvosAt.classList.replace('hid', 'viz')
        this.combatents.defender._salvosAt.classList.replace('hid', 'viz')
        this.combatents.attacker._salvosAt.classList.replace('opacityLo','opacityHi')
        this._plays.textContent = 0
        this._play.textContent = this.turn
        this.inplay = true
        this.combatents.attacker.inplay = this.combatents.defender.inplay = true
    } 
    init = () => {
        this.inplay = false
        this.combatents.attacker.inplay = false
        this.combatents.defender.inplay = false
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
        if (!this.inplay) { return }
        let gameover = this.combatents[this.notturn]._combatent.gameOver()
        if (gameover) {
            this.combatents[this.turn]._salvosAt.classList.replace('opacityLo','opacityHi')
            this.combatents[this.notturn]._salvosAt.classList.replace('opacityLo','opacityHi')

            let hits = _game.combatents[this.notturn]._combatent.board.hits().length
            let msghdr = `Game Over\n--------------------------------------\n `
            let msg = `Battle won by ${this.turn} in ${parseInt(this.turns/2 + 1)} salvos\ncausing ${hits} direct hits `
            this._status.textContent = msg
            this._play.textContent = ''
            console.log(msghdr + msg)
            alert (msghdr + msg)
            this._reset.classList.replace('hid','viz')
             
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
        // _this._combatent.board.board = new Board()
        _this._combatent.board = new Board()
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
        this._reset.classList.replace('viz','hid')
        
      }
}


_game = new Game(combatentuis)


// in development for vessel deployment
const _board = new RowCol()  

res = _board.isAdjacent(2, [4,5])
console.log([' isAdjacent(2, [4,5])', res])
res = _board.isAdjacent(2, [3,4,5])
console.log(['isAdjacent(2, [3,4,5])', res])


res = _board.isUniform([1,2,3,2,1]) 
console.log(['isUniform([1,2,3,2,1]) ', res])
res = _board.isUniform([0,0,0,0,1]) 
console.log(['isUniform([0,0,0,0,1]) ', res])
res = _board.isUniform([1,1,1,1,1]) 
console.log(['isUniform([1,1,1,1,1])', res])

res = _board.isSequence(1, [2,3,4,5,6,7,9])
console.log(['isSequence(1, [2,3,4,5,6,7,9])', res])
res = _board.isSequence(1, [2,3,5,6,7,9])
console.log(['isSequence(1, [2,3,5,6,7,9])', res])
res = _board.isSequence(1, [2,3,4,5,6,7])
console.log(['isSequence(1, [2,3,4,5,6,7])', res])


res = _board.isHoriz(['d3','d4']) // true
console.log(["isHoriz(['d3','d4'])", res])
res = _board.isHoriz(['d3','e3']) // false (is vertical)
console.log(["isHoriz(['d3','e3'])", res])
res = _board.isHoriz(['d3','e5']) // -2 (invalid)
console.log(["isHoriz(['d3','e5'])", res])
res = _board.isHoriz(['d3','f3']) // -1 (non contiguous)
console.log(["isHoriz(['d3','f3'])", res])


_this = _game.combatents.defender
_vesselToDeploy = _this._fleet_vessels[4]
_type = _vesselToDeploy.querySelector('.type').textContent
_targetlength = _len =Number(_vesselToDeploy.querySelector('.length').textContent)
// empty vessel
vssl = []
gridref = 'f4'
_board.isValid(gridref, vssl) // true

// single vessel
vssl = ['f4']
gridref = 'f4' 
_board.isValid(gridref, vssl) // false

gridref = 'f5' 
_board.isValid(gridref, vssl) // true

gridref = 'e4' 
_board.isValid(gridref, vssl) // true

gridref = 'g4' 
_board.isValid(gridref, vssl) // true

gridref = 'f3' 
_board.isValid(gridref, vssl) // true

gridref = 'e5' 
_board.isValid(gridref, vssl) // false  

gridref = 'b5' 
_board.isValid(gridref, vssl) // false 

gridref = 'g5' 
_board.isValid(gridref, vssl) // false 


// vertical
vssl = ['c4','d4' ]
gridref = 'e5'
_board.isValid(gridref, vssl ) // false 

gridref = 'b4'
_board.isValid(gridref, vssl ) // true 

gridref = 'e4'
_board.isValid(gridref, vssl) // true 
gridref = 'e7'
_board.isValid(gridref, vssl) // false

// horizontal
vssl = ['c4','c5' ]
gridref = 'c6'
_board.isValid(gridref, vssl ) // true

gridref = 'c3'
_board.isValid(gridref, vssl) // true  

gridref = 'b6'
_board.isValid(gridref, vssl ) // false 

gridref = 'e4'
_board.isValid(gridref, vssl) // false 

console.log(_board)



// isComplete = (array, targetLength) => (array.length === targetLength)	
// isSequence = (val, array) => {
//     copyAddedSort = array.slice(0)
//     copyAddedSort.push(val)
//     copyAddedSort.sort((a,b) => a-b)
//     return (copyAddedSort.at(-1) - copyAddedSort[0] + 1 === copyAddedSort.length)
// }
// isUniform = (array) => (array.reduce((prev, next) => prev += next, 0) / array.length === array[0])
// isAdjacent = (val, array) => (val >= array[0] - 1 && val <= array.at(-1) + 1)
// isIndeterminate = (array) => (array.length < 2 ? true : false)
// contains = (val, array) => (array.includes(val))

// decompose = (array) => {
//     // console.log(_board)
//     // if (!_board.rc) { console.log('must pass in the board.rc function'); return }
//     let _rowcols = array.map(_gridref => _board.rc(_gridref) )  // rows are letters, cols are numbers in gridrefs
//     let _rows = _rowcols.map(_coord => _coord[0]).sort((a,b) => a-b)
//     let _cols = _rowcols.map(_coord => _coord[1]).sort((a,b) => a-b)    
//     return [ _rows, _cols ] // x ,y  
// }
// isHoriz = (array) => {
//     let _rows
//     let _cols
//     if (array.length >= 2) {
//         res = decompose(array)
//         _rows = res[0]  
//         _cols = res[1] 
//         let _rowuniform = isUniform(_rows)
//         let _coluniform = isUniform(_cols)
//         let _rowsequence =  _rows.at(-1) - _rows[0] + 1 === _rows.length  //isSequence(_rows)
//         let _colsequence =  _cols.at(-1) - _cols[0] + 1 === _cols.length // isSequence(_cols)
        
//         if (_rowuniform && !_coluniform ) { // && _rowsequence
//             return true // is horizontal
//         } else if (!_rowuniform && _coluniform ) { // && _colsequence
//             return false // is vertical
//         } else {
//             return -2 // is invalid
//         }
//     } else {
//         return -1 // is indeterminate i.e < length 2 
//     }
// }
// isValid = (gridref, array) => {
//     let valid = false
//     if (array.length == 0) {
//       	console.log('zero length true')
//         valid = true
//     }
//     let _contains = array.includes(gridref)
//     let _isComplete = isComplete(array, _targetlength)
//     let row
//     let col
//     [row, col] = _board.rc(gridref)
//     // console.log(` isValid row ${row}    col ${col}  `)

//     // [_rows, _cols]
//     res = decompose(array)
//     let _rows = res[0] //._rows
//     let _cols = res[1] // ._cols

//     // let _rowcols = array.map(_gr => _board.rc(_gr))
//     // let _rows = _rowcols.map(_c => _c[0]).sort((a,b) => a-b)
//     // let _cols = _rowcols.map(_c => _c[1]).sort((a,b) => a-b) 
//     // [row, col] = _board.rc(gridref)
//      let _isAdjCols = isAdjacent(col, _cols)
//      let _isSeqCols = isSequence(col, _cols)
//         let _isUniformCols = isUniform(_cols)
//      let _isAdjRows = isAdjacent(row, _rows)
//      let _isSeqRows = isSequence(row, _rows)
//     let _isUniformRows = isUniform(_rows)

//     // console.log(` isValid row ${row} _isAdjRows ${_isAdjRows}    col ${col} _isAdjCols ${_isAdjCols}  _rows ${_rows}  _cols ${_cols} `)

//     if (array.length == 1) {
//         if (!_contains && ((_isSeqRows && _isAdjRows && !_isSeqCols && _cols[0] === col) || ( _isSeqCols && _isAdjCols && !_isSeqRows && _rows[0] === row))) {
// 	      	console.log('length one and is adjacent true')
//             valid = true
//         } else {
//           console.log('length one and not adjacent false')
// 					valid = false
//         }
//     } else if (array.length >= 2) {
//       	let _isHoriz = isHoriz(array)
//       	console.log('horizontal ' + _isHoriz)
//       	if ( !_contains && _isHoriz > -1) { // i.e. true (horizontal) or false (vertical)
//         //   if (_isHoriz && _isAdjCols && !_isUniformCols && _isSeqCols && !_isSeqRows && _isUniformRows && _isAdjRows ) { // && _isHoriz && _isAdjCols && _isUniformCols && _isSeqRows 
//             if (_isHoriz && _isSeqCols && _isUniformRows && _rows[0] === row ) { // && _isHoriz && _isAdjCols && _isUniformCols && _isSeqRows 
// 				      console.log('horizontal, not in, isadjacent true ' )
//               valid = true
//           } else if ( !_isHoriz && _isSeqRows && _isUniformCols && _cols[0] === col) { //  && !_isHoriz && _isAdjRows && _isSeqCols && _isUniformRows 
// 				      console.log('vertical, not in, isadjacent true ' )
//               valid = true
//           } else {
//             console.log(' drop thru invalid false ' )
//               valid = false
//           }
//         } else { // 
//           console.log('invalid for whatever reason (non adjacent or impossible (diagonal or width > 1))')
//           valid = false
//         }
//     }
//     return valid
// }

// let _targetlength
// let _vesselToDeploy = {
//   _element: {},
//   _vgrids: [],
//   _type: '',
//   _targetlength: 0,
//   _gridrefs: []
// }
// deployingVessel = (evt) => {
//     let gridref = evt.target.classList[1]
//     if (isValid(gridref, _vesselToDeploy._gridrefs)) {
//       _vesselToDeploy._gridrefs.push(gridref)
//       evt.target.classList.add('vessel')
//       if (_vesselToDeploy._targetlength === _vesselToDeploy._gridrefs.length) {
//         console.log('complete') 
//         // reset everything for next deployment
//         _vesselToDeploy = {
//           _element: {},
//           _vgrids: [],
//           _type: '',
//           _targetlength: 0,
//           _gridrefs: []
//         }
//       }
    
//     }
//     console.log(_vesselToDeploy)
// }

