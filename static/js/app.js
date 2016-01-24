/*** Global constants  ***/
//const _DEBUG_ = false;
const _DEBUG_ = true;
const _mypre = '<pre class="mypre">%s</pre>';

var compile = pattern => pattern+2
console.log(compile(1));

var app = {
    name: 'cross',
    link_clrs:  ['#fff', '#9ff', '#f9f', '#ff9', '#aaf', '#afa', '#faa', '#bdf', '#fbd', '#dfb', '#fdb'],
    cable_clrs: ['#fff', '#bff', '#fbf', '#ffb', '#ccf', '#bfc', '#fcc', '#cef', '#fce', '#efe', '#fdc'],
    /* for DEBUG */
    vars_watch: function() {
	$("#varswatch").text('Size of jQuery cache:%s, Size of window:%s'.format(Object.keys($.cache).length, Object.keys(window).length));
	//console.dir($.cache);
    },

    /* === stage hyperlink helpers === */
    A_Cross: function(_o) {
	return `<a class="web2spa" href="${web2spa.start_path}editcross/${_o.crossId}" title="${L._EDIT_CROSS_} ${_o.cross}">${_o.cross}</a>`;
    },
    A_Vertical: function(_o, x) {
	return `<a class="web2spa ${x||''}" href="${web2spa.start_path}vertical/${_o.verticalId}" title="${L._VIEW_VERT_} ${_o.vertical}">${_o.header||_o.vertical}</a>`;
    },
    A_Plint: function(_o) {
	var start1 = _o.pairId + _o.start1-1;
	return `<sup>${_o.start1}</sup><a class="web2spa" href="${web2spa.start_path}editplint/${_o.plintId}" title="${L._EDIT_PLINT_} ${_o.plint}">${_o.plint}</a>`;
    },
    A_Pair: function(_o) {
	var start1 = _o.pairId + _o.start1-1;
	return `<a class="web2spa" href="${web2spa.start_path}editpair/${_o.plintId}/${_o.pairId}" title="${L._EDIT_PAIR_} ${start1}" data-pair="1">${L._PAIR_} ${start1}</a>`;
    },
    pairRow: function(pair, depth, colv) {
	depth = typeof depth !== 'undefined' ? depth : 4;
	var tda = [], fna = [this.A_Cross, this.A_Vertical, this.A_Plint, this.A_Pair];
	for(var i=0; i<depth; i++) tda.push((colv ? `<td class="colv${i}">` : '<td>')+fna[i](pair)+'</td>');
	return tda.join('');
    },
    /* --- stage hyperlink helpers --- */

    /* toggle helpers for pair href */
    toggle_wrap: function() {
	app.wrapMode.init(function(value) { $('table.vertical td').css('white-space', value ? 'pre-line' : 'nowrap'); }, true);
    },
    toggle_chain: function() {  // find <a> elements, store original href to custom data property and set 'onclick' handler
	$scope.a = $('a[data-pair]').each(function() { $(this).data('href', this.attributes.href.value); });
	app.chainMode.init(function(value) { $scope.a.each(function(){ this.href = $(this).data('href')+(value?'?chain=true':''); }); }, true);
    },
    toggle_ctrl: function() {
	function cmp_href()	{   // compose href for <a>: replace 'ctrl' with 'editpair' or 'chain', add/remove var 'chain'
	    $.each($scope.a, function() {
		var em = app.editMode.value, cm = app.chainMode.value; // shortcuts
		this[2].href = this[0] + (em?'editpair':'chain') + this[1] + (em&&cm?'?chain=true':'');
	    });
	}
	$scope.a = [];  // array for store splitting href: part1, part2, jQuery <a> elements
	$('a[data-pair]').each(function(i) { $scope.a[i] = this.attributes.href.value.split('\/ctrl\/').concat([this]); });
	app.editMode.init(cmp_href);  // set 'change editMode handler'
	app.chainMode.init(cmp_href, true);  // set 'change chainMode handler' and starting once
    },
    /* toggle helpers for pair href */

    str_editMode: function() {
	return `<label><input id="editMode" type="checkbox">${L._EDITOR_}</label>`;
    },
    D_Vertical: function(header, search, news, vId) {
	return {plints:$scope.plints, users:$scope.users, cables:$scope.cables, header:header, search:search, news:news, vId:vId};
    },
    strip_table: function() {
	$('table tr:nth-child(odd)').css('background-color', function(i, v) {
	    // blacking color like rgb(rrr, ggg, bbb)
	    return v.replace(/(\d+)/g, function(s, m) { return (+m/1.03).toFixed(); });
	});
    }
};

web2spa.init({	// application settings, !!! important: urls or url's parts without slashes
    app: app.name,
    ajaxctrl: 'ajax',
    lexicon_url: 'lexicon', // lexicon url: 'cross/ajax/lexicon.json'
    target: 'crosshome',	// main div for content
    templates: 'templates', // templates url: 'cross/views/templates.html'
    post_back: true, // enable history.back() when forms are posted
    esc_back: true, // enable history.back() when 'ESC' key pressed
    routes: [
	['Cross', {index:true, shortcuts:true}],    // urls: 'cross/default/index', 'cross/default', 'cross'; JS controller: CrossCtrl; template: CrossTmpl, index=true means: path is empty, but controller is a string
	['Vertical'],	// url: 'cross/default/index/vertical'; JS controller: VerticalCtrl; template: VerticalTmpl
	['News', {template:'Vertical'}],
	['Chain'],
	['EditCross', {login_req:true}],    // will be redirect to login path, if not authorized
	['EditVertical', {login_req:true}],
	['EditPlint', {login_req:true}],
	['EditPair', {login_req:true}],
	['EditFound', {login_req:true}],
	['EditCables', {login_req:true}],
	['Restore', {master: true, login_req:true}],	// url: 'cross/default/restore', because master=true
	['User', {master: true, login_path:true}],  // url: 'cross/default/user' and this is login path pluralistically
	['Error', {error_path: true}]],

    beforeStart: function () {   /* callback, perform after app load & init, but before start, application setup */
	L = web2spa.lexicon;   // global shortcut to lexicon
	tbheaders = [L._CROSS_, L._VERTICAL_, L._PLINT_, L._PAIR_];
	L._BTNOKCNSL_ = web2spa._render({id:'btnOkCancelTmpl'});    // helpers, inline templates for common buttons
	L.i_ok = '<i class="glyphicon glyphicon-ok">';
	L.i_par = '<i class="glyphicon glyphicon-random">';
	app.chainMode = new CheckBox('chainMode');
	app.editMode = new CheckBox('editMode');
	app.wrapMode = new CheckBox('wrapMode');
	app.db_clear = function() { if (confirm("A you sure?")) location.href = web2spa.root_path + 'cleardb'; }
	_DEBUG_ && web2spa.targetEl.before('<div id="debug" class="well"><button class="btn btn-default" onclick="vars_watch()">Watch</button><span id="varswatch"></span></div>');
    },
    beforeNavigate: function() {
	app.chainMode.reset_handler();
    },
    afterNavigate: function() { _DEBUG_ && app.vars_watch(); }

});
