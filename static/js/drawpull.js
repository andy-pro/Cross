function drawline(p1, p2, good){
    var L = document.createElementNS(svg, "path");
    var lx = p2.left - p1.left;
    var ly = p2.top - p1.top;
    var cx = parseInt((p1.left + p2.left)/2);   // center of line
    var cy = parseInt((p1.top + p2.top)/2);
    var w = Math.max(lx,ly);
    var d = (w > 30) ? parseInt(Math.sqrt(w)*2)+10 : 0;     // offset of curve
    var pt4x = p1.left;
    var pt4y = p1.top;
    var cxe = cx;
    var cye = cy;
    w = 6;
    if (lx > ly) {
        cy = cy + d;
        cye = cy + w;
        rel = ' v'+w+' ';
        pt4y = pt4y + w;
        } else {
            cx = cx + d;
            cxe = cx + w;
            rel = ' h'+w+' ';
            pt4x = pt4x + w;
        }
    var pt = 'M'+p1.left+','+p1.top+' Q'+cx+','+cy+' '+p2.left+','+p2.top+rel+' Q'+cxe+','+cye+' '+pt4x+','+pt4y+' z';
    //console.log(pt);
    L.setAttribute("d", pt);
    //c = (good) ? "rgba(200, 200, 0, 0.4)" : "rgba(255, 0, 0, 0.3)";
    var c = (good) ? "rgba(200, 200, 0, 0.4)" : "rgba(255, 0, 0, 0.3)";
    L.setAttribute("fill",  c);
    //L.setAttribute("stroke",  "rgba(100, 100, 100, 0.4)");
    L.setAttribute("stroke", "rgba(80, 80, 80, 0.4)");
    L.setAttribute("stroke-width", 1);
    R.appendChild(L);

//<path d="M335,120 A60,60 0 0,1 335,183 h10 A60,60 0 0,0 345,120 z" fill="red" stroke="blue" stroke-width="1"/>
//<path d="M620,120 Q200,300 950,350" fill="transparent" stroke="blue" stroke-width="10"/>

}

function getPairAddr(e){
    var a = e.firstChild.href.split('/');
    return 'p'+a.pop()+'m'+a.pop(); }

function getPairCoord(e){
    var p = jQuery(e).offset();
    p.left = parseInt(p.left + w_half);
    p.top = parseInt(p.top + h_half - 4);
    return p; }

function drawpull(F){
    svg = "http://www.w3.org/2000/svg";
    R = document.getElementById("canvas");
    w_half = F[0].clientWidth/2;
    h_half = F[0].clientHeight/2;
    var Flen = F.length;
    jQuery.each(F, function(j) {
        var Sdest = this.firstChild.id;
        if (Sdest !== '') {
            var Sself = getPairAddr(this);
            for (var x=0; x<Flen; x++) {
            var Dself = getPairAddr(F[x]);
            if (Dself === Sdest){   // is a reverse direction
                var good = (Sself === F[x].firstChild.id) ? true:false;   // is a straight direction , is a good connection!
                drawline(getPairCoord(this), getPairCoord(F[x]), good);
                //console.log(this, F[x]);
                if (good) F[x].firstChild.id = '';
                //console.log(x);
                break;
                }
            }
        }
    });
}