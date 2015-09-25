var cachearray = [];

PlintCrossToggle = function(cb) {
  var e = jQuery('#sel_cross_to');
  (cb.checked) ? e.slideDown('slow') : e.slideUp('fast');
}

jQuery.fn.settofirst = function () {
  jQuery(':nth-child(1)', this).attr('selected', 'selected');
}

jQuery.fn.settovalue = function (value) {
  jQuery('[value='+value+']' , this).attr('selected', 'selected');
}

jQuery.fn.addoptions = function (data, add_none) {
  if (add_none) this.append(jQuery('<option>').text('{{=_NOT_CROSSED_}}').attr('value', 0));
  if (data.length) {
      var e = this;
      jQuery.each(data, function() {e.append(jQuery('<option>').text(this[1]).attr('value', this[0]));});
      this.prop('disabled', false);
  } else {
      this.prop('disabled', true);
  }
}

jQuery.fn.getPlintList = function (cross_index, vert_index) {
  vert_id = menuarray[cross_index][2][vert_index][0];
  var e = this;
  if (!cachearray[vert_id])  { // cache point is empty?
      jQuery.ajax({
        url: '{{=URL('getPlintList')}}',
        data: {'id': vert_id}, // vertical table id
        dataType: "json",
        type: "POST",
        async: false,
        success: function( serverdata ) {
          cachearray[vert_id] = serverdata.plints;
          e.addoptions(cachearray[vert_id]);
        }
      });
  } else {
      e.addoptions(cachearray[vert_id]);
    }
}

jQuery(document).ajaxStart(function() { jQuery("body").addClass("loading"); });
jQuery(document).ajaxStop(function() { jQuery("body").removeClass("loading"); });

jQuery.fn.enumoptions = function (cj, vj, pj) {
    vert_id = menuarray[cj][2][vj][0];
    start = +cachearray[vert_id][pj][2]; // convert Boolean to int
    var e = jQuery('option', this) // get options set of select
    if (e.length) {  // check options count
        jQuery.each(e, function (i) {this.text = i + start});
    } else {
        this.prop('disabled', false);
        for (i= 1; i <= 10; i++) {
            this.append(jQuery('<option>').text(i+start-1).attr('value', i));
        }
     }
}

var h1 = jQuery('#vertsel');
var h2 = jQuery('#plintsel');
var h3 = jQuery('#pairsel');
var self_cross_index = getCrossIndex(menuarray, {{=plintcrossindex}}); // jQuery, convert table record id to array index
h1.addoptions(menuarray[self_cross_index][2], true);
h1.settovalue({{=crossed_info[1]}}); // vertical id
var j1 = h1[0].selectedIndex;
var j2 = 0;
if (j1 > 0) {
    j1 -= 1
    h2.getPlintList(self_cross_index, j1);
    h2.settovalue({{=crossed_info[2]}}); // plint id
    j2 = h2[0].selectedIndex;
    h3.enumoptions(self_cross_index, j1, j2);
    h3.settovalue({{=crossed_info[3]}}); // pair number
}
  else {
    h2.prop('disabled', true);
    h3.prop('disabled', true);
}

h1.change(function(){ // cross to new vertical
  h2.empty();
  h2.prop("disabled", true);
  if (h3[0]) {
      h3.empty();
      h3.prop('disabled', true);
  }
  j1 = h1[0].selectedIndex;    // select by index of selection
  if (j1 > 0) {
      j1 -= 1
      h2.getPlintList(self_cross_index, j1)
      h2.settofirst();
      if (h3[0]) {
          h3.enumoptions(self_cross_index, j1, 0);
          h3.settofirst();
      }
  }
});

h2.change(function(){
  if (h3[0]) h3.enumoptions(self_cross_index, j1, h2[0].selectedIndex);
});
