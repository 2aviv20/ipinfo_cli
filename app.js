const stdin = process.openStdin();
const http = require('http');
const tokken = '765415d33b861b';

console.log('enter ip adress');
stdin.addListener("data", function(d) {
    const ip = d.toString().trim(); 
    queryIPInfo(ip);
});

function createTable(tableTitle , titlesArr, valuesArr){
    let msg = '|'
    const colWidth = 30;
    // table header
    for(let i=0;i<titlesArr.length;i++){
        msg += ` ${titlesArr[i]}`;
        for(let j = 0; j< colWidth - titlesArr[i].length ; j++){
            msg += ' ';
        } 
        msg += '|';
    }
    // table header part 2 ---
    msg += '\n';
    msg += ' ';
    for(let i = 0; i< (colWidth * titlesArr.length ) + titlesArr.length + 2 ; i++){
        msg += '-';
    }
    msg += '\n';
    msg += '|';

    //tables values
    for(let i=0;i<valuesArr.length;i++){
        msg += ` ${valuesArr[i]}`;
        for(let j = 0; j< colWidth - valuesArr[i].length ; j++){
            msg += ' ';
        } 
        msg += '|';
    }
    console.log(`\n${tableTitle}\n`);
    console.log(`${msg}\n`); 
}

function printTable(obj){
    let latLon = ['',''];
    if(obj.loc){
        latLon = obj.loc.split(",");
    }
    createTable(' Location',['Country', 'Region','City'],[obj.country, obj.region, obj.city]);
    createTable(' Coordinates',['Latitude', 'Longitude'],[latLon[0], latLon[1]]);
    console.log(' Organizations\n');
    console.log(` ${obj.org}`);
}

function queryIPInfo(ip){
    if(ipValidatior(ip)){
        ipHttpRequest(ip);
    }
}

// the numbers shuld be in the range 0 - 255
function rangeValidator(num){
    if(num >=0 && num <=255 && num !=''){
        return true;
    }
    else{return false;}
}

/**
 * the validator check:
 * ip cant start or end with dot
 * only number allowed, no special chars or letters
 * the numbers shuld be in the range 0 - 255
 * ip contain 4 sections of numbers
 * @param {*ip adress} ip 
 */
function ipValidatior(ip){
    let num = '';
    let count = 0;
    // check if the strimg start or end with .
    if(ip.charCodeAt(0) == 46 || ip.charCodeAt(ip.length-1) == 46){
        console.log(`ip can't start or end with Dot`);
        return false;
    }
    for(let i = 0;i < ip.length; i++){
        //check if the char is 0-9
        if(ip.charCodeAt(i) < 48 || ip.charCodeAt(i) > 57){
            //check if the char is Dot
            if(ip.charCodeAt(i) == 46){
                //check if the number is 0 - 255
                if(!rangeValidator(num)){
                    console.log('[not valid] - number shuld be in 0-255');
                    return false;
                }else{count++;};
                num = '';
            }
            else{
                //not valid
                console.log('[not valid] - only number allowed');
                return false;
            }
        }
        else{
            num += ip[i];
        }
        if(i == ip.length-1){
            if(!rangeValidator(num)){
                console.log('[not valid] - shuld be in 0-255');
                return false;
            }else{count++;};
        }
        
    }
    if(count !=4){
        //not valid
        console.log("[not valid] - this number of groupes !=4");
        return false;
    }
    return true;
}

function ipHttpRequest(ip){
    http.get(`http://ipinfo.io/${ip}/json?token=${tokken}`, (res) =>{
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.log('Erorr!!')
          console.error(error.message);
          res.resume();
          return;
        }
      
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            if(parsedData.hasOwnProperty('country') && parsedData.hasOwnProperty('region') && parsedData.hasOwnProperty('city') && parsedData.hasOwnProperty('loc') && parsedData.hasOwnProperty('org')){
                printTable(parsedData);
            }else{
                console.log(`ipinfo.io doesn't data on the ip adress ${ip}`);
            }
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
}