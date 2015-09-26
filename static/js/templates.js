var crosslistTmpl = '{{#each mainarray}}<div class="col-md-{{../size}}"><div class="panel panel-{{../class}}"><div class="panel-heading"><a class="mybtn-link" onclick="crossEdit({{this.[0]}})">{{this.[1]}}</a></div><div class="panel-body">{{#each this.[2]}}<a class="mybtn-link" onclick="verticalCtrl({{this.[0]}})">{{this.[1]}}</a>{{/each}}</div></div></div>{{/each}}';

