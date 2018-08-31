
function zip(f : (x : number, y : number) => number, a : number[], b : number[]) {
    return a.map((x, i) => f(x, b[i]));
}

function zip4(
        f : (x : number, y : number, z : number, q : number) => number, 
        a : number[], b : number[], c : number[], d : number[]) {
    return a.map((x, i) => f(x, b[i], c[i], d[i]));
}

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
            case 'x': case '0': iva = 0; ivb = ~0; break;
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
    static fromArray(data : number[]) {
        let m = 0, k = -1, avec = [], bvec = [];
        for (const x of data) {
            if ((m & 0x1f) == 0) {
                avec.push(0);
                bvec.push(0);
                k++;
            }
            const v = x + 1 + Number(x > 0);
            avec[k] |= ((v & 2) >> 1) << m;
            bvec[k] |= (v & 1) << m;
            m += 1;
        }
        return new Vector3vl(data.length, avec, bvec);
    }
    get bits() : number {
        return this._bits;
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
    not() {
        return new Vector3vl(this._bits,
            this._bvec.map(a => ~a),
            this._avec.map(a => ~a));
    }
    toArray() {
        let bit = 0, k = 0, m = 1, out = [];
        while (bit < this._bits) {
            const a = this._avec[k] & m;
            const b = this._bvec[k] & m;
            if (a && b) out.push(1);
            else if (b) out.push(0);
            else out.push(-1);
            m <<= 1;
            if (m == 0) {
                k++;
                m = 1;
            }
            bit++;
        }
        return out;
    }
    eq(v : Vector3vl) {
        if (v._bits != this._bits) return false;
        const lastmask = (~0) >>> -this._bits;
        let i = 0;
        for (; i < this._avec.length - 1; i++) {
            if (this._avec[i] != v._avec[i]) return false;
            if (this._bvec[i] != v._bvec[i]) return false;
        }
        if ((this._avec[i] & lastmask) != (v._avec[i] & lastmask)) return false;
        if ((this._bvec[i] & lastmask) != (v._bvec[i] & lastmask)) return false;
        return true;
    }
};


