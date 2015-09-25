function drawline(p1, p2, good){
    var L = document.createElementNS(svg, "line");
    L.setAttribute("x1", p1.left);
    L.setAttribute("y1", p1.top);
    L.setAttribute("x2", p2.left);
    L.setAttribute("y2", p2.top);
    c = (good) ? "rgba(200, 200, 0, 0.4)" : "rgba(255, 0, 0, 0.3)"
    L.setAttribute("stroke",  c);
    L.setAttribute("stroke-width", 10);
    R.appendChild(L);
}

function getPairAddr(e){
    a = e.firstChild.href.split('/')
    return 'p'+a.pop()+'m'+a.pop(); }

function getPairCoord(e){
    p = jQuery(e).offset();
    p.left = p.left + w_half;
    p.top = p.top + h_half;
    return p; }

function drawpull(F){
    svg = "http://www.w3.org/2000/svg";
    R = document.getElementById("canvas")
    w_half = F[0].clientWidth/2;
    h_half = F[0].clientHeight/2;
    var Flen = F.length;
    jQuery.each(F, function(j) {
        Sdest = this.firstChild.id
        if (Sdest !== '') {
            Sself = getPairAddr(this);
            for (x=0; x<Flen; x++) {
            Dself = getPairAddr(F[x]);
            if (Dself === Sdest){   // is a reverse direction
                good = (Sself === F[x].firstChild.id) ? true:false;   // is a straight direction , is a good connection!
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