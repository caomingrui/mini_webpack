import {fn} from 'src/tool.js';


export default  () => {
    const { getVal } = fn();
    const val = getVal('a');
    return val;
}