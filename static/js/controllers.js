rootpath = '/Cross/default/ajax_get';

jQuery.fn.settofirst = function () {
  jQuery(':nth-child(1)', this).attr('selected', 'selected');
}

jQuery.fn.settovalue = function (value) {
  jQuery('[value='+value+']' , this).attr('selected', 'selected');
}

jQuery.fn.addoptions = function (data, add_none) {
  if (add_none) this.append(jQuery('<option>').text('Not crossed').attr('value', 0));
  if (data.length) {
      var e = this;
      jQuery.each(data, function() {e.append(jQuery('<option>').text(this[1]).attr('value', this[0]));});
      this.prop('disabled', false);
  } else {
      this.prop('disabled', true);
  }
}

function setPlintPair(controls, link, tovalue=false) {
  El = controls.plintEl
  El.addoptions(cachearray[link.verticalId].items);
  if (tovalue) {
    El.settovalue(link.plintId);
  } else {
      El.settofirst()    ;
      link.plintId = El[0].value;
    }
}

function getPlintList(vert_id, callback) {
  if (!cachearray[vert_id]) {
    cachearray[vert_id] = {};
    cachearray[vert_id].targets = [];
    jQuery.ajax({
      url: rootpath+"PlintList.json/"+vert_id,
      //async: false,
      success: function( data ) {
        cachearray[vert_id].items = data.items;
        $.each(cachearray[vert_id].targets, function() {this()});
        delete cachearray[vert_id].targets;
    } });
  }
  if (cachearray[vert_id].items) callback();
    else cachearray[vert_id].targets.push(callback);
};

stages = ['cross','vertical','plint','pair'];
crosses = [];

chaintable = $("#chaintable");
chaindata = JSON.parse($("input[name='chaindata']").val());
//console.log(chaindata);
chaincontrols = [];

drawSelectors = function(tr, controls, index) {
    $.each(stages, function() {
        var td = $('<td>');
        var sel = $('<select>', {class:"form-control",
                                 "data-link":index,
                                 //"data-type":this,
                                 "size":"20",
                                 onchange:this+"Change(this)"
                                 }).appendTo(td);
        td.appendTo(tr);
        controls[this+'El'] = sel;
    });}


drawLink = function(index, link) {     // link is some {"crossId": 2, "plintId": 558, "pairId": 1, "verticalId": 39}
    var controls = {};
    var tr = $('<tr>');
    drawSelectors(tr, controls, index);
    var crs = controls.crossEl;  // cross selector
    var vls = controls.verticalEl;  // vertical selector
    var pls = controls.plintEl;  // plint selector
    var prs = controls.pairEl;  // pair selector
    crs.addoptions(mainarray, true);
    crs.settovalue(link.crossId);

    var crsi = crs[0].selectedIndex;     // cross selector index
    //console.log(crsi)
    //var vlsi = 0;    // vertical selector index
    if (crsi > 0) {
        crsi -= 1
        vls.addoptions(mainarray[crsi][2]);
        vls.settovalue(link.verticalId);
        //vlsi = vls[0].selectedIndex;
        //console.log(vls)
        //console.log(vlsi)
        //var cb = setPlintPair(pls, prs, link);
        //getPlintList(link.verticalId, setPlintPair, index, pls);
        var cb = function(){setPlintPair(controls, link, true)};
        getPlintList(link.verticalId, cb);
        //pls.getPlintList(crsi, vlsi);
        //pls.settovalue(link.plintId);
    }
    else {
            crs.settofirst();
            vls.prop('disabled', true);
            pls.prop('disabled', true);
            prs.prop('disabled', true);
        }


    chaincontrols.push(controls);
    tr.appendTo(chaintable);
}

$.each(chaindata, function(index, link){
    drawLink(index, link);
})

verticalDisable = function(index) {
    var vls = chaincontrols[index].verticalEl;
    vls.empty();
    vls.prop('disabled', true);
    plintDisable(index);
}

plintDisable = function(index) {
    var pls = chaincontrols[index].plintEl;
    pls.empty();
    pls.prop('disabled', true);
    var prs = chaincontrols[index].pairEl;
    prs.empty();
    prs.prop('disabled', true);
}

addLink = function () {
    var index = chaindata.length;
    var link = {};
    var controls = {};
    var tr = $('<tr>');
    drawSelectors(tr, controls, index);
    $.each(stages, function() { link[this+'Id'] = 0; });
    controls.crossEl.addoptions(mainarray, true);
    chaindata.push(link);
    chaincontrols.push(controls);
    tr.appendTo(chaintable);
    verticalDisable(index);
}

crossChange = function(El) {
    var index = El.attributes['data-link'].value;
    var link = chaindata[index];
    verticalDisable(index);
    link.crossId = El.value;
    var crsi = El.selectedIndex;
    if (crsi > 0) {
        crsi -= 1;
        var controls = chaincontrols[index];
        var vls = controls.verticalEl;
        vls.addoptions(mainarray[crsi][2]);
        vls.settofirst();
        link.verticalId = vls[0].value;
        var cb = function(){setPlintPair(controls, link)};
        getPlintList(link.verticalId, cb);
    }
}

verticalChange = function(El) {
    var index = El.attributes['data-link'].value;
    var link = chaindata[index];
    plintDisable(index);
    link.verticalId = El.value;
    var controls = chaincontrols[index];
    var cb = function(){setPlintPair(controls, link)};
    getPlintList(link.verticalId, cb);
}

plintChange = function(El) {
    var index = El.attributes['data-link'].value;
    var link = chaindata[index];
    link.plintId = El.value;
    console.log(link.plintId);
    var controls = chaincontrols[index];
    //var cb = function(){setPlintPair(controls, link)};
    //getPlintList(link.verticalId, cb);
}

var crossApp = angular.module('crossApp', [],
  function ($interpolateProvider){ $interpolateProvider.startSymbol('{?'); $interpolateProvider.endSymbol('?}'); }
  );


crossApp.controller('ChainCtrl', function($scope, $http) {
    //$scope.crosses = [ {id: '1', title: 'Chicago'}, {id: '2', title: 'New York'}, {id: '3', title: 'Washington'}, ];

    $scope.qwe2 = [[101,'a'],[202,'b'],[303,'c'],[404,'d'],[369,'e']];
    $scope.qwe3 = [{name: 'one', age: 30 },{ name: 'two', age: 27 },{ name: 'three', age: 50 }];
    $scope.qwe = ['a','b','c','d','e'];
    $scope.begin = 0;
    //$scope.qwe = [1,2,3,4];
    $scope.selectedItem = 2;
    $scope.crosschangecount = 0;
    $scope.vertichangecount = 0;

    //$http.get(rootpath+'CrossList.json').success(function(data) { $scope.crosses=data.items; });
    $scope.crosses = [];
    $scope.verticals = [];
    $scope.plints = [];
    $scope.pairs = [ [], [[1,0],[2,1],[3,2],[4,3],[5,4],[6,5],[7,6],[8,7],[9,8],[10,9]],
                         [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10]] ];

    //var defaultlink = {crossId:0, verticalId:0, plintId:0, pairId:0, start:2};
    //$scope.chain = [defaultlink];
    $scope.chain = [];
    $scope.addLink = function() {
        $scope.chain.push({crossPos:"0", verticalPos:"0", plintPos:"0", pairPos:"0", start:"0", crossId:0, verticalId:0, plintId:0, pairId:0});
      };
    $scope.addLink();

    $scope.crosschange = function(i, link) {

        $scope.crosschangecount += 1;

        L = $scope.chain[link];
        var Id = $scope.crosses[i][0];  // i = crossPos, index of selected OPTION in SELECT
        L.crossId = Id;    // Id is id of record in DB (primary key)
        if (Id > 0) {
            if (!$scope.verticals[Id]) {
                $http.get(rootpath+'VerticalList.json/'+Id).success(function(data) {
                    $scope.verticals[Id]=data.items;
                    setverticaltop(Id, link);  // wait, while ajax request is success
                });
              } else {
                        setverticaltop(Id, link);  // immediatelly
                     }
          } else { L.verticalId = 0;
                   L.plintId = 0;
                   L.pairId = 0; }
      };

    function setverticaltop(Id, link) {
        var st = 0;
        if ($scope.verticals[Id].length) {
            st = $scope.verticals[Id][0][0];
            $scope.verticalchange(0, link);
            } else { L.plintId = 0;
                     L.pairId = 0; }
        L.verticalId = st;
        L.verticalPos = "0";
      }

    $scope.verticalchange = function(i, link) {

        $scope.vertichangecount += 1;

        L = $scope.chain[link];
        var ci = L.crossId;  // cross id in DB (primary key)
        if ($scope.verticals[ci]) {
            var Id = $scope.verticals[ci][i][0];  // i = verticalPos, index of selected OPTION in SELECT
            L.verticalId = Id;    // id of record in DB (primary key)
            if (Id > 0) {
                if (!$scope.plints[Id]) {
                    $http.get(rootpath+'PlintList.json/'+Id).success(function(data) {
                        $scope.plints[Id]=data.items;
                        setplinttop(Id, link);
                    });
                } else setplinttop(Id, link);
            }
        }
    };

    function setplinttop(Id, link) {
        var st = 0;
        if ($scope.plints[Id].length) {
            st = $scope.plints[Id][0][0];
            $scope.plintchange(0, link);
            } else L.pairId = 0;
          L.plintId = st;
          L.plintPos = "0";
    };

    $scope.plintchange = function(i, link) {
        L = $scope.chain[link];
        var vi = L.verticalId;
        if ($scope.plints[vi]) {
            var Id = $scope.plints[vi][i][0];
            L.plintId = Id;
            var st = (Id > 0) ? $scope.plints[vi][i][2] + 1 : 0; // 0 or 1
            $scope.chain[link].pairId = st;


        }
    };

});

