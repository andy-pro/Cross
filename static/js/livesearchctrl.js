//======================================
/*** Ajax live search Controller ***/
(function(){
    //var oldvalue = '';
    //var searchvalue = '';
    //var div = $("#ajaxlivesearch");
    //var input = $("#master-search");
    //getPairTitles = function(value){    // input id="master-search" oninput event
      //searchvalue = value;
      //if(value.length > 2){
        //if(value != oldvalue) {
          //$.post(rootpathajax + "LiveSearch.json", {likestr: value}, function(data){
            //if (data.search.length) {
              //div.html(tmpl("liveSearchTmpl", data));
              //$("#ajaxlivesearch a").hover(
                //function() { searchvalue = this.text; },    // handlerIn on mouseenter
                //function() { searchvalue = input.val(); });   // handlerOut on mouseleave
              //div.show();
            //} else div.hide();
          //});
          //oldvalue = value; }
      //} else { div.hide(); oldvalue = value; }
    //}

    //input.focusout(function(){
        //input.val(searchvalue);
        //oldvalue = searchvalue;
        //div.hide();
    //});


    var searchvalue = '';
    var div = $("#ajaxlivesearch");
    var input = $("#master-search");

    getPairTitles = function(value){    // input id="master-search" oninput event
      searchvalue = value;
      if(value.length > 2){

            /***  async search  ***/
          //$.post(rootpathajax + "LiveSearch.json", {likestr: value}, function(data){
            //if (data.search.length) {
              //div.html(tmpl("liveSearchTmpl", data));
              //$("#ajaxlivesearch a").hover(
                //function() { searchvalue = this.text; },    // handlerIn on mouseenter
                //function() { searchvalue = input.val(); });   // handlerOut on mouseleave
              //div.show();
            //} else div.hide();
          //});

          /***  sync search  ***/
          var data = sLoad('LiveSearch', [], {}, {likestr: value}, 'POST');
          if (data.search.length) {
              div.html(tmpl("liveSearchTmpl", data));
              $("#ajaxlivesearch a").hover(
                  function() { searchvalue = this.text; },    // handlerIn on mouseenter
                  function() { searchvalue = input.val(); });   // handlerOut on mouseleave
               div.show();
          } else div.hide();




      } else { div.hide(); }
    }

    input.focusout(function(){
        input.val(searchvalue);
        div.hide();
    });

    //input.submit(function(){
        //div.hide();
    //});

    masterSearchAccept = function() {
        var value = input.val();
        if (value.length > 2) {
        //log(value)
        //log(decodeURIComponent(value))
        //log(encodeURIComponent(value))
        //log(encodeURI(value))
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            //location.hash = '#/vertical?search=' + escape(value);
            //location.hash = '#/vertical?search=' + encodeURIComponent(value);
            //location.hash = '#/vertical?search=' + encodeURI(value);
            //location.hash = '#/vertical?' + $("form.search").serialize(); // escape?
            location.hash = '#/vertical?search=' + value;
            //log(location.hash)
            //log('nogo')
        }
        else web2pyflash(value + ' : is too short query!', 'danger');
    }
})();
/* end ajax live search controller */