//======================================
/*** Cross Controller ***/
function CrossCtrl(params, route) {
    $scope = sLoad(route.ajaxurl);
    document.title = 'Cross';
    render(route, {crosses:$scope.crosses});
}
/* end cross controller */

//======================================
/*** Vertical Controller ***/
function VerticalCtrl(params, route) {	// requests: #/vertical/id, #/vertical?search=query, #/vertical?news=true

    wrapToggle = function(checked) { $('table.vertical td').css({'white-space': checked ? 'pre-line' : 'nowrap'}); localStorage.wraptext = checked; }
    editChain = function(checked) { localStorage.editchain = checked; }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    mastersearch.val($scope.query || '');
    var header = $scope.header,
	news = $scope.news;
    document.title = news ? L._NEWS_ : header;
    if (!news) {
	var href, _title;
	if (params.args[0]) { href = `"vertical",${params.args[0]}`; _title = `${L._EDIT_VERT_} ${$scope.vertical}`; }
	    else { href = `"found","search=${$scope.query}"`; _title = ''; }
	header = `<a href='javascript:edit(${href})' title='${_title}'>${header}</a>`;
      }
    render(route, {plints:$scope.plints, user:$scope.user, users:$scope.users, header:header, query:$scope.query, news:news});

    if (localStorage.wraptext == "true") {
	$("#wraptext").prop("checked", true);
	wrapToggle(true);
    }
    if (localStorage.editchain == "true") {
	$("#editchain").prop("checked", true);
    }
}
/* end vertical controller */

//======================================
/*** Chain Controller ***/
function ChainCtrl(params, route) {
    params.args.push('chain')
    $scope = sLoad(route.ajaxurl, params.args);
    document.title = $scope.address;
    render(route, {chain:$scope});
}
/* end vertical controller */

//======================================
/*** Edit Cross Controller ***/
function EditCrossCtrl(params, route) {

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    document.title = $scope.header;
    if ($scope.new) $scope.title = '';
    render(route, {cross:$scope});
    var form = new Form();

    form.form.submit(function(event) {
        var cross = $(this).serializeArray();
	if ($scope.new) cross.push({name:'new', value:true});
	else cross.push({name:'cross', value:params.args[0]});
	saveData(cross, $scope, event);
    });
}
/* end edit cross controller */

//======================================
/*** Edit Vertical Controller ***/
function EditVerticalCtrl(params, route) {

    commondataHelp = function() {
        $.get(staticpath + "varhelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    verticalChange = function(event) {

	//var form = event.data.form;    // retrieve object 'this'
	//console.info(inputs);
	//var inputs = form.inputs;
        var titles = chaindata.titles;
	$("table#watchtable tr").remove(".refreshing");
	//vertical = [];
	vertical.length = 0;
	if (inputs.delete) return;
	$('#changehead').html(inputs.title);
	var cd_rem = inputs.comdatareplace; // && inputs.cross_0 > 0);
	var re, res = /%(\d+)/.exec(inputs.plintmask);
	if (res) re = Number(res[1]);

	var comdata = inputs.cdmask.replace(/%1/g, titles.cross||'').replace(/%2/g, titles.vertical||'');
	var rcomdata = inputs.cdmask.replace(/%1/g, $scope.cross).replace(/%2/g, $scope.title);

	var cnt = inputs.count;
	if (isNaN(cnt) || cnt=='' || cnt>100 || cnt<0) $('div.numeric').addClass('has-error');
	else {
	    $('div.numeric').removeClass('has-error');
	    var si = titles.plintindex;
	    var ta_pts = taEl.val().split('\n');
	    var ta_add = ta_pts && /%1/.test(inputs.pairmask);
	    for(var i=0; i<cnt; i++) {
		var tr = $('<tr>', {class:"refreshing"});
		var ti;
		if (res) {
		    ti = String(re+i)
		    while (ti.length < res[1].length) ti = '0' + ti // for titles like '01', '001', ...
		    ti = inputs.plintmask.replace(res[0], ti);
		} else ti = inputs.plintmask;
		var _class, st, idx = matchTitle($scope.plints, ti);
		var cd, rcd, start1;
		if (idx >= 0) {
		    _class="warning";
		    st = "~";
		    rcd = L._OLDPL_;
		    cd = $scope.plints[idx].comdata;
		    start1 = inputs.start1all ? inputs.start1 : $scope.plints[idx].start1;
		} else {
		    _class="new";
		    st = "+";
		    rcd = L._NEWPL_;
		    cd = '';
		    start1 = inputs.start1;
		}
		cd = comdata.replace(/%0/g, cd);
		if (idx < 0 || inputs.start1all) vertical.push({name:'start1_'+i, value:start1});
		tr.append(`<td class="${_class}" title="${rcd}"><sup>${start1}</sup>${ti}</td>`);
		tr.append(`<td>${st}</td>`);
		rcd = rcomdata;
		if (titles.vertical && chaindata.plints[si+i]) {
		    st = chaindata.plints[si+i][1];
		    if (inputs.comdatareplace) {
			rcd = rcd.replace(/%0/g, chaindata.plints[si+i][3]);
			rcd = $.trim(rcd.replace(/%3/g, ti));
			vertical.push({name:'rcomdata_'+i, value:rcd});
		    } else rcd = '';
		} else {
		    st = '';
		    rcd = '';
		}
		cd = $.trim(cd.replace(/%3/g, st));
		tr.appendTo(watchtable);   // id of element, without declare variable!!!
		vertical.push({name:'title_'+i, value:ti});
		vertical.push({name:'comdata_'+i, value:cd});
		if (view_cd) {
		    $('<td>').html(_mypre.format(cd)).appendTo(tr);
		    $('<td>').html(_mypre.format(rcd)).appendTo(tr);
		}

		var pts = ta_add ? (ta_pts[i] || '').split('\t') : '';
		for(var j=0; j<10; j++) {
		    ti = idx >= 0 ? $scope.plints[idx].pairs[j] : '';
		    ti = inputs.pairmask.replace(/%0/g, ti);
		    ti = $.trim(ti.replace(/%1/g, pts[j] || ''));
		    vertical.push({name:'pid_'+i+'_'+String(j+1), value:ti});
		    if (!view_cd) $('<td>').html(_mypre.format(ti)).appendTo(tr);
		}

		if (!res) break;    // if not %1, add only 1 plint
	    }
	}
    }

    matchTitle = function(arr, query) {
	for(var o in arr) if (arr[o].title && arr[o].title == query) return o;
	return -1;
    }

    viewTextArea = function(El) {
	if (El.checked) {
	    taEl.show();
	    taEl.focus();
	} else taEl.hide();
    }

    function viewChange() {
	view_cd = vmEl.filter(':checked').val() == 'comdata';
	wthead.empty();
	$(_th_com_[0]).appendTo(wthead);
	$(_th_com_[1]).appendTo(wthead);
	if (view_cd) {
	    $(_th_cdt_[0]).appendTo(wthead);
	    $(_th_cdt_[1]).appendTo(wthead);
	} else for(var i=0; i<10; i++) $('<th width="8%">').appendTo(wthead);
	form.init();
    }


    $scope = sLoad(route.ajaxurl, params.args);
    document.title = $scope.header;
    $scope.verticalId = params.args[0];
    render(route, {vertical:$scope});

    const _th_com_ = ['<th width="14%">'+tbheaders[2]+'</th>', '<th width="6%">+/~</th>'];
    const _th_cdt_ = ['<th width="40%">'+L._COMMON_DATA_+'</th>', '<th>'+L._REM_CD_+'</th>'];

    var view_cd,
	wthead = $('#watchtable tr.info'),
	vmEl = $('input[name=view]').on('change', viewChange);
	taEl = $('textarea').on('input', verticalChange);

    taEl.keydown(function(e) {
	if(e.keyCode === 9) { // tab key
	    var start = this.selectionStart,
		target = e.target,
		value = target.value;
	    target.value = value.substring(0, start) + "\t" + value.substring(this.selectionEnd);
	    this.selectionStart = this.selectionEnd = start + 1;
	    //e.preventDefault();
	    return false;
	}
    });

    var form = new Form(verticalChange);
    form.onLinkChange = verticalChange;
    form.chaindepth = 3;
    form.chaindata = [];
    form.chaindata.push(new Link(form, 'plintscd'));
    var chaindata = form.chaindata[0],	// shorthands
	vertical = [],
	inputs = form.inputs;
    viewChange();

    form.form.submit(function(event) {
	//console.log(form);
	vertical.push({name:'title', value:inputs.title});
	vertical.push({name:'count', value:inputs.count});
	vertical.push({name:'vertical', value:params.args[0]});
	if (inputs.comdatareplace) {
	    vertical.push({name:'from_vert', value:chaindata.link.verticalId});
	    vertical.push({name:'from_plint', value:chaindata.link.plintId});
	}
	if (inputs.delete) vertical.push({name:'delete', value:'on'});
	//console.log($scope);
	saveData(vertical, $scope, event);
    });
}
/* end edit vertical controller */

//======================================
/*** Edit Plint Controller ***/
function EditPlintCtrl(params, route) {

    plintChange = function() {
	if (form.inputs.delete) return;
	$('ol').attr('start', parseInt(form.inputs.start1));
    }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);
    document.title = $scope.address;
    $scope.start1 = $scope.start1 ? "checked" : "";
    render(route, {plint:$scope});
    $('textarea').val($scope.pairtitles);   // insert multiline pairtitles by templating system gives loss first new line (\n), ;-( ?
    var form = new Form(plintChange);
    form.init();

    form.form.submit(function(event) {
	var plint = $(this).serializeArray();
	plint.push({name:'plint', value:params.args[0]});
	saveData(plint, $scope, event);
    });
}
/* end edit plint controller */

//======================================
/*** Edit Pair Controller ***/
function EditPairCtrl(params, route) {
// start Edit Pair Controller, Chain, new, class approach

//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
    refreshWatch = function() {
        $("table#watchtable tr").remove(".refreshing");
        $.each(form.chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link.link[this+'Id']).appendTo(tr); });
            tr.appendTo(watchtable);   // id of element, without declare variable!!!
        });
    }
//~~~~~~~~~~~~end for debug~~~~~~~~~~~~~~

    addLink = function () {
        form.chaindata.push(new Link(form, 'plints'));
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
        if (_DEBUG_) refreshWatch();
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
    }

    $scope = sLoad(route.ajaxurl, params.args);

    if (!$scope) raise404();

    document.title = $scope.address;
    render(route, {pair:$scope});
    var form = new Form();
    form.chaindepth = 4;
    form.chaindata = [ {link:{crossId: 0, verticalId: 0, plintId: params.args[0], pairId: params.args[1]}} ] // native link
    if ($scope.chain) $.each($scope.chain, function() { form.chaindata.push(new Link(form, 'plints', this)); });
    //console.log(form);

    //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
    //debugger;
    if (_DEBUG_) {
        route.targetEl.insertAdjacentHTML('beforeend', tmpl('watchtableTmpl', {}));
        refreshWatch();
	form.onLinkChange = refreshWatch;
    }
    //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~

    form.form.submit(function(event) {
        var pair = $(this).serializeArray();
        pair.push({name:'cross_0', value:0});
        pair.push({name:'plint_0', value:params.args[0]});
        pair.push({name:'pair_0',  value:params.args[1]});
        pair.push({name:'chain',  value:true});
        // saveData - add formkey, ajax(POST) data toserver, flash status result;
        // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
        saveData(pair, $scope, event);
    });
}
/* end edit pair controller */

//======================================
/*** Edit Found Controller ***/
function EditFoundCtrl(params, route) {

    regexpHelp = function() {
        $.get(staticpath + "regexphelp.html").success(function(data) { web2pyflash(data, 'default', 0); });
    }

    function refreshFoundTable() {
	//console.time("assignments");
        var ftext = inputs.find;
        var rtext = inputs.replace;
	var out = '<span style="background-color: #ff6">'+(inputs.follow ? rtext : ftext)+'</span>';
	for(var ci in fdata) {
	    pair = fdata[ci];
	    pair.cell.innerHTML = _mypre.format(pair.title.replace(ftext, out));
	    pair._title = pair.title.replace(ftext, rtext);
	}
	//console.timeEnd("assignments");
    }

    $scope = sLoad(route.ajaxurl, params.args, params.vars);

    var fdata = [];
    $.each($scope.plints, function(key, plint) {  // convert : array of plints to array of pairs
        var start1 = parseInt(plint.start1);
        $.each(this.pairs, function(idx, pair) {
            if (pair[0].indexOf($scope.query) >= 0)
                fdata.push({cross: plint.cross,
			    crossId: plint.crossId,
			    vertical: plint.vertical,
                            verticalId: plint.verticalId,
                            id: key,
                            plintId: plint.id,
                            plint: plint.title,
                            title: pair[0],
                            pairId: idx+1,    // idx in range 0-9, pid in range 1-10
                            start1: start1});
        });
    });

    document.title = $scope.header;
    render(route, {query:$scope.query, header:$scope.header, count:fdata.length});
    var form = new Form(refreshFoundTable);
    var inputs = form.inputs;

    var pair, tds, row, tr;
    for(var ci in fdata) {
	pair = fdata[ci];
	row = foundtable.insertRow();
	row.insertAdjacentHTML('beforeend', pairRow(pair));
	pair.cell = row.insertCell();
    }

    form.init();

    form.form.submit(function(event) {
        var pair = []; // = $.param(fdata);
        $.each(fdata, function(idx, link) {
            pair.push({name:'cross_'+idx, value:0});    // impotant!, inform 'def ajax_update():' record exist
            pair.push({name:'plint_'+idx, value:link.plintId});
            pair.push({name:'pair_' +idx, value:link.pairId});
            pair.push({name:'title_'+idx, value:link._title});
        });
        saveData(pair, $scope, event); // arg0 - data to be saved to server; arg1 - object, containing formname & formkey information
    });

}
/* end edit found controller */

//======================================
/*** Ajax Live Search Controller ***/
(function(){

    var keypress = false, searchvalue = '', oldvalue = '', div = $("#ajaxlivesearch"), reqs = [];

    var hidelive = function() {
        div.hide();
	div.empty();
        while (reqs.length) reqs.pop().abort();	// abort all ajax requests
    }

    var getPairTitles = function(event){    // input id="master-search" oninput event
        if (keypress) return;
        searchvalue = mastersearch.val();
        if(searchvalue.length > 2){
	//log(searchvalue)
            if (searchvalue != oldvalue) {
		oldvalue = searchvalue;
                $.ajax(rootpathajax + "livesearch.json", {
                    data: {search: searchvalue},
                    beforeSend: function(jqXHR){
                        while (reqs.length) reqs.pop().abort();
                        reqs.push(jqXHR);
                    },
                    success: function(data){
                        //oldvalue = searchvalue;
                        if (data.search.length) {
                            div.html(tmpl("liveSearchTmpl", data));

                            $("#ajaxlivesearch a").hover(
                                function() { searchvalue = this.text; },    // handlerIn on mouseenter
                                function() { searchvalue = mastersearch.val(); });   // handlerOut on mouseleave

			    div.show();

                        } else hidelive();
                    }
                });
            }
        } else {
            oldvalue = searchvalue;
            hidelive();
        }
    }

    mastersearch.on('keydown', function() { keypress = true; });
    mastersearch.on('keyup', function(event) { keypress = false; getPairTitles(event); });
    mastersearch.on('input', getPairTitles);

    //mastersearch.focusout(function(event){
    //div.focusout(function(event){
    mastersearch.blur(function(event){
	//log($("#ajaxlivesearch a").queue())
	//log(event);
	//var da = $("#ajaxlivesearch a");
	//log(da.queue())
	oldvalue = searchvalue;
	hidelive();
        if (mastersearch.val() != searchvalue) {
	    mastersearch.val(searchvalue);
	    setTimeout(function(){mastersearch.focus()}, 10);
	    //mastersearch.focus();
	    //$(document).queue(function(){mastersearch.focus();});
	    //$(document).dequeue();
	    //event.preventDefault;
	    //event.stopImmediatePropagation();
	    //return false;
	}
        //setTimeout(function(){hidelive()},500);
    });

    //" action="javascript:masterSearchAccept()">
    $('form.livesearch').submit(function() {
        var value = mastersearch.val();
	//event.preventDefault();
        if (value.length > 2) {
            hidelive();
            //log(decodeURIComponent(value))
            //log(encodeURIComponent(value))
            //log(encodeURI(value))
            //location.hash = '#/vertical?search=' + escape(value);
            //location.hash = '#/vertical?search=' + encodeURIComponent(value);
            //location.hash = '#/vertical?search=' + encodeURI(value);
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            location.hash = '#/vertical?search=' + value;
        } else web2pyflash(value + ' : ' + L._TOOSHORT_, 'danger');
        return false;
    });

})();
/* end ajax live search controller */
