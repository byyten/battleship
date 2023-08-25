
const { defender, attacker, Board } = require('./index')

// board = defender.board
const board = attacker.board
const _board = new Board()

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



// in development for vessel deployment
    test('_board.isAdjacent(2, [4,5])', () => {
        expect(_board.isAdjacent(2, [4,5])).toBe(false)
    })

    test(' isAdjacent(2, [4,5])', () => {
        expect(_board.isAdjacent(2, [3,4,5])).toBe(true)
    })

    test('_board.isUniform([1,2,3,2,1])', () => {
        expect(_board.isUniform([1,2,3,2,1])).toBe(false)
    })

    test('_board.isUniform([0,0,0,0,1])', () => {
        expect(_board.isUniform([0,0,0,0,1])).toBe(false)
    })

    test('_board.isUniform([1,1,1,1,1]) ', () => {
        expect(_board.isUniform([1,1,1,1,1]) ).toBe(true)
    })

    test('_board.isSequence(1, [2,3,4,5,6,7,9])', () => {
        expect(_board.isSequence(1, [2,3,4,5,6,7,9])).toBe(false)
    })

    test('_board.isSequence(1, [2,3,5,6,7,9])', () => {
        expect(_board.isSequence(1, [2,3,5,6,7,9])).toBe(false)
    })

    test('_board.isSequence(1, [2,3,4,5,6,7])', () => {
        expect(_board.isSequence(1, [2,3,4,5,6,7])).toBe(true)
    })

    test("_board.isHoriz(['d3','d4'])", () => {
        expect(_board.isHoriz(['d3','d4'])).toBe(true)
    })

    test("_board.isHoriz(['d3','e5'])", () => {
        expect(_board.isHoriz(['d3','e5'])).toBe(-2) // invalid
    })

    test("_board.isHoriz(['d3','f3'])", () => {
        expect(_board.isHoriz(['d3','f3'])).toBe(false)
    })


    _targetlength = 3 // _len =Number(_vesselToDeploy.querySelector('.length').textContent)

// empty vessel  vssl = []
    test("_board.isValid(gridref, vssl)  f4, []", () => {
        gridref = 'f4'
        vssl = []
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

// single selected grid vessel  vssl = ['f4']
    test("_board.isValid(gridref, vssl) 'f4',  ['f4'] already includes", () => {
        gridref = 'f4'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl) 'f5', ['f4'] ", () => {
        gridref = 'f5'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl) 'f3', ['f4'] ", () => {
        gridref = 'f3'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl) 'e4', ['f4'] ", () => {
        gridref = 'e4'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl) 'g4', ['f4'] ", () => {
        gridref = 'g4'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl) 'e5', ['f4'] ", () => {
        gridref = 'e5'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl) 'b5', ['f4'] ", () => {
        gridref = 'b5'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl) 'g5', ['f4'] ", () => {
        gridref = 'g5'
        vssl = ['f4']
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })


// vertical   vssl = ['c4','d4' ]
    test("_board.isValid(gridref, vssl)  'e5', ['c4','d4']", () => {
        gridref = 'e5'
        vssl = ['c4','d4' ]
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl)  'b4', ['c4','d4']", () => {
        gridref = 'b4'
        vssl = ['c4','d4' ]
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl)  'e4', ['c4','d4']", () => {
        gridref = 'e4'
        vssl = ['c4','d4' ]
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl)  'e7', ['c4','d4']", () => {
        gridref = 'e7'
        vssl = ['c4','d4' ]
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })



// horizontal  vssl = ['c4','c5' ]
    test("_board.isValid(gridref, vssl)  'c6', ['c4','c5']", () => {
        gridref = 'c6'
        vssl = ['c4','c5' ]
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl)  'c3', ['c4','c5']", () => {
        gridref = 'c3'
        vssl = ['c4','c5' ]
        expect(_board.isValid(gridref, vssl)).toBe(true)
    })

    test("_board.isValid(gridref, vssl)  'c7', ['c4','c5']", () => {
        gridref = 'c7'
        vssl = ['c4','c5' ]
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl)  'b6', ['c4','c5']", () => {
        gridref = 'b6'
        vssl = ['c4','c5' ]
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })

    test("_board.isValid(gridref, vssl)  'e4', ['c4','c5']", () => {
        gridref = 'e4'
        vssl = ['c4','c5' ]
        expect(_board.isValid(gridref, vssl)).toBe(false)
    })


