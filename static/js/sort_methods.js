
//var test = {1:'c', 2:'b', 3:'a', 4:'d'};
var test = {1:'Р12', 2:'Р22', 3:'Р26', 4:'17В', 5:'18В', 6:'Р30', 7:'Р84', 8:'0В', 9:'1В', 10:'2В', 11:'3В', 12:'Р10'};
//for (i in test ){console.log(test[i])};
var sortObjectByValue = function(obj){
    var arr = [];
    var sorted = {};
    for(prop in obj)
        if (obj.hasOwnProperty(prop)) {
            //arr.push([obj[i], i]);
            arr.push([prop, obj[prop]]);
        }
    //arr.sort();  // sort by keys, alphabetically
    arr.sort(function(a,b){ return (a[1]<b[1] ? -1 : (a[1]>b[1] ? 1 : 0)); });  // sort by values, alphabetically
    //arr.sort(function(a,b){ return (a[0]<b[0] ? -1 : (a[0]>b[0] ? 1 : 0)); });  // sort by keys, alphabetically
    //arr.sort(function(a,b){ a = parseInt(a[0]); b = parseInt(b[0]); return (a < b ? -1 : (a > b ? 1 : 0)); });  // sort by keys, increase
    //arr.sort(function(a,b){ return (a[1].localeCompare(b[1])); });  // sort by values, alphabetically
    //for (i in arr) { sorted[arr[i][0]] = arr[i][1];}
    $.each(arr, function(){sorted[this[0]] = this[1]});
    return sorted;
    }

var st=(sortObjectByValue(test));
for (it in st) log(st[it])

// sort <option> in <select>
        //var opt_list = el.find('option');
        //opt_list.sort(function(a,b){return $(a).text() > $(b).text();});
        //if (sort) el.html('').append(opt_list);