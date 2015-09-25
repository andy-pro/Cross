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
        url: "{{=URL('default', 'ajax_getPlintList')}}",
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
