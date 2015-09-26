//======================================
/*** Class: Link, responce <selector> sequence to table ***/

// constructor, usage: var link = new Link(...);
function Link(index, target, link, depth, cache) {
    //const stages = ['cross','vertical','plint','pair'];
    this.index = index;
    this.link = link;
    this.depth = depth;
    this.cache = cache;
    this.controls = {};
    this.titles = {};
    //this.names = {};
    var tr = $('<tr>');
    for (var i = 0; i < depth; i++) {
        var td = $('<td>');
        var sel = $('<select>', {class:"form-control", name:stages[i]+"_"+index})
            .prop('disabled', true).data('link', this).data('stage', stages[i]).change($selectChange).appendTo(td);    // disabled controls
        td.appendTo(tr);
        this.controls[stages[i]+'El'] = sel;
        }
    tr.appendTo(target);
    this.stage = stages[0];
    if (!this.cache.crosses) this.cache.crosses = sLoad('indexdata').crosses;
    this.controls.crossEl.append($('<option>').text('Not crossed').attr('value', 0));
    this.addOptFromObj(this.cache.crosses);
    this.setVertical();
}

Link.prototype.setVertical = function() {
    if (this.depth > 1) {
        this.stage = stages[1]; // set stage 'vertical'
        var idx = this.link.crossId;
        if (idx > 0) {
            var cross = this.cache.crosses[idx];
            this.titles.cross = cross.title;
            this.verticals = cross.verticals; // shortcut
            if (!$.isEmptyObject(this.verticals)) {
                this.addOptFromObj(this.verticals);
                this.setPlint();
            }
        }
    }
}

Link.prototype.setPlint = function() {
    if (this.depth > 2) {
        this.stage = stages[2];
        //console.warn(this);
        var idx = this.link.verticalId;
        if (idx > 0) {
            this.vertical = this.verticals[idx]; // shortcut
            this.titles.vertical = this.vertical.title;

            var self = this;    // spike, pointer to object for ajax callback
            //----------callback function---------------
                var callback = function(){
                    self.plints = self.vertical.plints.data; // shortcut
                    //console.log(plints)
                    if (self.plints.length) {
                        El = self.controls.plintEl;
                        $.each(self.plints, function() {El.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
                        El.prop('disabled', false);
                        var pair;
                        if (self.link.plintId) {
                            El.settovalue(self.link.plintId);
                            pair = self.link.pairId;
                        } else {             // false(default) - set to first
                            El.settofirst()    ;
                            self.link.plintId = El[0].value;
                            pair = 1;
                        }
                        self.plintTitle();
                        si = El[0].selectedIndex;
                        if (self.depth > 3) {
                            El = self.controls.pairEl;
                            El.enumoptions(self.plints[si][2]);
                            El.settovalue(pair);
                            self.link.pairId = pair;
                        }
                    }
                }
            //----------end callback function---------------
            aLoad(this.vertical, callback, 'plints', [this.link.verticalId]);
        }
    }
}

Link.prototype.crossChange = function() {
    if (this.depth > 1) {
        //----vertical, plint, pair selectors disable---------
        this.titles = {};
        this.controls.verticalEl.empty();
        this.controls.verticalEl.prop('disabled', true);
        this.link.verticalId = 0;
        this.plintDisable();
        //--------------------------
        this.setVertical();
    }
}

Link.prototype.verticalChange = function() {
    this.plintDisable(); //----- plint, pair selectors disable
    this.setPlint();
}

Link.prototype.plintChange = function() {
    this.plintTitle();
    if (this.depth > 3) {
        var plint = this.controls.plintEl[0].selectedIndex;
        this.controls.pairEl.enumoptions(this.plints[plint][2]);
    }
}

Link.prototype.plintTitle = function() {
    var si = this.controls.plintEl[0].selectedIndex;
    this.titles.plintindex = si;
    this.titles.plint = this.plints[si][1];
}

Link.prototype.plintDisable = function() {  //----- plint, pair selectors disable
    if (this.depth > 2) {
        this.controls.plintEl.empty();
        this.controls.plintEl.prop('disabled', true);
        this.link.plintId = 0;
        if (this.depth > 3) {
            this.controls.pairEl.empty();
            this.controls.pairEl.prop('disabled', true);
            this.link.pairId = 0;
        }
    }
}

Link.prototype.setselect = function() {
    var El = this.controls[this.stage+'El'];
    var value = this.link[this.stage+'Id'];
    if (value) El.settovalue(value);
    else {
        El.settofirst();
        this.link[this.stage+'Id'] = El[0].value;
    }
    //this.names[this.stage] = El.children(':selected').text();
}

Link.prototype.addOptFromObj = function(data) {
    var El = this.controls[this.stage+'El'];
    $.each(data, function(key, item) {El.append($('<option>').text(item.title+' : '+key).attr('value', key));});
    El.prop('disabled', false);
    this.setselect();
}
/*** End Class: Link ***/
//======================================

$selectChange = function() {
    var El = $(this);
    var obj = El.data('link');    // retrieve object Link
    var stage = El.data('stage');
    obj.link[stage+'Id'] = El.val();        // !!! write select option to Link here !!!
    //obj.names[stage] = El.children(':selected').text();
    if (stage != 'pair') obj[stage+'Change']();  // prototype function name, execute crossChange, verticalChange or plintChange
    var f = window['OnSelectChange'];
    if (typeof f == 'function') {
        if (ajaxstate.during) ajaxstate.callback.push(function() {f(El)});
        else f(El);
    }
}

emptyLink = function () {
    var emptylink = {};
    $.each(stages, function() { emptylink[this+'Id'] = 0; });
    return emptylink
}

//======================================
/*** Chain Controller ***/
function chainCtrl(params, route) {
// start Chain Controller, new, class approach

//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
    var refreshWatch = function() {
    //console.log(++watchcnt);
        $("table#watchtable tr").remove(".refreshing");
        $.each(chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link.link[this+'Id']).appendTo(tr); });
            tr.appendTo(watchtableId);   // id of element, without declare variable!!!
        });
    }
//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~

    addLink = function () {
        var link = new Link(chaindata.length, chaintableId, emptyLink(), depth, cache);
        chaindata.push(link);
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
                refreshWatch();
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
    }

    pairEditAccept = function () {
        var data = $('form.edit').serializeArray();
        data.push({name:'cross_0', value:0});
        data.push({name:'plint_0', value:params.args[0]});
        data.push({name:'pair_0',  value:params.args[1]});
        // saveData - add formkey, ajax(POST) data toserver, flash status result;
        // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
        saveData(data, plintdata);
    }

    const depth = 4;
    var cache = {};     // use own data cache
    var watchcnt=0;
    //var args = [params.args[0], params.args[1]];
    //if (localStorage.editchain) args.push('chain');
    //console.log(params)
    var plintdata = sLoad(route.ajaxData, params.args);

    chaindata = [ {link:{crossId: 0, verticalId: 0, plintId: params.args[0], pairId: params.args[1]}} ] // native link
    if (plintdata.chain) for (i in plintdata.chain) chaindata.push({link:plintdata.chain[i]});
    OnSelectChange = refreshWatch;

    //log(chaindata)
    //chaindata.push({link:{crossId:2, verticalId:39, plintId:558, pairId:1}});  //Cross РШ 1Р, Vertical 0В, Plint БM4, Pair 0
    //chaindata.push({link:{crossId:8, verticalId:64, plintId:845, pairId:2}});  // Cross ЛАЗ, Vertical П15, Plint Р4, Pair 2
    //chaindata.push({link:{crossId:8, verticalId:61, plintId:810, pairId:8}});  // Cross ЛАЗ, Vertical 1В, Plint M5, Pair 8
    //chaindata.push({link:{crossId:1, verticalId:37, plintId:541, pairId:4}});
    //chaindata.push({link:{crossId:4, verticalId:44, plintId:650, pairId:3}});
    //chaindata.push({link:{crossId:6, verticalId:47, plintId:0, pairId:0}});    // empty vertical
    //chaindata.push({link:{crossId:0, verticalId:0, plintId:0, pairId:0}});     // empty link
    //chaindata.push({link:{crossId:22, verticalId:0, plintId:0, pairId:0}});    // empty cross

    //if (plintdata) {
        document.title = plintdata.address;
        render(route, {data:plintdata});
        var chaintableId = $("#chaintable");
        watchtableId = $("#watchtable");
        for (i=1; i<chaindata.length; i++)
            chaindata[i] = new Link(i, chaintableId, chaindata[i].link, depth, cache);
        $('#crosshome input:text:visible:first').focus();

        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
        //debugger;
        refreshWatch();
        //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
    //}

}
/* end chain controller */