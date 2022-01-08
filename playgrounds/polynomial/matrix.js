class AugMatrix{
    constructor(...rows){
        this.rowCount = rows.length;
        this.colCount = rows[0].length;
        this.data = [];
        for(let i = 0; i < rows.length; i++){
            if(rows[i].length !== this.colCount){
                console.error('Jagged matrix not supported');
            }
            this.data.push([...rows[i]]);
        }
        
    }
    print(){
        for(let i = 0; i < this.rowCount; i++){
            let str = '[ '
            for(let j=0;j<this.colCount;j++){
                if(j === this.colCount-1){
                    str += '| '
                }
                str += this.data[i][j] + ' ';
            }
            str += ']'
            console.log(str);
        }
        console.log('\n');
    }
    swapRow(i,j){
        if(i >= this.rowCount && j >= this.rowCount){
            console.error('index for swap out of bounds')
            return;
        }
        let tempRow = [...this.data[i]];
        this.data[i] = [...this.data[j]];
        this.data[j] = tempRow;
    }
    rref(){
        let lead = 0;
        for(let r = 0; r < this.rowCount; r++){
            if(lead >= this.colCount){
                return;
            }
            let i = r;
            while(this.data[i][lead] === 0){
                i++;
                if(this.rowCount === i){
                    i = r;
                    lead++;
                    if(lead === this.colCount){
                        return;
                    }
                }
            }
            this.swapRow(i,r);
            if(this.data[r][lead] !== 0){
                //get row r col lead to 1
                let val = this.data[r][lead];
                for(let k = 0; k < this.colCount; k++){
                    this.data[r][k] /= val;
                }
            }
            for(let i = 0; i < this.rowCount; i++){
                if(i === r){continue}
                //subtract data[i,lead]*row(r) from row(i)
                let val = this.data[i][lead];
                for(let k = 0; k < this.colCount; k++){
                    this.data[i][k] -= val * this.data[r][k];
                }
            }
            lead++;
        }
    }
    checkValid(){
        for(let n= 0; n < this.colCount-1; n++){
            if(Math.abs(this.data[this.rowCount-1][n]) > 0.1){
                return true;
            }
        }
        return (this.data[this.rowCount-1][this.colCount-1] === 0)
    }
}
/*
let m = new AugMatrix([1,2,-1,-4],[2,3,-1,-11],[-2,0,-3,22]);
m.print();
m.swapRow(0,1);
m.print();
m.rref();
m.print();
*/