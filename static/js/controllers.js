/*** ErrorController ***/
function ErrorCtrl() {
    document.title = L._ERROR_;
    web2spa.loadHTML();
}
/* end ErrorController */

//======================================
/*** UserController ***/
function UserCtrl() {
    document.title = L[$request.args[0]];   // login, logout, profile, change_password, register, request_reset_password
    $request.json = false;
    web2py_component(web2spa.get_ajax_url($route.ajaxurl), $route.target);	// as $.load, but provide form submit
}
/* end UserController */

//======================================
/*** CrossController ***/
function CrossCtrl() { web2spa.load_and_render(function() { return {data:{crosses:$scope.crosses}}; }); }
/* end CrossController */

//======================================
/*** VerticalController ***/
function VerticalCtrl() {	// requests: #/vertical/id, #/vertical?search=search

    web2spa.load_and_render(function() {
	var search = $request.vars.search, vId = false, _title='', href;
	mastersearch.val((search || '').unescapeHTML());
	if ($request.args[0]) { // for certain vertical view
	    vId = $request.args[0];
	    href = `${web2spa.start_path}editvertical/${vId}`;
	    _title = `${L._EDIT_VERT_} ${$scope.vertical}`;
	} else href = `${web2spa.start_path}editfound?search=${search}`;    // for search results view
	var header = `<a class="web2spa" href="${href}" title="${_title}">${$scope.header}</a>`;
	return {title:$scope.header, data:D_Vertical(header, search, false, vId)};
    });

    toggle_wrap();
    toggle_ctrl();
}
/* end VerticalController */

//======================================
/*** NewsController ***/
function NewsCtrl() { web2spa.load_and_render(function() { return {title:L._NEWS_, data:D_Vertical($scope.header, false, true, false)}; }); }
/* end NewsController */

//======================================
/*** ChainController ***/
function ChainCtrl() {
    web2spa.load_and_render(function() { return {title:$scope.address, data:{chain:$scope}}; });
    toggle_chain();
}
/* end ChainController */

//======================================
/*** RestoreController ***/
function RestoreCtrl() {

    function handleFileSelect(e) {
	file = e.target.files[0];
	document.getElementById('prop').innerHTML = file.size + ' bytes, last modified: ' +
	    (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a');
    }

    var file, title, ft = 'csv';
    if ($request.vars.merge) title = L._MERGE_DB_;
    else if ($request.vars.txt) { title = L._IMPORT_; ft = 'txt'; }
    else title = L._RESTORE_;

    web2spa.load_and_render(function() { return {title:title, data:{title:title, hint:`Select ${ft} file`}}; });
    var form = new Form(function() { return file ? form.post(this) : false; }); // restore ctrl
    document.getElementById('upload').addEventListener('change', handleFileSelect, false);
}
/* end RestoreController */

//======================================
/*** EditCrossController ***/
function EditCrossCtrl() {
    web2spa.load_and_render(function() {
	if ($scope.new = $request.vars.new) $scope.title = '';
	return {title:$scope.header, data:{cross:$scope}};
    });
    var form = new Form(function() { return form.post(this); });    // edit cross ctrl
}
/* end EditCrossController */

//======================================
/*** EditVerticalController ***/
function EditVerticalCtrl() {

    verticalChange = function() {
	//console.info(inputs);
	$("table#watchtable tr").remove(".refreshing");
	vertical = {};
	if (inputs.delete) return;
	$('#verttitle').text(inputs.title);

	var plintmask = inputs.plintmask;
	if (!plintmask) return;

	var cnt = inputs.count;
	if (isNaN(cnt) || cnt=='' || cnt>100 || cnt<0) $('div.numeric').addClass('has-error');
	else {
	    var titles = chaindata.titles;
	    var re, res = /%(\d+)/.exec(plintmask);
	    if (res) re = Number(res[1]);
	    var comdata = inputs.cdmask.replace(/%1/g, titles.cross||'').replace(/%2/g, titles.vertical||'');
	    var rcomdata = inputs.cdmask.replace(/%1/g, $scope.cross).replace(/%2/g, $scope.vertical).unescapeHTML();

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
		    ti = plintmask.replace(res[0], ti);
		} else ti = plintmask;
		var _class, st, idx = matchTitle($scope.plints, ti);
		var cd, rcd, start1;
		if (idx >= 0) {
		    _class="warning";
		    st = "~";
		    rcd = L._OLDPL_;
		    cd = $scope.plints[idx].comdata.unescapeHTML();
		    start1 = inputs.start1all ? inputs.start1 : $scope.plints[idx].start1;
		} else {
		    _class="new";
		    st = "+";
		    rcd = L._NEWPL_;
		    cd = '';
		    start1 = inputs.start1;
		}
		cd = comdata.replace(/%0/g, cd);
		if (idx < 0 || inputs.start1all) vertical['start1_'+i] = start1;
		tr.append(`<td class="${_class}" title="${rcd}"><sup>${start1}</sup>${ti.escapeHTML()}</td>`);
		tr.append(`<td>${st}</td>`);
		rcd = rcomdata;
		if (titles.vertical && chaindata.plints[si+i]) {
		    st = chaindata.plints[si+i][1];
		    if (inputs.rcdreplace) {
			rcd = rcd.replace(/%0/g, chaindata.plints[si+i][3]);
			rcd = $.trim(rcd.replace(/%3/g, ti));
			vertical['rcomdata_'+i] = rcd;
		    } else rcd = '';
		} else {
		    st = '';
		    rcd = '';
		}
		cd = $.trim(cd.replace(/%3/g, st));
		tr.appendTo(watchtable);   // id of element, without declare variable!!!
		vertical['title_'+i] = ti;
		vertical['comdata_'+i] = cd;
		if (view_cd) {
		    $('<td>').html(_mypre.format(cd.escapeHTML())).appendTo(tr);
		    $('<td>').html(_mypre.format(rcd.escapeHTML())).appendTo(tr);
		}

		var pts = ta_add ? (ta_pts[i] || '').split('\t') : '';
		for(var j=0; j<10; j++) {
		    ti = idx >= 0 ? $scope.plints[idx].pairs[j].unescapeHTML() : '';
		    ti = inputs.pairmask.replace(/%0/g, ti);
		    ti = $.trim(ti.replace(/%1/g, pts[j] || ''));
		    vertical['pid_'+i+'_'+String(j+1)] = ti;
		    if (!view_cd) $('<td>').html(_mypre.format(ti.escapeHTML())).appendTo(tr);
		}

		if (!res) break;    // if not %1, add only 1 plint
	    }
	}
    }

    function matchTitle(arr, query) { // title of plint: existing or new
	for(var o in arr) if (arr[o].title && arr[o].title == query.escapeHTML()) return o;
	return -1;
    }

    function viewChange() {
	view_cd = vmEl.filter(':checked').val() == 'comdata';
	wthead.empty();
	wthead.append(_th_com_);
	if (view_cd) wthead.append(_th_cdt_);
	else for(var i=0; i<10; i++) wthead.append('<th width="8%">');
	form.init();
    }

    function verticalSubmit() {
	vertical.title = inputs.title;
	vertical.count = inputs.count || 0;
	if (inputs.rcdreplace) {
	    vertical.from_vert = chaindata.verticalId;
	    vertical.from_plint = chaindata.plintId;
	}
	if (inputs.delete) vertical.delete = 'on';
	$scope.formData = vertical;
	return form.post();
    }

    web2spa.load_and_render(function() {
	$scope.verticalId = $request.args[0];
	return {title: $scope.header, data:{vertical:$scope}};
    });

    $('#helpbtn').click(function() { $.get(web2spa.static_path + "varhelp.html").success(function(data) { web2spa.show_msg(data, 'default', 0); }); });
    $('#editor').change(function() { if (this.checked) { taEl.show(); taEl.focus(); } else taEl.hide(); });

    const _th_com_ = '<th width="14%">'+tbheaders[2]+'</th><th width="6%">+/~</th>';
    const _th_cdt_ = '<th width="40%">'+L._COMMON_DATA_+'</th><th>'+L._REM_CD_+'</th>';

    var view_cd, vertical,
	wthead = $('#watchtable tr.info'),
	vmEl = $('input[name=view]').on('change', viewChange),
	taEl = $('textarea').on('input', verticalChange);

    var form = new Form(verticalSubmit, {hC:verticalChange});
    Chain.init('plintscd', 3, verticalChange);
    var chaindata = Chain.chain[0], inputs = form.inputs;   // shorthands
    viewChange();

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
}
/* end EditVerticalController */

//======================================
/*** EditPlintController ***/
function EditPlintCtrl() {

    function plintChange() {
	if (form.inputs.delete) return;
	mergechar.disabled = !form.inputs.merge;
	$('ol').attr('start', parseInt(form.inputs.start1));
    }

    function viewChange() { ta.css('display', function(i, v) { return v=='none' ? 'block' : 'none'; }); }

    web2spa.load_and_render(function() {
	$scope.start1 = $scope.start1 ? "checked" : "";
	return {title:$scope.address, data:{plint:$scope}};
    });
    var ta = $('textarea');
    ta[0].value = $scope.pairtitles.unescapeHTML();   // innerHTML used in templating system gives loss first empty line (\n), :-( ?
    ta[1].value = $scope.pairdetails.unescapeHTML();
    $('input[name=view]').on('change', viewChange);
    var form = new Form(function() { return form.post(this); }, {hC:plintChange}); // edit plint ctrl
    var mergechar = form.inputstext.filter('[name=mergechar]')[0];
    form.init();
}
/* end EditPlintController */

//======================================
/*** EditPairController ***/
function EditPairCtrl() {

    function refreshWatch() {	//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
        $("table#watchtable tr").remove(".refreshing");
        $.each(Chain.chain, function(key, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(key).appendTo(tr);
            $.each(Chain.stages, function() { $('<td>').text(link[this+'Id']).appendTo(tr); });
            tr.appendTo(watchtable);   // id of element, without declare variable!!!
        });
	//console.log(form);
    }	//~~~~~~~~~~~~end for debug~~~~~~~~~~~~~~

    function editpairSubmit() {	// submit edit pair ctrl
	var id, title = this.title.value, details = this.details.value;
	if (chainMode) Chain.order(title, details);
	else {
	    id = $request.args;
	    Chain.plints[id[0]] = {};
	    Chain.plints[id[0]]['pid'+id[1]] = title;
	    Chain.plints[id[0]]['pdt'+id[1]] = details;
	}

	$scope.formData = {};
	$scope.formData.plints = JSON.stringify(Chain.plints);
	//console.log($scope.formData.plints);
	return form.post();
	//return false;
    }

    var chainMode = $request.vars.chain;
    web2spa.load_and_render(function() { return {title:$scope.address, data:{pair:$scope, chain:chainMode}}; });
    var form = new Form(editpairSubmit);
    if (chainMode) {
	Chain.init('plints', 4, _DEBUG_ ? refreshWatch : null, $scope.chain);
	//debugger;
	if (_DEBUG_) { web2spa.render({id:'watchtableTmpl', append:true}); refreshWatch(); }
	//console.dir(Chain);
    }

    app.chainMode.init(function(value) { web2spa.navigate(location.pathname + (value?'?chain=true':'')); });

}
/* end edit pair controller */

//======================================
/*** Edit Found Controller ***/
function EditFoundCtrl() {

    function refreshFoundTable() {
        var ftext = inputs.find.escapeHTML();
        var rtext = inputs.replace.escapeHTML();
	var out = '<span style="background-color: #ff6">'+(inputs.follow ? rtext : ftext)+'</span>';
	for(var ci in fdata) {
	    pair = fdata[ci];
	    pair.cell.innerHTML = _mypre.format(pair.title.replace(ftext, out));
	    pair._title = pair.title.replace(ftext, rtext);
	    row = pair.plintId;
	    if (!plints[row]) plints[row] = {};
	    plints[row]['pid'+pair.pairId] = pair._title.unescapeHTML();
	}
    }

    function plints_to_pairs() {
	$.each($scope.plints, function(key, plint) {  // convert : array of plints to array of pairs
	    var start1 = parseInt(plint.start1);
	    $.each(this.pairs, function(idx, pair) {
		if (pair[0].indexOf($request.vars.search) >= 0)
		    fdata.push({cross: plint.cross,
				crossId: plint.crossId,
				vertical: plint.vertical,
				verticalId: plint.verticalId,
				id: key,
				plintId: plint.id,
				plint: plint.title,
				title: pair[0],
				details: pair[3],
				comdata: plint.comdata,
				pairId: idx+1,    // idx in range 0-9, pid in range 1-10
				start1: start1});
	    });
	});
	return {title:$scope.header, data:{search:$request.vars.search, header:$scope.header, count:fdata.length}};
    }

    function foundSubmit() { $scope.formData = {}; $scope.formData.plints = JSON.stringify(plints); return form.post(); }

    var fdata = [];
    web2spa.load_and_render(plints_to_pairs);
    var form = new Form(foundSubmit, {hC:refreshFoundTable});    // edit found ctrl
    var inputs = form.inputs;
    var plints = {};
    var pair, row;
    for(var ci in fdata) {
	pair = fdata[ci];
	row = foundtable.insertRow();
	row.insertAdjacentHTML('beforeend', pairRow(pair));
	pair.cell = row.insertCell();
	row.insertCell().innerHTML = pair.details;
	row.insertCell().innerHTML = pair.comdata;
    }
    form.init();
    toggle_chain();
}
/* end edit found controller */

//======================================
/*** Ajax Live Search Controller ***/
// running at startup
(function() {

    var keypress = false, searchvalue = '', oldvalue = '', div = $("#livesearchout"), reqs = [];

    function hidelive() {
        div.hide();
	div.empty();
        while (reqs.length) reqs.pop().abort();	// abort all ajax requests
    }

    function getPairTitles(event) {
        if (keypress) return;
        searchvalue = mastersearch.val();
        if(searchvalue.length > 2){
	//console.log(searchvalue)
            if (searchvalue != oldvalue) {
		oldvalue = searchvalue;
                $.ajax(web2spa.get_ajax_url("livesearch", {}), {
                    data: {search: searchvalue},
                    beforeSend: function(jqXHR){
                        while (reqs.length) reqs.pop().abort();
                        reqs.push(jqXHR);
                    },
		    dataFilter: function(data) { return data.escapeHTML(); },
                    success: function(data){
                        if (data.search.length) {
                            div.html(web2spa._render({id:'liveSearchTmpl', data:data}));
                            $("#livesearchout a").hover(
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

    mastersearch = $("#master-search")    // global input
	.on('keydown', function() { keypress = true; })
	.on('keyup', function(event) { keypress = false; getPairTitles(event); })
	.on('input', getPairTitles)
	.blur(function(event){
	    oldvalue = searchvalue;
	    hidelive();
	    if (mastersearch.val() != searchvalue) {
		mastersearch.val(searchvalue);
		setTimeout(function(){mastersearch.focus()}, 10);
	    }
	});

    $('#livesearch').submit(function() {
        var value = mastersearch.val();
        if (value.length > 2) {
            hidelive();
            web2spa.navigate(web2spa.start_path + 'vertical?search=' + value, {add:true});
        } else web2spa.show_msg(value + ' : ' + L._TOOSHORT_, 'danger');
        return false;
    });

})();
/* end ajax live search controller */
