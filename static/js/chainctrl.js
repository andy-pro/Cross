//======================================
/*** Chain Controller ***/
function chainCtrl(params, route) {

/*** controller functions ***/
{

    refreshWatch = function() {
     //function refreshWatch() {
        //$("table tr").remove(".refreshing");
        $("table#chaintablewatch tr").remove(".refreshing");
        $.each(chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link[this+'Id']).appendTo(tr); });
            tr.appendTo(chaintablewatchId);   // id of element, without declare variable!!!
        });
    }

    pairEditAccept = function () {
        var data = $('form.chain').serializeArray();
        data.push({name:'cross_0', value:0});
        data.push({name:'plint_0', value:plintid});
        data.push({name:'pair_0',  value:pairid});
        // saveData - add formkey, ajax(POST) data toserver, flash status result;
        // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
        saveData(data, plintdata);
    }

    addLink = function () {
        var index = chaindata.length;
        var link = {};
        var controls = {};
        var tr = $('<tr>');
        drawSelectors(tr, controls, index);
        $.each(stages, function() { link[this+'Id'] = 0; });
        //controls.crossEl.addCrossOptions();
        chainCross(controls, link);     // starting fill controls <select> with according <option>
        chaindata.push(link);
        chaincontrols.push(controls);
        tr.appendTo(chaintableId);

//~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
        refreshWatch();
//~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~

    }

    function chainCross(controls, link) {
        var El = controls.crossEl;  // cross selector
        if (!cache['crosses']) cache['crosses'] = sLoad('indexdata').crosses;
        El.append($('<option>').text('Not crossed').attr('value', 0));
        var idx = link.crossId;
        addOptFromObj(El, cache['crosses'], idx);
        if (idx)
            chainVertical(controls, link);
        }

    function chainVertical(controls, link) {
        var idx = link.crossId;
        if (idx > 0) {
            var data = cache.crosses[idx].verticals;
            if (!$.isEmptyObject(data)) {
                var El = controls.verticalEl;  // vertical selector
                idx = link.verticalId;
                addOptFromObj(El, data, idx);
                idx = El[0].value;
                link.verticalId = idx;
                if (idx)
                    chainPlint(controls, link);
                }
            }
        }

    function chainPlint(controls, link) {
        var idx = link.verticalId;
        if (idx > 0) {
            var data = cache.crosses[link.crossId].verticals[idx];
            //----------callback function---------------
                var callback = function(){
                    El = controls.plintEl;
                    var plintsdata = data['plints'].data;
                    //log(data);
                    if (plintsdata.length) {
                        //addOptFromArr(El, plintsdata);
                        $.each(plintsdata, function() {El.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
                        El.prop('disabled', false);
                        var pair;
                        if (link.plintId) {
                            El.settovalue(link.plintId);
                            pair = link.pairId;
                        } else {             // false(default) - set to first
                            El.settofirst()    ;
                            link.plintId = El[0].value;
                            pair = 1;
                        }
                      si = El[0].selectedIndex;
                      El = controls.pairEl;
                      El.enumoptions(plintsdata[si][2]);
                      El.settovalue(pair);
                      link.pairId = pair;
                    }
//~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
refreshWatch();
//~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
                };
            //----------end callback function---------------
            aLoad(data, callback, 'plints', [link.verticalId]);
            }
        }

    function addOptFromObj(el, data, value) {
        $.each(data, function(key, item) {el.append($('<option>').text(item.title+' : '+key).attr('value', key));});
        el.prop('disabled', false);
        //value = typeof value !== 'undefined' ? value : 0;
        if (value) el.settovalue(value);
            else el.settofirst();
        }

    //function addOptFromArr(el, data) {
        //$.each(data, function() {el.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
        //el.prop('disabled', false); }

    //---------- jQuery extension function ---------------
    $.fn.settofirst = function() { $(':nth-child(1)', this).attr('selected', 'selected'); }

    $.fn.settovalue = function(value) { $('[value='+value+']' , this).attr('selected', 'selected'); }

    $.fn.enumoptions = function (start) {
        var DEBUG = ' : value';
        var e = $('option', this) // get options set of select
        start = parseInt(start);
        if (e.length) {  // if options exist, simply change text
            $.each(e, function (i) {this.text = i + start + DEBUG+String(i+1)});
        } else {
            this.prop('disabled', false);   // if it was early cleared and disabled, append new options
            for (i= 1; i <= 10; i++) {
                this.append($('<option>').text(i+start-1 + DEBUG+String(i)).attr('value', i));
            }
        }
    }

    selectorChange = function(Eh) {
        //var index = Eh.attributes['data-index'].value;
        //var stage = Eh.attributes['data-stage'].value;
        var value = Eh.attributes['name'].value.split('_');
        var stage = value[0];
        var index = parseInt(value[1])-1;
        var link = chaindata[index];
        var controls = chaincontrols[index];
        var El = controls[stage+'El'];
        value = El[0].value;
        link[stage+'Id'] = value;
        //console.log('index:'+index+' stage:'+stage+' value:'+value);
        switch (stage) {
            case stages[0]: // cross
                //----vertical, plint, pair selectors disable---------
                controls.verticalEl.empty();
                controls.verticalEl.prop('disabled', true);
                link.verticalId = 0;
                plintDisable(controls, link);
                //--------------------------
                chainVertical(controls, link);
                break;
            case stages[1]: // vertical
                plintDisable(controls, link); //----- plint, pair selectors disable
                chainPlint(controls, link);
                break;
            case stages[2]: // plint
                var data = cache.crosses[link.crossId].verticals[link.verticalId].plints.data;
                controls.pairEl.enumoptions(data[El[0].selectedIndex][2]);
                break;
            case 'pair':
                //
        }
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
        refreshWatch();
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~

    }

    function drawSelectors(tr, controls, index) {
        index++;
        $.each(stages, function() {
            var td = $('<td>');
            var sel = $('<select>', {class:"form-control",
                                     //"data-index":index,
                                     //"data-stage":this,
                                     name:this+"_"+index,
                                     //"size":"20",
                                     //onchange:this+"Change(this)"
                                     onchange:"selectorChange(this)"
                                     }).prop('disabled', true).appendTo(td);    // disabled controls
            td.appendTo(tr);
            controls[this+'El'] = sel;
        });}

    function plintDisable(controls, link) {  //----- plint, pair selectors disable
        controls.plintEl.empty();
        controls.plintEl.prop('disabled', true);
        link.plintId = 0;
        controls.pairEl.empty();
        controls.pairEl.prop('disabled', true);
        link.pairId = 0;
    }
}
/*** end chain controller functions ***/

    // start Chain Controller

    var cache = {};     // use own data cache
    var chaincontrols = [];
    var chaindata = [];
    chaindata = [
        //{crossId:2, verticalId:39, plintId:558, pairId:1},  //Cross РШ 1Р, Vertical 0В, Plint БM4, Pair 0
        //{crossId:8, verticalId:64, plintId:845, pairId:2},  // Cross ЛАЗ, Vertical П15, Plint Р4, Pair 2
        //{crossId:8, verticalId:61, plintId:810, pairId:8},  // Cross ЛАЗ, Vertical 1В, Plint M5, Pair 8
        //{crossId:1, verticalId:37, plintId:541, pairId:4},
        //{crossId:4, verticalId:44, plintId:650, pairId:3},
        //{crossId:6, verticalId:47, plintId:0, pairId:0},    // empty vertical
        //{crossId:0, verticalId:0, plintId:0, pairId:0},     // empty link
        //{crossId:22, verticalId:0, plintId:0, pairId:0},    // empty cross
    ]

    var plintid = params.args[0];
    var pairid = params.args[1];
    var plintdata = sLoad(route.ajaxData, [plintid, pairid]);
    if (plintdata) {
        document.title = plintdata.address;
        render(route, {data:plintdata});
        var chaintableId = $("#chaintable");
        var chaintablewatchId = $("#chaintablewatch");
        $.each(chaindata, function(index, link){ // link is some {"crossId": 2, "verticalId": 39, "plintId": 558, "pairId": 1}
            var controls = {};
            var tr = $('<tr>');
            drawSelectors(tr, controls, index);
            chaincontrols.push(controls);
            tr.appendTo(chaintableId);
            chainCross(controls, link);
        });
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
        refreshWatch();
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
    }
}
/* end chain controller */