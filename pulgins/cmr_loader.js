const list = [];

// 标签周期
let tagState = false,
    // 左侧标识
    leftTagState = false,
    // 样式状态
    styleState = false,
    // 样式内容
    style = '',
    // 标签名称
    tag = '',
    // text 状态
    countState = false,
    // 记录text
    count = '';
    // 记录标签属性
    tagCount = '';


function option (type) {
    const prevData = list[list.length - 1];
    switch (String(type)) {
        // 左 <
        case '0': {
            tagState = true;
            countState = false;
            leftTagState = true;
            if (prevData) {
                prevData.text = count;
                list[list.length - 1] = prevData;
            }
            count = "";
            return;
        }
        // 左 >
        case '1': {
            tagState = false;
            leftTagState = false;
            styleState = false;
            const obj = {
                type: tag.slice(1),
                child: [],
                style: style.slice(2, -1)
            };
            list.push(obj);
            tag = '';
            countState = true;
            style = '';
            tagCount = ''
        }
        // 又 </
        case '2': {
            countState = false;
            console.log(prevData)
            const innerText = prevData?.text ?? '';
            if (prevData) {
                prevData.text = innerText + count;
            }
            list[list.length - 1] = prevData;
            count = '';
        }
        // 右 >
        case '3': {
            const lastData = list.pop();
            const prevData = list[list.length - 1];
            if (prevData) {
                prevData.child = [...prevData.child, lastData];
                list[list.length - 1] = prevData;
            }
            countState = true;
        }
    }
}

module.exports = function (source) {
    console.log(source, '测试测试测试测试测试从');
    const str = source;

    const exportFile = `
    ${str.replace(/cmr/g, 'const')}
    export default a + b`;


    // for (let i = 0; i < str.length - 1; i++) {
    //     const current = str[i], nextCurrent = str[i + 1];
    //
    //     if (current === '<' && nextCurrent !== '/') {
    //         option(0);
    //     }
    //
    //     if (current === '<' && nextCurrent === '/') {
    //         option(2);
    //     }
    //
    //     // 右闭合 结束
    //     if (current === '>' && !leftTagState) {
    //         option(3);
    //     }
    //
    //     // > 左闭合
    //     if (current === '>' && leftTagState) {
    //         option(1);
    //     }
    //
    //     if (tagState) {
    //         if (current === " ") {
    //             tagState = false;
    //         }
    //         else {
    //             tag += current;
    //         }
    //     }
    //
    //     if (leftTagState && !tagState) {
    //         tagCount += current;
    //         if (tagCount.slice(1) === 'style=') {
    //             tagCount = "";
    //             styleState = true;
    //         }
    //         if (styleState) {
    //             style+=current;
    //         }
    //     }
    //
    //     if (countState && current != '>') {
    //         count += current;
    //     }
    // }
    // list.push(count);
    // const ast = list[0];
    // console.log(ast, 'ast');

    console.log(exportFile, this.rules);
    return exportFile;
}