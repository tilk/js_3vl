
import { Vector3vl } from './index';
import * as _ from 'lodash';
import * as jsc from 'jsverify';

const array3vl = jsc.array(jsc.elements([-1, 0, 1]));
const vector3vl = array3vl.smap(a => Vector3vl.fromArray(a), v => v.toArray());

describe('relation to arrays', () => {
    jsc.property('fromArray.toArray', array3vl, a =>
        _.isEqual(a, Vector3vl.fromArray(a).toArray()));

    jsc.property('toArray.fromArray', vector3vl, v => 
        v.eq(Vector3vl.fromArray(v.toArray())));

    jsc.property('get', vector3vl, v => 
        _.isEqual(v.toArray(), Array.from(Array(v.bits), (x, k) => v.get(k))));
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
});

