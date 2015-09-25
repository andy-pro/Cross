function hideAjaxResults(){ jQuery("#ajaxpairresults").hide(); }

getPairTitles = function(value){
  searchvalue = value;
  if(value.length > 2){
  if(value != oldvalue) {
    jQuery.post("/Cross/default/ajax_getPairData", {likestr: value}, function(result){ jQuery("#ajaxpairresults").html(result); });
    oldvalue = value; }
  } else { hideAjaxResults(); oldvalue = value; }
}

jQuery( document ).ajaxSend(function( event, jqxhr, settings ) {
      f = settings.url.split('/').pop();
      if (f === "ajax_getPlintList") { jQuery("body").addClass("loading"); } });

jQuery(document).ajaxComplete(function( event, xhr, settings ) {
  f = settings.url.split('/').pop();
  //console.log(f);
  if (f === "ajax_getPairData") {
    if(jQuery("a.ajaxresult").length > 0){
      jQuery("a.ajaxresult").hover(
        function() { searchvalue = this.text; },
        function() { searchvalue = jQuery("#searchinput").val(); }
       );
      jQuery("#ajaxpairresults").show();
    } else { hideAjaxResults(); }
  } else if (f === "ajax_getPlintList") { jQuery("body").removeClass("loading"); }
});

function getCrossIndex(data, id){
  var i = 0;
  while (data[i][0] != id) i += 1;
  return i;
}

function buildMainMenu(li, data, href){
  var ul = jQuery('<ul/>', {class:'dropdown-menu'});
  li.addClass('dropdown').append(ul);
  jQuery.each(data, function() {
      var li = jQuery('<li/>');
      li.wrapInner(
          jQuery('<a/>', {
              "href": '/Cross/default/' + href + '/' + this[0],
              text: this[1]
          })).appendTo(ul);
      if (this[2]) {
      buildMainMenu(li, this[2], 'vertical');}
  });
};
