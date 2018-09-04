
function zip(f : (x : number, y : number) => number, a : number[], b : number[]) {
    return a.map((x, i) => f(x, b[i]));
}

function zip4(
        f : (x : number, y : number, z : number, q : number) => number, 
        a : number[], b : number[], c : number[], d : number[]) {
    return a.map((x, i) => f(x, b[i], c[i], d[i]));
}

function wordnum(n : number) {
    return n >> 5;
}

function bitnum(n : number) {
    return n & 0x1f;
}

const fromBinMap = {'0': 0b00, '1': 0b11, 'x': 0b01};
Object.seal(fromBinMap);
const fromOctMap = {'x': 0b000111};
for (let i = 0; i < 8; i++)
    fromOctMap[i.toString()] = i | (i << 3);
Object.seal(fromBinMap);
const fromHexMap = {'x': 0b00001111};
for (let i = 0; i < 16; i++)
    fromHexMap[i.toString(16)] = i | (i << 4);
Object.seal(fromBinMap);

export class Vector3vl {
    private _bits : number;
    private _avec : number[];
    private _bvec : number[];
    private constructor(bits, avec, bvec) {
        this._bits = bits;
        this._avec = avec;
        this._bvec = bvec;
    }
    static make(bits : number, init) {
        bits = bits | 0;
        let iva, ivb;
        switch(init) {
            case true: case '1': case 1: iva = ivb = ~0; break;
            case false: case '0': case -1: case undefined: iva = ivb = 0; break;
            case 'x': case 0: iva = 0; ivb = ~0; break;
            default: console.assert(false);
        }
        const words = (bits+31)/32 | 0;
        return new Vector3vl(bits,
            Array(words).fill(iva),
            Array(words).fill(ivb));
    }
    static zeros(bits : number) {
        return Vector3vl.make(bits, -1);
    }
    static ones(bits : number) {
        return Vector3vl.make(bits, 1);
    }
    static xes(bits : number) {
        return Vector3vl.make(bits, 0);
    }
    static fromIterator(iter : Iterable<number>, skip : number, nbits? : number) {
        if ((skip & (skip - 1)) == 0) return Vector3vl.fromIteratorPow2(iter, skip, nbits);
        else return Vector3vl.fromIteratorAnySkip(iter, skip, nbits);
    }
    static fromIteratorAnySkip(iter : Iterable<number>, skip : number, nbits? : number) {
        let m = 0, k = -1, avec = [], bvec = [];
        const mask = (1 << skip) - 1;
        for (const v of iter) {
            if (bitnum(m) == 0) {
                avec.push(0);
                bvec.push(0);
                k++;
            }
            avec[k] |= ((v >>> skip) & mask) << m;
            bvec[k] |= (v & mask) << m;
            if (((mask << m) >>> m) != mask) {
                avec.push(((v >>> skip) & mask) >>> -m);
                bvec.push((v & mask) >>> -m);
                k++;
            }
            m += skip;
        }
        if (nbits !== undefined) {
            const words = (nbits+31)/32 | 0;
            const last_x = m > 0 && !(avec.slice(-1)[0] & (1 << (m-1))) && (bvec.slice(-1)[0] & (1 << (m-1)));
            if (last_x) bvec[bvec.length-1] |= (-1) << m;
            if (avec.length < words) {
                avec = avec.concat(Array(words - avec.length).fill(0));
                bvec = bvec.concat(Array(words - bvec.length).fill(last_x ? -1 : 0));
            } else {
                avec.splice(words);
                bvec.splice(words);
            }
            m = nbits;
        }
        return new Vector3vl(m, avec, bvec);
    }
    static fromIteratorPow2(iter : Iterable<number>, skip : number, nbits? : number) {
        let m = 0, k = -1, avec = [], bvec = [];
        const mask = (1 << skip) - 1;
        for (const v of iter) {
            if (bitnum(m) == 0) {
                avec.push(0);
                bvec.push(0);
                k++;
            }
            avec[k] |= ((v >>> skip) & mask) << m;
            bvec[k] |= (v & mask) << m;
            m += skip;
        }
        if (nbits !== undefined) {
            const words = (nbits+31)/32 | 0;
            const last_x = Boolean(m > 0 && !(avec.slice(-1)[0] & (1 << (m-1))) && (bvec.slice(-1)[0] & (1 << (m-1))));
            if (last_x) bvec[bvec.length-1] |= (-1) << m;
            if (avec.length < words) {
                avec = avec.concat(Array(words - avec.length).fill(0));
                bvec = bvec.concat(Array(words - bvec.length).fill(last_x ? -1 : 0));
            } else {
                avec.splice(words);
                bvec.splice(words);
            }
            m = nbits;
        }
        return new Vector3vl(m, avec, bvec);
    }
    static fromArray(data : number[]) {
        function* f(): Iterable<number> {
            for (const x of data) yield x + 1 + Number(x > 0);
        }
        return Vector3vl.fromIteratorPow2(f(), 1);
    }
    static fromBin(data : string, nbits? : number) {
        function* f() : Iterable<number> {
            for (let i = data.length - 1; i >= 0; i--)
                yield fromBinMap[data[i]];
        }
        return Vector3vl.fromIteratorPow2(f(), 1, nbits);
    }
    static fromOct(data : string, nbits? : number) {
        function* f() : Iterable<number> {
            for (let i = data.length - 1; i >= 0; i--)
                yield fromOctMap[data[i]];
        }
        return Vector3vl.fromIteratorAnySkip(f(), 3, nbits);
    }
    static fromHex(data : string, nbits? : number) {
        function* f() : Iterable<number> {
            for (let i = data.length - 1; i >= 0; i--)
                yield fromHexMap[data[i]];
        }
        return Vector3vl.fromIteratorPow2(f(), 4, nbits);
    }
    get bits() : number {
        return this._bits;
    }
    get(n : number) {
        const bn = bitnum(n);
        const wn = wordnum(n);
        const a = (this._avec[wn] >>> bn) & 1;
        const b = (this._bvec[wn] >>> bn) & 1;
        return a + b - 1;
    }
    and(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip((a, b) => a & b, v._avec, this._avec),
            zip((a, b) => a & b, v._bvec, this._bvec));
    }
    or(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip((a, b) => a | b, v._avec, this._avec),
            zip((a, b) => a | b, v._bvec, this._bvec));
    }
    xor(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip4((a1, a2, b1, b2) => (a1 | b1) & (a2 ^ b2),
                 v._avec, v._bvec, this._avec, this._bvec),
            zip4((a1, a2, b1, b2) => (a1 & b1) ^ (a2 | b2),
                 v._avec, v._bvec, this._avec, this._bvec));
    }
    nand(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip((a, b) => ~(a & b), v._bvec, this._bvec),
            zip((a, b) => ~(a & b), v._avec, this._avec));
    }
    nor(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip((a, b) => ~(a | b), v._bvec, this._bvec),
            zip((a, b) => ~(a | b), v._avec, this._avec));
    }
    xnor(v : Vector3vl) {
        console.assert(v._bits == this._bits);
        return new Vector3vl(this._bits,
            zip4((a1, a2, b1, b2) => ~((a1 & b1) ^ (a2 | b2)),
                 v._avec, v._bvec, this._avec, this._bvec),
            zip4((a1, a2, b1, b2) => ~((a1 | b1) & (a2 ^ b2)),
                 v._avec, v._bvec, this._avec, this._bvec));
    }
    not() {
        return new Vector3vl(this._bits,
            this._bvec.map(a => ~a),
            this._avec.map(a => ~a));
    }
    toIterator(skip : number) {
        if ((skip & (skip - 1)) == 0) return this.toIteratorPow2(skip);
        else return this.toIteratorAnySkip(skip);
    }
    *toIteratorAnySkip(skip : number) {
        this.normalize();
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            let a = (this._avec[k] & m) >>> bit;
            let b = (this._bvec[k] & m) >>> bit;
            if ((m >>> bit) != sm && k + 1 != this._avec.length) {
                const m1 = sm >> -bit;
                a |= (this._avec[k + 1] & m1) << -bit;
                b |= (this._bvec[k + 1] & m1) << -bit;
            }
            yield (a << skip) | b;
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = (sm << bit);
            }
        }
    }
    *toIteratorPow2(skip : number) {
        this.normalize();
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            const a = (this._avec[k] & m) >>> bit;
            const b = (this._bvec[k] & m) >>> bit;
            yield (a << skip) | b;
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = sm;
            }
        }
    }
    toArray() {
        const out = [];
        for (const v of this.toIteratorPow2(1)) {
            out.push(v - 1 - Number(v > 1));
        }
        return out;
    }
    toBin() {
        const out = [];
        for (const v of this.toIteratorPow2(1)) {
            if (1 & v & ~(v >> 1)) out.push('x');
            else out.push((v >> 1).toString());
        }
        return out.reverse().join('');
    }
    toOct() {
        const out = [];
        for (const v of this.toIteratorAnySkip(3)) {
            if (1 & v & ~(v >> 3)) out.push('x');
            else out.push((v >> 3).toString());
        }
        return out.reverse().join('');
    }
    toHex() {
        const out = [];
        for (const v of this.toIteratorPow2(4)) {
            if (0xf & v & ~(v >> 4)) out.push('x');
            else out.push((v >> 4).toString(16));
        }
        return out.reverse().join('');
    }
    eq(v : Vector3vl) {
        if (v._bits != this._bits) return false;
        this.normalize();
        v.normalize();
        for (const i in this._avec) {
            if (this._avec[i] != v._avec[i]) return false;
            if (this._bvec[i] != v._bvec[i]) return false;
        }
        return true;
    }
    normalize() {
        const lastmask = (~0) >>> -this._bits;
        this._avec[this._avec.length - 1] &= lastmask;
        this._bvec[this._bvec.length - 1] &= lastmask;
    }
};


