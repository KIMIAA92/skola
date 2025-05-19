
var eng=new Array(97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,87,82,84,83,67,74,90);
var geo=new Array(4304,4305,4330,4307,4308,4324,4306,4336,4312,4335,4313,4314,4315,4316,4317,4318,4325,4320,4321,4322,4323,4309,4332,4334,4327,4310,4333,4326,4311,4328,4329,4319,4331,91,93,59,39,44,46,96);

function makeGeo(ob,e) {
  code = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;

  // if (code==96) {
  // document.getElementById('geoKeys').checked = !document.getElementById('geoKeys').checked;
  // return false;
  // }

  if (e.which==0) return true;
  if (e.altKey || e.ctrlKey || e.metaKey) return true;
  if (!document.getElementById('geoKeys').checked) return true;

  var found = false;
  for (i=0; i<=geo.length; i++) {
    if (eng[i]==code) {
      c=geo[i];
      found = true;
    }
  }

  if ( found ) {
    if (document.selection) {
      sel = document.selection.createRange();
      sel.text = String.fromCharCode(c);
    } else {
      if (ob.selectionStart || ob.selectionStart == '0') {
        var startPos = ob.selectionStart;
        var endPos = ob.selectionEnd;
        ob.value = ob.value.substring(0, startPos) + String.fromCharCode(c) + ob.value.substring(endPos, ob.value.length);
        ob.selectionStart = startPos+1;
        ob.selectionEnd = endPos+1;
      } else {
        //ob.value = ob.value + String.fromCharCode(c);
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
}
