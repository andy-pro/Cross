//================================================
/*** ========== Router ========== ***/
var Router = {
    routes: {},
    root: startpath.clearSlashes(),
    currentURL: '',

    add: function(args) {
	var title = args[1], opts = args[2] || {};
	var lowtitle = title.toLowerCase();
	var ctrl = opts.index ? '' : lowtitle;
	var path = args[0].clearSlashes();
	var route = path+':'+ctrl;
	this.routes[route] = {
	    ajaxurl: lowtitle,
	    templateId: title+'Tmpl',
	    controller: window[title+'Ctrl'],
	    login_req: opts.login_req
	}
	if (opts.login_path) this.login_path = path+'/'+ctrl;
	if (opts.shortcuts) {
	    path = path.split('/');
	    title = '';
	    for(var i=0; i<path.length-1; i++) {
		title += path[i] + '/';
		this.routes[title.clearSlashes()+':'+ctrl] = this.routes[route];
	    }
	}
    },

    navigate: function(url, addEntry) {
	//console.info(url)
	this.currentURL = get_url(); // this is allow return to current page after login
	var params = {vars: {}, args: url.split('?')}, rt;
	if (params.args.length > 1) { $.each(params.args[1].split('&'), function() { rt=this.split('='); params.vars[rt[0]]=rt[1]}); } // variables exist
	rt = params.args[0].clearSlashes();
	//console.info(rt);
	//$.each(this.routes, function() {
	    ////
	    //log(this);

	//});

	for(var i in this.routes) {
	    var route = i.split(':');
	    //var re = rt.exec(new RegExp("^"+route[0]));
	    //var re = new RegExp("^"+route[0]+"(\.+)").exec(rt);
	    //log(route[0]);
	    var re = rt.match("^"+route[0]+"(\.*)");
	    if (re) {
		params.args = re[1].clearSlashes().split('/');
		var ctrl = params.args.shift();
		if (ctrl == route[1]) {
		    //log(re); log('ctrl = '+ctrl); log('args = '+params.args); log(this.routes[i].templateId);
		    if (addEntry) { history.pushState(null, null, url); }
		    route = this.routes[i];
		    route.controller(params, route);
		}
	    }
	}

	//var pos = 0;
	//for(var i=0; i<4; i++) {
	    //pos = rt.indexOf('/', pos+1);
	    //if (pos<0) { pos=rt.length; break; }
	//}
	//var route = this.routes[rt.substring(0, pos)];
	//log(rt.substring(0, pos));
	//console.info(route);
	//if (route) {
	    //params.args = rt.substr(pos+1).split('/');
	    //if (route.login_req && !userId) location.href = login_request(this.currentURL);    // for this router calling currentURL is a previous URL
	    //else {
		//if (addEntry) { history.pushState(null, null, url); }
		//route.controller(params, route);
	    //}
	//} //else location.href = url;
    }
}
//==========================================================
/*** Class: Form, performs form setup actions ***/
    /* constructor, usage: var form = new Form(...);
    event_handler - callback will be performed, when any input changing occured */
function Form(event_handler) {

    this.panel = $('div.panel').filter(':first');
    this.form = this.panel.find('form');
    this.chaintable = $("#chaintable");
    this.cache = {};     // use own data cache for ajax request
    this.inputfirst = this.form.find("input:text:visible:first");
    this.inputfirst.focus();
    this.event_handler = event_handler || undefined;
    this.inputs = {};
    this.inputstext = this.form.find('input[type!=checkbox][name]').on('input', {form:this}, $inputChange);
    this.inputscheckbox = this.form.find('input:checkbox[name]').on('change', {form:this}, $inputChange);
}

Form.prototype.init = function() {  // emulate run event_handler, fill all inputs fields
     this.inputfirst.trigger('input');
}

var $inputChange = function(event) {
    var El = $(this);
    var form = event.data.form;    // retrieve object 'this'
    form.inputstext.each(function() { form.inputs[this.name] = this.value; });
    form.inputscheckbox.each(function() { form.inputs[this.name] = Number(this.checked); });
    //console.log(form.inputs);
    if (El.hasClass('delete')) {
	//console.log('del click');
	var del = form.inputs.delete;
	form.panel.removeClass(del ? $clrp : $clrd);
	form.panel.addClass(del ? $clrd : $clrp);
    }
    var f = form.event_handler;
    if (typeof f == 'function') f(event, El);
    return false;
}

//==========================================================
/*** Class: Link, responce <selector> sequence to table ***/
// constructor, usage: var link = new Link(...);
function Link(form, url, link) {

    if (typeof link === 'undefined') { link = {}; $.each(stages, function() { link[this+'Id'] = 0; }); }
    this.index = form.chaindata.length;
    this.link = link;
    //this.depth = form.chaindepth ? form.chaindepth : 1;
    this.depth = form.chaindepth || 1;
    this.cache = form.cache;
    this.url = url;
    this.controls = {};
    this.titles = {};
    var tr = $('<tr>');
    for(var i = 0; i < this.depth; i++) {
        var td = $('<td>');
        var sel = $('<select>', {class:"form-control", name:stages[i]+"_"+this.index}).prop('disabled', true).data('stage', stages[i]).appendTo(td);
        sel.on('change', {this:this, form:form}, $selectChange);
        td.appendTo(tr);
        this.controls[stages[i]+'El'] = sel;
        }
    tr.appendTo(form.chaintable);
    form.chaintable.css({color:'inherit'});   // make table visible
    this.stage = stages[0];
    if (!this.cache.crosses) this.cache.crosses = sLoad('index', {unescape:true}).crosses;
    this.controls.crossEl.append($('<option>').text(L._NOT_CROSSED_).attr('value', 0));
    this.addOptFromObj(this.cache.crosses);
    this.setVertical();
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

            var self = this;    // spike, pointer to object for ajax callback
            //----------callback function---------------
                var callback = function(){
                    self.plints = self.vertical[self.url].data; // shortcut, [url] - content of cache defined by urls, specific of "aLoad"
                    //console.log(plints)
                    if (self.plints.length) {
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
            aLoad(this.vertical, callback, this.url, [this.link.verticalId]);
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
//======================================

var $selectChange = function(event) {
    var obj = event.data.this;    // retrieve object 'this'
    //console.log(event)
    var El = $(this);
    var stage = El.data('stage');
    obj.link[stage+'Id'] = El.val();        // !!! write select option to Link here !!!
    //obj.names[stage] = El.children(':selected').text();
    if (stage != 'pair') obj[stage+'Change']();  // prototype function name, execute crossChange, verticalChange or plintChange
    var f = event.data.form.onLinkChange;
    if (typeof f == 'function') {
        if (ajaxstate.during) ajaxstate.callback.push(function() {f(event, El)});
        else f(event, El);
    }
    return false;
}
