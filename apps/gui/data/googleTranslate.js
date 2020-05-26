 /*
  * Translate any english "string" passed as argument to all the
  * languages required by online spreadsheet
  **/
const translate = require('@vitalets/google-translate-api');

const fromString = process.argv[2];
// French, Russian, Ukranian, Nederland (BE), English, Portuguese, German, Greek, Nederland (NL)
const targets = ['fr', 'ru', 'uk', 'nl', 'en', 'pt', 'de', 'el', 'nl'];

const translatePromises = targets.map((target, id) => {
    return translate(fromString, {from: 'en', to: target})
        .then(res => {
            return {'id' : id , 'target' : target, 'res': res.text};
        })
        .catch(err => {
            console.error(err);
        });
});

// print out sorted results
Promise.all(translatePromises)
    .then(res =>{
        const sorted = res.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        console.log('---------------------------------\n');
        sorted.map(r => {
            console.log(`${r.target} => ${r.res}`);
        });
        const joined = Array.from(sorted, e => e.res).join('\\');
        console.log('---------------------------------\n');
        console.log('Copy this and paste in the spreadsheet, B column of the newline\n');
        console.log(`    =SPLIT("${joined}","\\")`);
        console.log();
    })
    .catch(err => {
        console.error(err);
    });
