//======================================
/*** Found Controller ***/
function foundCtrl(params, route) {

/*** controller functions ***/
{

    regexpHelp = function() {
        $.get(staticpath + "regexphelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    drawFoundTable = function() {
        //$("table#foundtable td").remove(".refreshing");
        $.each(fdata, function(idx, pair) {
            var tr = $('<tr>'); //, {class:"refreshing"});
            $('<td>').text(pair.root[1]).appendTo(tr);
            //$('<td>').html('<a href="#/vertical/'+pair.parent[0]+'" target="_blank">'+pair.parent[1]+'</a>').appendTo(tr);
            //$('<td>').html('<a href="#/vertical/%s" target="_blank">%s</a>'.format(pair.parent[0], pair.parent[1])).appendTo(tr);
            $('<td>').html(`<a href="#/vertical/${pair.parent[0]}" target="_blank">${pair.parent[1]}</a>`).appendTo(tr);
            //$('<td>').html('<sup>%s</sup>%s'.format(pair.start, pair.plint)).appendTo(tr);
            $('<td>').html(`<sup>${pair.start}</sup>${pair.plint}`).appendTo(tr);
            $('<td>').text(pair.pair+pair.start-1).appendTo(tr);
            pair['td'] = $('<td>').appendTo(tr);
            tr.appendTo(foundtable);   // id of element, without declare variable!!!
        });
        $('#footerstatus').text(fdata.length);
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
                data.push({name:'cross_'+idx, value:0});    // impotant!, inform 'def ajax_getEditPair():' record exist
                data.push({name:'plint_'+idx, value:pair.id});
                data.push({name:'pair_'+idx, value:pair.pair});
                data.push({name:'title_'+idx, value:pair._title});
            });
            saveData(data, $scope); // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
        }
    }

}
/*** end found controller functions ***/

    // start found Controller

    if (!$scope || $scope.query != params.vars.search) $scope = sLoad(route.ajaxData, params.args, params.vars);
    //route.targetEl.innerHTML = tmpl("foundEditTmpl", context);
    render(route, {query:$scope.query, header:$scope.header});

    var fdata = [],
        findId = $("form.found input[name=find]"),
        replaceId = $("form.found input[name=replace]"),
        rcheckId = $("form.found input[name=replacecheck]");

    //jQuery(function () { jQuery('[data-toggle="popover"]').popover('show'); });

    $.each($scope.plints, function(key, plint) {  // convert : array of plints to array of pairs
        var start = parseInt(plint.start);
        $.each(this.pairs, function(idx, pair) {
            if (pair[0].indexOf($scope.query) >= 0)
                fdata.push({root: plint.root,
                            parent: plint.parent,
                            id: key,
                            plint: plint.title,
                            title: pair[0],
                            pair: idx+1,    // idx in range 0-9, pid in range 1-10
                            start: start});
        });
    });
    drawFoundTable();
    refreshFoundTable();

}
/* end found controller */
