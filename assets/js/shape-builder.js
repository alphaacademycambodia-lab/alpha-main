/* Shape Builder — Cambridge Lower Secondary Stage 7: 2D shapes (Unit 2), area of
   triangles and compound shapes (Unit 4), 3D solids (Unit 8), transformations
   (Unit 13), views of solids (Unit 23) and coordinates (Unit 25).
   Everything is drawn as SVG. No libraries. Uses the .cb styles of chart-builder.css. */
(function(){
"use strict";
const root=document.getElementById("sbRoot");if(!root)return;
const $=s=>root.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>{const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:0};
const fmt=(n,d=2)=>{if(!isFinite(n))return"—";const r=Math.round(n*10**d)/10**d;return String(Object.is(r,-0)?0:r)};
const near=(a,b,t=1e-6)=>Math.abs(a-b)<t;
const DEG=180/Math.PI;
const LET="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ------------------------------------------------------------------ geometry */
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,k)=>[a[0]*k,a[1]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],crs=(a,b)=>a[0]*b[1]-a[1]*b[0],len=a=>Math.hypot(a[0],a[1]);
const unit=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l]};
const dist=(a,b)=>len(sub(a,b));
function sArea(V){let s=0;for(let i=0;i<V.length;i++){const p=V[i],q=V[(i+1)%V.length];s+=p[0]*q[1]-q[0]*p[1]}return s/2}
const vCentre=V=>mul(V.reduce((a,p)=>add(a,p),[0,0]),1/V.length);
function lineDist(p,a,b){return Math.abs(crs(sub(b,a),sub(p,a)))/dist(a,b)}
function foot(p,a,b){const d=sub(b,a),t=dot(sub(p,a),d)/dot(d,d);return[add(a,mul(d,t)),t]}
function segX(a,b,c,d){const r=sub(b,a),s=sub(d,c),den=crs(r,s);if(Math.abs(den)<1e-12)return false;const t=crs(sub(c,a),s)/den,u=crs(sub(c,a),r)/den;return t>1e-9&&t<1-1e-9&&u>1e-9&&u<1-1e-9}
function selfIntersects(V){const n=V.length;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if(Math.abs(i-j)<=1||(i===0&&j===n-1))continue;if(segX(V[i],V[(i+1)%n],V[j],V[(j+1)%n]))return true}return false}
function angles(V){const n=V.length,o=Math.sign(sArea(V))||1;return V.map((v,i)=>{const p=V[(i-1+n)%n],q=V[(i+1)%n],a=sub(p,v),b=sub(q,v);
  let ang=Math.acos(Math.max(-1,Math.min(1,dot(a,b)/(len(a)*len(b)||1))))*DEG;const turn=crs(sub(v,p),sub(q,v));if(Math.sign(turn)===-o&&Math.abs(turn)>1e-9)ang=360-ang;return ang})}
const sides=V=>V.map((v,i)=>dist(v,V[(i+1)%V.length]));
const parallel=(a,b,c,d)=>{const u=sub(b,a),v=sub(d,c);return Math.abs(crs(u,v))/(len(u)*len(v)||1)<1e-6};
function triangulate(V){ // ear clipping, returns index triples
  let idx=V.map((_,i)=>i);const out=[];const o=Math.sign(sArea(V))||1;let guard=0;
  while(idx.length>3&&guard++<500){let cut=false;
    for(let k=0;k<idx.length;k++){const i0=idx[(k-1+idx.length)%idx.length],i1=idx[k],i2=idx[(k+1)%idx.length],a=V[i0],b=V[i1],c=V[i2];
      if(Math.sign(crs(sub(b,a),sub(c,b)))!==o)continue;
      let inside=false;for(const j of idx){if(j===i0||j===i1||j===i2)continue;const p=V[j];const s1=crs(sub(b,a),sub(p,a))*o,s2=crs(sub(c,b),sub(p,b))*o,s3=crs(sub(a,c),sub(p,c))*o;if(s1>=-1e-12&&s2>=-1e-12&&s3>=-1e-12){inside=true;break}}
      if(inside)continue;out.push([i0,i1,i2]);idx.splice(k,1);cut=true;break}
    if(!cut)break}
  if(idx.length===3)out.push(idx.slice());return out;
}
function symmetry(V){
  const n=V.length,c=vCentre(V),E=new Set(V.map((_,i)=>key(i,(i+1)%n)));
  function key(a,b){return a<b?a+"-"+b:b+"-"+a}
  function same(T){const m=T.map(p=>V.findIndex(q=>dist(p,q)<1e-6));if(m.some(j=>j<0))return false;for(let i=0;i<n;i++)if(!E.has(key(m[i],m[(i+1)%n])))return false;return true}
  const dirs=[];const addDir=d=>{if(len(d)<1e-9)return;let a=Math.atan2(d[1],d[0]);a=((a%Math.PI)+Math.PI)%Math.PI;if(!dirs.some(x=>Math.abs(x-a)<1e-6||Math.abs(Math.abs(x-a)-Math.PI)<1e-6))dirs.push(a)};
  V.forEach((v,i)=>{addDir(sub(v,c));addDir(sub(mul(add(v,V[(i+1)%n]),.5),c))});
  const lines=dirs.filter(a=>{const u=[Math.cos(a),Math.sin(a)];return same(V.map(p=>{const r=sub(p,c),t=dot(r,u);return add(c,sub(mul(u,2*t),r))}))});
  let order=1;for(let k=n;k>=2;k--){if(n%k)continue;const t=2*Math.PI/k,cs=Math.cos(t),sn=Math.sin(t);if(same(V.map(p=>{const r=sub(p,c);return add(c,[r[0]*cs-r[1]*sn,r[0]*sn+r[1]*cs])}))){order=k;break}}
  return{lines,order,c};
}
const POLY=["","","","Triangle","Quadrilateral","Pentagon","Hexagon","Heptagon","Octagon","Nonagon","Decagon","Hendecagon","Dodecagon"];
function classify(V){
  const n=V.length,L=sides(V),A=angles(V),eqL=(i,j)=>near(L[i],L[j],1e-6),allL=L.every(l=>near(l,L[0],1e-6)),allA=A.every(a=>near(a,A[0],1e-4));
  const concave=A.some(a=>a>180+1e-6);let name,fam=n<=12?POLY[n]:n+"-sided polygon";
  if(n===3){const e=L.filter((l,i)=>near(l,L[(i+1)%3],1e-6)).length;const s=e===3?"Equilateral":e>=1?"Isosceles":"Scalene";
    const big=Math.max(...A);const a=near(big,90,1e-3)?"right-angled":big>90?"obtuse-angled":"acute-angled";name=e===3?"Equilateral triangle":`${s} ${a} triangle`;}
  else if(n===4){
    const p1=parallel(V[0],V[1],V[3],V[2]),p2=parallel(V[1],V[2],V[0],V[3]),right=A.every(a=>near(a,90,1e-3));
    if(concave)name=(eqL(0,1)&&eqL(2,3))||(eqL(1,2)&&eqL(3,0))?"Arrowhead (concave kite)":"Concave quadrilateral";
    else if(right&&allL)name="Square";else if(right)name="Rectangle";else if(allL)name="Rhombus";else if(p1&&p2)name="Parallelogram";
    else if(p1||p2){const legs=p1?[1,3]:[0,2];name=eqL(legs[0],legs[1])?"Isosceles trapezium":(A.some(a=>near(a,90,1e-3))?"Right-angled trapezium":"Trapezium")}
    else if((eqL(0,1)&&eqL(2,3))||(eqL(1,2)&&eqL(3,0)))name="Kite";else name="Quadrilateral";}
  else name=(allL&&allA&&!concave?"Regular ":concave?"Concave ":"Irregular ")+(n<=12?POLY[n].toLowerCase():n+"-sided polygon");
  return{name,fam,concave,regular:allL&&allA&&!concave,L,A};
}

/* ------------------------------------------------------------------ state */
const PRESETS2=[
  {id:"square",n:"Square",v:[[1,1],[5,1],[5,5],[1,5]]},
  {id:"rectangle",n:"Rectangle",v:[[1,1],[7,1],[7,4],[1,4]]},
  {id:"parallelogram",n:"Parallelogram",v:[[1,1],[6,1],[8,4],[3,4]]},
  {id:"rhombus",n:"Rhombus",v:[[1,1],[6,1],[9,5],[4,5]]},
  {id:"kite",n:"Kite",v:[[4,1],[6,4],[4,8],[2,4]]},
  {id:"trapezium",n:"Trapezium",v:[[1,1],[8,1],[6,4],[2,4]]},
  {id:"isotrap",n:"Isosceles trapezium",v:[[1,1],[8,1],[6,4],[3,4]]},
  {id:"tri-eq",n:"Equilateral triangle",reg:3},
  {id:"tri-iso",n:"Isosceles triangle",v:[[1,1],[7,1],[4,6]]},
  {id:"tri-sca",n:"Scalene triangle",v:[[1,1],[8,1],[3,5]]},
  {id:"tri-right",n:"Right-angled triangle",v:[[1,1],[7,1],[1,5]]},
  {id:"tri-obt",n:"Obtuse triangle",v:[[1,1],[5,1],[8,4]]},
  {id:"regular",n:"Regular polygon",reg:"n"},
  {id:"lshape",n:"Compound L-shape",v:[[1,1],[7,1],[7,3],[3,3],[3,6],[1,6]]},
  {id:"arrow",n:"Arrowhead",v:[[4,6],[7,1],[4,3],[1,1]]},
  {id:"custom",n:"Your own shape",v:[[1,1],[6,2],[4,6]],custom:true},
  {id:"circle",n:"Circle",circle:true}
];
const SOLIDS=[
  {id:"cube",n:"Cube",f:[["a","Edge a",4]]},
  {id:"cuboid",n:"Cuboid",f:[["l","Length l",5],["w","Width w",3],["h","Height h",4]]},
  {id:"prism",n:"Prism",f:[["n","Sides of the end face",3],["s","End-face side s",3],["L","Length L",6]]},
  {id:"pyramid",n:"Pyramid",f:[["n","Sides of the base",4],["s","Base side s",4],["h","Height h",4]]},
  {id:"tetra",n:"Tetrahedron",f:[["s","Edge s",4]]},
  {id:"cylinder",n:"Cylinder",f:[["r","Radius r",2.5],["h","Height h",5]]},
  {id:"cone",n:"Cone",f:[["r","Radius r",3],["h","Height h",5]]},
  {id:"sphere",n:"Sphere",f:[["r","Radius r",3]]}
];
function regularPoly(n,R=3,c=[4,4]){const a0=-Math.PI/2-Math.PI/n;return Array.from({length:n},(_,i)=>{const a=a0+i*2*Math.PI/n;return[c[0]+R*Math.cos(a),c[1]+R*Math.sin(a)]})}
function freshState(){return{mode:"2d",showWork:true,practice:false,
  d2:{preset:"rectangle",v:PRESETS2[1].v.map(p=>p.slice()),regN:6,snap:1,show:{len:true,ang:true,lab:true,diag:false,sym:false,ht:true},
      tr:{type:"none",line:"y-axis",k:0,ang:"90cw",cx:0,cy:0,sf:2,tx:3,ty:-4},circle:{r:4,parts:{radius:true,diameter:true,chord:true,arc:false,sector:false,segment:false,tangent:false}}},
  d3:{solid:"cuboid",dims:{},yaw:-32,pitch:22,view:"3d",show:{hidden:true,lab:true,cubes:false}}}}
let S;try{const s=JSON.parse(localStorage.getItem("aa-shape-builder")||"null");if(s&&s.d2&&s.d3)S=s}catch(e){}
if(!S)S=freshState();
const save=()=>{try{localStorage.setItem("aa-shape-builder",JSON.stringify(S))}catch(e){}};
function dimsFor(id){const D=S.d3.dims,sol=SOLIDS.find(s=>s.id===id);const o={};sol.f.forEach(([k,,def])=>{o[k]=D[k+"_"+id]??def});return o}

/* ------------------------------------------------------------------ 2D drawing */
const W=680,H=560,U=30,OX=340,OY=280,XR=10,YR=8;
const px=x=>OX+x*U,py=y=>OY-y*U,P=p=>`${fmt(px(p[0]),2)},${fmt(py(p[1]),2)}`;
function gridSvg(){let s=`<rect x="${px(-XR)}" y="${py(YR)}" width="${2*XR*U}" height="${2*YR*U}" fill="var(--panel)"/>`;
  for(let x=-XR;x<=XR;x++)s+=`<line x1="${px(x)}" x2="${px(x)}" y1="${py(-YR)}" y2="${py(YR)}" class="cb-gr"/>`;
  for(let y=-YR;y<=YR;y++)s+=`<line y1="${py(y)}" y2="${py(y)}" x1="${px(-XR)}" x2="${px(XR)}" class="cb-gr"/>`;
  s+=`<line x1="${px(-XR)}" x2="${px(XR)}" y1="${py(0)}" y2="${py(0)}" stroke="var(--muted)" stroke-width="1.4"/><line y1="${py(-YR)}" y2="${py(YR)}" x1="${px(0)}" x2="${px(0)}" stroke="var(--muted)" stroke-width="1.4"/>`;
  for(let x=-XR;x<=XR;x+=2)if(x)s+=`<text x="${px(x)}" y="${py(0)+14}" text-anchor="middle" class="cb-tm" font-size="10">${x}</text>`;
  for(let y=-YR;y<=YR;y+=2)if(y)s+=`<text x="${px(0)-6}" y="${py(y)+3.5}" text-anchor="end" class="cb-tm" font-size="10">${y}</text>`;
  s+=`<text x="${px(XR)-4}" y="${py(0)-6}" text-anchor="end" class="cb-tm" font-size="11" font-style="italic">x</text><text x="${px(0)+6}" y="${py(YR)+12}" class="cb-tm" font-size="11" font-style="italic">y</text>`;
  return s}
function clipLine(c,u){ // long line through c along u, clipped to the grid box
  const ts=[];[[-XR,0],[XR,0]].forEach(([x])=>{if(Math.abs(u[0])>1e-9)ts.push((x-c[0])/u[0])});[[-YR],[YR]].forEach(([y])=>{if(Math.abs(u[1])>1e-9)ts.push((y-c[1])/u[1])});
  const pts=ts.map(t=>add(c,mul(u,t))).filter(p=>p[0]>=-XR-1e-6&&p[0]<=XR+1e-6&&p[1]>=-YR-1e-6&&p[1]<=YR+1e-6);
  if(pts.length<2)return null;pts.sort((a,b)=>dot(a,u)-dot(b,u));return[pts[0],pts[pts.length-1]]}
function arcPath(v,a0,sweep,r){const pts=[];const N=Math.max(6,Math.ceil(Math.abs(sweep)/6));for(let i=0;i<=N;i++){const a=a0+sweep*i/N;pts.push([v[0]+r*Math.cos(a),v[1]+r*Math.sin(a)])}return pts.map(P).join(" ")}
function polySvg(V,o){
  const n=V.length,ar=sArea(V),or=Math.sign(ar)||1,A=angles(V),cls=o.cls;let s="";
  s+=`<polygon points="${V.map(P).join(" ")}" fill="${o.fill}" fill-opacity="${o.fop}" stroke="${o.stroke}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if(o.angles)V.forEach((v,i)=>{const p=V[(i-1+n)%n],q=V[(i+1)%n],ang=A[i];const tq=Math.atan2(q[1]-v[1],q[0]-v[0]),tp=Math.atan2(p[1]-v[1],p[0]-v[0]);
    const start=or>0?tq:tp,sw=ang/DEG,r=Math.min(.7,dist(v,p)/3,dist(v,q)/3);
    if(near(ang,90,1e-3)){const u1=mul(unit(sub(q,v)),r*.75),u2=mul(unit(sub(p,v)),r*.75);s+=`<polyline points="${[add(v,u1),add(add(v,u1),u2),add(v,u2)].map(P).join(" ")}" fill="none" stroke="${o.stroke}" stroke-width="1.3"/>`}
    else s+=`<polyline points="${arcPath(v,start,sw,r)}" fill="none" stroke="${o.stroke}" stroke-width="1.3"/>`;
    if(near(ang,90,1e-3))return;const mid=start+sw/2,rt=r+(ang<40?.75:.5);const t=[v[0]+rt*Math.cos(mid),v[1]+rt*Math.sin(mid)];
    s+=`<text x="${px(t[0])}" y="${py(t[1])+4}" text-anchor="middle" class="cb-t" font-size="11" font-weight="600" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${fmt(ang,1)}°</text>`});
  if(o.lengths)V.forEach((v,i)=>{const q=V[(i+1)%n],m=mul(add(v,q),.5),d=sub(q,v),nrm=mul(unit([d[1],-d[0]]),or*.42);const t=add(m,nrm);
    s+=`<text x="${px(t[0])}" y="${py(t[1])+4}" text-anchor="middle" class="cb-t" font-size="12" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${fmt(dist(v,q),1)}</text>`});
  if(o.labels)V.forEach((v,i)=>{const p=V[(i-1+n)%n],q=V[(i+1)%n];let b=add(unit(sub(p,v)),unit(sub(q,v)));if(len(b)<1e-6)b=[-(q[1]-v[1]),q[0]-v[0]];b=unit(b);if(A[i]>180)b=mul(b,-1);const t=add(v,mul(b,-.55));
    s+=`<text x="${px(t[0])}" y="${py(t[1])+5}" text-anchor="middle" class="cb-tt" font-size="14" fill="${o.stroke}">${LET[i%26]}${o.prime||""}</text>`});
  return s}
function heightInfo(V,c){ // returns {base:[i,j], apex:k, foot, h, b} for triangles / parallelograms / trapezia
  const n=V.length;
  if(n===3){const L=sides(V);let i=L.indexOf(Math.max(...L));// prefer the most horizontal longest side
    const hor=V.map((v,k)=>[k,Math.abs(V[(k+1)%3][1]-v[1])<1e-9]).filter(x=>x[1]).map(x=>x[0]);if(hor.length)i=hor.sort((a,b)=>L[b]-L[a])[0];
    const a=V[i],b=V[(i+1)%3],k=(i+2)%3,[f,t]=foot(V[k],a,b);return{base:[i,(i+1)%3],apex:k,foot:f,t,h:dist(V[k],f),b:dist(a,b)}}
  if(n===4&&/Parallelogram|Rhombus|Trapezium|trapezium/.test(c.name)){
    let i=parallel(V[0],V[1],V[3],V[2])?0:1;const a=V[i],b=V[i+1],k=i===0?3:0;const [f,t]=foot(V[k],a,b);return{base:[i,i+1],apex:k,foot:f,t,h:dist(V[k],f),b:dist(a,b)}}
  return null}
function heightSvg(V,hi){if(!hi||hi.h<1e-9)return"";const a=V[hi.base[0]],b=V[hi.base[1]],ap=V[hi.apex],f=hi.foot;let s="";
  if(hi.t<0||hi.t>1){const e=hi.t<0?a:b;s+=`<line x1="${px(e[0])}" y1="${py(e[1])}" x2="${px(f[0])}" y2="${py(f[1])}" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 4"/>`}
  s+=`<line x1="${px(ap[0])}" y1="${py(ap[1])}" x2="${px(f[0])}" y2="${py(f[1])}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 4"/>`;
  const u1=mul(unit(sub(ap,f)),.35),dir=unit(sub(b,a)),u2=mul(dir,hi.t>.5?-.35:.35);s+=`<polyline points="${[add(f,u1),add(add(f,u1),u2),add(f,u2)].map(P).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="1.3"/>`;
  const m=mul(add(ap,f),.5),side=mul(dir,hi.t>.5?.45:-.45),t=add(m,side);
  s+=`<text x="${px(t[0])}" y="${py(t[1])+4}" text-anchor="middle" class="cb-t" font-size="12" font-weight="700" fill="var(--accent)" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">h = ${fmt(hi.h,1)}</text>`;return s}
function transformImage(V){const T=S.d2.tr,k=num(T.k),c=[num(T.cx),num(T.cy)];
  switch(T.type){
    case"reflect":return V.map(([x,y])=>T.line==="x-axis"?[x,-y]:T.line==="y-axis"?[-x,y]:T.line==="x=k"?[2*k-x,y]:T.line==="y=k"?[x,2*k-y]:T.line==="y=x"?[y,x]:[-y,-x]);
    case"rotate":return V.map(([x,y])=>{const dx=x-c[0],dy=y-c[1];return T.ang==="90cw"?[c[0]+dy,c[1]-dx]:T.ang==="90ccw"?[c[0]-dy,c[1]+dx]:[c[0]-dx,c[1]-dy]});
    case"enlarge":{const f=num(T.sf)||1;return V.map(p=>add(c,mul(sub(p,c),f)))}
    case"translate":return V.map(([x,y])=>[x+num(T.tx),y+num(T.ty)]);
  }return null}
function trDescribe(){const T=S.d2.tr;const L={"x-axis":"the x-axis","y-axis":"the y-axis","x=k":`the line x = ${fmt(num(T.k))}`,"y=k":`the line y = ${fmt(num(T.k))}`,"y=x":"the line y = x","y=-x":"the line y = −x"};
  switch(T.type){case"reflect":return`Reflection in ${L[T.line]}`;case"rotate":return`Rotation ${T.ang==="180"?"180°":T.ang==="90cw"?"90° clockwise":"90° anticlockwise"} about (${fmt(num(T.cx))}, ${fmt(num(T.cy))})`;
    case"enlarge":return`Enlargement, scale factor ${fmt(num(T.sf))}, centre (${fmt(num(T.cx))}, ${fmt(num(T.cy))})`;case"translate":return`Translation ${fmt(num(T.tx))} right/left and ${fmt(num(T.ty))} up/down — column vector (${fmt(num(T.tx))}, ${fmt(num(T.ty))})`}return""}
function trDecor(){const T=S.d2.tr,k=num(T.k);let s="";const line=(a,b)=>{const L=clipLine(a,unit(sub(b,a)));return L?`<line x1="${px(L[0][0])}" y1="${py(L[0][1])}" x2="${px(L[1][0])}" y2="${py(L[1][1])}" stroke="var(--c4)" stroke-width="2" stroke-dasharray="8 5"/>`:""};
  if(T.type==="reflect"){const m={"x-axis":[[0,0],[1,0]],"y-axis":[[0,0],[0,1]],"x=k":[[k,0],[k,1]],"y=k":[[0,k],[1,k]],"y=x":[[0,0],[1,1]],"y=-x":[[0,0],[1,-1]]}[T.line];s+=line(m[0],m[1])}
  if(T.type==="rotate"||T.type==="enlarge"){const c=[num(T.cx),num(T.cy)];s+=`<circle cx="${px(c[0])}" cy="${py(c[1])}" r="5" fill="var(--c4)"/><text x="${px(c[0])+8}" y="${py(c[1])-8}" class="cb-t" font-size="11" fill="var(--c4)">centre</text>`}
  return s}
function render2D(){
  const D=S.d2;if(D.preset==="circle")return renderCircle();
  const V=D.v,c=classify(V),sy=symmetry(V),hi=heightInfo(V,c);let s=`<svg viewBox="0 0 ${W} ${H}" id="sbSvg" role="img" aria-label="${esc(c.name)} on a coordinate grid" style="touch-action:none">`+gridSvg();
  if(D.show.sym)sy.lines.forEach(a=>{const L=clipLine(sy.c,[Math.cos(a),Math.sin(a)]);if(L)s+=`<line x1="${px(L[0][0])}" y1="${py(L[0][1])}" x2="${px(L[1][0])}" y2="${py(L[1][1])}" stroke="var(--c5)" stroke-width="2" stroke-dasharray="7 5"/>`});
  if(D.show.sym&&sy.order>1)s+=`<circle cx="${px(sy.c[0])}" cy="${py(sy.c[1])}" r="4" fill="var(--c5)"/>`;
  const img=transformImage(V);
  s+=`<clipPath id="sbClip"><rect x="${px(-XR)}" y="${py(YR)}" width="${2*XR*U}" height="${2*YR*U}"/></clipPath>`;
  if(img){s+=trDecor()+'<g clip-path="url(#sbClip)">';if(D.tr.type==="enlarge"){const c0=[num(D.tr.cx),num(D.tr.cy)];img.forEach(p=>{s+=`<line x1="${px(c0[0])}" y1="${py(c0[1])}" x2="${px(p[0])}" y2="${py(p[1])}" stroke="var(--c4)" stroke-width="1" stroke-opacity=".5" stroke-dasharray="3 4"/>`})}
    s+=polySvg(img,{fill:"var(--c2)",fop:.22,stroke:"var(--c2)",labels:D.show.lab,lengths:false,angles:false,prime:"′"})+"</g>"}
  if(D.show.diag&&V.length>=4&&V.length<=8)for(let i=0;i<V.length;i++)for(let j=i+2;j<V.length;j++){if(i===0&&j===V.length-1)continue;s+=`<line x1="${px(V[i][0])}" y1="${py(V[i][1])}" x2="${px(V[j][0])}" y2="${py(V[j][1])}" stroke="var(--c3)" stroke-width="1.6" stroke-dasharray="5 4"/>`}
  s+=polySvg(V,{fill:"var(--c1)",fop:.14,stroke:"var(--c1)",labels:D.show.lab,lengths:D.show.len,angles:D.show.ang});
  if(D.show.ht&&hi)s+=heightSvg(V,hi);
  if(!S.practice||true){V.forEach((v,i)=>{s+=`<circle class="sb-h" tabindex="0" data-v="${i}" cx="${px(v[0])}" cy="${py(v[1])}" r="9" fill="var(--panel)" stroke="var(--c1)" stroke-width="2.5" style="cursor:grab"><title>Drag ${LET[i]}</title></circle>`});
    if(PRESETS2.find(p=>p.id===D.preset)?.custom||D.preset==="custom")V.forEach((v,i)=>{const m=mul(add(v,V[(i+1)%V.length]),.5);s+=`<g class="sb-ins" data-ins="${i}" style="cursor:copy"><circle cx="${px(m[0])}" cy="${py(m[1])}" r="8" fill="var(--accent)" fill-opacity=".9"/><path d="M${px(m[0])-4} ${py(m[1])}h8M${px(m[0])} ${py(m[1])-4}v8" stroke="var(--on-color)" stroke-width="2"/><title>Add a corner here</title></g>`})}
  if(selfIntersects(V))s+=`<text x="${W/2}" y="${H-10}" text-anchor="middle" class="cb-t" font-size="13" fill="var(--bad)" font-weight="700">The sides cross — move a corner so the shape is a proper polygon.</text>`;
  return s+"</svg>";
}
const CPARTS=[["radius","Radius","var(--c1)"],["diameter","Diameter","var(--c3)"],["chord","Chord","var(--c4)"],["arc","Arc","var(--c5)"],["sector","Sector","var(--c2)"],["segment","Segment","var(--c6)"],["tangent","Tangent","var(--c7)"]];
function renderCircle(){const C=S.d2.circle,r=Math.max(.5,Math.min(7.5,num(C.r)||4)),c=[0,0],pt=a=>[r*Math.cos(a/DEG),r*Math.sin(a/DEG)];let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Parts of a circle">`+gridSvg();
  const pp=C.parts;
  if(pp.sector){const a=pt(200),b=pt(250);s+=`<path d="M${P(c)} L${P(a)} A${r*U} ${r*U} 0 0 0 ${P(b)} Z" fill="var(--c2)" fill-opacity=".35" stroke="var(--c2)" stroke-width="2"/>`;const t=pt(225).map(v=>v*.6);s+=`<text x="${px(t[0])}" y="${py(t[1])+4}" text-anchor="middle" class="cb-t" font-size="12" font-weight="700">sector</text>`}
  if(pp.segment){const a=pt(290),b=pt(345);s+=`<path d="M${P(a)} A${r*U} ${r*U} 0 0 0 ${P(b)} Z" fill="var(--c6)" fill-opacity=".4" stroke="var(--c6)" stroke-width="2"/>`;const t=pt(318).map(v=>v*.86);s+=`<text x="${px(t[0])}" y="${py(t[1])+4}" text-anchor="middle" class="cb-t" font-size="11" font-weight="700">segment</text>`}
  s+=`<circle cx="${px(0)}" cy="${py(0)}" r="${r*U}" fill="var(--c1)" fill-opacity=".06" stroke="var(--fg)" stroke-width="2.2"/><circle cx="${px(0)}" cy="${py(0)}" r="3.5" fill="var(--fg)"/><text x="${px(0)-8}" y="${py(0)+16}" class="cb-t" font-size="12" font-weight="700">O</text>`;
  const lbl=(p,t,col)=>`<text x="${px(p[0])}" y="${py(p[1])+4}" text-anchor="middle" class="cb-t" font-size="12" font-weight="700" fill="${col}" style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${t}</text>`;
  if(pp.radius){const a=pt(35);s+=`<line x1="${px(0)}" y1="${py(0)}" x2="${px(a[0])}" y2="${py(a[1])}" stroke="var(--c1)" stroke-width="3"/>`+lbl(add(mul(a,.5),[-.35,.45]),"radius","var(--c1)")}
  if(pp.diameter){const a=pt(180),b=pt(0);s+=`<line x1="${px(a[0])}" y1="${py(a[1])}" x2="${px(b[0])}" y2="${py(b[1])}" stroke="var(--c3)" stroke-width="3"/>`+lbl([-r/2,-.45],"diameter","var(--c3)")}
  if(pp.chord){const a=pt(110),b=pt(160);s+=`<line x1="${px(a[0])}" y1="${py(a[1])}" x2="${px(b[0])}" y2="${py(b[1])}" stroke="var(--c4)" stroke-width="3"/>`+lbl(mul(add(a,b),.42),"chord","var(--c4)")}
  if(pp.arc){const a=pt(55),b=pt(95);s+=`<path d="M${P(a)} A${r*U} ${r*U} 0 0 0 ${P(b)}" fill="none" stroke="var(--c5)" stroke-width="6" stroke-linecap="round"/>`+lbl(pt(75).map(v=>v*1.13),"arc","var(--c5)")}
  if(pp.tangent){const a=pt(-30),u=[Math.cos(60/DEG),Math.sin(60/DEG)],p1=add(a,mul(u,-3.2)),p2=add(a,mul(u,3.2));s+=`<line x1="${px(p1[0])}" y1="${py(p1[1])}" x2="${px(p2[0])}" y2="${py(p2[1])}" stroke="var(--c7)" stroke-width="3"/><circle cx="${px(a[0])}" cy="${py(a[1])}" r="4" fill="var(--c7)"/>`+lbl(add(p2,[.6,.1]),"tangent","var(--c7)")}
  s+=lbl([r*Math.cos(-100/DEG)*1.13,r*Math.sin(-100/DEG)*1.13-.15],"circumference","var(--fg)");
  return s+"</svg>"}

/* ------------------------------------------------------------------ 3D meshes */
const v3=(x,y,z)=>[x,y,z],s3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],c3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],d3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],n3=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)};
function ngon(n,R,y,rot=0){return Array.from({length:n},(_,i)=>{const a=rot+i*2*Math.PI/n;return[R*Math.cos(a),y,R*Math.sin(a)]})}
function meshFor(id,d){
  const V=[],F=[];const addV=p=>V.push(p)-1;
  if(id==="cube"||id==="cuboid"){const l=id==="cube"?d.a:d.l,w=id==="cube"?d.a:d.w,h=id==="cube"?d.a:d.h;
    for(const x of[-l/2,l/2])for(const y of[-h/2,h/2])for(const z of[-w/2,w/2])addV([x,y,z]);
    const q=(a,b,c,e)=>F.push([a,b,c,e]);q(0,1,3,2);q(4,6,7,5);q(0,4,5,1);q(2,3,7,6);q(0,2,6,4);q(1,5,7,3);}
  else if(id==="prism"){const n=Math.round(d.n),s=d.s,L=d.L,R=s/(2*Math.sin(Math.PI/n));const rot=-Math.PI/2-Math.PI/n;
    const ring=Array.from({length:n},(_,i)=>{const a=rot+i*2*Math.PI/n;return[R*Math.cos(a),R*Math.sin(a)]});const minY=Math.min(...ring.map(p=>p[1])),maxY=Math.max(...ring.map(p=>p[1])),cy=(minY+maxY)/2;
    ring.forEach(p=>addV([-L/2,p[1]-cy,p[0]]));ring.forEach(p=>addV([L/2,p[1]-cy,p[0]]));
    F.push([...Array(n).keys()]);F.push([...Array(n).keys()].map(i=>i+n));for(let i=0;i<n;i++){const j=(i+1)%n;F.push([i,j,j+n,i+n])}}
  else if(id==="pyramid"||id==="tetra"){let n,s,h;if(id==="tetra"){n=3;s=d.s;h=s*Math.sqrt(2/3)}else{n=Math.round(d.n);s=d.s;h=d.h}
    const R=s/(2*Math.sin(Math.PI/n));ngon(n,R,-h/2,n===4?Math.PI/4:-Math.PI/2).forEach(p=>addV(p));const ap=addV([0,h/2,0]);F.push([...Array(n).keys()]);for(let i=0;i<n;i++)F.push([i,(i+1)%n,ap])}
  else if(id==="cylinder"||id==="cone"){const N=48,r=d.r,h=d.h;ngon(N,r,-h/2).forEach(p=>addV(p));
    if(id==="cylinder"){ngon(N,r,h/2).forEach(p=>addV(p));F.push([...Array(N).keys()]);F.push([...Array(N).keys()].map(i=>i+N));for(let i=0;i<N;i++){const j=(i+1)%N;F.push([i,j,j+N,i+N])}}
    else{const ap=addV([0,h/2,0]);F.push([...Array(N).keys()]);for(let i=0;i<N;i++)F.push([i,(i+1)%N,ap])}}
  else if(id==="sphere"){const r=d.r,NA=32,NB=16;const top=addV([0,r,0]);for(let b=1;b<NB;b++){const t=Math.PI*b/NB;for(let a=0;a<NA;a++){const p=2*Math.PI*a/NA;addV([r*Math.sin(t)*Math.cos(p),r*Math.cos(t),r*Math.sin(t)*Math.sin(p)])}}const bot=addV([0,-r,0]);
    const idx=(b,a)=>1+(b-1)*NA+(a%NA);for(let a=0;a<NA;a++)F.push([top,idx(1,a+1),idx(1,a)]);for(let b=1;b<NB-1;b++)for(let a=0;a<NA;a++)F.push([idx(b,a),idx(b,a+1),idx(b+1,a+1),idx(b+1,a)]);for(let a=0;a<NA;a++)F.push([bot,idx(NB-1,a),idx(NB-1,a+1)])}
  // orient outward, normals, edges
  const cen=V.reduce((a,p)=>[a[0]+p[0]/V.length,a[1]+p[1]/V.length,a[2]+p[2]/V.length],[0,0,0]);
  const N=F.map((f,fi)=>{let nx=0,ny=0,nz=0;for(let i=0;i<f.length;i++){const p=V[f[i]],q=V[f[(i+1)%f.length]];nx+=(p[1]-q[1])*(p[2]+q[2]);ny+=(p[2]-q[2])*(p[0]+q[0]);nz+=(p[0]-q[0])*(p[1]+q[1])}
    let n=n3([nx,ny,nz]);const fc=f.reduce((a,i)=>[a[0]+V[i][0]/f.length,a[1]+V[i][1]/f.length,a[2]+V[i][2]/f.length],[0,0,0]);if(d3(n,s3(fc,cen))<0){F[fi]=f.slice().reverse();n=n.map(x=>-x)}return n});
  const E=new Map();F.forEach((f,fi)=>f.forEach((a,i)=>{const b=f[(i+1)%f.length],k=a<b?a+"-"+b:b+"-"+a;if(!E.has(k))E.set(k,{a:Math.min(a,b),b:Math.max(a,b),f:[]});E.get(k).f.push(fi)}));
  const edges=[...E.values()].map(e=>({...e,real:e.f.length<2||Math.acos(Math.max(-1,Math.min(1,d3(N[e.f[0]],N[e.f[1]]))))*DEG>25}));
  return{V,F,N,edges};
}
function rot3(p,yaw,pitch){const cy=Math.cos(yaw/DEG),sy=Math.sin(yaw/DEG),cp=Math.cos(pitch/DEG),sp=Math.sin(pitch/DEG);const x1=p[0]*cy+p[2]*sy,z1=-p[0]*sy+p[2]*cy;return[x1,p[1]*cp-z1*sp,p[1]*sp+z1*cp]}
function project(M,yaw,pitch){return{P:M.V.map(p=>rot3(p,yaw,pitch)),Nr:M.N.map(n=>rot3(n,yaw,pitch))}}
function edgeLayer(M,pr,map,opt){let s="",hid="";const vis=pr.Nr.map(n=>n[2]>1e-6);
  M.edges.forEach(e=>{const f=e.f.map(i=>vis[i]);const anyV=f.some(Boolean),sil=!e.real&&f.length===2&&f[0]!==f[1];if(!e.real&&!sil)return;
    const a=map(pr.P[e.a]),b=map(pr.P[e.b]);if(anyV||sil)s+=`<line x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}" stroke="var(--fg)" stroke-width="${opt.w||2}" stroke-linecap="round"/>`;
    else if(opt.hidden)hid+=`<line x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4"/>`});return hid+s}
function render3D(){
  const D=S.d3,d=dimsFor(D.solid),M=meshFor(D.solid,d);
  if(D.view==="net")return renderNet(D.solid,d);if(D.view==="views")return renderViews(M,d);
  const pr=project(M,D.yaw,D.pitch),R=Math.max(...M.V.map(p=>Math.hypot(...p))),sc=175/R,cx=W/2,cy=230,map=p=>[cx+p[0]*sc,cy-p[1]*sc];
  let s=`<svg viewBox="0 0 ${W} 470" id="sb3d" role="img" aria-label="${esc(solidName(D.solid,d))} — drag to turn it" style="touch-action:none;cursor:grab">`;
  const L=n3([-.45,.65,.6]);
  M.F.map((f,i)=>[f,i]).filter(([,i])=>pr.Nr[i][2]>1e-6).sort((a,b)=>avgZ(a[0])-avgZ(b[0])).forEach(([f,i])=>{const b=Math.max(0,d3(pr.Nr[i],L));
    const col=`hsl(214 ${D.solid==="sphere"?60:70}% ${fmt(52+34*b,1)}%)`;s+=`<polygon points="${f.map(k=>map(pr.P[k]).map(v=>fmt(v)).join(",")).join(" ")}" fill="${col}" fill-opacity=".9" stroke="${col}" stroke-width=".6" stroke-linejoin="round"/>`});
  function avgZ(f){return f.reduce((a,k)=>a+pr.P[k][2],0)/f.length}
  if(D.show.cubes&&(D.solid==="cube"||D.solid==="cuboid"))s+=unitCubes(M,pr,map,d);
  s+=edgeLayer(M,pr,map,{hidden:D.show.hidden});
  if(D.show.lab)s+=dimLabels(D.solid,d,M,pr,map,[cx,cy]);
  s+=`<text x="${W-12}" y="462" text-anchor="end" class="cb-tm" font-size="11">Drag to turn · yaw ${Math.round(D.yaw)}°, tilt ${Math.round(D.pitch)}°</text>`;
  return s+"</svg>";
}
function unitCubes(M,pr,map,d){const l=d.l??d.a,w=d.w??d.a,h=d.h??d.a;if([l,w,h].some(x=>!Number.isInteger(+x)||x>15))return"";let s="";
  const F=[[["x",-l/2],["y","z"]],[["x",l/2],["y","z"]],[["y",-h/2],["x","z"]],[["y",h/2],["x","z"]],[["z",-w/2],["x","y"]],[["z",w/2],["x","y"]]];const ext={x:l,y:h,z:w},ax={x:0,y:1,z:2};
  F.forEach(([[fa,fv],[u,v]])=>{const n=[0,0,0];n[ax[fa]]=Math.sign(fv);const nr=rot3(n,S.d3.yaw,S.d3.pitch);if(nr[2]<=1e-6)return;
    const line=(p,q)=>{const a=map(rot3(p,S.d3.yaw,S.d3.pitch)),b=map(rot3(q,S.d3.yaw,S.d3.pitch));return`<line x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}" stroke="var(--fg)" stroke-opacity=".35" stroke-width="1"/>`};
    for(let i=1;i<ext[u];i++){const p=[0,0,0],q=[0,0,0];p[ax[fa]]=q[ax[fa]]=fv;p[ax[u]]=q[ax[u]]=-ext[u]/2+i;p[ax[v]]=-ext[v]/2;q[ax[v]]=ext[v]/2;s+=line(p,q)}
    for(let i=1;i<ext[v];i++){const p=[0,0,0],q=[0,0,0];p[ax[fa]]=q[ax[fa]]=fv;p[ax[v]]=q[ax[v]]=-ext[v]/2+i;p[ax[u]]=-ext[u]/2;q[ax[u]]=ext[u]/2;s+=line(p,q)}});return s}
function dimLabels(id,d,M,pr,map,c2){let s="";const vis=pr.Nr.map(n=>n[2]>1e-6);
  const txt=(p,t)=>`<text x="${fmt(p[0])}" y="${fmt(p[1]+4)}" text-anchor="middle" class="cb-t" font-size="13" font-weight="700" fill="var(--accent)" style="paint-order:stroke;stroke:var(--panel);stroke-width:3.5px">${esc(t)}</text>`;
  const off=(m,k=18)=>{const u=unit(sub(m,c2));return add(m,mul(u,k))};
  const pickEdge=(test,label)=>{let best=null,bs=-1e9;M.edges.forEach(e=>{if(!e.real||!e.f.some(i=>vis[i]))return;const A=M.V[e.a],B=M.V[e.b];if(!test(A,B))return;const a=map(pr.P[e.a]),b=map(pr.P[e.b]),m=mul(add(a,b),.5);const sc=m[1]+Math.abs(m[0]-c2[0])*.2;if(sc>bs){bs=sc;best=m}});if(best)s+=txt(off(best),label)};
  const freeLine=(p,q,label,dashed)=>{const a=map(rot3(p,S.d3.yaw,S.d3.pitch)),b=map(rot3(q,S.d3.yaw,S.d3.pitch));s+=`<line x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}" stroke="var(--accent)" stroke-width="2" ${dashed?'stroke-dasharray="5 4"':""}/>`;const m=mul(add(a,b),.5),dd=sub(b,a),nn=unit([-dd[1],dd[0]]);s+=txt(add(m,mul(nn,14)),label)};
  const par=(i)=>(A,B)=>{const dv=s3(B,A);return Math.abs(dv[i])>1e-6&&Math.abs(dv[(i+1)%3])<1e-6&&Math.abs(dv[(i+2)%3])<1e-6};
  const u=" cm";
  if(id==="cube"){pickEdge(par(0),`${fmt(d.a)}${u}`);pickEdge(par(1),`${fmt(d.a)}${u}`);pickEdge(par(2),`${fmt(d.a)}${u}`)}
  if(id==="cuboid"){pickEdge(par(0),`l = ${fmt(d.l)}${u}`);pickEdge(par(1),`h = ${fmt(d.h)}${u}`);pickEdge(par(2),`w = ${fmt(d.w)}${u}`)}
  if(id==="prism"){pickEdge(par(0),`L = ${fmt(d.L)}${u}`);pickEdge((A,B)=>near(A[0],B[0])&&near(Math.abs(A[0]),d.L/2),`s = ${fmt(d.s)}${u}`)}
  if(id==="pyramid"||id==="tetra"){const h=id==="tetra"?d.s*Math.sqrt(2/3):d.h;pickEdge((A,B)=>near(A[1],B[1])&&A[1]<0,`s = ${fmt(d.s)}${u}`);if(id==="pyramid")freeLine([0,h/2,0],[0,-h/2,0],`h = ${fmt(d.h)}${u}`,true)}
  if(id==="cylinder"){const tv=rot3([0,1,0],S.d3.yaw,S.d3.pitch)[2]>0,bv=rot3([0,-1,0],S.d3.yaw,S.d3.pitch)[2]>0,y=tv?d.h/2:-d.h/2;freeLine([0,y,0],[d.r*Math.cos(.6),y,d.r*Math.sin(.6)],`r = ${fmt(d.r)}${u}`,!(tv||bv));freeLine([0,d.h/2,0],[0,-d.h/2,0],`h = ${fmt(d.h)}${u}`,true)}
  if(id==="cone"){const bot=rot3([0,-1,0],S.d3.yaw,S.d3.pitch)[2]>0;freeLine([0,-d.h/2,0],[d.r*Math.cos(.6),-d.h/2,d.r*Math.sin(.6)],`r = ${fmt(d.r)}${u}`,!bot);freeLine([0,d.h/2,0],[0,-d.h/2,0],`h = ${fmt(d.h)}${u}`,true)}
  if(id==="sphere")freeLine([0,0,0],rot3Inv([d.r,0,0]),`r = ${fmt(d.r)}${u}`,true);
  return s}
function rot3Inv(p){ // a point that projects to the right of centre whatever the rotation
  const yaw=S.d3.yaw/DEG,pitch=S.d3.pitch/DEG,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p[0];// inverse of rot3 for [x,0,0]
  const y2=0,z2=0,x1=x,yy=y2*cp+z2*sp,z1=-y2*sp+z2*cp;return[x1*cy-z1*sy,yy,x1*sy+z1*cy]}
function renderViews(M,d){const views=[["Front elevation",0,0],["Side elevation",-90,0],["Plan (from above)",0,90]];const R=Math.max(...M.V.map(p=>Math.hypot(...p))),sc=88/R;
  let s=`<svg viewBox="0 0 ${W} 330" role="img" aria-label="Front, side and plan views">`;
  views.forEach(([t,yw,pt],i)=>{const cx=113+i*227,cy=170,pr=project(M,yw,pt),map=p=>[cx+p[0]*sc,cy-p[1]*sc];
    s+=`<rect x="${cx-105}" y="40" width="210" height="260" rx="10" fill="var(--line2)"/><text x="${cx}" y="28" text-anchor="middle" class="cb-tt" font-size="14">${t}</text>`;
    const vis=pr.Nr.map(n=>n[2]>1e-6);M.F.forEach((f,fi)=>{if(vis[fi])s+=`<polygon points="${f.map(k=>map(pr.P[k]).map(v=>fmt(v)).join(",")).join(" ")}" fill="var(--panel)" stroke="var(--panel)" stroke-width="1.2"/>`});
    s+=edgeLayer(M,pr,map,{hidden:S.d3.show.hidden,w:2})});
  s+=`<text x="${W/2}" y="322" text-anchor="middle" class="cb-tm" font-size="11">Dashed lines are edges you cannot see from that side.</text>`;return s+"</svg>"}
function renderNet(id,d){
  const polys=[],labels=[],circles=[],sectors=[];let note="";
  const rect=(x,y,w,h,t)=>{polys.push([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);if(t)labels.push([x+w/2,y+h/2,t,1])};
  const elab=(a,b,t)=>labels.push([(a[0]+b[0])/2,(a[1]+b[1])/2,t,0,a,b]);
  const regOnEdge=(p,q,n,out)=>{ // regular n-gon built on edge p→q on the side given by out (+1/-1)
    const pts=[p,q];let a=p,b=q;for(let i=2;i<n;i++){const d=sub(b,a),ang=out*(2*Math.PI/n),c=[b[0]+d[0]*Math.cos(ang)-d[1]*Math.sin(ang),b[1]+d[0]*Math.sin(ang)+d[1]*Math.cos(ang)];pts.push(c);a=b;b=c}return pts};
  if(id==="cube"||id==="cuboid"){const l=id==="cube"?d.a:d.l,w=id==="cube"?d.a:d.w,h=id==="cube"?d.a:d.h;
    rect(w,0,l,w,"top");rect(w,w,l,h,"front");rect(0,w,w,h,"side");rect(w+l,w,w,h,"side");rect(w,w+h,l,w,"bottom");rect(w,2*w+h,l,h,"back");
    elab([w,w+h],[w+l,w+h],`${fmt(l)} cm`);elab([2*w+l,w+h],[2*w+l,w],`${fmt(h)} cm`);elab([0,w+h],[w,w+h],`${fmt(w)} cm`)}
  else if(id==="prism"){const n=Math.round(d.n),s=d.s,L=d.L;for(let i=0;i<n;i++)rect(i*s,0,s,L,"");polys.push(regOnEdge([2*s,0],[s,0],n,-1));polys.push(regOnEdge([s,L],[2*s,L],n,-1));
    elab([0,L],[s,L],`${fmt(s)} cm`);elab([0,0],[0,L],`${fmt(L)} cm`)}
  else if(id==="pyramid"||id==="tetra"){const n=id==="tetra"?3:Math.round(d.n),s=d.s,ap=s/(2*Math.tan(Math.PI/n)),sl=id==="tetra"?s*Math.sqrt(3)/2:Math.hypot(d.h,ap);
    const base=regOnEdge([0,0],[s,0],n,-1);polys.push(base);base.forEach((p,i)=>{const q=base[(i+1)%n],m=mul(add(p,q),.5),dd=sub(q,p),nrm=unit([dd[1],-dd[0]]);// outward for this orientation
      const cen=vCentre(base),o=dot(nrm,sub(m,cen))>0?nrm:mul(nrm,-1);polys.push([p,q,add(m,mul(o,sl))])});
    elab(base[0],base[1],`${fmt(s)} cm`);if(id==="pyramid")note=`Slant height of each triangle = √(h² + ${fmt(ap,2)}²) ≈ ${fmt(sl,2)} cm`}
  else if(id==="cylinder"){const C=2*Math.PI*d.r,h=d.h;rect(0,0,C,h,"curved surface");circles.push([C/2,-d.r,d.r],[C/2,h+d.r,d.r]);elab([0,h],[C,h],`2πr ≈ ${fmt(C,1)} cm`);elab([0,0],[0,h],`${fmt(h)} cm`)}
  else if(id==="cone"){const l=Math.hypot(d.r,d.h),th=360*d.r/l;sectors.push([0,0,l,th]);circles.push([0,l+d.r,d.r]);{const a=(90+th/2)/DEG;labels.push([l*Math.cos(a)/2,l*Math.sin(a)/2-.35,`l ≈ ${fmt(l,2)} cm`,0,[0,0],[0,0]])}labels.push([0,l+d.r,`r = ${fmt(d.r)} cm`,1]);note=`Slant height l = √(r² + h²) ≈ ${fmt(l,2)} cm · sector angle = 360° × r ÷ l ≈ ${fmt(th,1)}°`}
  else return`<div class="hidden-chart"><div><b>A sphere has no net</b>Its curved surface cannot be flattened without stretching or tearing.</div></div>`;
  // fit
  const pts=[...polys.flat(),...circles.flatMap(([x,y,r])=>[[x-r,y-r],[x+r,y+r]]),...sectors.flatMap(([x,y,l,th])=>{const a=[];for(let k=0;k<=24;k++){const t=(90-th/2+th*k/24)/DEG;a.push([x+l*Math.cos(t),y+l*Math.sin(t)])}a.push([x,y]);return a})];
  const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0])),minY=Math.min(...pts.map(p=>p[1])),maxY=Math.max(...pts.map(p=>p[1]));
  const sc=Math.min(600/(maxX-minX||1),400/(maxY-minY||1)),ox=(W-(maxX-minX)*sc)/2-minX*sc,oy=30-minY*sc,m=p=>[ox+p[0]*sc,oy+p[1]*sc];
  let s=`<svg viewBox="0 0 ${W} ${fmt((maxY-minY)*sc+80)}" role="img" aria-label="Net of the solid">`;
  polys.forEach((pg,i)=>{s+=`<polygon points="${pg.map(p=>m(p).map(v=>fmt(v)).join(",")).join(" ")}" fill="var(--c1)" fill-opacity="${i%2?.16:.24}" stroke="var(--fg)" stroke-width="1.8" stroke-linejoin="round"/>`});
  circles.forEach(([x,y,r])=>{const c=m([x,y]);s+=`<circle cx="${fmt(c[0])}" cy="${fmt(c[1])}" r="${fmt(r*sc)}" fill="var(--c1)" fill-opacity=".24" stroke="var(--fg)" stroke-width="1.8"/>`});
  sectors.forEach(([x,y,l,th])=>{const c=m([x,y]),a1=(90-th/2)/DEG,a2=(90+th/2)/DEG,p1=m([x+l*Math.cos(a1),y+l*Math.sin(a1)]),p2=m([x+l*Math.cos(a2),y+l*Math.sin(a2)]);s+=`<path d="M${fmt(c[0])} ${fmt(c[1])} L${fmt(p1[0])} ${fmt(p1[1])} A${fmt(l*sc)} ${fmt(l*sc)} 0 ${th>180?1:0} 1 ${fmt(p2[0])} ${fmt(p2[1])} Z" fill="var(--c1)" fill-opacity=".16" stroke="var(--fg)" stroke-width="1.8"/>`});
  labels.forEach(([x,y,t,inside,a,b])=>{let p=m([x,y]);if(!inside){const A=m(a),B=m(b),dd=sub(B,A),nn=unit([dd[1],-dd[0]]);p=add(p,mul(nn,-14))}
    s+=`<text x="${fmt(p[0])}" y="${fmt(p[1]+4)}" text-anchor="middle" class="${inside?"cb-tm":"cb-t"}" font-size="${inside?11:12.5}" font-weight="${inside?500:700}" ${inside?"":'fill="var(--accent)"'} style="paint-order:stroke;stroke:var(--panel);stroke-width:3px">${esc(t)}</text>`});
  if(note)s+=`<text x="${W/2}" y="${fmt((maxY-minY)*sc+70)}" text-anchor="middle" class="cb-tm" font-size="12">${esc(note)}</text>`;
  return s+"</svg>"}

/* ------------------------------------------------------------------ 3D facts */
function solidName(id,d){const n=Math.round(d.n||0);const pn={3:"Triangular",4:"Square",5:"Pentagonal",6:"Hexagonal",7:"Heptagonal",8:"Octagonal"};
  if(id==="prism")return n===4&&near(d.s,d.L)?"Cube (square prism)":`${pn[n]||n+"-sided"} prism`;if(id==="pyramid")return`${pn[n]||n+"-sided"}-based pyramid`;if(id==="tetra")return"Tetrahedron (triangular-based pyramid)";return SOLIDS.find(s=>s.id===id).n}
function solidFacts(id,d){const n=Math.round(d.n||0),pi=Math.PI,cm3=" cm³",cm2=" cm²";let o={};
  const regA=(n,s)=>n*s*s/(4*Math.tan(pi/n));
  switch(id){
    case"cube":o={F:6,E:12,Vx:8,faces:"6 squares",prism:"Yes — a square prism",V:d.a**3,SA:6*d.a*d.a,stage7:true,
      Vw:[`V = a³ = ${fmt(d.a)} × ${fmt(d.a)} × ${fmt(d.a)} = <b>${fmt(d.a**3)}${cm3}</b>`],SAw:[`6 faces, each a square of area ${fmt(d.a)} × ${fmt(d.a)} = ${fmt(d.a*d.a)}${cm2}`,`SA = 6a² = 6 × ${fmt(d.a*d.a)} = <b>${fmt(6*d.a*d.a)}${cm2}</b>`]};break;
    case"cuboid":{const{l,w,h}=d;o={F:6,E:12,Vx:8,faces:"6 rectangles, in 3 equal pairs",prism:"Yes — a rectangular prism",V:l*w*h,SA:2*(l*w+l*h+w*h),stage7:true,
      Vw:[`V = length × width × height = ${fmt(l)} × ${fmt(w)} × ${fmt(h)} = <b>${fmt(l*w*h)}${cm3}</b>`],
      SAw:[`Top and bottom: 2 × ${fmt(l)} × ${fmt(w)} = ${fmt(2*l*w)}${cm2}`,`Front and back: 2 × ${fmt(l)} × ${fmt(h)} = ${fmt(2*l*h)}${cm2}`,`Two ends: 2 × ${fmt(w)} × ${fmt(h)} = ${fmt(2*w*h)}${cm2}`,`SA = ${fmt(2*l*w)} + ${fmt(2*l*h)} + ${fmt(2*w*h)} = <b>${fmt(2*(l*w+l*h+w*h))}${cm2}</b>`]};break}
    case"prism":{const A=regA(n,d.s);o={F:n+2,E:3*n,Vx:2*n,faces:`2 ${POLY[n]?.toLowerCase()||n+"-gon"}s (the ends) and ${n} rectangles`,prism:"Yes",V:A*d.L,SA:2*A+n*d.s*d.L,
      Vw:[`Area of the end face (regular ${POLY[n]?.toLowerCase()}) ≈ ${fmt(A,2)}${cm2}`,`V = area of cross-section × length ≈ ${fmt(A,2)} × ${fmt(d.L)} ≈ <b>${fmt(A*d.L,2)}${cm3}</b>`],
      SAw:[`Two ends: 2 × ${fmt(A,2)} ≈ ${fmt(2*A,2)}${cm2}`,`${n} rectangles: ${n} × ${fmt(d.s)} × ${fmt(d.L)} = ${fmt(n*d.s*d.L)}${cm2}`,`SA ≈ <b>${fmt(2*A+n*d.s*d.L,2)}${cm2}</b>`]};break}
    case"pyramid":case"tetra":{const nn=id==="tetra"?3:n,s=d.s,h=id==="tetra"?s*Math.sqrt(2/3):d.h,A=regA(nn,s),ap=s/(2*Math.tan(pi/nn)),sl=Math.hypot(h,ap);
      o={F:nn+1,E:2*nn,Vx:nn+1,faces:id==="tetra"?"4 equilateral triangles":`1 ${POLY[nn]?.toLowerCase()} base and ${nn} triangles`,prism:"No — the cross-section shrinks to the apex",V:A*h/3,SA:A+nn*s*sl/2,
      Vw:[`Base area ≈ ${fmt(A,2)}${cm2}${id==="tetra"?`, height ≈ ${fmt(h,2)} cm`:""}`,`V = ⅓ × base area × height ≈ ⅓ × ${fmt(A,2)} × ${fmt(h,2)} ≈ <b>${fmt(A*h/3,2)}${cm3}</b>`],
      SAw:[`Base ≈ ${fmt(A,2)}${cm2}`,`${nn} triangles: ${nn} × ½ × ${fmt(s)} × ${fmt(sl,2)} ≈ ${fmt(nn*s*sl/2,2)}${cm2}`,`SA ≈ <b>${fmt(A+nn*s*sl/2,2)}${cm2}</b>`]};break}
    case"cylinder":{const{r,h}=d;o={F:"3 (2 flat, 1 curved)",E:2,Vx:0,faces:"2 circles and 1 curved surface",prism:"Yes — a circular prism",V:pi*r*r*h,SA:2*pi*r*r+2*pi*r*h,
      Vw:[`V = πr²h = π × ${fmt(r)}² × ${fmt(h)} ≈ <b>${fmt(pi*r*r*h,2)}${cm3}</b>`],SAw:[`Two circles: 2πr² ≈ ${fmt(2*pi*r*r,2)}${cm2}`,`Curved surface: 2πrh ≈ ${fmt(2*pi*r*h,2)}${cm2}`,`SA ≈ <b>${fmt(2*pi*r*r+2*pi*r*h,2)}${cm2}</b>`]};break}
    case"cone":{const{r,h}=d,l=Math.hypot(r,h);o={F:"2 (1 flat, 1 curved)",E:1,Vx:"1 (the apex)",faces:"1 circle and 1 curved surface",prism:"No",V:pi*r*r*h/3,SA:pi*r*r+pi*r*l,
      Vw:[`V = ⅓πr²h = ⅓ × π × ${fmt(r)}² × ${fmt(h)} ≈ <b>${fmt(pi*r*r*h/3,2)}${cm3}</b>`],SAw:[`Slant height l = √(${fmt(r)}² + ${fmt(h)}²) ≈ ${fmt(l,2)} cm`,`SA = πr² + πrl ≈ ${fmt(pi*r*r,2)} + ${fmt(pi*r*l,2)} ≈ <b>${fmt(pi*r*r+pi*r*l,2)}${cm2}</b>`]};break}
    case"sphere":{const{r}=d;o={F:"1 curved",E:0,Vx:0,faces:"1 curved surface",prism:"No",V:4/3*pi*r**3,SA:4*pi*r*r,Vw:[`V = ⁴⁄₃πr³ ≈ <b>${fmt(4/3*pi*r**3,2)}${cm3}</b>`],SAw:[`SA = 4πr² ≈ <b>${fmt(4*pi*r*r,2)}${cm2}</b>`]};break}
  }return o}

/* ------------------------------------------------------------------ panels */
const step=(n,h)=>`<div class="cb-step"><span class="no">${n}</span><div>${h}</div></div>`;
const row=(k,v)=>`<tr><th class="l">${k}</th><td class="l">${v}</td></tr>`;
function facts2D(){
  const D=S.d2;
  if(D.preset==="circle"){const r=num(D.circle.r)||4;return{name:"Circle",chips:["curved","1 centre"],table:row("Radius r",`${fmt(r)} cm`)+row("Diameter d = 2r",`${fmt(2*r)} cm`)+row("Circumference = 2πr",`≈ ${fmt(2*Math.PI*r,2)} cm <span class="sb-ext">later stages</span>`)+row("Area = πr²",`≈ ${fmt(Math.PI*r*r,2)} cm² <span class="sb-ext">later stages</span>`)+row("Lines of symmetry","infinitely many (every diameter)")+row("Rotational symmetry","any angle — infinite order"),
    work:[`<b>Centre</b> — the fixed point O; every point on the circle is the same distance from it.`,`<b>Radius</b> — from the centre to the circumference (${fmt(r)} cm). <b>Diameter</b> — a chord through the centre, twice the radius (${fmt(2*r)} cm).`,`<b>Chord</b> — a straight line joining two points on the circumference. <b>Arc</b> — part of the circumference.`,`<b>Sector</b> — the region between two radii and an arc. <b>Segment</b> — the region between a chord and an arc.`,`<b>Tangent</b> — a straight line that touches the circle at exactly one point. <b>Circumference</b> — the perimeter of the circle.`]}}
  const V=D.v,n=V.length,c=classify(V),sy=symmetry(V),L=c.L,A=c.A,ar=Math.abs(sArea(V)),per=L.reduce((a,b)=>a+b,0);
  const side=i=>LET[i]+LET[(i+1)%n];
  const par=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if((j===i+1)||(i===0&&j===n-1))continue;if(parallel(V[i],V[(i+1)%n],V[j],V[(j+1)%n]))par.push(`${side(i)} ∥ ${LET[(j+1)%n]}${LET[j]}`)}
  if(n===3)par.length=0;
  const eqG={};L.forEach((l,i)=>{const k=fmt(l,4);(eqG[k]=eqG[k]||[]).push(side(i))});const eq=Object.values(eqG).filter(g=>g.length>1).map(g=>g.join(" = "));
  let diag="";if(n===4){const d1=dist(V[0],V[2]),d2=dist(V[1],V[3]),perp=Math.abs(dot(sub(V[2],V[0]),sub(V[3],V[1])))<1e-6;const m1=mul(add(V[0],V[2]),.5),m2=mul(add(V[1],V[3]),.5),bis=dist(m1,m2)<1e-6;
    diag=`AC = ${fmt(d1,1)} cm, BD = ${fmt(d2,1)} cm · ${near(d1,d2,1e-6)?"equal":"not equal"} · ${perp?"meet at 90°":"not perpendicular"} · ${bis?"bisect each other":"do not bisect each other"}`}
  const hi=heightInfo(V,c),F=x=>`<span style="font-size:12px;color:var(--fg2);font-style:italic">${x}</span>`;
  const perF=`${F((c.regular?`P = ${n} × side`:`P = sum of all sides`))}<br>${L.map((_,i)=>side(i)).join(" + ")} = ${L.map(l=>fmt(l,2)).join(" + ")} ${L.some(l=>!near(l,Math.round(l*100)/100,1e-9))?"≈":"="} <b>${fmt(per,2)} cm</b>`;
  let areaF;
  if(c.name==="Square"||c.name==="Rectangle")areaF=`${F("A = length × width")}<br>${fmt(L[0],2)} × ${fmt(L[1],2)} = <b>${fmt(ar,2)} cm²</b>`;
  else if(n===3&&hi)areaF=`${F("A = ½ × base × height")}<br>½ × ${fmt(hi.b,2)} × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>`;
  else if(hi&&/Parallelogram|Rhombus/.test(c.name))areaF=`${F("A = base × height")}<br>${fmt(hi.b,2)} × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>`;
  else if(hi&&/rapezium/.test(c.name)){const o=hi.base[0]===0?L[2]:L[3];areaF=`${F("A = ½ × (a + b) × h")}<br>½ × (${fmt(hi.b,2)} + ${fmt(o,2)}) × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>`}
  else if(c.name==="Kite"){const d1=dist(V[0],V[2]),d2=dist(V[1],V[3]);areaF=`${F("A = ½ × diagonal₁ × diagonal₂")}<br>½ × ${fmt(d1,2)} × ${fmt(d2,2)} = <b>${fmt(ar,2)} cm²</b>`}
  else if(!selfIntersects(V)){const T=triangulate(V),parts=T.map(t=>({name:t.map(i=>LET[i]).join(""),a:Math.abs(sArea(t.map(i=>V[i])))}));
    areaF=`${F(`A = ${parts.map(p=>"area "+p.name).join(" + ")}`)}<br>${parts.map(p=>fmt(p.a,2)).join(" + ")} = <b>${fmt(ar,2)} cm²</b>`}
  else areaF=`<b>${fmt(ar,2)} cm²</b>`;
  const table=row("Sides / vertices",`${n} / ${n}`)+row("Side lengths",L.map((l,i)=>`${side(i)} = ${fmt(l,1)}`).join(", ")+" cm")+row("Angles",A.map((a,i)=>`∠${LET[i]} = ${fmt(a,1)}°`).join(", "))+
    row("Angle sum",`${fmt(A.reduce((a,b)=>a+b,0),1)}°`)+(eq.length?row("Equal sides",eq.join("; ")):"")+(n>3?row("Parallel sides",par.length?par.join("; "):"none"):"")+(diag?row("Diagonals",diag):n>4?row("Diagonals",`${n*(n-3)/2}`):"")+
    row("Lines of symmetry",String(sy.lines.length))+row("Rotational symmetry",`order ${sy.order}`)+row("Perimeter",perF)+row("Area",areaF);
  const chips=[c.fam,c.concave?"concave":"convex",c.regular?"regular":"irregular"];
  // working
  const work=[];let k=1;
  work.push(`<b>Perimeter</b> = ${L.map(l=>fmt(l,1)).join(" + ")} = <b>${fmt(per,1)} cm</b>${L.some(l=>!near(l,Math.round(l),1e-6))?" (lengths rounded to 1 d.p.)":""}`);
  work.push(`<b>Angle sum</b>: a ${n}-sided polygon splits into ${n-2} triangle${n-2>1?"s":""} from one vertex, so the angles add up to (${n} − 2) × 180° = <b>${(n-2)*180}°</b>.${c.regular?` Each angle of the regular polygon = ${(n-2)*180} ÷ ${n} = ${fmt((n-2)*180/n,2)}°.`:""}`);
  if(c.name==="Square"||c.name==="Rectangle")work.push(`<b>Area</b> = length × width = ${fmt(L[0],2)} × ${fmt(L[1],2)} = <b>${fmt(ar,2)} cm²</b>`);
  else if(n===3&&hi)work.push(`<b>Area</b> = ½ × base × perpendicular height = ½ × ${fmt(hi.b,2)} × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>${hi.t<0||hi.t>1?" — the height falls outside the triangle, so the base line is extended.":""}`);
  else if(hi&&/Parallelogram|Rhombus/.test(c.name))work.push(`<b>Area</b> = base × perpendicular height = ${fmt(hi.b,2)} × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>`);
  else if(hi&&/rapezium/.test(c.name)){const o=hi.base[0]===0?L[2]:L[3];work.push(`<b>Area</b> = ½ × (sum of parallel sides) × height = ½ × (${fmt(hi.b,2)} + ${fmt(o,2)}) × ${fmt(hi.h,2)} = <b>${fmt(ar,2)} cm²</b>`)}
  else if(!selfIntersects(V)){const T=triangulate(V);const parts=T.map(t=>{const tv=t.map(i=>V[i]);return{name:t.map(i=>LET[i]).join(""),a:Math.abs(sArea(tv))}});
    work.push(`<b>Area</b>: split the shape into ${T.length} triangles — ${parts.map(p=>`${p.name} = ${fmt(p.a,2)}`).join(", ")} cm². Total = ${parts.map(p=>fmt(p.a,2)).join(" + ")} = <b>${fmt(ar,2)} cm²</b>`+(c.name.includes("L-shape")||n===6?" (you can also split it into rectangles).":""))}
  work.push(`<b>Symmetry</b>: ${sy.lines.length} line${sy.lines.length===1?"":"s"} of symmetry; rotational symmetry of order ${sy.order}${c.regular?` — a regular polygon with ${n} sides has ${n} lines and order ${n}`:""}.`);
  if(D.tr.type!=="none"){const img=transformImage(V);work.push(`<b>${esc(trDescribe())}</b>. ${D.tr.type==="enlarge"?`Every length is multiplied by ${fmt(num(D.tr.sf))} and the area by ${fmt(num(D.tr.sf)**2)}; the angles stay the same, so the image is <i>similar</i>.`:"The image is <i>congruent</i> to the object: same lengths and angles, only the position"+(D.tr.type==="translate"?" changes.":" and orientation change.")}<div class="tbl-wrap" style="margin-top:6px"><table class="cb-k"><thead><tr><th>Object</th><th>Image</th></tr></thead><tbody>${V.map((p,i)=>`<tr><td>${LET[i]} (${fmt(p[0])}, ${fmt(p[1])})</td><td>${LET[i]}′ (${fmt(img[i][0])}, ${fmt(img[i][1])})</td></tr>`).join("")}</tbody></table></div>`)}
  return{name:c.name,chips,table,work};
}
function facts3D(){const D=S.d3,d=dimsFor(D.solid),f=solidFacts(D.solid,d),name=solidName(D.solid,d);const poly=typeof f.F==="number"&&typeof f.Vx==="number";
  const table=row("Faces",f.F)+row("Edges",f.E)+row("Vertices",f.Vx)+row("The faces",f.faces)+row("Is it a prism?",f.prism)+row("Volume",`${f.stage7?"":"≈ "}${fmt(f.V,2)} cm³${f.stage7?"":' <span class="sb-ext">later stages</span>'}`)+row("Surface area",`${f.stage7?"":"≈ "}${fmt(f.SA,2)} cm²${f.stage7?"":' <span class="sb-ext">later stages</span>'}`);
  const work=[];if(poly)work.push(`<b>Euler's check</b>: faces + vertices − edges = ${f.F} + ${f.Vx} − ${f.E} = <b>${f.F+f.Vx-f.E}</b> (always 2 for a solid with flat faces).`);
  work.push(`<b>Volume</b>: `+f.Vw.join("<br>"));work.push(`<b>Surface area</b>: `+f.SAw.join("<br>")+(D.view!=="net"&&D.solid!=="sphere"?` — switch to <i>Net</i> to see every face laid flat.`:""));
  if(D.solid==="cuboid"||D.solid==="cube")work.push(`<b>Capacity</b>: 1 cm³ = 1 ml, so this holds ${fmt(f.V)} ml${f.V>=1000?` = ${fmt(f.V/1000,3)} litres`:""}.`);
  return{name,chips:[poly?"flat faces":"curved surface",f.prism.startsWith("Yes")?"prism":"not a prism"],table,work}}
function practiceQs(){
  if(S.mode==="2d"){const D=S.d2;if(D.preset==="circle"){const r=num(D.circle.r)||4;return[qRow(`The radius is ${fmt(r)} cm. What is the diameter?`,2*r),qRow("How many lines of symmetry does a circle have? (type 0 for infinitely many)",0)]}
    const V=D.v,c=classify(V),sy=symmetry(V),n=V.length,L=c.L,ar=Math.abs(sArea(V)),per=L.reduce((a,b)=>a+b,0);
    const names=["Square","Rectangle","Rhombus","Parallelogram","Trapezium","Isosceles trapezium","Kite","Arrowhead (concave kite)","Equilateral triangle"];
    const q=[];if(names.includes(c.name))q.push(qRow("What is the name of this shape?",c.name,"sel",names));
    q.push(qRow("How many lines of symmetry?",sy.lines.length),qRow("What is the order of rotational symmetry?",sy.order),qRow("What do the interior angles add up to? (°)",(n-2)*180),qRow("Perimeter (cm, to 1 d.p.)",Math.round(per*10)/10,"tol1"),qRow("Area (cm², to 1 d.p.)",Math.round(ar*10)/10,"tol1"));
    if(D.tr.type!=="none"){const img=transformImage(V);q.push(qRow(`Under the ${esc(trDescribe().toLowerCase())}, what is the x-coordinate of A′?`,img[0][0]),qRow("…and the y-coordinate of A′?",img[0][1]))}
    return q}
  const D=S.d3,d=dimsFor(D.solid),f=solidFacts(D.solid,d);const q=[];
  if(typeof f.F==="number")q.push(qRow("How many faces?",f.F),qRow("How many edges?",f.E),qRow("How many vertices?",f.Vx));else q.push(qRow("How many edges?",f.E));
  if(f.stage7)q.push(qRow("Volume (cm³)",f.V),qRow("Surface area (cm²)",f.SA));else q.push(qRow("Volume (cm³, to 1 d.p.)",Math.round(f.V*10)/10,"tol1"));
  return q}
function qRow(text,ans,kind="num",opts){const id="sq"+Math.random().toString(36).slice(2,8);
  const ctl=kind==="sel"?`<select id="${id}" data-ans="${esc(ans)}" data-kind="sel"><option value="">Choose…</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select>`
    :`<input type="number" step="any" id="${id}" data-ans="${ans}" data-tol="${kind==="tol1"?0.11:0.001}" inputmode="decimal">`;
  return`<div class="q"><label for="${id}">${text}</label>${ctl}<span class="mark" aria-live="polite"></span></div>`}
function checkAll(){let r=0,t=0;root.querySelectorAll("#sbWork [data-ans]").forEach(el=>{t++;const q=el.closest(".q"),m=q.querySelector(".mark");const ok=el.dataset.kind==="sel"?el.value===el.dataset.ans:(el.value!==""&&Math.abs(num(el.value)-num(el.dataset.ans))<=num(el.dataset.tol));if(ok)r++;q.classList.toggle("ok",ok);q.classList.toggle("bad",!ok);m.textContent=ok?"✓":"✗";m.className="mark "+(ok?"ok":"bad")});const sc=$("#sbScore");if(sc)sc.textContent=`${r} / ${t} correct${r===t&&t?" — well done!":""}`}
function revealAll(){root.querySelectorAll("#sbWork [data-ans]").forEach(el=>{el.value=el.dataset.kind==="sel"?el.dataset.ans:fmt(num(el.dataset.ans),2)});checkAll()}

/* ------------------------------------------------------------------ UI */
function icon2(p){const sh={square:[[3,3],[21,3],[21,21],[3,21]],rectangle:[[2,6],[26,6],[26,20],[2,20]],parallelogram:[[2,20],[19,20],[26,6],[9,6]],rhombus:[[14,2],[25,13],[14,24],[3,13]],kite:[[14,2],[22,9],[14,25],[6,9]],trapezium:[[2,21],[26,21],[20,6],[6,6]],isotrap:[[2,21],[26,21],[19,6],[9,6]],
  "tri-eq":[[3,22],[25,22],[14,3]],"tri-iso":[[4,22],[24,22],[14,2]],"tri-sca":[[2,22],[26,22],[8,5]],"tri-right":[[4,22],[24,22],[4,4]],"tri-obt":[[2,22],[14,22],[26,6]],regular:regularPoly(6,11,[14,13]).map(([x,y])=>[x,26-y]),lshape:[[3,23],[25,23],[25,15],[11,15],[11,3],[3,3]],arrow:[[14,3],[25,23],[14,16],[3,23]],custom:[[3,21],[10,4],[24,9],[20,23]]}[p.id];
  if(p.id==="circle")return`<circle cx="14" cy="13" r="10" fill="var(--c1)" fill-opacity=".2" stroke="var(--c1)" stroke-width="2"/><line x1="14" y1="13" x2="22" y2="7" stroke="var(--c1)" stroke-width="2"/>`;
  return`<polygon points="${sh.map(q=>q.join(",")).join(" ")}" fill="var(--c1)" fill-opacity=".2" stroke="var(--c1)" stroke-width="2" stroke-linejoin="round"/>`}
function icon3(id){return{cube:`<path d="M6 9l9-5 9 5v10l-9 5-9-5z M6 9l9 5 9-5 M15 14v10" fill="none" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,cuboid:`<path d="M3 10l8-5h15l-8 5z M3 10h15v11H3z M18 10l8-5v11l-8 5" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,
  prism:`<path d="M4 21l5-12 5 12z M9 9h14l5 12H14 M23 9" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,pyramid:`<path d="M15 3L3 20l9 4 13-5z M15 3l-3 21 M15 3l10 16" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,
  tetra:`<path d="M15 3L4 21h21z M15 3l-2 18" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,cylinder:`<ellipse cx="15" cy="6" rx="9" ry="3" fill="none" stroke="var(--c1)" stroke-width="1.8"/><path d="M6 6v14a9 3 0 0 0 18 0V6" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8"/>`,
  cone:`<path d="M15 3L6 20a9 3 0 0 0 18 0z" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8" stroke-linejoin="round"/>`,sphere:`<circle cx="15" cy="13" r="10" fill="var(--c1)" fill-opacity=".15" stroke="var(--c1)" stroke-width="1.8"/><ellipse cx="15" cy="13" rx="10" ry="3.5" fill="none" stroke="var(--c1)" stroke-width="1" stroke-dasharray="2 2"/>`}[id]}
const chk=(id,on,label)=>`<label class="sb-chk"><input type="checkbox" id="${id}" ${on?"checked":""}> ${label}</label>`;
function controls(){
  if(S.mode==="2d"){const D=S.d2,isC=D.preset==="circle",isCustom=D.preset==="custom",p=PRESETS2.find(x=>x.id===D.preset);
    let h=`<section class="panel"><h2>Pick a shape</h2><div class="types sb-types">${PRESETS2.map(x=>`<button class="type" data-p2="${x.id}" aria-pressed="${D.preset===x.id}"><svg viewBox="0 0 28 26" aria-hidden="true">${icon2(x)}</svg><span>${x.n}</span></button>`).join("")}</div>`;
    if(p&&p.reg==="n")h+=`<div class="cb-field" style="margin-top:10px"><label for="regN">Number of sides</label><input type="range" id="regN" min="3" max="12" value="${D.regN}"><span class="sb-val">${D.regN} sides — ${POLY[D.regN]}</span></div>`;
    if(!isC)h+=`<p class="cb-hint" style="margin-top:10px">${isCustom?"Drag the corners. Press an orange <b>+</b> to add a corner on that side.":"Drag any corner to change the shape — the name and facts update as you go."}</p>`+(isCustom?`<div class="btns" style="margin-top:8px"><button class="cb-btn" id="sbDel" ${D.v.length<=3?"disabled":""}>Remove last corner</button></div>`:"");
    h+=`</section>`;
    if(isC)h+=`<section class="panel"><h2>Circle</h2><div class="cb-field"><label for="cR">Radius (cm)</label><input type="range" id="cR" min="1" max="7.5" step=".5" value="${num(D.circle.r)||4}"><span class="sb-val">r = ${fmt(num(D.circle.r)||4)} cm</span></div><div class="sb-chks">${CPARTS.map(([k,l])=>chk("cp_"+k,D.circle.parts[k],l)).join("")}</div></section>`;
    else{h+=`<section class="panel"><h2>Show on the drawing</h2><div class="sb-chks">${chk("sh_len",D.show.len,"Side lengths")}${chk("sh_ang",D.show.ang,"Angles")}${chk("sh_lab",D.show.lab,"Corner letters")}${chk("sh_ht",D.show.ht,"Perpendicular height")}${chk("sh_diag",D.show.diag,"Diagonals")}${chk("sh_sym",D.show.sym,"Lines of symmetry")}</div>
      <div class="cb-field" style="margin-top:10px"><label for="snap">Corners snap to</label><select id="snap"><option value="1" ${D.snap==1?"selected":""}>whole squares</option><option value=".5" ${D.snap==.5?"selected":""}>half squares</option><option value="0" ${D.snap==0?"selected":""}>anywhere</option></select></div></section>`;
      const T=D.tr;h+=`<section class="panel"><h2>Transform it</h2><div class="cb-field"><label for="trT">Transformation</label><select id="trT">${[["none","None"],["reflect","Reflection"],["rotate","Rotation"],["translate","Translation"],["enlarge","Enlargement"]].map(([v,l])=>`<option value="${v}" ${T.type===v?"selected":""}>${l}</option>`).join("")}</select></div>`;
      if(T.type==="reflect")h+=`<div class="row2" style="margin-top:8px"><div class="cb-field"><label for="trL">Mirror line</label><select id="trL">${[["x-axis","x-axis"],["y-axis","y-axis"],["x=k","x = k"],["y=k","y = k"],["y=x","y = x"],["y=-x","y = −x"]].map(([v,l])=>`<option value="${v}" ${T.line===v?"selected":""}>${l}</option>`).join("")}</select></div>${/=k/.test(T.line)?`<div class="cb-field"><label for="trK">k</label><input type="number" id="trK" step=".5" value="${T.k}"></div>`:""}</div>`;
      if(T.type==="rotate")h+=`<div class="cb-field" style="margin-top:8px"><label for="trA">Angle</label><select id="trA"><option value="90cw" ${T.ang==="90cw"?"selected":""}>90° clockwise</option><option value="90ccw" ${T.ang==="90ccw"?"selected":""}>90° anticlockwise</option><option value="180" ${T.ang==="180"?"selected":""}>180°</option></select></div>`;
      if(T.type==="rotate"||T.type==="enlarge")h+=`<div class="row2" style="margin-top:8px"><div class="cb-field"><label for="trCx">Centre x</label><input type="number" id="trCx" value="${T.cx}"></div><div class="cb-field"><label for="trCy">Centre y</label><input type="number" id="trCy" value="${T.cy}"></div></div>`;
      if(T.type==="enlarge")h+=`<div class="cb-field" style="margin-top:8px"><label for="trS">Scale factor</label><input type="number" id="trS" min=".5" step=".5" value="${T.sf}"></div>`;
      if(T.type==="translate")h+=`<div class="row2" style="margin-top:8px"><div class="cb-field"><label for="trX">Across (x)</label><input type="number" id="trX" value="${T.tx}"></div><div class="cb-field"><label for="trY">Up (y)</label><input type="number" id="trY" value="${T.ty}"></div></div>`;
      h+=`</section>`}
    return h}
  const D=S.d3,sol=SOLIDS.find(s=>s.id===D.solid),d=dimsFor(D.solid);
  let h=`<section class="panel"><h2>Pick a solid</h2><div class="types sb-types">${SOLIDS.map(x=>`<button class="type" data-s3="${x.id}" aria-pressed="${D.solid===x.id}"><svg viewBox="0 0 30 26" aria-hidden="true">${icon3(x.id)}</svg><span>${x.n}</span></button>`).join("")}</div></section>`;
  h+=`<section class="panel"><h2>Measurements</h2><div class="stack" style="gap:10px">${sol.f.map(([k,l])=>k==="n"?`<div class="cb-field"><label for="dm_n">${l}</label><select id="dm_n">${[3,4,5,6,7,8].map(v=>`<option value="${v}" ${d.n==v?"selected":""}>${v} — ${POLY[v].toLowerCase()}</option>`).join("")}</select></div>`
    :`<div class="cb-field"><label for="dm_${k}">${l} (cm)</label><div class="sb-range"><input type="range" id="dmr_${k}" min=".5" max="12" step=".5" value="${d[k]}" aria-label="${l}"><input type="number" id="dm_${k}" min=".5" max="30" step=".5" value="${d[k]}"></div></div>`).join("")}</div></section>`;
  h+=`<section class="panel"><h2>View</h2><div class="sb-seg">${[["3d","3D model"],["net","Net"],["views","Front, side & plan"]].map(([v,l])=>`<button data-view="${v}" aria-pressed="${D.view===v}">${l}</button>`).join("")}</div>
   <div class="sb-chks" style="margin-top:10px">${chk("s3_hid",D.show.hidden,"Hidden edges (dashed)")}${chk("s3_lab",D.show.lab,"Measurements")}${(D.solid==="cube"||D.solid==="cuboid")?chk("s3_cub",D.show.cubes,"Unit cubes (whole numbers)"):""}</div>
   ${D.view==="3d"?`<div class="btns" style="margin-top:10px"><button class="cb-btn" data-rot="-15,0" aria-label="Turn left">◀</button><button class="cb-btn" data-rot="15,0" aria-label="Turn right">▶</button><button class="cb-btn" data-rot="0,10" aria-label="Tilt towards you">▲</button><button class="cb-btn" data-rot="0,-10" aria-label="Tilt away">▼</button><button class="cb-btn" data-rot="reset">Reset</button></div>`:""}</section>`;
  return h}
function render(){
  root.querySelector("#sbModes").innerHTML=[["2d","2D shapes"],["3d","3D solids"]].map(([m,l])=>`<button data-mode="${m}" aria-pressed="${S.mode===m}">${l}</button>`).join("");
  $("#sbControls").innerHTML=controls();
  renderStage();
}
function renderStage(){
  const f=S.mode==="2d"?facts2D():facts3D();
  $("#sbStage").innerHTML=S.mode==="2d"?render2D():render3D();
  $("#sbName").innerHTML=`<h2 class="sb-name">${esc(f.name)}</h2><div class="sb-chips">${f.chips.map(c=>`<span>${esc(c)}</span>`).join("")}</div>`;
  $("#tWork").setAttribute("aria-pressed",S.showWork);$("#tPractice").setAttribute("aria-pressed",S.practice);
  if(S.practice){$("#sbFacts").hidden=true;$("#sbWork").innerHTML=`<h3>Practice</h3><p class="cb-hint">Work these out from the drawing, then check. Drag or change the shape for a new set.</p><div>${practiceQs().join("")}</div><div class="btns"><button class="cb-btn cb-primary" id="sbChk">Check answers</button><button class="cb-btn" id="sbRev">Show answers</button><span class="score" id="sbScore"></span></div>`;$("#sbWork").hidden=false;return}
  $("#sbFacts").hidden=false;$("#sbFacts").innerHTML=`<div class="tbl-wrap"><table class="cb-k sb-facts"><tbody>${f.table}</tbody></table></div>`;
  $("#sbWork").hidden=!S.showWork;$("#sbWork").innerHTML=S.showWork?`<h3>Working</h3>${f.work.map((w,i)=>step(i+1,w)).join("")}`:"";
  save();
}
function setPreset(id){const D=S.d2,p=PRESETS2.find(x=>x.id===id);D.preset=id;D.tr.type=D.tr.type||"none";if(p.circle)return;if(p.reg)D.v=regularPoly(p.reg==="n"?D.regN:p.reg);else D.v=p.v.map(q=>q.slice())}

/* events */
root.addEventListener("click",e=>{const b=e.target.closest("button,[data-ins]");if(!b)return;
  if(b.dataset.mode){S.mode=b.dataset.mode;S.practice=false;render();return}
  if(b.dataset.p2){setPreset(b.dataset.p2);render();return}
  if(b.dataset.s3){S.d3.solid=b.dataset.s3;if(b.dataset.s3==="sphere"&&S.d3.view==="net")S.d3.view="3d";render();return}
  if(b.dataset.view){S.d3.view=b.dataset.view;render();return}
  if(b.dataset.rot){if(b.dataset.rot==="reset"){S.d3.yaw=-32;S.d3.pitch=22}else{const[a,c]=b.dataset.rot.split(",").map(Number);S.d3.yaw+=a;S.d3.pitch=Math.max(-89,Math.min(89,S.d3.pitch+c))}renderStage();return}
  if(b.dataset.ins!=null){const i=+b.dataset.ins,V=S.d2.v,m=mul(add(V[i],V[(i+1)%V.length]),.5);V.splice(i+1,0,snapP(m));render();return}
  if(b.id==="sbDel"){if(S.d2.v.length>3)S.d2.v.pop();render();return}
  if(b.id==="tWork"){S.showWork=!S.showWork;if(S.showWork)S.practice=false;renderStage();return}
  if(b.id==="tPractice"){S.practice=!S.practice;renderStage();return}
  if(b.id==="sbChk")checkAll();if(b.id==="sbRev")revealAll();
});
root.addEventListener("input",e=>{const el=e.target,id=el.id,D2=S.d2,D3=S.d3;
  const map2={sh_len:"len",sh_ang:"ang",sh_lab:"lab",sh_ht:"ht",sh_diag:"diag",sh_sym:"sym"};
  if(map2[id]){D2.show[map2[id]]=el.checked;renderStage();return}
  if(id.startsWith("cp_")){D2.circle.parts[id.slice(3)]=el.checked;renderStage();return}
  if(id==="cR"){D2.circle.r=num(el.value);el.nextElementSibling.textContent=`r = ${fmt(num(el.value))} cm`;renderStage();return}
  if(id==="regN"){D2.regN=+el.value;D2.v=regularPoly(D2.regN);el.nextElementSibling.textContent=`${D2.regN} sides — ${POLY[D2.regN]}`;renderStage();return}
  if(id==="snap"){D2.snap=num(el.value);save();return}
  const trm={trK:"k",trCx:"cx",trCy:"cy",trS:"sf",trX:"tx",trY:"ty"};if(trm[id]){D2.tr[trm[id]]=el.value;renderStage();return}
  if(id==="s3_hid"){D3.show.hidden=el.checked;renderStage();return}if(id==="s3_lab"){D3.show.lab=el.checked;renderStage();return}if(id==="s3_cub"){D3.show.cubes=el.checked;renderStage();return}
  if(id.startsWith("dm_")||id.startsWith("dmr_")){const k=id.split("_")[1];let v=num(el.value);if(k!=="n")v=Math.max(.5,Math.min(30,v));if(!v)return;D3.dims[k+"_"+D3.solid]=v;
    const other=$(id.startsWith("dmr_")?"#dm_"+k:"#dmr_"+k);if(other&&other!==el)other.value=v;renderStage();return}
});
root.addEventListener("change",e=>{const id=e.target.id;
  if(id==="trT"){S.d2.tr.type=e.target.value;render();return}if(id==="trL"){S.d2.tr.line=e.target.value;render();return}if(id==="trA"){S.d2.tr.ang=e.target.value;renderStage();return}
  if(id==="dm_n"){S.d3.dims["n_"+S.d3.solid]=+e.target.value;renderStage();return}});
/* dragging: vertices (2D) and rotation (3D) */
let drag=null;
function snapP(p){const s=S.d2.snap;let q=s>0?[Math.round(p[0]/s)*s,Math.round(p[1]/s)*s]:[Math.round(p[0]*100)/100,Math.round(p[1]*100)/100];return[Math.max(-XR,Math.min(XR,q[0])),Math.max(-YR,Math.min(YR,q[1]))]}
function toWorld(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();if(!m)return[0,0];const p=pt.matrixTransform(m.inverse());return[(p.x-OX)/U,(OY-p.y)/U]}
root.addEventListener("pointerdown",e=>{const h=e.target.closest(".sb-h");if(h){e.preventDefault();drag={kind:"v",i:+h.dataset.v};return}
  if(e.target.closest("#sb3d")){e.preventDefault();drag={kind:"r",x:e.clientX,y:e.clientY}}});
window.addEventListener("pointermove",e=>{if(!drag)return;
  if(drag.kind==="v"){const svg=root.querySelector("#sbSvg");if(!svg)return;const p=snapP(toWorld(svg,e)),V=S.d2.v;if(V[drag.i][0]===p[0]&&V[drag.i][1]===p[1])return;V[drag.i]=p;renderStage()}
  else{S.d3.yaw+=(e.clientX-drag.x)*.5;S.d3.pitch=Math.max(-89,Math.min(89,S.d3.pitch+(e.clientY-drag.y)*.5));drag.x=e.clientX;drag.y=e.clientY;renderStage()}});
window.addEventListener("pointerup",()=>{if(drag){drag=null;save()}});
root.addEventListener("keydown",e=>{const h=e.target.closest&&e.target.closest(".sb-h");if(!h)return;const i=+h.dataset.v,st=S.d2.snap||.1,V=S.d2.v,mv={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,st],ArrowDown:[0,-st]}[e.key];if(!mv)return;e.preventDefault();V[i]=snapP(add(V[i],mv));renderStage();const nh=root.querySelector(`.sb-h[data-v="${i}"]`);nh&&nh.focus()});
if(location.hash==="#3d")S.mode="3d";
render();
})();
