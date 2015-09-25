var h1 = jQuery('#{{=selfields[0][0]}}');
var h2 = jQuery('#{{=selfields[1][0]}}');
var h3 = jQuery('#{{=selfields[2][0]}}');
// jQuery function, convert table record id to array index
var self_cross_index = getCrossIndex(menuarray, {{=response.plintcrossindex}});
h1.addoptions(menuarray[self_cross_index][2], true);
h1.settovalue({{=response.crossed_info[1]}}); // vertical id
var j1 = h1[0].selectedIndex;
var j2 = 0;
if (j1 > 0) {
    j1 -= 1
    h2.getPlintList(self_cross_index, j1);
    h2.settovalue({{=response.crossed_info[2]}}); // plint id
    j2 = h2[0].selectedIndex;
    h3.enumoptions(self_cross_index, j1, j2);
    h3.settovalue({{=response.crossed_info[3]}}); // pair number
}
  else {
    h2.prop('disabled', true);
    h3.prop('disabled', true);
}

h1.change(function(){ // cross to new vertical
  h2.empty();
  h2.prop('disabled', true);
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
