/*** object: Chain, contains chain data, links information ***/
var Chain = {

    clr: ['#fff', '#9ff', '#f9f', '#ff9', '#aaf', '#afa', '#faa', '#bdf', '#fbd', '#dfb', '#fdb'],
    stages: ['cross','vertical','plint','pair'],
    addLink: function(link) {
	link = new Link(link);
	this.chain[link.id] = link;
	link.row.appendTo(this.body);
	this.count++;
    },
    readyLink: function(link) {
	link.run_once = null;
	if (!--Chain.chainlen) run(Chain.hC);
    },
    init: function(url, depth, hS, chain, ext, hC) {
	this.url = url;
	this.depth = depth || 1;
	this.hS	= hS;	// <select> input change handler
	this.hC = hC;   // chain load complete handler
	this.chain = {};
	this.ext = ext;	// extend mode, extra cols: edited, add parallel, color
	this.count = 0;
	this.body = $('#chainbody');
	this.cache = web2spa.load('cross', {unescape:true, clearpath:true}).data;     // use own data cache for ajax request
	this.plints = {};

	this.chainlen = chain ? chain.length : 1;
	if (chain) {
	    var self = this, plints = this.plints;
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
	    this.body.sortable();
	    $('#addLink').click(function() { self.addLink(); });
	} else this.addLink();
    },
    order: function(title, details) {
	var link, row, id, pch=1, self = this, plints = this.plints;
	$.each(this.body.sortable('toArray'), function() {
	    link = self.chain[this.split('-')[1]];  // retrive index from id='chainId-index'
	    //console.log(link);
	    row = link.plint.id;
	    id = link.pair.id;
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
    }
}

/*** Class: Link, response <selector> sequence to element ***/
// constructor, usage: var link = new Link(...);
function Link(link) {
    const _td = '<td>';
    const _tdc = '<td class="chain">';
    const _sel = '<select class="form-control input-sm">';
    link = link || {};
    this.id = Chain.count;
    this.cross = {id:+link.crossId || 0, data: Chain.cache};
    this.vertical = {id:+link.verticalId || 0};
    this.plint = {id:+link.plintId || 0};
    this.pair = {id:+link.pairId || 0};
    this.edited = link.edited;
    this.par = link.par || false;
    this.clr = link.clr || 0;
    this.row = $('<tr id="%s">'.format('chainId-'+this.id));
    this.ajax = {};

    var td, stage, El;

    if (Chain.ext) {
	td = $(_tdc);
	if (link.edited) td.html(L.i_ok);
	this.row.append(td).addClass('chain');
	//.mousedown(function(){$(this).css('cursor','grabbing')}).mouseup(function(){$(this).css('cursor','grab')});
    }

    for(var i = 0; i < Chain.depth; i++) {
	stage = Chain.stages[i];
        td = $(_td);
        this[stage].El = $(_sel)
	    .prop('disabled', true).data({stage:stage, this:this})
	    .on('change', this.selectChange).appendTo(td);    // appendTo(this.li);
        td.appendTo(this.row);
        }

    if (Chain.ext) {
	this.comdata = $(_tdc).appendTo(this.row);
	td = $(_tdc);
	this.pair['parenEl'] = $('<input type="checkbox" title="Add parallel">').prop({disabled:true, checked:this.par}).data({this:this}).on('change', this.parChange).appendTo(td);
	td.appendTo(this.row);

	td = $(_td);
	El = $(_sel).prop('disabled', true).data({this:this}).on('change', this.colorChange).appendTo(td);
	$.each(Chain.clr, function(i) { $('<option>').css('background', this).attr('value', i).appendTo(El); });	// .text(i)
	this.pair['colorEl'] = El;
	td.appendTo(this.row);
	El.val(this.clr);
	El.trigger('change');
    }

    this.row.appendTo(Chain.body);
    this.cross.El.append($('<option>').text(L._NOT_CROSSED_).attr('value', 0));
    this.appendOptions(this.cross);
    this.f_load = setTimeout(function(link) {Chain.readyLink(link);}, 0, this);	// 'loading in progress' flag/timeout handler
    this.setVertical();
}

Link.prototype = {
    selectChange: function(event) {
	var El = $(this),
	    self = El.data('this'),
	    stage = El.data('stage'),
	    f = Chain.hS;
	self[stage].id = +El.val();
	self[stage].si = El[0].selectedIndex;
	if (stage != 'pair') self[stage+'Change']();  // prototype function name, execute crossChange, verticalChange or plintChange
	if (typeof f == 'function') {
	    El = this;
	    function hS() {
		//console.log('onselect occure');
		f.call(El, event);
	    }
	    self.ajax.ready ? hS() : self.ajax.hS = hS;
	}
	return false;
    },
    setVertical: function() {
	if (Chain.depth > 1) {
	    if (this.cross.id) {
		var cache = this.cross.data[this.cross.si-1];    // '-1' because row 0 is 'Not crossed'
		this.cross.title = cache[1];
		this.vertical.data = cache[2];    // shortcut to vertical data of cross from cache
		if (cache[2].length) {
		    this.appendOptions(this.vertical);
		    this.setPlint();
		}
	    }
	}
    },
    setPlint: function() {
	if (Chain.depth > 2) {
	    if (this.vertical.id) {
		//console.log('Link.vertical: ', this.vertical);
		var cache = this.vertical.data[this.vertical.si]; // shortcut to Chain.cache[id].verticals[id]
		this.vertical.title = cache[1];
		var self = this;

		function appendPlint(){ //----------callback function---------------
		    self.plint.data = cache[2]; // shortcut, [url] - content of cache defined by urls, specific of "aLoad"
		    if (cache[2] && cache[2].length) {
			var pair = self.plint.id ? self.pair.id : 1;
			self.appendOptions(self.plint);
			self.plintChange(pair);
		    }
		    if (self.f_load) Chain.readyLink(self);
		    //self.h_onready = null;
		}	//----------end callback function---------------

		if (!cache[2]) {
		    cache[2] = [];
		    cache.ajax = {
			xhr: $.ajax({    /*** Ajax async Load  ***/
			    url: web2spa.get_ajax_url(Chain.url, {args:[this.vertical.id]}),
			    complete: function(jqXHR) {
				if (jqXHR.statusText=='abort') cache[2] = undefined;
				else {
				    cache[2] = jqXHR.statusText=='OK' ? jqXHR.responseJSON.data : [[0, 'Error', 0, '']];
				    for(var id in cache.ajax.targets) run(cache.ajax.targets[id]);	// local callback stack
				    run(cache.ajax.hS);
				    cache.ajax.ready = true;
				    delete cache.ajax.xhr;
				    delete cache.ajax.targets;
				}
			    }
			}),
			targets: {}
		    };
		}
		if (cache.ajax.ready) appendPlint();
		else {
		    cache.ajax.targets[this.id] = appendPlint;
		    clearTimeout(this.f_load);
		    if (this.ajax.xhr) {
			delete this.ajax.targets[this.id];	// reset 'appendPlint' handler for previous ajax request, if exist
			//if ($.isEmptyObject(this.ajax.targets)) this.ajax.xhr.abort();
		    }
		    this.ajax = cache.ajax;
		}
	    }
	}
    },
    crossChange: function() {
	if (Chain.depth > 1) {
	    //----vertical, plint, pair selectors disable---------
	    this.cross.title = '';
	    this.vertical.title = '';
	    this.plint.title = '';
	    this.pair.title = '';
	    this.vertical.El.empty();
	    this.vertical.El.prop('disabled', true);
	    this.vertical.id = 0;
	    this.plintDisable();
	    //--------------------------
	    this.setVertical();
	}
    },
    verticalChange: function() {
	this.plintDisable(); //----- plint, pair selectors disable
	this.setPlint();
    },
    plintChange: function(pair) {
	var plint = this.plint.data[this.plint.si];
	this.plint.title = plint[1];
	if (this.comdata) this.comdata.html('<sup>'+plint[2]+'</sup>'+plint[3]);
	if (Chain.depth > 3) {
	    var El = this.pair.El,
		o = $('option', El), // get options set of select
		start = +plint[2];
	    if (o.length) {  // if options exist, simply change text
		$.each(o, function (i) {this.text = i + start + (_DEBUG_ ? ' : v.'+String(i+1) : '')});
	    } else {
		El.prop('disabled', false);   // if it was early cleared and disabled, append new options
		for(var i= 1; i <= 10; i++) $('<option>').text(i+start-1 + (_DEBUG_ ? ' : v.'+String(i) : '')).attr('value', i).appendTo(El);
	    }
	    if (pair) {
		El.val(pair);
		this.pair.id = pair;
		this.setPairProp(false);
	    }
	}
    },
    plintDisable: function() {  //----- plint, pair selectors disable
	if (Chain.depth > 2) {
	    this.plint.El.empty();
	    this.plint.El.prop('disabled', true);
	    this.plint.id = 0;
	    if (this.comdata) this.comdata.empty();
	    if (Chain.depth > 3) {
		this.pair.El.empty();
		this.pair.El.prop('disabled', true);
		this.setPairProp(true);
		this.pair.id = 0;
	    }
	}
    },
    setPairProp: function(value) {
	if (Chain.ext) {
	    this.pair.parenEl.prop('disabled', value);
	    this.pair.colorEl.prop('disabled', value);
	}
    },
    appendOptions: function(stage) {
	var El = stage.El;
	$.each(stage.data, function() {El.append($('<option>').text(this[1]+(_DEBUG_ ? ' : '+this[0] : '')).attr('value', this[0]));});
	El.prop('disabled', false);
	if (stage.id) El.val(stage.id);
	else { El.prop('selectedIndex', 0); stage.id = +El.val(); }
	stage.si = El[0].selectedIndex;
    },
    parChange: function() {
	var self = $(this).data('this');
	self.par = this.checked;
    },
    colorChange: function() {
	var self = $(this).data('this');
	self.clr = this.selectedIndex;
	var clr = Chain.clr[self.clr];
	$(this.parentElement.parentElement).css('background', clr);
	$(this).css('background', clr);
    }
}
/*** End Class: Link ***/
//===========================================================
