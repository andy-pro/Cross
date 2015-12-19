/*** object: Chain, contains chain data, links information ***/
var Chain = {

    clr: ['#fff', '#9ff', '#f9f', '#ff9', '#aaf', '#afa', '#faa', '#bdf', '#fbd', '#dfb', '#fdb'],
    stages: ['cross','vertical','plint','pair'],

    addLink: function(link) {
	link = new Link(this.count++, link);
	this.chain[link.id] = link;
	link.row.appendTo(this.body);
	//console.log(this.count);
    },

    init: function(url, depth, hC, chain) {
	this.chain = {};
	this.count = 0;
	this.body = $('#chainbody');
	this.url = url;
	this.onLinkChange = hC;
	this.depth = depth || 1;
	this.cache = null;     // use own data cache for ajax request
	this.plints = {};

	if (chain) {
	    var self = this, plints = this.plints;
	    this.ext = true;	// extend mode, extra cols: edited, add parallel, color
	    $.each(chain, function() {
		self.addLink(this);
		var row = this.plintId, id = this.pairId;
		if (!plints[row]) plints[row] = {};
		plints[row]['pid'+id] = '';  // if pair becomes 'Not crossed', his title is ''
		plints[row]['pch'+id] = 0;  //  chain position = 0
		plints[row]['par'+id] = false;  // parallel presence is false
		plints[row]['clr'+id] = 0;  // pair color
		if (this.edited) plints[row]['pdt'+id] = ''; // native link
		//console.log(row, ':', plints[row]);
	    });

	    //console.log(self.count);
	    this.body.sortable();
	    $('#addLink').click(function() { self.addLink(); });
	} else {
	    this.ext = false;
	    this.addLink();
	}

    },

    order: function(title, details) {
	var link, row, id, pch=1, self = this, plints = this.plints;
	$.each(this.body.sortable('toArray'), function() {
	    link = self.chain[this.split('-')[1]];  // retrive index from id='chainId-index'
	    //console.log(link);
	    row = link.plintId;
	    id = link.pairId;
	    //console.log(row);
	    if (row > 0) {  // pearl off rows with "Not crossed"
		if (!plints[row]) plints[row]= {};
		plints[row]['pid'+id] = title;
		plints[row]['pch'+id] = pch++;
		plints[row]['par'+id] = link.par;
		plints[row]['clr'+id] = +link.clr;
		if (link.edited) plints[row]['pdt'+id] = details;
	    }
	});
    },

    getStage: function(data, id) { for(var i in data) { var s = data[i]; if (s[0] == id) return s; } }

}

/*** Class: Link, responce <selector> sequence to element ***/
// constructor, usage: var link = new Link(...);
function Link(id, link) {

    const _td = '<td>';
    const _tdc = '<td class="chain">';
    const _sel = '<select class="form-control input-sm">';

    link = link || {};

    this.id = id || 0;
    //console.log(this.id);
    this.crossId = link.crossId || 0;
    this.verticalId = link.verticalId || 0;
    this.plintId = link.plintId || 0;
    this.pairId = link.pairId || 0;
    this.edited = link.edited;
    this.par = link.par || false;
    this.clr = link.clr || 0;

    this.controls = {};
    this.titles = {};
    var td, stage, El;

    this.row = $('<tr id="%s">'.format('chainId-'+id));

    if (Chain.ext) {
	td = $(_tdc);
	if (link.edited) td.html(L.i_ok);
	this.row.append(td).addClass('chain');
	//.mousedown(function(){$(this).css('cursor','grabbing')}).mouseup(function(){$(this).css('cursor','grab')});
    }

    for(var i = 0; i < Chain.depth; i++) {
	stage = Chain.stages[i];
        td = $(_td);
        this.controls[stage+'El'] = $(_sel)
	    .prop('disabled', true).data({stage:stage, this:this})
	    .on('change', this.selectChange).appendTo(td);    // appendTo(this.li);
        td.appendTo(this.row);
        }

    if (Chain.ext) {
	this.comdata = $(_tdc).appendTo(this.row);
	td = $(_tdc);
	this.controls['parenEl'] = $('<input type="checkbox" title="Add parallel">').prop({disabled:true, checked:this.par}).data({this:this}).on('change', this.parChange).appendTo(td);
	td.appendTo(this.row);

	td = $(_td);
	El = $(_sel).prop('disabled', true).data({this:this}).on('change', this.colorChange).appendTo(td);
	$.each(Chain.clr, function(i) { $('<option>').css('background', this).attr('value', i).appendTo(El); });	// .text(i)
	this.controls['colorEl'] = El;
	td.appendTo(this.row);
	El.settovalue(this.clr);
	El.trigger('change');
    }

    this.row.appendTo(Chain.body);
    this.stage = Chain.stages[0];
    if (!Chain.cache) Chain.cache = web2spa.load('cross', {unescape:true, clearpath:true}).data;
    this.controls.crossEl.append($('<option>').text(L._NOT_CROSSED_).attr('value', 0));
    this.appendOptions(Chain.cache);
    this.setVertical();
}

Link.prototype.parChange = function() {
    var self = $(this).data('this');
    self.par = this.checked;
}

Link.prototype.colorChange = function() {
    var self = $(this).data('this');
    self.clr = this.selectedIndex;
    var clr = Chain.clr[self.clr];
    $(this.parentElement.parentElement).css('background', clr);
    $(this).css('background', clr);
}

Link.prototype.selectChange = function(event) {
    var El = $(this);
    var self = El.data('this'), stage = El.data('stage');
    self[stage+'Id'] = El.val();        // !!! write select option to Link here !!!
    if (stage != 'pair') self[stage+'Change']();  // prototype function name, execute crossChange, verticalChange or plintChange
    var f = Chain.onLinkChange;
    if (typeof f == 'function') {
	self = this;
	function hC() { f.call(self, event); }
	ajaxstate.during ? ajaxstate.callback.push(hC) : hC();
    }
    return false;
}

Link.prototype.setVertical = function() {
    if (Chain.depth > 1) {
        this.stage = Chain.stages[1]; // set stage 'vertical'
        var id = this.crossId;
        if (id > 0) {
            var cross = Chain.getStage(Chain.cache, id);
            this.titles.cross = cross[1];
            this.verticals = cross[2]; // shortcut to Chain.cache[id][2]
            if (!$.isEmptyObject(this.verticals)) {
                this.appendOptions(this.verticals);
                this.setPlint();
            }
        }
    }
}

Link.prototype.setPlint = function() {
    if (Chain.depth > 2) {
        this.stage = Chain.stages[2];
        //console.warn(this);
        var id = this.verticalId;
        if (id > 0) {
	    //console.log('verticals: ', this.verticals);
            this.vertical = Chain.getStage(this.verticals, id); // shortcut to Chain.cache[id].verticals[id]
            this.titles.vertical = this.vertical[1];

            var self = this;
            //----------callback function---------------
	    function callback(){  // this=Window inside
		self.plints = self.vertical[Chain.url].data; // shortcut, [url] - content of cache defined by urls, specific of "aLoad"
		//console.log(self.titles.vertical, ':', self.verticalId, ', ajaxcount:', ajaxstate.count, ', plints:', self.plints, self)
		if (self.plints && self.plints.length) {
		    var El = self.controls.plintEl;
		    El.empty(); // prevent multiple <option>
		    $.each(self.plints, function() {El.append($('<option>').text(this[1]+(_DEBUG_ ? ' : '+this[0] : '')).attr('value', this[0]));});
		    El.prop('disabled', false);
		    var pair;
		    if (self.plintId) {
			El.settovalue(self.plintId);
			pair = self.pairId;
		    } else {             // false(default) - set to first
			El.settofirst()    ;
			self.plintId = El[0].value;
			pair = 1;
		    }
		    self.plintTitle();
		    var si = El[0].selectedIndex;
		    if (Chain.depth > 3) {
			El = self.controls.pairEl;
			El.enumoptions(self.plints[si][2]);
			El.settovalue(pair);
			self.pairId = pair;
			self.setPairProp(false);
		    }
		}
	    }
            //----------end callback function---------------
            aLoad(this.vertical, callback, Chain.url, {args:[this.verticalId]});
        }
    }
}

Link.prototype.setPairProp = function(value) {
    if (Chain.ext) {
	this.controls.parenEl.prop('disabled', value);
	this.controls.colorEl.prop('disabled', value);
    }
}

Link.prototype.crossChange = function() {
    if (Chain.depth > 1) {
        //----vertical, plint, pair selectors disable---------
        this.titles = {};
        this.controls.verticalEl.empty();
        this.controls.verticalEl.prop('disabled', true);
        this.verticalId = 0;
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
    if (Chain.depth > 3) {
        var plint = this.controls.plintEl[0].selectedIndex;
        this.controls.pairEl.enumoptions(this.plints[plint][2]);
    }
}

Link.prototype.plintTitle = function() {
    var si = this.controls.plintEl[0].selectedIndex;
    this.titles.plintindex = si;
    si = this.plints[si];
    this.titles.plint = si[1];
    if (this.comdata) this.comdata.html('<sup>'+si[2]+'</sup>'+si[3]);
}

Link.prototype.plintDisable = function() {  //----- plint, pair selectors disable
    var ctrls = this.controls;
    if (Chain.depth > 2) {
        ctrls.plintEl.empty();
        ctrls.plintEl.prop('disabled', true);
        this.plintId = 0;
	if (this.comdata) this.comdata.empty();
        if (Chain.depth > 3) {
            ctrls.pairEl.empty();
            ctrls.pairEl.prop('disabled', true);
	    this.setPairProp(true);
            this.pairId = 0;
        }
    }
}

Link.prototype.appendOptions = function(data) {
    var stage = this.stage,
	El = this.controls[stage+'El'],
	value = this[stage+'Id'];
    $.each(data, function() {El.append($('<option>').text(this[1]+(_DEBUG_ ? ' : '+this[0] : '')).attr('value', this[0]));});
    El.prop('disabled', false);
    if (value) El.settovalue(value);
    else {
        El.settofirst();
        this[stage+'Id'] = El[0].value;
    }
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

//==========================================================
/***---------- jQuery extension function ---------------*/
$.fn.settofirst = function() { $(':nth-child(1)', this).attr('selected', 'selected'); }

$.fn.settovalue = function(value) { $('[value='+value+']' , this).attr('selected', 'selected'); }

$.fn.enumoptions = function (start) {
    var e = $('option', this) // get options set of select
    start = parseInt(start);
    if (e.length) {  // if options exist, simply change text
	$.each(e, function (i) {this.text = i + start + (_DEBUG_ ? ' : v.'+String(i+1) : '')});
    } else {
        this.prop('disabled', false);   // if it was early cleared and disabled, append new options
        for(var i= 1; i <= 10; i++) $('<option>').text(i+start-1 + (_DEBUG_ ? ' : v.'+String(i) : '')).attr('value', i).appendTo(this);
    }
}
