
import { Vector3vl } from './index';
import * as _ from 'lodash';
import * as jsc from 'jsverify';

const array3vl = jsc.array(jsc.elements([-1, 0, 1]));
const vector3vl = array3vl.smap(a => Vector3vl.fromArray(a), v => v.toArray());

jsc.property('fromArray.toArray', array3vl, a => 
    _.isEqual(a, Vector3vl.fromArray(a).toArray()));

jsc.property('toArray.fromArray', vector3vl, v => 
    v.eq(Vector3vl.fromArray(v.toArray())));

jsc.property('~~x = x', vector3vl, v =>
    v.eq(v.not().not()));

jsc.property('x | x == x', vector3vl, v =>
    v.eq(v.or(v)));

jsc.property('x | 0 == x', vector3vl, v =>
    v.eq(v.or(Vector3vl.zeros(v.bits))));

jsc.property('0 | x == x', vector3vl, v =>
    v.eq(Vector3vl.zeros(v.bits).or(v)));

jsc.property('x | 1 == 1', vector3vl, v =>
    Vector3vl.ones(v.bits).eq(v.or(Vector3vl.ones(v.bits))));

jsc.property('1 | x == 1', vector3vl, v =>
    Vector3vl.ones(v.bits).eq(Vector3vl.ones(v.bits).or(v)));

