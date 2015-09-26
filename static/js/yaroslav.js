
console.log('test');
test = [];
console.log(test);      // []
console.log(test[0]);   // undefined
test[0]={};
console.log(test);      // [Object{ }]
console.log(test[0]);      // Object{ }
console.log(test[0].items); // undefined
test[0].items=[];
console.log(test[0].items); // []
console.log(test[0]);      // Object{ items=[0] }
console.log(test);      // [Object{ items=[0] }]
delete test[0].items;
console.log(test);      // [Object{ }]
console.log('test');


crosses_loading = false;
loading_callbacks = [];

OnLoadTask = function(url, callback) {
    if (typeof url == "string" || url instanceof String) {
        this.ajax_opt = {
            url: url
        };
    } else {
        this.ajax_opt = url;
    }
    this.callback = callback;
    this.data = undefined;
    this.is_loading = false;
    this.loading_targets = [];

    var self = this;
    this.ajax_opt.success = function(data) {
        self.data = data;
        self.is_loading = false;
        $.each(self.loading_targets, function() {self.callback(data, this)});
    };

    this.apply_to = function(element) {
        if (this.is_loading) {
            this.loading_targets.push(element);
        } else {
            if (typeof this.data == "undefined") {
                this.is_loading = true;
                this.loading_targets.push(element);
                $.ajax(this.ajax_opt);
            } else {
                this.callback(this.data, element);
            }
        }
    };
    this.caller = function() {
        var self = this;
        var lambda = function(element) {
            self.apply_to(element);
        }
        return lambda;
    }
};

getCrossListTask = new OnLoadTask(
    rootpath+'CrossList.json',
    function(data, el) {
        $.each(data.items, function() {el.append(jQuery('<option>').text(this[1]).attr('value', this[0]));});
    }
);

getCrossListYaroslav = getCrossListTask.caller();

function (el) {
    var addoptions = function() { $.each(crosses, function() {el.append(jQuery('<option>').text(this[1]).attr('value', this[0]));}); }
    if (crosses_loading) {
        loading_callbacks.push(addoptions);
    } else {
        if (!crosses.length) {
            crosses_loading = true;
            loading_callbacks.push(addoptions);
            $.ajax({
                    url: rootpath+'CrossList.json',
                    success: function( data ) {
                      crosses=data.items;
                      crosses_loading = false;
                      $.each(loading_callbacks, function() {this()});
                      loading_callbacks = [];
                    }
                  });
        } else addoptions();
    }
}

getPlintList = function (vert_id, callback) {
//jQuery.fn.getPlintList = function (cross_index, vert_index) {
//  vert_id = menuarray[cross_index][2][vert_index][0];
  //var e = this;
  if (!cachearray[vert_id])  { // cache point is empty?
    cachearray[vert_id] = {};
    cachearray[vert_id].state = {is_loading:true, loading_targets:[]};
    jQuery.ajax({
      url: rootpath+"PlintList.json/"+vert_id,
      async: false,
      success: function( data ) {
        cachearray[vert_id].items = data.items;
        callback();
        //e.addoptions(cachearray[vert_id].items);
        //self.is_loading = false;
        //$.each(self.loading_targets, function() {self.callback(data, this)});
      }
    });
  } else {
      //e.addoptions(cachearray[vert_id].items);
      callback();
    }
}

/*** Cross Controller based on the <a> tags ***/
crossCtrl = function() {
    jQuery.ajax({
        url: rootpathajax+"MainArray.json",
        async: false,
        success: function( data ) { mainarray = data.items; } });
    crosshome = $("#crosshome");
    a_attrs = {'data-w2p_target':"crosshome", 'data-w2p_method':"GET", 'data-w2p_disable_with':"default"};
    $.each(mainarray, function(){
        var attrs = {href:rootpath+'cross/'+this[0], text:this[1]};
        $.extend(attrs, a_attrs);
        var head = $('<a>', attrs);//.css('display', 'block');
        var content = [];
        $.each(this[2], function(){
            attrs = {href:rootpath+'vertical/'+this[0], text:this[1]};
            $.extend(attrs, a_attrs);
            content.push($('<a>', attrs));
            content.push(', '); });
        attrs = {href:rootpath+'close/'+this[0]};
        $.extend(attrs, a_attrs);
        crosshome.getPanel(head, content, 'default', true, attrs);
    });
}

jQuery.fn.getPanel = function(head, content, _class="info", _close=true, _attcl={}) {
//default : grey; primary : deep blue; success : green; info : blue; warning : pink; danger : red
//<a href='#' class=><span class="glyphicon glyphicon-remove"></span></a>
    var panel = $('<div>', {class:"panel panel-"+_class}); // addClass
    var hddiv = $('<div>', {class:'panel-heading'}).append(head);
    if (_close) {
        var attcl = {class:"btn btn-xs pull-right btn-"+_class, href:"#"};
        $.extend(attcl, _attcl);
        hddiv.append($('<a>', attcl).append($('<span>', {class:"glyphicon glyphicon-remove"})));
    }
    hddiv.appendTo(panel);
    var body = $('<div>', {class:'panel-body'});
    body.append(content);
    body.appendTo(panel);
    $('<div>', {class:"col-lg-4"}).append(panel).appendTo(this);
}

//=================================================
{{extend 'layout.html'}}

<h2>
{{=T('Sign Up') if request.args(0) == 'register' else T('Log In') if request.args(0) == 'login' else T(request.args(0).replace('_',' ').title())}}
</h2>

<div class="container">
    <div class="row">
        <div id="web2py_user_form" class="col-lg-6">
        {{
        if request.args(0)=='login':
            if not 'register' in auth.settings.actions_disabled:
                form.add_button(T('Sign Up'),URL(args='register', vars={'_next': request.vars._next} if request.vars._next else None),_class='btn btn-default')
            pass
            if not 'request_reset_password' in auth.settings.actions_disabled:
                form.add_button(T('Lost Password'),URL(args='request_reset_password'),_class='btn btn-default')
            pass
        pass
        =form
        }}
        </div>
    </div>
</div>


{{block page_js}}
<script>
    jQuery("#web2py_user_form input:visible:enabled:first").focus();
{{if request.args(0)=='register':}}
    web2py_validate_entropy(jQuery('#auth_user_password'),100);
{{elif request.args(0)=='change_password':}}
    web2py_validate_entropy(jQuery('#no_table_new_password'),100);
{{pass}}
</script>
{{end page_js}}
