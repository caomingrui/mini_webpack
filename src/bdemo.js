import {fn} from 'src/tool';


export default  () => {
    const { setVal } = fn();
    const data = setVal('a', '1');
    return data;
}