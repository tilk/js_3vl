
function zip(f : (x : number, y : number) => number, a : number[], b : number[]) {
    return a.map((x, i) => f(x, b[i]));
}

export class Vector3vl {
    private bits : number;
    private avec : number[];
    private bvec : number[];
    private constructor(bits, avec, bvec) {
        this.bits = bits;
        this.avec = avec;
        this.bvec = bvec;
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
    and(v : Vector3vl) {
        console.assert(v.bits == this.bits);
        return new Vector3vl(this.bits,
            zip((a, b) => a & b, v.avec, this.avec),
            zip((a, b) => a & b, v.bvec, this.bvec));
    }
    or(v : Vector3vl) {
        console.assert(v.bits == this.bits);
        return new Vector3vl(this.bits,
            zip((a, b) => a | b, v.avec, this.avec),
            zip((a, b) => a | b, v.bvec, this.bvec));
    }
    not() {
        return new Vector3vl(this.bits,
            this.bvec.map(a => ~a),
            this.avec.map(a => ~a));
    }
    toArray() {
        let bit = 0, k = 0, m = 1, out = [];
        while (bit < this.bits) {
            const a = this.avec[k] & m;
            const b = this.bvec[k] & m;
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
};


