var w1 = jQuery('#fromcrosssel');
var w2 = jQuery('#fromvertsel');
var w3 = jQuery('#fromplintsel');
w1.addoptions(menuarray, true);
w1.settovalue({{=plint.outside_info['cross']}}); // cross id
var k1 = w1[0].selectedIndex;
var k2 = 0;
if (k1 > 0) {
    k1 -= 1
    w2.addoptions(menuarray[k1][2]);
    w2.settovalue({{=plint.outside_info['vertical']}}); // vertical id
    k2 = w2[0].selectedIndex; // vertical index
    w3.getPlintList(k1, k2);
    w3.settovalue({{=plint.outside_info['plint']}}); // plint id
}
w1.change(function(){ // from new cross
    w2.empty();
    w2.prop("disabled", true);
    w3.empty();
    w3.prop('disabled', true);
    k1 = w1[0].selectedIndex;
    if (k1 > 0) {
        k1 -= 1
        w2.addoptions(menuarray[k1][2]);
        w2.settofirst();
        w3.getPlintList(k1, 0);
        w3.settofirst();
  }
});
w2.change(function(){
  w3.empty();
  w3.prop('disabled', true);
  w3.getPlintList(k1, w2[0].selectedIndex);
  w3.settofirst();
});
