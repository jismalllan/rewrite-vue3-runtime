/*let arr = [4,2,3,1,5];
console.log(LengthOfLIS(arr));
console.log(IndexOfLIS(arr));
console.log(NumOfLIS(arr));*/

function LengthOfLIS(num){
    let len = num.length;
    const dp = new Array(len).fill(1);
    if (len<=1){
        return len;
    }
    let max = 1;
    for (let i = 1;i<len;i++){
        for (let j = 0;j<i;j++){
            if(num[i]>num[j]){
                dp[i] = Math.max(dp[i],dp[j]+1);
            }
        }
        max = Math.max(max,dp[i]);
    }
    return max;
}

export function IndexOfLIS(num){
    let len = num.length;
    let max = [num[0]];
    const dp = new Array(len).fill(1).map((v,i)=>[[i]]);
    for (let i = 1;i<len;i++){
        for (let j = 0;j<i;j++){
            if(num[i]>num[j]){
                for (let k = 0;k<dp[j].length;k++){
                    let target = [...dp[j][k],i];
                    dp[i].push(target);
                    if(target.length>max.length){
                        max = [...target];
                    }
                }
            }
        }
    }
    return max;
}

function NumOfLIS(num){
    let len = num.length;
    let max = [num[0]];
    const dp = new Array(len).fill(1).map((v,i)=>[[num[i]]]);
    for (let i = 1;i<len;i++){
        for (let j = 0;j<i;j++){
            if(num[i]>num[j]){
                for (let k = 0;k<dp[j].length;k++){
                    let target = [...dp[j][k],num[i]];
                    dp[i].push(target);
                    if(target.length>max.length){
                        max = [...target];
                    }
                }
            }
        }
    }
    return max;
}