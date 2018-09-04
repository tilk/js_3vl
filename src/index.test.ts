
import { Vector3vl } from './index';
import * as _ from 'lodash';
import * as jsc from 'jsverify';

const replicate = (n, g) => jsc.tuple(Array(n).fill(g))

const myarray = <A>(arb : jsc.ArbitraryLike<A>) => jsc.bless({
    generator: jsc.generator.bless((size : number) =>
        jsc.generator.tuple(Array(jsc.random(0, size)).fill(arb.generator))(size)),
    shrink: jsc.shrink.array(arb.shrink),
    show: a => jsc.show.array(arb.show, a)
});

const myarrays = <A>(n : number, arb : jsc.ArbitraryLike<A>) => jsc.bless({
    generator: jsc.generator.bless((size : number) =>
        jsc.generator.tuple(Array(n).fill(jsc.generator.tuple(Array(jsc.random(0, size)).fill(arb.generator))))(size)),
    shrink: jsc.shrink.tuple(Array(n).fill(jsc.shrink.array(arb.shrink))),
    show: a => jsc.show.tuple(Array(n).fill(b => jsc.show.array(arb.show, b)), a)
});

const trit = jsc.elements([-1, 0, 1]);
const array3vl = myarray(trit);
const arrays3vl = n => myarrays(n, trit);
const vector3vl = array3vl.smap(a => Vector3vl.fromArray(a), v => v.toArray());
const vectors3vl = n => arrays3vl(n).smap(x => x.map(a => Vector3vl.fromArray(a)), x => x.map(v => v.toArray()));
const binarytxt = jsc.array(jsc.elements(['0', '1', 'x'])).smap(a => a.join(''), s => s.split(''))
const octaltxt = myarray(jsc.elements(['x'].concat(Array.from(Array(8), (a, i) => i.toString()))))
    .smap(a => a.join(''), s => s.split(''))
const hextxt = myarray(jsc.elements(['x'].concat(Array.from(Array(16), (a, i) => i.toString(16)))))
    .smap(a => a.join(''), s => s.split(''))

describe('relation to arrays', () => {
    jsc.property('fromArray.toArray', array3vl, a =>
        _.isEqual(a, Vector3vl.fromArray(a).toArray()));

    jsc.property('toArray.fromArray', vector3vl, v => 
        v.eq(Vector3vl.fromArray(v.toArray())));

    jsc.property('get', vector3vl, v => 
        _.isEqual(v.toArray(), Array.from(Array(v.bits), (x, k) => v.get(k))));
});

describe('parsing and printing', () => {
    jsc.property('rev binary', vector3vl, v =>
        v.eq(Vector3vl.fromBin(v.toBin())));

    jsc.property('binary', binarytxt, s =>
        s === Vector3vl.fromBin(s).toBin());

    jsc.property('octal', octaltxt, s =>
        s === Vector3vl.fromOct(s).toOct());

    jsc.property('hexadecimal', hextxt, s =>
        s === Vector3vl.fromHex(s).toHex());
});

describe('constant vectors', () => {
    jsc.property('0', jsc.nat(1000), n =>
        _.isEqual(Array(n).fill(-1), Vector3vl.zeros(n).toArray()));
    jsc.property('x', jsc.nat(1000), n =>
        _.isEqual(Array(n).fill(0), Vector3vl.xes(n).toArray()));
    jsc.property('1', jsc.nat(1000), n =>
        _.isEqual(Array(n).fill(1), Vector3vl.ones(n).toArray()));
});

describe('not properties', () => {
    jsc.property('~~a == a', vector3vl, v =>
        v.eq(v.not().not()));
    
    jsc.property('~(a | b) == ~a & ~b', vectors3vl(2), ([v, w]) =>
        v.or(w).not().eq(v.not().and(w.not())));
    
    jsc.property('~(a & b) == ~a | ~b', vectors3vl(2), ([v, w]) =>
        v.and(w).not().eq(v.not().or(w.not())));
    
    jsc.property('~(a ^ b) == ~a ^ b', vectors3vl(2), ([v, w]) =>
        v.xor(w).not().eq(v.not().xor(w)));
});

describe('or properties', () => {
    jsc.property('a | a == a', vector3vl, v =>
        v.eq(v.or(v)));

    jsc.property('a | 0 == a', vector3vl, v =>
        v.eq(v.or(Vector3vl.zeros(v.bits))));

    jsc.property('0 | a == a', vector3vl, v =>
        v.eq(Vector3vl.zeros(v.bits).or(v)));

    jsc.property('a | 1 == 1', vector3vl, v =>
        Vector3vl.ones(v.bits).eq(v.or(Vector3vl.ones(v.bits))));

    jsc.property('1 | a == 1', vector3vl, v =>
        Vector3vl.ones(v.bits).eq(Vector3vl.ones(v.bits).or(v)));

    jsc.property('a | b == b | a', vectors3vl(2), ([v, w]) =>
        v.or(w).eq(w.or(v)));

    jsc.property('(a | b) | c == a | (b | c)', vectors3vl(3), ([v, w, x]) =>
        v.or(w).or(x).eq(v.or(w.or(x))));
});

describe('and properties', () => {
    jsc.property('a & a == a', vector3vl, v =>
        v.eq(v.and(v)));

    jsc.property('a & 0 == 0', vector3vl, v =>
        Vector3vl.zeros(v.bits).eq(v.and(Vector3vl.zeros(v.bits))));

    jsc.property('0 & a == 0', vector3vl, v =>
        Vector3vl.zeros(v.bits).eq(Vector3vl.zeros(v.bits).and(v)));

    jsc.property('x & 1 == a', vector3vl, v =>
        v.eq(v.and(Vector3vl.ones(v.bits))));

    jsc.property('1 & a == a', vector3vl, v =>
        v.eq(Vector3vl.ones(v.bits).and(v)));

    jsc.property('a & b == b & a', vectors3vl(2), ([v, w]) =>
        v.and(w).eq(w.and(v)));

    jsc.property('(a & b) & c == a & (b & c)', vectors3vl(3), ([v, w, x]) =>
        v.and(w).and(x).eq(v.and(w.and(x))));
});

describe('xor properties', () => {
    jsc.property('a ^ 0 == a', vector3vl, v =>
        v.xor(Vector3vl.zeros(v.bits)).eq(v));

    jsc.property('0 ^ a == a', vector3vl, v =>
        Vector3vl.zeros(v.bits).xor(v).eq(v));

    jsc.property('a ^ 1 == ~a', vector3vl, v =>
        v.xor(Vector3vl.ones(v.bits)).eq(v.not()));

    jsc.property('1 ^ a == ~a', vector3vl, v =>
        Vector3vl.ones(v.bits).xor(v).eq(v.not()));

    jsc.property('a ^ b == b ^ a', vectors3vl(2), ([v, w]) =>
        v.xor(w).eq(w.xor(v)));

    jsc.property('(a ^ b) ^ c == a ^ (b ^ c)', vectors3vl(3), ([v, w, x]) =>
        v.xor(w).xor(x).eq(v.xor(w.xor(x))));
});

