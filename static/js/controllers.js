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
function CrossCtrl() { web2spa.load_and_render(function() { return {data:{crosses:$scope.data}}; }); }
/* end CrossController */

//======================================
/*** VerticalController ***/
function VerticalCtrl() {	// requests: #/vertical/id, #/vertical?search=search
    web2spa.load_and_render(function() {
	var search = $request.vars.search, vId = false, _title='', href;
	$("#master-search").val((search || '').unescapeHTML());
	if ($request.args[0]) { // for certain vertical view
	    vId = $request.args[0];
	    href = `${web2spa.start_path}editvertical/${vId}`;
	    _title = `${L._EDIT_VERT_} ${$scope.vertical}`;
	} else href = `${web2spa.start_path}editfound?search=${search}`;    // for search results view
	var header = `<a class="web2spa" href="${href}" title="${_title}">${$scope.header}</a>`;
	return {title:$scope.header, data:D_Vertical(header, search, false, vId)};
    });
    toggle_wrap();
    if ($userId) toggle_ctrl();
    //toggle_ctrl();
}
/* end VerticalController */

//======================================
/*** NewsController ***/
function NewsCtrl() {
    web2spa.load_and_render(function() { return {title:L._NEWS_, data:D_Vertical($scope.header, false, true, false)}; });
    //toggle_chain();
}
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
    var file, title, ft = 'csv';
    if ($request.vars.merge) title = L._MERGE_DB_;
    else if ($request.vars.txt) { title = L._IMPORT_; ft = 'txt'; }
    else title = L._RESTORE_;
    web2spa.load_and_render(function() { return {title:title, data:{title:title, hint:`Select ${ft} file`}}; });
    var form = new Form(function() { return file ? form.post(this) : false; }); // restore ctrl
    $('#upload').change(function (e) {
	file = e.target.files[0];
	$('#prop').text(file.size + ' bytes, last modified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a'));
    });
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

/* specific String helpers */
String.prototype.getCounter = function(re, i) {
    return this.replace(re, function(s,m) { return String(+m+i).frontZero(m.length); });
}
String.prototype.getComData = function(p1, p2, i) {
    return $.trim(this.getCounter(/%(\d+)/g, i)/*counters*/.replace(/%A/g, p1)/*actual common data*/.replace(/%M/g, p2))/*plint name*/;
}
/* end specific String helpers */

function EditVerticalCtrl() {

    const oldset = ["warning", "~", L._OLDPL_], newset = ["new", "+", L._NEWPL_];

    function verticalChange() {
	//var timeLoop = performance.now();
        //console.time('editvertical');
	//console.info('form inputs:', inputs);
	vertical = {plints:[], rplints:[]};
	var data = {rows:[]}, link = Chain.chain[0];
	//console.log(link);
	if (inputs.delete) vertical.delete = 'on';
	else {
	    $('#verttitle').text(inputs.title);
	    var plintmask = inputs.plintmask, cable = 0;
	    if (plintmask) {
		var cnt = inputs.count;
		if (isNaN(cnt) || cnt=='' || cnt>100 || cnt<0) $('#plintCount').addClass('has-error');
		else {
		    $('#plintCount').removeClass('has-error');
		    //var titles = chaindata.titles,
		    var cdmask = inputs.cdmask.replace(/%C/g, link.cross.title||'').replace(/%V/g, link.vertical.title||''),
			rcdmask = inputs.cdmask.replace(/%C/g, $scope.cross).replace(/%V/g, $scope.vertical).unescapeHTML(),
			pairmask = inputs.pairmask,
			multiplint = /%\d+/.test(plintmask),    // one plint or more
			remote = link.plint.si,	// remote plint selected index
			editor = taEl.val().split('\n'),
			editor_en = editor && /%E/.test(pairmask);
		    for(var i=0; i<cnt; i++) {
			var plint = {maindata:{},pairdata:{}},
			    title = plintmask.getCounter(/%(\d+)/g, i),   // plint title with counter
			    pairbase = pairmask.getCounter(/%(\d+)/g, i),   // plint counter for pair
			    set, row, cd, rcd = '', start1, rem_rec = '',
			    oldplint = plintByTitle($scope.plints, title.escapeHTML());   // search in vertical by plint title
			if (oldplint) {
			    set = oldset;
			    cd = oldplint.comdata.unescapeHTML(); // actual common data from old plint
			    start1 = inputs.start1all ? inputs.start1 : oldplint.start1;
			    if (i==0) cable = oldplint.cable || 0;
			} else {
			    set = newset;
			    cd = '';
			    start1 = inputs.start1;
			}
			if (!oldplint || inputs.start1all) plint.maindata['start1'] = start1;
			if (link.vertical.title && link.plint.data[remote+i]) {
			    rem_rec = link.plint.data[remote+i];   // [id, title, start1, comdata]
			    if (inputs.rcdreplace) {
				rcd = rcdmask.getComData(rem_rec[3], title, i);
				vertical.rplints.push({id:rem_rec[0], maindata:{comdata:rcd}});
			    }
			    rem_rec = rem_rec[1];   // remote plint title
			}
			row = {class:set[0], hint:set[2], start1:start1, title:title.escapeHTML(), chr:set[1], cd:cdmask.getComData(cd, rem_rec, i), rcd:rcd, pairs:[]};
			plint.maindata['title'] = title;
			plint.maindata['comdata'] = row.cd;
			set = editor_en ? (editor[i] || '').split('\t')	: '';	// set of pair titles from editor
			for(var j=0; j<10; j++) {
			    title = $.trim(pairbase.getCounter(/%P(\d+)/g, j).getCounter(/%D(\d+)/g, i*10+j)
				.replace(/%A/g, oldplint ? oldplint.pairs[j].unescapeHTML() : '')
				.replace(/%E/g, set[j] || ''));
			    plint.pairdata['pid'+String(j+1)] = title;
			    row.pairs.push(title);
			}
			data.rows.push(row);
			vertical.plints.push(plint);
			if (!multiplint) break;    // if not %counter, add only 1 plint
		    }
		}
	    }
	    scEl.val(cable);
	}
	$('#watchbody').html(data.rows.length ? web2spa._render({id: (view_cd ? 'CDwatchTmpl': 'PTwatchTmpl'), data:data}) : '');
	//console.timeEnd('editvertical');
	//console.log(performance.now() - timeLoop);
    }

    function plintByTitle(arr, title) { // title of plint: existing or new
	for(var o in arr) if (arr[o].title && arr[o].title == title) return arr[o];
	return 0;
    }

    const _th_com_ = '<th width="14%">'+tbheaders[2]+'</th><th width="6%">+/~</th>';
    const _th_cdt_ = '<th width="40%">'+L._COMMON_DATA_+'</th><th>'+L._REM_CD_+'</th>';

    function viewChange() {
	view_cd = vmEl.filter(':checked').val() == 'comdata';
	$('#watchhead').html(view_cd ? wthead_cd : wthead_pt);
	form.init();	// this trigger 'verticalChange'
    }

    function verticalSubmit() {
	vertical.title = inputs.title;
	if ($('#setCable')[0].checked) {
	    var cid = +scEl.val();
	    if (vertical.plints.length) {
		var details = vertical.plints[0].maindata.comdata;
		for (var ci in vertical.plints) vertical.plints[ci].maindata.cable = cid;
		if (vertical.rplints.length) {
		    for(var ci in vertical.rplints) vertical.rplints[ci].maindata.cable = cid;
		    if (cid) vertical.cable = {id:cid, maindata:{details:vertical.rplints[0].maindata.comdata + ' - ' + details}};
		}
	    }
	}
	$scope.formData = {};
	$scope.formData.vertical = JSON.stringify(vertical);
	//console.log($scope.formData); return false;
	return form.post();
    }

    web2spa.load_and_render(function() {
	$scope.verticalId = $request.args[0];
	if ($scope.s_plint) $scope.s_plint.mask = $scope.s_plint.title.replace(/(\d+)/, '%$1');
	else $scope.s_plint = {mask:'М%1', count:0};
	return {title: $scope.header, data:{vertical:$scope}};
    });

    $('#helpbtn').click(function() { $.get(web2spa.static_path + "varhelp.html").success(function(data) { web2spa.show_msg(data, 'default', 0); }); });
    $('#editor').change(function() { if (this.checked) { taEl.show(); taEl.focus(); } else taEl.hide(); });

    var view_cd, vertical, vdata,
	vmEl = $('input[name=view]').on('change', viewChange),
	taEl = $('textarea').on('input', verticalChange),
	scEl = $('#cables'),
	form = new Form(verticalSubmit, {hC:verticalChange}),
	inputs = form.inputs,   // shorthand
	wthead_cd = _th_com_ + _th_cdt_,   // for common data
	wthead_pt = _th_com_ + '<th width="8%">'.repeat(10);	// for pair titles

    Chain.init('plintscd', 3, verticalChange, $scope.chain, false, viewChange);

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
        var wt = $('#watchtable'), tr;
        wt.find('tr').remove('.refreshing');
        $.each(Chain.chain, function(key, link) {
            tr = $('<tr>', {class:'refreshing'});
            $('<td>', {class:'warning'}).text(key).appendTo(tr);
            $.each(Chain.stages, function() { $('<td>').text(link[this].id).appendTo(tr); });
            tr.appendTo(wt);   // id of element, without declare variable!!!
        });
	//console.log(form);
    }	//~~~~~~~~~~~~end for debug~~~~~~~~~~~~~~

    function editpairSubmit() {	// submit edit pair ctrl
	var id, title = this.title.value, details = this.details.value;
	if (chainMode) Chain.order(title, details);
	else {
	    id = $request.args;
	    Chain.plints = {};
	    Chain.plints[id[0]] = {};
	    Chain.plints[id[0]]['pid'+id[1]] = title;
	    Chain.plints[id[0]]['pdt'+id[1]] = details;
	}
	$scope.formData = {};
	$scope.formData.plints = JSON.stringify(Chain.plints);
	//console.log($scope.formData.plints); return false;
	return form.post();
    }

    var chainMode = $request.vars.chain;
    web2spa.load_and_render(function() { return {title:$scope.address, data:{pair:$scope, chain:chainMode}}; });
    var form = new Form(editpairSubmit);
    if (chainMode) {
	Chain.init('plintscd', 4, _DEBUG_?refreshWatch:null, $scope.chain, true);	// 'plints'
	if (_DEBUG_) { web2spa.render({id:'ChainWatchTmpl', append:true}); refreshWatch(); }
	//debugger;
    }
    //console.table(Chain);

    app.chainMode.init(function(value) {
	value = location.pathname + (value?'?chain=true':'');
	history.replaceState(null, null, value);
	web2spa.navigate(value);
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
	    plints[pair.plintId]['pid'+pair.pairId] = pair._title.unescapeHTML();
	}
    }

    function plints_to_pairs() {
	$.each($scope.plints, function(key, plint) {  // convert : array of plints to array of pairs
	    var start1 = parseInt(plint.start1);
	    $.each(this.pairs, function(idx, pair) {
		if (pair[0].indexOf($request.vars.search) >= 0) {
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
		    if (!plints[plint.id]) plints[plint.id] = {};
		}
	    });
	});
	return {title:$scope.header, data:{search:$request.vars.search, header:$scope.header, count:fdata.length}};
    }

    function foundSubmit() { $scope.formData = {}; $scope.formData.plints = JSON.stringify(plints); return form.post(); }

    var fdata = [], plints = {};
    web2spa.load_and_render(plints_to_pairs);
    var form = new Form(foundSubmit, {hC:refreshFoundTable});    // edit found ctrl
    var inputs = form.inputs, pair, row;
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

    var jqXHR, keypress = false, searchvalue = '', oldvalue = '', div = $("#livesearchout");

    function hidelive() {
        div.hide();
	div.empty();
        //while (reqs.length) reqs.pop().abort();	// abort all ajax requests
    }

    function getPairTitles(event) {
        if (keypress) return;
        searchvalue = mastersearch.val();
        if(searchvalue.length > 2){
	//console.log(searchvalue)
            if (searchvalue != oldvalue) {
		oldvalue = searchvalue;
		if (jqXHR) jqXHR.abort();
                jqXHR = $.ajax(web2spa.get_ajax_url("livesearch", {}), {
                    data: {search: searchvalue},
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

    var mastersearch = $("#master-search")    // global input
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
