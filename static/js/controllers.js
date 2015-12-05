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

    function set_href() {
	$.each($scope.a, function() {
	    var edit = app.editMode.value, chain = app.chainMode.value; // shortcuts
	    // compose href for <a>: replace 'ctrl' with 'editpair' or 'chain', add var 'chain'
	    this[2].href = this[0] + (edit?'editpair':'chain') + this[1] + (edit&&chain?'?chain=true':'');
	});
    }

    app.wrapMode.init(function(value) { $('table.vertical td').css({'white-space': value ? 'pre-line' : 'nowrap'}); }, true);

    $scope.a = [];  // array for store splitting href: part1, part2, jQuery <a> elements
    $('a[data-pair]').each(function(i) { $scope.a[i] = this.attributes.href.value.split('ctrl').concat([this]); });

    app.editMode.init(set_href);  // set change editMode handler
    app.chainMode.init(set_href, true);  // set change chainMode handler and starting once
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
    $scope.a = $('a[data-pair]');  // store set of jQuery <a> elements
    $scope.a.each(function() { $(this).data('href', this.attributes.href.value); });
    app.chainMode.init(function(value) { $scope.a.each(function(){ this.href = $(this).data('href')+(value?'?chain=true':''); }); }, true);
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

    commondataHelp = function() { $.get(web2spa.static_path + "varhelp.html").success(function(data) { web2spa.show_msg(data, 'default', 0); }); }

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
	wthead.append(_th_com_);
	if (view_cd) wthead.append(_th_cdt_);
	else for(var i=0; i<10; i++) wthead.append('<th width="8%">');
	form.init();
    }

    function verticalSubmit() {
	vertical.title = inputs.title;
	vertical.count = inputs.count || 0;
	if (inputs.rcdreplace) {
	    vertical.from_vert = chaindata.link.verticalId;
	    vertical.from_plint = chaindata.link.plintId;
	}
	if (inputs.delete) vertical.delete = 'on';
	return form.post();
    }

    web2spa.load_and_render(function() {
	$scope.verticalId = $request.args[0];
	return {title: $scope.header, data:{vertical:$scope}};
    });

    const _th_com_ = '<th width="14%">'+tbheaders[2]+'</th><th width="6%">+/~</th>';
    const _th_cdt_ = '<th width="40%">'+L._COMMON_DATA_+'</th><th>'+L._REM_CD_+'</th>';

    var view_cd, vertical,
	wthead = $('#watchtable tr.info'),
	vmEl = $('input[name=view]').on('change', viewChange),
	taEl = $('textarea').on('input', verticalChange);

    var form = new Form(verticalSubmit, {hC:verticalChange});    // edit vertical ctrl
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
        $.each(form.chaindata, function(i, link) {
            var tr = $('<tr>', {class:"refreshing"});
            $('<td>', {class:"warning"}).text(i).appendTo(tr);
            $.each(stages, function() { $('<td>').text(link.link[this+'Id']).appendTo(tr); });
            tr.appendTo(watchtable);   // id of element, without declare variable!!!
        });
	//console.log(form);
    }	//~~~~~~~~~~~~end for debug~~~~~~~~~~~~~~

    function editpairSubmit() {	// submit edit pair ctrl
	var title = this.title.value, details = this.details.value;
	$.each(form.chaindata, function() {
	    row = this.link.plintId;
	    if (row > 0) {  // pearl off rows with "Not crossed"
		if (!plints[row]) plints[row]= {};
		plints[row]['pid'+this.link.pairId] = title;
		if (this.link.main) plints[row]['pdt'+this.link.pairId] = details;
	    }
	});
	//console.log(plints);
	$scope.formData.plints = JSON.stringify(plints);
	return form.post();
    }

    function editpairRender() {	// submit edit pair rendering
	web2spa.load_and_render(function() { return {title:$scope.address, data:{pair:$scope, chain:$request.vars.chain}}; });
	form = new Form(editpairSubmit);
	$('#addLink').click(function addLink() {
	    form.chaindata.push(new Link(form, 'plints'));
	    if (_DEBUG_) refreshWatch();
	});
	$scope.formData = {};
	$scope.formData.plints = {};
	plints = $scope.formData.plints; // shortcut
	form.chaindepth = 4;
	form.chaindata = []
	if ($scope.chain) $.each($scope.chain, function() {
	    row = this.plintId;
	    if (!plints[row]) plints[row] = {};
	    plints[row]['pid'+this.pairId] = '';
	    if (this.main) plints[row]['pdt'+this.pairId] = ''; // native link
	    row = $request.vars.chain ? new Link(form, 'plints', this) : {link:this}; // plintspid
	    form.chaindata.push(row);
	});
	//console.log('form:', form, ' plints:', plints);
	//debugger;
	if (_DEBUG_) {	//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
	    web2spa.render({id:'watchtableTmpl', append:true});
	    refreshWatch();
	    form.onLinkChange = refreshWatch;
	}	//~~~~~~~~~~~~for debug~~~~~~~~~~~~~~
    }

    var form, plints, row;
    app.chainMode.init(function(value) {
	$request.vars.chain = value;
	editpairRender();
    }, true);

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

    function foundSubmit() { $scope.formData.plints = JSON.stringify(plints); return form.post(); }

    var fdata = [];
    web2spa.load_and_render(plints_to_pairs);
    var form = new Form(foundSubmit, {hC:refreshFoundTable});    // edit found ctrl
    var inputs = form.inputs;
    $scope.formData = {};
    $scope.formData.plints = {};
    var plints = $scope.formData.plints; // shortcut
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
}
/* end edit found controller */

//======================================
/*** Ajax Live Search Controller ***/
// running at startup
(function() {

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

    mastersearch = $("#master-search");	    // global input
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
            web2spa.navigate(web2spa.start_path + 'vertical?search=' + value, {add:true});
        } else web2spa.show_msg(value + ' : ' + L._TOOSHORT_, 'danger');
        return false;
    });

})();
/* end ajax live search controller */

//==========================================================

/*** Class: Link, responce <selector> sequence to table ***/
// constructor, usage: var link = new Link(...);
function Link(form, url, link) {

    if (typeof link === 'undefined') { link = {}; $.each(stages, function() { link[this+'Id'] = 0; }); }
    this.form = form;
    this.index = form.chaindata.length;
    this.link = link;
    //this.depth = form.chaindepth ? form.chaindepth : 1;
    this.depth = form.chaindepth || 1;
    this.cache = form.cache;
    this.url = url;
    this.controls = {};
    this.titles = {};
    var tr = $('<tr>'), td, sel, selclass = 'form-control' + (link.main ? ' main' : ''), self = this;
    for(var i = 0; i < this.depth; i++) {
        td = $('<td>');
        sel = $('<select>', {class:selclass}).prop('disabled', true).data('stage', stages[i]).appendTo(td);
        //sel.on('change', {this:this, form:form}, $selectChange);
        sel.on('change', function() { self.selectChange($(this)); });
        td.appendTo(tr);
        this.controls[stages[i]+'El'] = sel;
        }
    tr.appendTo(form.chaintable);
    form.chaintable.css({color:'inherit'});   // make table visible
    this.stage = stages[0];
    if (!this.cache.crosses) this.cache.crosses = web2spa.load('cross', {unescape:true, clearpath:true}).crosses;
    this.controls.crossEl.append($('<option>').text(L._NOT_CROSSED_).attr('value', 0));
    this.addOptFromObj(this.cache.crosses);
    this.setVertical();
}

Link.prototype.selectChange = function(El) {
console.log(El);
    var stage = El.data('stage');
    this.link[stage+'Id'] = El.val();        // !!! write select option to Link here !!!
    if (stage != 'pair') this[stage+'Change']();  // prototype function name, execute crossChange, verticalChange or plintChange
    var f = this.form.onLinkChange;
    if (typeof f == 'function') { ajaxstate.during ? ajaxstate.callback.push(f) : f(); }
    return false;
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

            var self = this;
            //----------callback function---------------
                var callback = function(){
                    self.plints = self.vertical[self.url].data; // shortcut, [url] - content of cache defined by urls, specific of "aLoad"
                    //console.log(self.titles.vertical, ':', self.link.verticalId, ', ajaxcount:', ajaxstate.count, ', plints:', self.plints, self)
                    if (self.plints && self.plints.length) {
                        var El = self.controls.plintEl;
                        if (_DEBUG_) $.each(self.plints, function() {El.append($('<option>').text(this[1]+' : '+this[0]).attr('value', this[0]));});
                            else $.each(self.plints, function() {El.append($('<option>').text(this[1]).attr('value', this[0]));});
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
                        var si = El[0].selectedIndex;
                        if (self.depth > 3) {
                            El = self.controls.pairEl;
                            El.enumoptions(self.plints[si][2]);
                            El.settovalue(pair);
                            self.link.pairId = pair;
                        }
                    }
                }
            //----------end callback function---------------
            aLoad(this.vertical, callback, this.url, {args:[this.link.verticalId]});
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
    if (_DEBUG_) $.each(data, function(key, item) {El.append($('<option>').text(item.title+' : '+key).attr('value', key));});
        else $.each(data, function(key, item) {El.append($('<option>').text(item.title).attr('value', key));});
    El.prop('disabled', false);
    this.setselect();
}
/*** End Class: Link ***/

//===========================================================
/*** Ajax async Load  ***/
var ajaxstate = {during:false, callback:[], count:0, cache:[]};

function aLoad(cache, callback, ajaxurl, params) {
    if (!cache[ajaxurl]) {
        cache[ajaxurl] = {};
        cache[ajaxurl].targets = [];
        $.ajax({
            url: web2spa.get_ajax_url(ajaxurl, params),
	    beforeSend: function(){
		ajaxstate.during = true;
		ajaxstate.count++;
	    },
            success: function(data) {
		ajaxstate.count--;
                cache[ajaxurl].data = data.data;
                while (cache[ajaxurl].targets.length) cache[ajaxurl].targets.pop()();	// local callback stack
                delete cache[ajaxurl].targets;
		if (ajaxstate.count == 0) {
		    ajaxstate.during = false;
		    while (ajaxstate.callback.length) {
			ajaxstate.callback.pop()();	// global callback stack
		    }
		}
            }
	});
    }
    if (cache[ajaxurl].data) callback();
    else cache[ajaxurl].targets.push(callback);
}
//======================================
//***---------- jQuery extension function ---------------***
$.fn.settofirst = function() { $(':nth-child(1)', this).attr('selected', 'selected'); }

$.fn.settovalue = function(value) { $('[value='+value+']' , this).attr('selected', 'selected'); }

$.fn.enumoptions = function (start) {
    var e = $('option', this) // get options set of select
    start = parseInt(start);
    if (e.length) {  // if options exist, simply change text
	if (_DEBUG_) $.each(e, function (i) {this.text = i + start + _dbgstr1+String(i+1)});
	    else $.each(e, function (i) {this.text = i + start});
    } else {
        this.prop('disabled', false);   // if it was early cleared and disabled, append new options
        for(var i= 1; i <= 10; i++) {
            if (_DEBUG_) this.append($('<option>').text(i+start-1 + _dbgstr1+String(i)).attr('value', i));
		else this.append($('<option>').text(i+start-1).attr('value', i));
        }
    }
}
