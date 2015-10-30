/*** ErrorController ***/
function ErrorCtrl() {
    document.title = L._ERROR_;
    $request.json = false;
    $('#'+targetDIV).load(get_ajax_url($route.ajaxurl));
}
/* end ErrorController */

//======================================
/*** UserController ***/
function UserCtrl() {
    document.title = L[$request.args[0]];
    $request.json = false;
    web2py_component(get_ajax_url($route.ajaxurl), targetDIV);	// as $.load, but provide form submit
}
/* end UserController */

//======================================
/*** CrossController ***/
function CrossCtrl() {
    $scope = sLoad($route.ajaxurl);
    Resig.render('Cross', {crosses:$scope.crosses});
}
/* end CrossController */

//======================================
/*** VerticalController ***/
function VerticalCtrl() {	// requests: #/vertical/id, #/vertical?search=search, #/vertical?news=true
    $scope = sLoad($route.ajaxurl);
    var search = $request.vars.search, news = $request.vars.news, verticalId = false;
    var header = search || '';
    mastersearch.val(header.unescapeHTML());
    header = $scope.header;
    if (!news) {
	var href, _title;
	if ($request.args[0]) {
	    verticalId = $request.args[0];
	    href = `${startpath}editvertical/${verticalId}`;
	    _title = `${L._EDIT_VERT_} ${$scope.vertical}`;

	} else {
		href = `${startpath}editfound?search=${search}`;
		_title = '';
	    }
	header = `<a href="${href}" title="${_title}" ajax="1">${header}</a>`;
      }

    Resig.render(news?L._NEWS_:$scope.header, {plints:$scope.plints, users:$scope.users, header:header, search:search, news:news, verticalId:verticalId});
    set_wraptext();
    set_editchain();
}
/* end VerticalController */

//======================================
/*** ChainController ***/
function ChainCtrl() {
    $request.args.push('chain')
    $scope = sLoad($route.ajaxurl);
    Resig.render($scope.address, {chain:$scope});
    set_editchain();
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

    $scope = sLoad($route.ajaxurl);
    var file, title;
    if ($request.vars.merge) title = L._MERGE_DB_;
    else if ($request.vars.txt) title = L._IMPORT_;
    else title = L._RESTORE_;

    Resig.render(title, {title:title});
    var form = new Form();
    document.getElementById('upload').addEventListener('change', handleFileSelect, false);

    form.form.submit(function() {
	return file ? postForm(this) : false;
    });
}
/* end RestoreController */

//======================================
/*** EditCrossController ***/
function EditCrossCtrl() {
    $scope = sLoad($route.ajaxurl);
    if ($scope.new) $scope.title = '';
    Resig.render($scope.header, {cross:$scope});
    var form = new Form();
    form.form.submit(function() { return postForm(this); });
}
/* end EditCrossController */

//======================================
/*** EditVerticalController ***/
function EditVerticalCtrl() {

    commondataHelp = function() {
        $.get(staticpath + "varhelp.html")
        .success(function(data) { web2pyflash(data, 'default', 0); });
    }

    verticalChange = function() {
	//console.info(inputs);
	$("table#watchtable tr").remove(".refreshing");
	$scope.formData = {};
	vertical = $scope.formData;
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
		//if (idx < 0 || inputs.start1all) vertical.push({name:'start1_'+i, value:start1});
		if (idx < 0 || inputs.start1all) vertical['start1_'+i] = start1;
		tr.append(`<td class="${_class}" title="${rcd}"><sup>${start1}</sup>${ti.escapeHTML()}</td>`);
		tr.append(`<td>${st}</td>`);
		rcd = rcomdata;
		if (titles.vertical && chaindata.plints[si+i]) {
		    st = chaindata.plints[si+i][1];
		    if (inputs.rcdreplace) {
			rcd = rcd.replace(/%0/g, chaindata.plints[si+i][3]);
			rcd = $.trim(rcd.replace(/%3/g, ti));
			//vertical.push({name:'rcomdata_'+i, value:rcd});
			vertical['rcomdata_'+i] = rcd;
		    } else rcd = '';
		} else {
		    st = '';
		    rcd = '';
		}
		cd = $.trim(cd.replace(/%3/g, st));
		tr.appendTo(watchtable);   // id of element, without declare variable!!!
		//vertical.push({name:'title_'+i, value:ti});
		//vertical.push({name:'comdata_'+i, value:cd});
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
		    //vertical.push({name:'pid_'+i+'_'+String(j+1), value:ti});
		    vertical['pid_'+i+'_'+String(j+1)] = ti;
		    if (!view_cd) $('<td>').html(_mypre.format(ti.escapeHTML())).appendTo(tr);
		}

		if (!res) break;    // if not %1, add only 1 plint
	    }
	}
    }

    var matchTitle = function(arr, query) {
	for(var o in arr) if (arr[o].title && arr[o].title == query.escapeHTML()) return o;
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

    $scope = sLoad($route.ajaxurl);
    $scope.verticalId = $request.args[0];
    Resig.render($scope.header, {vertical:$scope});

    const _th_com_ = ['<th width="14%">'+tbheaders[2]+'</th>', '<th width="6%">+/~</th>'];
    const _th_cdt_ = ['<th width="40%">'+L._COMMON_DATA_+'</th>', '<th>'+L._REM_CD_+'</th>'];

    var view_cd, vertical,
	wthead = $('#watchtable tr.info'),
	vmEl = $('input[name=view]').on('change', viewChange),
	taEl = $('textarea').on('input', verticalChange);

    var form = new Form(verticalChange);
    form.onLinkChange = verticalChange;
    form.chaindepth = 3;
    form.chaindata = [];
    form.chaindata.push(new Link(form, 'plintscd'));
    var chaindata = form.chaindata[0], inputs = form.inputs;	// shorthands
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

    form.form.submit(function() {
	vertical.title = inputs.title;
	vertical.count = inputs.count || 0;
	if (inputs.rcdreplace) {
	    vertical.from_vert = chaindata.link.verticalId;
	    vertical.from_plint = chaindata.link.plintId;
	}
	if (inputs.delete) vertical.delete = 'on';
	return postForm();
    });
}
/* end EditVerticalController */

//======================================
/*** EditPlintController ***/
function EditPlintCtrl() {

    plintChange = function() {
	if (form.inputs.delete) return;
	mergechar.disabled = !form.inputs.merge;
	$('ol').attr('start', parseInt(form.inputs.start1));
    }

    $scope = sLoad($route.ajaxurl);
    $scope.start1 = $scope.start1 ? "checked" : "";
    Resig.render($scope.address, {plint:$scope});
    $('textarea').val($scope.pairtitles.unescapeHTML());   // insert multiline pairtitles by templating system gives loss first new line (\n), ;-( ?
    var form = new Form(plintChange);
    var mergechar = form.inputstext.filter('[name=mergechar]')[0];
    form.init();

    form.form.submit(function() { return postForm(this); });
}
/* end EditPlintController */

//======================================
/*** EditPairController ***/
function EditPairCtrl() {

//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
    refreshWatch = function() {
        $("table#watchtable tr").remove(".refreshing");
        $.each(form.chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link.link[this+'Id']).appendTo(tr); });
            tr.appendTo(watchtable);   // id of element, without declare variable!!!
        });
	//console.log(form);
    }
//~~~~~~~~~~~~end for debug~~~~~~~~~~~~~~

    addLink = function() {
        form.chaindata.push(new Link(form, 'plints'));
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
        if (_DEBUG_) refreshWatch();
        //~~~~~~$$$$$$$$$$$$$$$$$~~~~~~~~~~~~~
    }

    if (localStorage.editchain == 'true') $request.args.push('chain');
    $scope = sLoad($route.ajaxurl);
    Resig.render($scope.address, {pair:$scope});
    var form = new Form();
    form.chaindepth = 4;
    form.chaindata = [ {link:{crossId: 0, verticalId: 0, plintId: $request.args[0], pairId: $request.args[1]}} ] // native link
    if ($scope.chain) $.each($scope.chain, function() { form.chaindata.push(new Link(form, 'plints', this)); });
    //console.log(form);

    //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~
    //debugger;
    if (_DEBUG_) {
        Resig.append_render('watchtableTmpl');
        refreshWatch();
	form.onLinkChange = refreshWatch;
    }
    //~~~DEBUG~~~$$$$$$$$$$$$$$$$$~~~~~~

    form.form.submit(function(event) {
	$scope.formData = {'cross_0':0, 'plint_0':$request.args[0], 'pair_0':$request.args[1], 'chain':true};
	postForm(this);
    });
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
	}
    }

    $scope = sLoad($route.ajaxurl);

    var fdata = [];
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
                            pairId: idx+1,    // idx in range 0-9, pid in range 1-10
                            start1: start1});
        });
    });

    Resig.render($scope.header, {search:$request.vars.search, header:$scope.header, count:fdata.length});
    var form = new Form(refreshFoundTable);
    var inputs = form.inputs;

    var pair, row;
    for(var ci in fdata) {
	pair = fdata[ci];
	row = foundtable.insertRow();
	row.insertAdjacentHTML('beforeend', pairRow(pair));
	pair.cell = row.insertCell();
    }

    form.init();

    form.form.submit(function() {
	$scope.formData = {};
        $.each(fdata, function(idx, link) {
            $scope.formData['cross_'+idx] = 0;    // impotant!, inform 'def ajax_update():' about record existence
            $scope.formData['plint_'+idx] = link.plintId;
            $scope.formData['pair_' +idx] = link.pairId;
            $scope.formData['title_'+idx] = link._title.unescapeHTML();
        });
	postForm();
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
	//console.log(searchvalue)
            if (searchvalue != oldvalue) {
		oldvalue = searchvalue;
                $.ajax(get_ajax_url("livesearch", {}), {
                    data: {search: searchvalue},
                    beforeSend: function(jqXHR){
                        while (reqs.length) reqs.pop().abort();
                        reqs.push(jqXHR);
                    },
		    dataFilter: function(data) { return data.escapeHTML(); },
                    success: function(data){
                        if (data.search.length) {
                            div.html(Resig._render("liveSearchTmpl", data));
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

    mastersearch.blur(function(event){
	oldvalue = searchvalue;
	hidelive();
        if (mastersearch.val() != searchvalue) {
	    mastersearch.val(searchvalue);
	    setTimeout(function(){mastersearch.focus()}, 10);
	}
    });

    $('form.livesearch').submit(function() {
        var value = mastersearch.val();
        if (value.length > 2) {
            hidelive();
            Router.navigate(startpath + 'vertical?search=' + value, {add:true});
        } else web2pyflash(value + ' : ' + L._TOOSHORT_, 'danger');
        return false;
    });

})();
/* end ajax live search controller */
