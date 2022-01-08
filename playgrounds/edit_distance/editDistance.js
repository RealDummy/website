//takes 2 strings, returns levenshtien edit distance between them
function levenshtein(a,b){
    let d = [];
    for(let i = 0; i <= a.length; i++){
        let temp = [];
        for(let j = 0; j <= b.length; j++){
            temp.push(0);
        }
        d.push(temp);
    }
    //word 1
    for(let i = 1; i < d.length; i++){
        d[i][0] = i;
    }
    //word2
    for(let j = 1; j < d[0].length; j++){
        d[0][j] = j;
    }
    for(let i = 1; i < d.length; i++){
        for(let j = 1; j < d[0].length; j++){
            let subCost = 1;
            if(a[i-1] === b[j-1]){
                subCost = 0;
            }
            //the smallest between deletion, insertion and substitution
            d[i][j] = Math.min(
                d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+subCost
                );
        }
    }
    return d;
}

function osa(a,b){
    let d = [];
    for(let i = 0; i <= a.length; i++){
        let temp = [];
        for(let j = 0; j <= b.length; j++){
            temp.push(0);
        }
        d.push(temp);
    }
    for( let i = 1; i <= a.length; i++){
        d[i][0] = i;
    }
    for(let j = 1; j <= b.length; j++){
        d[0][j] = j;
    }
    for(let i = 1; i < d.length; i++){
        for(let j = 1; j < d[0].length; j++){
            let subCost = 1;
            if(a[i-1] === b[j-1]){
                subCost = 0;
            }
            //the smallest between deletion, insertion and substitution, and swap
            d[i][j] = Math.min(
                d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+subCost
            );
            if(i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]){
                d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 1);
            }
        }
    }
    return d;
}