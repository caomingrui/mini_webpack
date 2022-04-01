import {fn} from 'src/tool';


export default  () => {
    const { getVal } = fn();
    const val = getVal('a');
    return val;
}