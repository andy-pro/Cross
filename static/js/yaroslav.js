
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