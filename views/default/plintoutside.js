var w1 = jQuery('#{{=selfields[3][0]}}');
var w2 = jQuery('#{{=selfields[4][0]}}');
var w3 = jQuery('#{{=selfields[5][0]}}');
w1.addoptions(menuarray, true);
w1.settovalue({{=response.outside_info[1]}}); // cross id
var k1 = w1[0].selectedIndex;
var k2 = 0;
if (k1 > 0) {
    k1 -= 1
    w2.addoptions(menuarray[k1][2]);
    w2.settovalue({{=response.outside_info[2]}}); // vertical id
    k2 = w2[0].selectedIndex; // vertical index
    w3.getPlintList(k1, k2);
    w3.settovalue({{=response.outside_info[3]}}); // plint id
}
else {
        w1.settofirst();
        w2.prop('disabled', true);
        w3.prop('disabled', true);
    }

w1.change(function(){ // from new cross
    w2.empty();
    w2.prop('disabled', true);
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
