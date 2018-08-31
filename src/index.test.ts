
import { Vector3vl } from './index';
import * as _ from 'lodash';
import * as jsc from 'jsverify';

const array3vl = jsc.array(jsc.elements([-1, 0, 1]));
const vector3vl = array3vl.smap(a => Vector3vl.fromArray(a), v => v.toArray());

jsc.property('Vector3vl.fromArray.toArray', array3vl, a => 
    _.isEqual(a, Vector3vl.fromArray(a).toArray() ));

jsc.property('Vector3vl.toArray.fromArray', vector3vl, v => 
    v.eq(Vector3vl.fromArray(v.toArray()) ));
