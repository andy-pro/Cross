var crossApp = angular.module('crossApp', [],
  function ($interpolateProvider){ $interpolateProvider.startSymbol('{?'); $interpolateProvider.endSymbol('?}'); }
  );

rootpath = '/Cross/default/ajax_get';

crossApp.controller('ChainCtrl', function($scope, $http) {
    //$scope.crosses = [ {id: '1', title: 'Chicago'}, {id: '2', title: 'New York'}, {id: '3', title: 'Washington'}, ];

    $scope.qwe2 = [[101,'a'],[202,'b'],[303,'c'],[404,'d'],[369,'e']];
    $scope.qwe3 = [{name: 'one', age: 30 },{ name: 'two', age: 27 },{ name: 'three', age: 50 }];
    $scope.qwe = ['a','b','c','d','e'];
    $scope.begin = 0;
    //$scope.qwe = [1,2,3,4];
    $scope.crosschangecount = 0;
    $scope.vertichangecount = 0;

    $http.get(rootpath+'CrossList.json').success(function(data) { $scope.crosses=data.items; });
    $scope.verticals = [];
    $scope.plints = [];
    $scope.pairs = [];

    pairseq = [[[1,0],[2,1],[3,2],[4,3],[5,4],[6,5],[7,6],[8,7],[9,8],[10,9]],
                    [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10]],[]];

    //var defaultlink = {crossId:0, verticalId:0, plintId:0, pairId:0, start:2};
    //$scope.chain = [defaultlink];
    $scope.chain = [];
    $scope.addLink = function() {
        $scope.chain.push({crossId:0, verticalId:0, plintId:0, pairId:0, start:2, crossPos:0, verticalPos:0, plintPos:0});
      };
    $scope.addLink();

    $scope.crosschange1 = function(Id, link, e) {
    $scope.crosschangecount += 1;
        //console.log('crossId is '+Id+' '+link);
        console.log(e);
        if (Id > 0) {
            //jQuery("#vert1").settofirst();
            if (!$scope.verticals[Id]) {
                $http.get(rootpath+'VerticalList.json/'+Id).success(function(data) {
                    $scope.verticals[Id]=data.items;
                    setvertical(Id, link);  // wait, while ajax request is success
                });
              } else {
                        setvertical(Id, link);  // immediatelly
                     }
          }
      };

      function setvertical(Id, link) {
          if ($scope.verticals[Id].length) {
            var n = $scope.verticals[Id][0][0];
            $scope.verticalchange(n, link);
            $scope.chain[link].verticalId = n;
            } else $scope.chain[link].verticalId = 0;
      }

    $scope.verticalchange1 = function(Id, link, e) {
    $scope.vertichangecount += 1;
        if (Id > 0) {
            if (!$scope.plints[Id]) {
                $http.get(rootpath+'PlintList.json/'+Id).success(function(data) {
                    $scope.plints[Id]=data.items;
                    $scope.chain[link].plintId=settofirst($scope.plints[Id]);
                });
              } else {
                        $scope.chain[link].plintId=settofirst($scope.plints[Id]);
                     }
          }
      };

    $scope.plintchange1 = function(Id, link, e) {
        if (Id > 0) {
            //var i = e.chain[link].plint
            //$scope.pairs=pairseq[$scope.plints[$scope.chain[link].verticalId][Id][2]];
            $scope.pairs=pairseq[$scope.plints[$scope.chain[link].verticalId][0][2]];
            $scope.chain[link].pairId=1;
          } else
          $scope.pairs=pairseq[2];
      };


      testchange = function (e,b) {
      //console.log(e);
      //console.log(b);

      }
      $scope.ngtestchange = function (e) {
      //console.log(e.target);
      //console.log(e.currentTarget.selectedIndex);
//var el = $event.target;
  //  console.log(el);
      }

});



crossApp.directive('crossChange', function ($http, $timeout){

      setverticaltotop = function (lp, pk, $scope) {
      //console.log(lp+' '+pk);
      var n = 0;
          if ($scope.verticals[pk].length) {
            n = $scope.verticals[pk][0][0];
            //scope.verticalchange(n, lp);
            }

            $scope.chain[lp].verticalId = n;
            $timeout(function(){
                 $scope.chain[lp].verticalId = n;
                // console.log($scope.chain[lp].verticalId);
             }, 1);

            //$scope.$digest();

      }

      return {
          restrict : 'A',
          link: function (scope, element, attrs) {
             element.on('change', function (event){
                var lp = scope[attrs["crossChange"]];   // link position in chain
                var pk = scope.chain[lp].crossId;       // database id (primary key)
                si = element[0].selectedIndex;
                scope.chain[lp].crossPos = si;
                //console.log(si+' '+li);

                if (pk > 0) {
                    if (!scope.verticals[pk]) {
                        $http.get(rootpath +'VerticalList.json/'+pk).success(function(data) {
                            scope.verticals[pk]=data.items;
                            setverticaltotop(lp, pk, scope);
                           // setvertical(Id, link);  // wait, while ajax request is success
                        });
                      } else {
                               setverticaltotop(lp, pk, scope);
                               // setvertical(Id, link);  // immediatelly
                             }
             }});
          }
       }
    });

crossApp.directive('verticalChange', function ($http, $timeout){

      setplinttotop = function (lp, pk, $scope) {
      var n = 0;
          if ($scope.plints[pk].length) {
            n = $scope.plints[pk][0][0];
            }
            $timeout(function(){
                 $scope.chain[lp].plintId = n;
             }, 1);
      }

      return {
          restrict : 'A',
          link: function (scope, element, attrs) {
             element.on('change', function (event){
                var lp = scope[attrs["verticalChange"]];
                var pk = scope.chain[lp].verticalId;
                si = element[0].selectedIndex;
                scope.chain[lp].verticalPos = si;
                if (pk > 0) {
                    if (!scope.plints[pk]) {
                        $http.get(rootpath+'PlintList.json/'+pk).success(function(data) {
                            scope.plints[pk]=data.items;
                            setplinttotop(lp, pk, scope);
                        });
                      } else {
                               setplinttotop(lp, pk, scope);
                             }
             }});
          }
       }
    });


    settofirst = function(v) {
        var i = 0
        if (v.length) i = v[0][0];
        return i;
    }
