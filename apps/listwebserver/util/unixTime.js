function unixTimeShort(UNIX_timestamp){
    var ts = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = ts.getFullYear();
    var month = months[ts.getMonth()];
    var date = ts.getDate();
    var hour = ts.getHours();
    var min = ts.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;

    return time;
}

module.exports = { unixTimeShort };