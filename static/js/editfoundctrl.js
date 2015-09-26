//======================================
/*** Edit Found Controller ***/
function EditFoundCtrl(params, route) {

/*** controller functions ***/

    regexpHelp = function() {
        $.get(staticpath + "regexphelp.html").success(function(data) { web2pyflash(data, 'default', 0); });
    }

    var refreshFoundTable = function() {
        var ftext = findId.val();
        var rtext = replaceId.val();
        $.each(fdata, function() {
            var out = (followId[0].checked) ? rtext : ftext;
            //this.td.html('<pre class="mypre">'+this.title.replace(ftext, '<span style="background-color: #ff6">'+out+'</span>')+'</pre>');
            this.td.html(_mypre.format(this.title.replace(ftext, '<span style="background-color: #ff6">'+out+'</span>')));
            //this.td.find('span').text('text');
            this['_title'] = this.title.replace(ftext, rtext);
        });
    }

/*** end found controller functions ***/

    // start Edit Found Controller

    //console.time("search_in_db");
    //if (!$scope || $scope.query != params.vars.search) $scope = sLoad(route.ajaxurl, params.args, params.vars);
    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    //console.timeEnd("search_in_db");

    //route.targetEl.innerHTML = tmpl("foundEditTmpl", context);
    var fdata = [];
    $.each($scope.plints, function(key, plint) {  // convert : array of plints to array of pairs
        var start1 = parseInt(plint.start1);
        $.each(this.pairs, function(idx, pair) {
            if (pair[0].indexOf($scope.query) >= 0)
                fdata.push({root: plint.root,
                            parent: plint.parent,
                            id: key,
                            plintId: plint.id,
                            plint: plint.title,
                            title: pair[0],
                            pairId: idx+1,    // idx in range 0-9, pid in range 1-10
                            start1: start1});
        });
    });

    render(route, {query:$scope.query, header:$scope.header, count:fdata.length});

    var findId = $("#find").on('input', refreshFoundTable),
        replaceId = $("#replace").on('input', refreshFoundTable),
        followId = $("#follow").on('click', refreshFoundTable);

    findId.focus();

    $.each(fdata, function(idx, pair) {
        var tr = $('<tr>'); //, {class:"refreshing"});
        $('<td>').html(`<a href="#/editCross/${pair.root[0]}" target="_blank">${pair.root[1]}</a>`).appendTo(tr);
        $('<td>').html(`<a href="#/vertical/${pair.parent[0]}" target="_blank">${pair.parent[1]}</a>`).appendTo(tr);
        $('<td>').html(`<sup>${pair.start1}</sup><a href="#/editPlint/${pair.plintId}" target="_blank">${pair.plint}</a>`).appendTo(tr);
        $('<td>').text(pair.pairId+pair.start1-1).appendTo(tr);
        pair['td'] = $('<td>').appendTo(tr);    // pair title, write jQuery elements <td> to fdata
        tr.appendTo(foundtable);   // id of element, without declare variable!!!
    });

    refreshFoundTable();

    $('form.edit').submit(function(event) {
        var pair = []; // = $.param(fdata);
        $.each(fdata, function(idx, pair) {
            pair.push({name:'cross_'+idx, value:0});    // impotant!, inform 'def ajax_update():' record exist
            pair.push({name:'plint_'+idx, value:pair.plintId});
            pair.push({name:'pair_' +idx, value:pair.pairId});
            pair.push({name:'title_'+idx, value:pair._title});
        });
        pair.push({name:'update_mode', value:'pair'});
        saveData(pair, $scope, event); // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
    });

}
/* end edit found controller */
