/*** Global constants  ***/
const _DEBUG_ = false;
//const _DEBUG_ = true;
const _mypre = '<pre class="mypre">%s</pre>';

app = {name: 'cross'};

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
	if (_DEBUG_) web2spa.targetEl.before('<div id="debuglog" class="well"></div>');
    },
    //beforeNavigate: function() { app.chainMode.reset_handler(); console.log(lengthOf($.cache)); console.dir($.cache); }
    beforeNavigate: function() { app.chainMode.reset_handler(); },
    afterNavigate: function() {
	if (_DEBUG_) { $("#debuglog").text('Size of jQuery cache: '+Object.keys( $.cache ).length); console.dir($.cache); }
    }
});

/* stage hyperlink helpers */
function A_Cross(o) { return `<a class="web2spa" href="${web2spa.start_path}editcross/${o.crossId}" title="${L._EDIT_CROSS_} ${o.cross}">${o.cross}</a>`; }

function A_Vertical(o, _class='') {
    //_class = _class ? `class="${_class}"` : '';
    return `<a class="web2spa ${_class}" href="${web2spa.start_path}vertical/${o.verticalId}" title="${L._VIEW_VERT_} ${o.vertical}">${o.header || o.vertical}</a>`; }

function A_Plint(o) {
    var start1 = o.pairId+o.start1-1;
    return `<sup>${o.start1}</sup><a class="web2spa" href="${web2spa.start_path}editplint/${o.plintId}" title="${L._EDIT_PLINT_} ${o.plint}">${o.plint}</a>`; }

function A_Pair(o) {
    var start1 = o.pairId+o.start1-1;
    return `<a class="web2spa" href="${web2spa.start_path}editpair/${o.plintId}/${o.pairId}" title="${L._EDIT_PAIR_} ${start1}" data-pair="1">${L._PAIR_} ${start1}</a>`; }

function pairRow(pair, depth, colv) {
    depth = typeof depth !== 'undefined' ? depth : 4;
    var cell, row = '', tds = [A_Cross, A_Vertical, A_Plint, A_Pair];
    for(var i=0; i<depth; i++) {
	cell = colv ? `<td class="colv${i}">` : '<td>';
	row += cell+tds[i](pair)+'</td>';
    }
    return row;
}
/* stage hyperlink helpers */

/* toggle helpers for pair href */
function toggle_wrap() {
    app.wrapMode.init(function(value) { $('table.vertical td').css('white-space', value ? 'pre-line' : 'nowrap'); }, true);
}

function toggle_chain() {
    $scope.a = $('a[data-pair]');  // set for store of jQuery <a> elements
    $scope.a.each(function() { $(this).data('href', this.attributes.href.value); });	// store original href to custom data property
    app.chainMode.init(function(value) { $scope.a.each(function(){ this.href = $(this).data('href')+(value?'?chain=true':''); }); }, true);
}

function toggle_ctrl() {
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
}
/* toggle helpers for pair href */

function str_editMode() { return `<label><input id="editMode" type="checkbox">${L._EDITOR_}</label>`; }

function D_Vertical(header, search, news, vId) {
    return {plints:$scope.plints, users:$scope.users, header:header, search:search, news:news, vId:vId};
}
