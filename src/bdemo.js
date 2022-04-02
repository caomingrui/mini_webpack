import {fn} from 'src/tool.js';


export default  () => {
    const { setVal } = fn();
    const data = setVal('a', '1');
    return data;
}