/*** Model: Chain, contains chain data, links information ***/
function Chain(depth, ext) { // constructor
    this.on = function(_e, _h) {
	switch(_e) {
	    case 'change': this.hS = _h; break;	// <select> input change handler
	    case 'load': $.when.apply($, this.promises).always(function() { run(_h); }); // chain load complete handler
	}
	return this;
    },
    this.addLink = function(link) {
	link = new Link(this, link);
	this.chain[link.id] = link;
	link.row.appendTo(this.body);
	this.count++;
    }
    this.order = function(title, details) {
	var link, row, id, pch=1, self = this, plints = this.plints;
	$.each(this.body.sortable('toArray'), function() {
	    link = self.chain[this.split('-')[1]];  // retrive index from id='chainId-index'
	    row = link.plint.id;
	    id = link.pair.id;
	    //console.log('link:', link, 'row:', row);
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
    this.stages = ['cross','vertical','plint','pair'];
    //this.cache = web2spa.load('cross', {unescape:true, clearpath:true}).data;
    this.cache = $scope.crosses;
    this.body = $('#chainbody');
    this.plints = {};
    this.chain = {};
    this.promises = [];
    this.depth = depth || 1;
    this.ext = ext;	// extend mode, extra cols: edited, add parallel, color
    this.count = 0;
    if ($scope.chain) {
	var self = this, plints = this.plints;
	$.each($scope.chain, function() {
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
}
/*** end model: Chain ***/
//===========================================================

/*** Model: Link, response <selector> sequence to row ***/
function Link(Chain, link) { // constructor
    link || (link = {});
    this.Chain = Chain;
    this.depth = Chain.depth;
    this.id = Chain.count;
    this.cross = {id:+link.crossId || 0, data: Chain.cache};
    this.vertical = {id:+link.verticalId || 0};
    this.plint = {id:+link.plintId || 0};
    this.pair = {id:+link.pairId || 0};
    this.edited = link.edited;
    this.par = link.par || false;
    this.clr = link.clr || 0;
    this.row = $('<tr id="%s">'.format('chainId-'+this.id));
    this.cache = [];
    var td, stage, El;
    if (Chain.ext) { this.row.addClass('move').append(this.add_td(true).html(link.edited?L.i_ok:'')); }
    for(var i = 0; i < this.depth; i++) {
	stage = Chain.stages[i];
	this[stage].El = this.add_sel().data({stage:stage}).on('change', this.selectChange);
    }
    if (Chain.ext) {
	this.comdata = this.add_td(true);
	this.pair['parenEl'] = $('<input type="checkbox" title="Add parallel">').prop({disabled:true, checked:this.par}).data({this:this}).on('change', this.parChange).appendTo(this.add_td(true));
	this.pair['colorEl'] = this.add_sel().on('change', colorChange).colouring(this.clrs).val(this.clr).trigger('change');
    }
    this.cross.El.append($('<option>').text(L._NOT_CROSSED_).attr('value', 0));
    this.appendOptions(this.cross);
    this.setVertical();
}

Link.prototype = {
    clrs: app.LINK_CLRS,
    add_td: function(_c) { return $(_c?'<td class="padd9">':'<td>').appendTo(this.row); },
    add_sel: function () { return $('<select class="form-control input-sm">').prop('disabled', true).data({this:this}).appendTo(this.add_td());},
    selectChange: function(event) {
	var El = $(this),
	    self = El.data('this'),
	    stage = El.data('stage');
	self[stage].id = +El.val();
	self[stage].si = El[0].selectedIndex;
	if (stage !== 'pair') self[stage+'Change']();  // execute crossChange(), verticalChange() or plintChange()
	if (typeof self.Chain.hS === 'function') {
	    El = this;
	    self.cache.xhr.always(function() {
		//console.log(status, 'onselect occure:', stage, self[stage]);
		self.Chain.hS.call(El, event);
	    });
	}
	return false;
    },
    setVertical: function() {
	if (this.cross.id) {
	    var cache = this.cross.data[this.cross.si-1];    // '-1' because row 0 is 'Not crossed'
	    this.cross.title = cache[1];
	    this.vertical.data = cache[2];    // shortcut to vertical data of cross from cache
	    if (cache[2].length) {
		this.appendOptions(this.vertical);
		this.setPlint();
	    }
	} else this.cross.title = '';
    },
    setPlint: function() {
	if (this.depth > 2) {
	    if (this.vertical.id) {
		var self = this,
		    cache = this.vertical.data[this.vertical.si]; // shortcut to cross[id].vertical[id]
		this.vertical.title = cache[1];
		if (!cache.xhr) {
		    cache.xhr = $.get(web2spa.get_ajax_url('plintscd', {args:[this.vertical.id]})).always(function(data, status) {
			cache[2] = status=='success' ? data.data : [[0,status,0,'']];	// data is jqXHR if error
		    });
		}
		this.cache = cache;
		this.Chain.promises.push(cache.xhr);
		cache.xhr.always(function() { // add function to inner array of promise object
		    if (self.cache.xhr == cache.xhr && !self.plint.data) {
			self.plint.data = cache[2];
			if (cache[2].length) {	// append plints & pairs <options>
			    self.appendOptions(self.plint);
			    self.plintChange(self.pair.id || 1);
			}
		    }
		});
	    }
	}
    },
    crossChange: function() {
	this.stageDisable(this.vertical);
	this.plintDisable();
	this.setVertical();
    },
    verticalChange: function() {
	this.plintDisable(); //----- plint, pair selectors disable
	this.setPlint();
    },
    plintChange: function(pair) {
	var plint = this.plint.data[this.plint.si];
	this.plint.title = plint[1];
	if (this.comdata) this.comdata.html('<sup>'+plint[2]+'</sup>'+plint[3]);
	if (this.depth > 3) {
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
    stageDisable: function(stage) {
	stage.El.empty();
	stage.El.prop('disabled', true);
	stage.id = 0;
	stage.title = '';
	stage.data = null;
    },
    plintDisable: function() {  //----- plint, pair selectors disable
	if (this.depth > 2) {
	    this.stageDisable(this.plint);
	    if (this.comdata) this.comdata.empty();
	    if (this.depth > 3) {
		this.stageDisable(this.pair);
		this.setPairProp(true);
	    }
	}
    },
    setPairProp: function(value) {
	if (this.Chain.ext) {
	    this.pair.parenEl.prop('disabled', value);
	    this.pair.colorEl.prop('disabled', value);
	}
    },
    appendOptions: function(stage) {
	var El = stage.El;
	$.each(stage.data, function() { El.append($('<option>').text(this[1]+(_DEBUG_ ? ' : '+this[0] : '')).attr('value', this[0])); });
	El.prop('disabled', false);
	if (stage.id) El.val(stage.id);
	else { El.prop('selectedIndex', 0); stage.id = +El.val(); }
	stage.si = El[0].selectedIndex;
    },
    parChange: function() {
	var self = $(this).data('this');
	self.par = this.checked;
    }
}
/*** end model: Link ***/
//===========================================================

/*** Model: Cable ***/
function Cable(cable) { // constructor
    this.row = $('<tr>');
    this.title = this.addCell(this._inp).val(cable[0]);
    this.details = this.addCell(this._inp).val(cable[1]);
    this.clr = cable[2];
    this.addCell('<select>').on('change', colorChange).colouring(this.clrs).val(this.clr).trigger('change');
    if (cable.id) {
	this.id = cable.id;
	this.delete = $('<input type="checkbox">');
    }
    $('<td class="padd9">').append(this.delete).appendTo(this.row);
}

Cable.prototype = {
    clrs: app.CABLE_CLRS,
    _inp: '<input type="text">',
    addCell: function (El) {
	El = $(El).attr('class', 'form-control input-sm').data({this:this});
	$('<td>').append(El).appendTo(this.row);
	return El;
    }
}
/*** end model: Cable ***/
//===========================================================

/*** Model's event handlers ***/
function colorChange() {
    var self = $(this).data('this');	// get model
    self.clr = this.selectedIndex;  // get current <option>
    var _c = self.clrs[self.clr];
    $(this.parentElement.parentElement).css('background', _c);
    $(this).css('background', _c);
}
/*** end model's event handlers ***/

/*** jQuery extensions ***/
$.fn.colouring = function(_c) {
    var El = this;
    $.each(_c, function(i) { $('<option>').css('background', this).attr('value', i).appendTo(El); });
    return this;
}
