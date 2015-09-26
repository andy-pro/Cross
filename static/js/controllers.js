rootpath = '/Cross/default/ajax_get';
stages = [['crossId','crossEl'],
          ['verticalId','verticalEl'],
          ['plintId','plintEl'],
          ['pairId','pairEl']];
chain = [];
crosses = [];
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
//function (el) {
    //var addoptions = function() { $.each(crosses, function() {el.append(jQuery('<option>').text(this[1]).attr('value', this[0]));}); }
    //if (crosses_loading) {
        //loading_callbacks.push(addoptions);
    //} else {
        //if (!crosses.length) {
            //crosses_loading = true;
            //loading_callbacks.push(addoptions);
            //$.ajax({
                    //url: rootpath+'CrossList.json',
                    //success: function( data ) {
                      //crosses=data.items;
                      //crosses_loading = false;
                      //$.each(loading_callbacks, function() {this()});
                      //loading_callbacks = [];
                    //}
                  //});
        //} else addoptions();
    //}
//}

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

chaintable = $("#chaintable");

addLink = function () {
    var index = chain.length;
    var link = {};
    //console.log(crosses);
    //console.log(index);
    var tr = $('<tr>');

    $.each(stages, function() {
        var td = $('<td>');
        var sel = $('<select>', {class:"form-control", "x-link":index, "x-type":this[0], onchange:"changeSelect(this)"}).appendTo(td);
        td.appendTo(tr);
        link[this[0]] = 0;
        link[this[1]] = sel;
    });

    //getCrossList(link.crossEl);
    link.crossEl.addoptions(menuarray, true);
    //$.each(crosses, function() {e.append(jQuery('<option>').text(this[1]).attr('value', this[0]));});

    chain.push(link);
    //console.log(chain);
    tr.appendTo(chaintable);
}

changeSelect = function(el) {
    //console.log(el[0].selectedItem);
    console.log(el);
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

