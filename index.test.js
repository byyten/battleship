
const { enemies, allies } = require('./index')


board = allies.board
board = enemies.board


// vesselLength
    test('d3, d5 is valid length 3', () => {
        expect(board.vesselLength('d3','d5')[0]).toBe(1)
        expect(board.vesselLength('d3','d5')[1]).toBe(3)
    })
    test('d8, d12 is invalid length 5 off board', () => {
        expect(board.vesselLength('d8','d12')[0]).toBe(NaN)
        expect(board.vesselLength('d8','d12')[1]).toBe(NaN)
    })
    test('d5, e5 is valid length 2', () => {
        expect(board.vesselLength('d5','e5')[0]).toBe(1)
        expect(board.vesselLength('d5','e5')[1]).toBe(2)
    })

    test('h5, h9 is valid length 5', () => {
        expect(board.vesselLength('h5','h9')[0]).toBe(1)
        expect(board.vesselLength('h5','h9')[1]).toBe(5)
    })

// areValid()
    test('[0,1], [9,9] are invalid grid references', () => {
        expect(board.areValid([0,1], [9,9])).toBe("invalid references: grid references are strings like 'a1'")
    }) 

    test('a1, a6 is invalid grid references', () => {
        expect(board.areValid('a7', 'a11')).toBe('invalid grid references')
    }) 

    test('b1, b4 is valid grid references', () => {
        expect(board.areValid('b1', 'b4')).toBe(true)
    }) 

    test('b1, a3 is invalid vessel', () => {
        expect(board.areValid('b1', 'a3')).toBe('invalid vessel')
    }) 

// rc()
    test('[0,0] valid grid coord is ok', () => {
        expect(board.rc([0,0])).toBe('a1')
    })

    test('[9,9] valid grid coord is ok', () => {
        expect(board.rc([9,9])).toBe('j10')
    })

    test('[19,9] valid grid coord is false', () => {
        expect(board.rc([19,9])).toBe(false)
    })

    test('a1 valid grid ref is ok', () => {
        expect(board.rc('a1')[0]).toBe(0)
        expect(board.rc('a1')[1]).toBe(0)
    })

    test('j10 valid grid ref is ok', () => {
        expect(board.rc('j10')[0]).toBe(9)
        expect(board.rc('j10')[1]).toBe(9)
    })

    test('a11 invalid grid ref is false', () => {
        expect(board.rc('a11')).toBe(false)
    })

    test('p5 invalid grid ref is false', () => {
        expect(board.rc('p5')).toBe(false)
    })





/*


build = () => {
    const cols = 'abcdefghij'
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const vessels = ['submarine','destroyer','cruiser','battleship','aircraft carrier']
    let _occupied = []
    let _salvos = []
    let _hits = []
    let board = {}
    occupied = () => _occupied
    salvos = () => _salvos
    hits = () => _hits
    rc = (coord) => {
        let c
        let r 
        let n
        if (coord instanceof Array) {  // arrays are coordinates in their conventional sense
            c = cols[coord[0]] == undefined ? false : cols[coord[0]]
            r = rows[coord[1]] == undefined ?  'invalid' : rows[coord[1]]  // console.log([c, r])
            return  c && r !== 'invalid' ? cols[coord[0]] + rows[coord[1]] : false
        } else {
            // strings are grid references that are translated to coordinates
            c = cols.indexOf(coord.slice(0,1)) == -1  ? 'invalid' : cols.indexOf(coord.slice(0,1))
            n = Number(coord.slice(1)) - 1 
            r = n >= 0 && n < 10 ? n : 'invalid' 
            return ((c !== 'invalid' && r !== 'invalid') ? [c, r] : false )      
        } 
    }  
    salvo = (coords) => {
        let gridref
        if (coords instanceof Array) {
            gridref = rc(coords)
        } else {
            gridref = coords
        }
        if (_salvos.includes(gridref)) { // if already hit that grid negate hit (for computer random shoots)
            return -1
        } else { // can mark the salvo
            board[gridref].salvo = true
            _salvos.push(gridref)
        }
        if (board[gridref].vessel) { // .vessel == false | { length, hit, isSunk, ... }
            // add hit to ship
            board[gridref].vessel.hit()
            _hits.push(gridref);
            return board[gridref].vessel.isSunk() ? [true, board[gridref].vessel.hits()] : [false, board[gridref].vessel.hits()]
        } else { 
            return [false, 0] 
        }
    }
    randomSalvo = () => [parseInt(Math.random() * 10), parseInt(Math.random() * 10)]
    randomOKSalvo = () => {
        let potShot = false
        let shot = ''
        while ( !potShot ) {
            shot = rc(randomSalvo())
            potShot = !_salvos.includes(shot)
        }
        return shot
    }
    ship = (length, prfx = 'nato_') => {
        let _length = length
        let _hits = 0
        let _type = vessels[length - 1]
        let _id = prfx + parseInt(Date.now().toString().slice(-4) * Math.random())
        let _grids = []
        grid = (ref) => _grids.push(ref)
        hit = () => _hits += 1
        hits = () => _hits
        isSunk = () => _hits === _length ? true : false 
        state = () => { return (`  ${_id.padEnd(10, ' ')}  ${_type.padEnd(20, ' ')} ${_hits}/${_length} ${parseInt((1 - _hits/_length)*100).toString().padStart(8, ' ')}% `) }
        return { length, hit, isSunk, hits, grid, _grids, _id, _type, state } //
    }        
    areValid = (start, end) => {
        // start = 'a1' ; end = 'a5'
        if (start instanceof Array || end instanceof Array) {
            return "invalid references: grid references are strings like 'a1'"
        }
        let st = rc(start) 
        let en = rc(end)
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
    vesselLength = (start, end) => {
        // st = rc('d3'); en = rc('e3')    // st = rc('e9'); en = rc('e13') // st = rc('e9'); en = rc('e13')
        let st = rc(start) 
        let en = rc(end)
        let x = Math.abs(st[0] - en[0])
        let y = Math.abs(st[1] - en[1])
        let width = x == 0 ? x + 1 : y + 1
        let length = y == 0 ? x + 1 : y + 1 // : x + 1
        return [width, length]
    }
    placement = (start, end, vessel) => {
        // start = 'j3'  // end = 'j7'
        let arevalid = areValid(start, end) 
        if (arevalid) {
            let st = rc(start) 
            let en = rc(end)
            // let width, len
            // [width, len] = vesselLength(start, end)
            // let vssl = ship(len) // v = ship(3)  v.grid('j5')  z = ship(1, 'nazi_') z.hit() 
    
            let xfrom = Math.min(st[0], en[0])
            let xto = Math.max(st[0], en[0])
            let yfrom = Math.min(st[1], en[1])
            let yto = Math.max(st[1], en[1])
    
            for (let r = xfrom; r <= xto; r++ ) {
                for (let c = yfrom; c <= yto; c++) {
                    let gridref = rc([r,c])
                    vessel.grid(gridref)
                    _occupied.push(gridref)
                    board[gridref].vessel = vessel
                }
            }
        }
    }    
    isGrid = (gridref) => (board[gridref].vessel === false ? false : true)  // board['e10'].vessel   occupied('e10')
    isGridOccupied = (gridrefs) => gridrefs.map(ref => { return { ref: ref, occ: _occupied.includes(ref) }})
    for (let c = 0; c < 10; c++) {
        for (let r = 0; r < 10; r++) {
            // console.log(rc([c, r]))
            board[rc([r, c])] = { salvo: false, vessel: false }
        }
    }
    return { board, occupied, isGrid, isGridOccupied, placement, ship, salvo, salvos, hits, rc, areValid, vesselLength, randomOKSalvo }
} 

player = (name, callSign) => {
    let board = build()
    let ac = ship(5, callSign)
    let bs = ship(4, callSign)
    let cr = ship(3, callSign)
    let ds1 = ship(2, callSign)
    let ds2 = ship(2, callSign)
    let sb1 = ship(1, callSign)
    let sb2 = ship(1, callSign)
    let fleet = [ ac, bs, cr, ds1, ds2, sb1, sb2 ]
    // let _hits = []
    gameOver = () => (board.hits().length >= 18 ? true : false)
    state = () => { 
        msg = name + '\n' 
        msg += fleet.map(vss => vss.state() ).join('\n')
        msg += '\n\n  ' + parseInt((1 - board.hits().length / board.occupied().length) * 100) + '% force strength' 
        console.log( msg)
    }
    return { name, callSign, fleet, board, state, gameOver }
}

placeFleet = (navy) => {navy.board.placement('e5', 'e9', navy.fleet[0]);navy.board.placement('b3', 'b6', navy.fleet[1]);navy.board.placement('g6', 'g8', navy.fleet[2]);navy.board.placement('f2', 'f3', navy.fleet[3]);navy.board.placement('c8', 'c9', navy.fleet[4]);navy.board.placement('a10', 'a10', navy.fleet[5]);navy.board.placement('j10', 'j10', navy.fleet[6]);}

placeFleet2 = (navy) => {navy.board.placement('e6', 'e10', navy.fleet[0]);navy.board.placement('b2', 'b5', navy.fleet[1]);navy.board.placement('g5', 'g7', navy.fleet[2]);navy.board.placement('f1', 'f2', navy.fleet[3]);navy.board.placement('c7', 'c8', navy.fleet[4]);navy.board.placement('a9', 'a9', navy.fleet[5]);navy.board.placement('j8', 'j8', navy.fleet[6]);}

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
boardReset = () => {
    enemies = player('Fachists', 'facha_')
    placeFleet(enemies)    
    allies = player('Allies', 'nato_')
    placeFleet2(allies)
    // destroyFleet(enemies)   
} 

let enemies
let allies

boardReset()

allies.state()
enemies.state()


board = allies.board
// board.randomOKSalvo()
// allies.state()
// enemies.state()
// enemies.board.salvos()           enemies.board.occupied().length  enemies.board.hits().length
// enemies.board.salvo(enemies.board.randomOKSalvo())
// allies.board.salvo(allies.board.randomOKSalvo())

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

play(enemies, allies, 10)


*/
    

