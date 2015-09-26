//======================================
/*** Found Controller ***/
function foundCtrl(params, route) {

/*** controller functions ***/

    regexpHelp = function() {
        $.get(staticpath + "regexphelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    refreshFoundTable = function() {
        var ftext = findId.val();
        var rtext = replaceId.val();
        $.each(fdata, function() {
            var out;
            if (rcheckId[0].checked) out = rtext;
                else out = ftext;
            this.td.html(this.title.replace(ftext, '<span style="background-color: #ff6">'+out+'</span>'));
            this['_title'] = this.title.replace(ftext, rtext);
        });
    }

    foundEditAccept = function() {
        if ($scope.formkey) {
        //log ($scope.formkey)
            var data = []; // = $.param(fdata);
            $.each(fdata, function(idx, pair) {
                data.push({name:'cross_'+idx, value:0});    // impotant!, inform 'def ajax_getupdate():' record exist
                data.push({name:'plint_'+idx, value:pair.plintId});
                data.push({name:'pair_' +idx, value:pair.pairId});
                data.push({name:'title_'+idx, value:pair._title});
            });
            saveData(data, $scope); // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
        }
    }

/*** end found controller functions ***/

    // start found Controller

    if (!$scope || $scope.query != params.vars.search) $scope = sLoad(route.ajaxData, params.args, params.vars);
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

    var findId = $("input[name=find]"),
        replaceId = $("input[name=replace]"),
        rcheckId = $("input[name=replacecheck]");

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

}
/* end found controller */
