let stringA = document.getElementById('string-a');
let stringB = document.getElementById('string-b');
let compareButton = document.getElementById('compareButton');
let explination = document.getElementById('explanation');


function findPathImpl(completPaths, paths, pathNumber, m, i, j,a,b) {
    if ( i === 0 && j === 0) {
        completPaths.push(paths[pathNumber]);
        return;
    }
    else if(i === 0) {
        if(m[i][j] === m[i][j-1] + 1){
            paths[pathNumber].push({
                type: "ins",
                i: i,
                j: j,
            });
            findPathImpl(completPaths, paths, pathNumber, m, i, j-1,a,b);
        }
        return;
    }
    else if( j === 0) {
        if(m[i][j] === m[i-1][j] + 1){
            paths[pathNumber].push({
                type: "del",
                i: i,
                j: j,
            });
            findPathImpl(completPaths, paths, pathNumber, m, i-1, j,a,b);
        }
        return;
    }
    if (i > 1 && j > 1 && m[i][j] === m[i-2][j-2] + 1 
        && m[i][j] !== m[i-1][j-1] + 1 
        && a[i-1] === b[j-2]
        && b[j-1] === a[i-2]
        ) {
        paths[pathNumber].push({
            type: "swap",
            i: i,
            j: j,
        });
        findPathImpl(completPaths,paths,pathNumber, m, i-2, j-2,a,b);
        return;
    }

    let min = Math.min(m[i-1][j-1], m[i-1][j], m[i][j-1]);
    
    let newPath = false;
    let newPathNumber = pathNumber;
    let tempPath = [...paths[pathNumber]];
    
    if (m[i-1][j-1] === min) {
        if (m[i][j] !== min){
            paths[newPathNumber].push({
                type: "sub",
                i: i,
                j: j,
            });
        }
       
        findPathImpl(completPaths,paths,newPathNumber,m,i-1,j-1,a,b);
        
        newPath = true;
    }
    if (m[i][j] === min) {
        return;
    }
    if (m[i-1][j] === min) {
        if (newPath) {
            paths.push([...tempPath]);
            newPathNumber = paths.length - 1;
        }
        paths[newPathNumber].push({
            type: "del",
            i: i,
            j: j,
        });
        findPathImpl(completPaths,paths,newPathNumber,m,i-1,j,a,b);
        
        newPath = true;
    }
    if (m[i][j-1] === min) {
        if (newPath) {
            paths.push([...tempPath]);
            newPathNumber = paths.length - 1;
        }
        paths[newPathNumber].push({
            type: "ins",
            i: i,
            j: j,
        });
        findPathImpl(completPaths,paths,newPathNumber,m,i,j-1,a,b);
        
    }
    paths[pathNumber] = tempPath;
}

function analyze(m,a,b) {
    let res = [];
    let i = m.length - 1;
    let j = m[0].length - 1;
    findPathImpl(res,[[]],0,m,i,j,a,b);
    let paths = [];
    for (let path of res) {
        let temp = [];
        let lastc = "";
        let lastcpos = 0;
        for(let op of path.reverse() ) {
            
            if(op.type === "ins") {
                if(a.length !== 0){
                    temp.push(
                        `insert '${b[op.j - 1]}' ${op.i === 0 ? 
                            `before '` + a[0] + `'` : 
                            `after '` + a[op.i - 1] + `'`}`
                    );
                }
                else {
                    if(lastc !== "") {
                        temp.push(`insert '${b[op.j - 1]}' after '${lastc}'`);
                    }
                    else {
                        temp.push(`insert '${b[op.j - 1]}'`);
                    }
                }
                lastc = b[op.j - 1];
                lastcpos = op.i;
            }
            else if(op.type === "del") {
                temp.push(`delete '${a[op.i - 1]}'`);
                lastc = a[op.i - 2];
                lastcpos = op.i - 1;
            }
            else if(op.type === "swap") {
                if ( op.i - 1 === lastcpos ) {
                    temp.push(`swap '${lastc}' and '${a[op.i - 1]}'`);
                }
                else {
                    temp.push(`swap '${a[op.i - 2]}' and '${a[op.i - 1]}'`);
                }
                lastcpos = op.i - 1;
            }
            else if(op.type === "sub") {
                temp.push(`substitute '${a[op.i - 1]}' for '${b[op.j - 1]}'`);
                lastcpos = op.i - 1;
                lastc = b[op.j - 1];
            }
            else {
                console.error("oh no");
            }
        }
        paths.push(temp);
        
    }
    let resdiv = document.createElement("div");
    for(let i = 0; i < 1; ++i) {
        let tdiv = document.createElement("div");
        let header = document.createElement("h2");
        header.innerText = `Edit Path`;
        tdiv.appendChild(header);
        for(let op of paths[i]) {
            let p = document.createElement('p');
            p.innerText = op;
            tdiv.appendChild(p);
        }
        resdiv.appendChild(tdiv);
    }
    console.table(paths);
    return resdiv.innerHTML;
}

compareButton.addEventListener('click',(e)=>{
    if(stringA.value.length > 25 || stringB.value.length > 25) {
        explination.innerText = "too long!"
        return;
    }
    let osaDist = osa(stringA.value,stringB.value);
    console.table(osaDist);
    explination.innerHTML = analyze(osaDist,stringA.value, stringB.value);
    
});


