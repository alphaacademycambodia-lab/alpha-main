/* Chart Builder — Stage 7 Unit 7. Draws every representation in the unit as SVG
   (or an HTML table), with the working and a practice mode. No libraries. */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>{const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:0};
const has=v=>String(v??"").trim()!==""&&isFinite(parseFloat(v));
const fmt=(n,d=2)=>{const r=Math.round(n*10**d)/10**d;return String(r)};
const COLORS=["var(--c1)","var(--c2)","var(--c3)","var(--c4)","var(--c5)","var(--c6)","var(--c7)","var(--c8)","var(--c9)","var(--c10)"];
const col=i=>COLORS[i%COLORS.length];

/* ---------- chart types ---------- */
const TYPES={
  tally:{name:"Tally chart",sub:"& frequency table",mode:"single",
    use:"Use while you collect data: one stroke per result, counted in fives.",
    tips:["Every fifth stroke is drawn across the other four: ||||̸ = 5.","Add a frequency column with the count for each row.","Check the frequencies add up to the number of results.","For continuous data use classes like 10 ≤ t < 20 so every value fits exactly one class."]},
  bar:{name:"Bar chart",sub:"categorical / discrete",mode:"single",
    use:"Use to compare amounts in categories or discrete values.",
    tips:["Bars have equal width with equal gaps between them.","The frequency axis starts at zero and has an even scale.","Label both axes and give the chart a title.","The tallest bar shows the mode (most common value)."]},
  dual:{name:"Dual bar chart",sub:"compare two groups",mode:"double",
    use:"Use to compare two groups (e.g. girls and boys) category by category.",
    tips:["Put the two bars for each category side by side, touching.","Leave a gap between categories.","Always include a key showing which colour is which group.","Compare category by category, then compare the totals."]},
  pie:{name:"Pie chart",sub:"shares of a whole",mode:"single",
    use:"Use to show how a whole is shared out between categories.",
    tips:["Angle = frequency ÷ total × 360°.","Work out 360 ÷ total first: that is the angle for one item.","All the angles must add up to 360°.","Draw from a vertical start line and measure each angle with a protractor, going clockwise.","Pie charts show proportions well but exact values poorly."]},
  waffle:{name:"Waffle diagram",sub:"10 × 10 squares",mode:"single",
    use:"Use to show shares of a whole as percentages: each of the 100 squares is 1%.",
    tips:["Percentage = frequency ÷ total × 100.","One square = 1% of the total.","Round so the squares add up to exactly 100.","Shade each category in its own colour, filling row by row, and add a key."]},
  picto:{name:"Pictogram",sub:"symbols with a key",mode:"single",
    use:"Use for simple, eye-catching comparisons. One symbol stands for a fixed number of items.",
    tips:["A pictogram always needs a key, e.g. ● = 4 books.","Number of symbols = frequency ÷ key value.","Use part of a symbol for a remainder (half a symbol = half the key value).","Line the symbols up neatly so rows can be compared."]},
  freq:{name:"Frequency diagram",sub:"grouped continuous",mode:"single",
    use:"Use for grouped continuous data such as times, heights or masses.",
    tips:["The bars touch, because the classes are continuous.","The horizontal axis is a number line showing the class boundaries.","Classes must be the same width and must not overlap.","14 ≤ t < 15 includes 14 but not 15."]},
  line:{name:"Line graph",sub:"change over time",mode:"line",
    use:"Use to show how a quantity changes over time, such as weekly growth.",
    tips:["Time goes on the horizontal axis.","Plot each reading with a cross or dot, then join the points with straight lines.","Points are joined because the change between readings is continuous.","Add a second line with a key to compare two things over the same times."]},
  scatter:{name:"Scatter graph",sub:"two variables",mode:"xy",
    use:"Use to see whether two measurements are related.",
    tips:["Each person or object gives one point (x, y).","Do not join the points.","Positive relationship: as one goes up, the other goes up.","Negative relationship: as one goes up, the other goes down.","No pattern means no relationship."]},
  twoway:{name:"Two-way table",sub:"two categories at once",mode:"double",
    use:"Use to show data sorted by two categories at once, with totals.",
    tips:["Rows show one category, columns show the other.","Add a total for every row and every column.","The grand total in the corner must match both the row totals and column totals.","Use the totals to fill in missing values."]},
  venn:{name:"Venn diagram",sub:"sorting into sets",mode:"sets",
    use:"Use to sort items by two properties, showing what belongs to both.",
    tips:["Items with both properties go in the overlap.","Items with neither property go outside both circles, inside the rectangle.","Check every item appears exactly once.","Count each region to answer questions."]},
  carroll:{name:"Carroll diagram",sub:"yes / no grid",mode:"sets",
    use:"Use to sort items by two yes/no properties into a 2 × 2 grid.",
    tips:["Columns: has property A / does not.","Rows: has property B / does not.","Every item goes in exactly one cell.","A Carroll diagram holds the same information as a Venn diagram."]}
};
const ICONS={
  tally:'<path d="M5 4v16M10 4v16M15 4v16M20 4v16M2 18 23 6" stroke="currentColor" stroke-width="2" fill="none"/>',
  bar:'<rect x="3" y="12" width="6" height="10" fill="var(--c1)"/><rect x="13" y="5" width="6" height="17" fill="var(--c1)"/><rect x="23" y="9" width="6" height="13" fill="var(--c1)"/>',
  dual:'<rect x="2" y="10" width="5" height="12" fill="var(--c1)"/><rect x="7" y="6" width="5" height="16" fill="var(--c2)"/><rect x="17" y="4" width="5" height="18" fill="var(--c1)"/><rect x="22" y="12" width="5" height="10" fill="var(--c2)"/>',
  pie:'<circle cx="17" cy="12" r="10" fill="var(--c2)"/><path d="M17 12V2a10 10 0 0 1 9.5 13z" fill="var(--c1)"/><path d="M17 12l9.5 3a10 10 0 0 1-12 6.6z" fill="var(--c3)"/>',
  waffle:(()=>{let s="";for(let r=0;r<4;r++)for(let c=0;c<6;c++){const i=r*6+c;s+=`<rect x="${4+c*4.5}" y="${3+r*4.6}" width="3.6" height="3.6" fill="${i<11?"var(--c1)":i<17?"var(--c2)":"var(--c3)"}"/>`}return s})(),
  picto:'<circle cx="6" cy="7" r="3.2" fill="var(--c1)"/><circle cx="14" cy="7" r="3.2" fill="var(--c1)"/><circle cx="22" cy="7" r="3.2" fill="var(--c1)"/><circle cx="6" cy="17" r="3.2" fill="var(--c1)"/><path d="M14 13.8a3.2 3.2 0 0 0 0 6.4z" fill="var(--c1)"/>',
  freq:'<rect x="3" y="13" width="7" height="9" fill="var(--c6)" stroke="var(--panel)"/><rect x="10" y="5" width="7" height="17" fill="var(--c6)" stroke="var(--panel)"/><rect x="17" y="9" width="7" height="13" fill="var(--c6)" stroke="var(--panel)"/><rect x="24" y="16" width="7" height="6" fill="var(--c6)" stroke="var(--panel)"/>',
  line:'<polyline points="3,20 10,15 17,11 24,6 31,4" fill="none" stroke="var(--c1)" stroke-width="2"/><circle cx="10" cy="15" r="2" fill="var(--c1)"/><circle cx="17" cy="11" r="2" fill="var(--c1)"/><circle cx="24" cy="6" r="2" fill="var(--c1)"/>',
  scatter:'<g fill="var(--c5)"><circle cx="5" cy="19" r="2"/><circle cx="10" cy="16" r="2"/><circle cx="13" cy="13" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="22" cy="8" r="2"/><circle cx="28" cy="5" r="2"/></g>',
  twoway:'<rect x="3" y="3" width="28" height="18" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h28M3 15h28M12 3v18M22 3v18" stroke="currentColor" stroke-width="1"/>',
  venn:'<circle cx="12" cy="12" r="8" fill="var(--c1)" fill-opacity=".35" stroke="var(--c1)"/><circle cx="22" cy="12" r="8" fill="var(--c2)" fill-opacity=".35" stroke="var(--c2)"/>',
  carroll:'<rect x="3" y="3" width="28" height="18" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M17 3v18M3 12h28" stroke="currentColor" stroke-width="1.5"/>'
};

/* ---------- examples ---------- */
const PRESETS=[
  {id:"portions",name:"Fruit & vegetable portions (180 teenagers)",type:"pie",title:"Portions of fruit and vegetables eaten in a day",xLabel:"Number of portions",yLabel:"Frequency",s1:"Frequency",s2:"",
    rows:[["0",5],["1",10],["2",20],["3",35],["4",10],["5",60],["6",30],["7",10]]},
  {id:"buttons",name:"Chocolate buttons per packet (25 packets)",type:"tally",title:"Chocolate buttons per packet",xLabel:"Number of buttons",yLabel:"Frequency",s1:"Frequency",
    rows:[["34",3],["35",4],["36",10],["37",5],["38",3]]},
  {id:"subject",name:"Favourite subject (30 students)",type:"bar",title:"Favourite subject of Class 7A",xLabel:"Subject",yLabel:"Number of students",s1:"Frequency",
    rows:[["Sport",12],["Science",6],["Maths",6],["Art",3],["Languages",3]]},
  {id:"sport",name:"Favourite sport — girls and boys",type:"dual",title:"Favourite sport of Stage 7 students",xLabel:"Sport",yLabel:"Number of students",s1:"Girls",s2:"Boys",
    rows:[["Football",6,14],["Basketball",8,9],["Badminton",11,5],["Swimming",7,6],["Volleyball",9,4]]},
  {id:"books",name:"Library books borrowed (pictogram)",type:"picto",title:"Library books borrowed this week",xLabel:"Day",yLabel:"Books",s1:"Books",
    rows:[["Monday",16],["Tuesday",10],["Wednesday",22],["Thursday",12],["Friday",6]]},
  {id:"times",name:"100 m race times (grouped)",type:"freq",title:"Times to run 100 m",xLabel:"Time, t (seconds)",yLabel:"Frequency",s1:"Frequency",
    rows:[["13 ≤ t < 14",2],["14 ≤ t < 15",7],["15 ≤ t < 16",11],["16 ≤ t < 17",8],["17 ≤ t < 18",4]]},
  {id:"sunflower",name:"Height of a sunflower (weekly)",type:"line",title:"Height of a sunflower",xLabel:"Number of weeks",yLabel:"Height (cm)",s1:"Height",s2:"",
    rows:[["0",2],["1",5],["2",9],["3",14],["4",19],["5",24],["6",28]]},
  {id:"temps",name:"Temperature in two cities (line graph)",type:"line",title:"Midday temperature over one week",xLabel:"Day",yLabel:"Temperature (°C)",s1:"Phnom Penh",s2:"Siem Reap",
    rows:[["Mon",33,31],["Tue",34,32],["Wed",32,33],["Thu",31,30],["Fri",33,32],["Sat",35,33],["Sun",34,34]]},
  {id:"armspan",name:"Height and arm span (scatter)",type:"scatter",title:"Height and arm span of 12 students",xLabel:"Height (cm)",yLabel:"Arm span (cm)",s1:"Height",s2:"Arm span",
    rows:[["",142,140],["",148,147],["",150,152],["",153,150],["",155,157],["",158,156],["",160,161],["",162,165],["",165,163],["",168,170],["",170,168],["",173,175]]},
  {id:"test",name:"Test results by class (two-way)",type:"twoway",title:"Maths test results",xLabel:"Class",yLabel:"Result",s1:"Pass",s2:"Fail",
    rows:[["Class 7A",24,6],["Class 7B",19,9],["Class 7C",27,3]]},
  {id:"numbers",name:"Sort the numbers 1 to 30 (Venn / Carroll)",type:"venn",title:"Numbers from 1 to 30",xLabel:"",yLabel:"",s1:"",s2:"",
    rows:[],sets:{list:"1-30",a:{k:"even",n:2},b:{k:"mult",n:3}}}
];

/* ---------- state ---------- */
let S;
function fromPreset(p){
  return {preset:p.id,type:p.type,title:p.title,xLabel:p.xLabel,yLabel:p.yLabel,s1:p.s1||"Frequency",s2:p.s2||"",
    rows:p.rows.map(r=>({l:r[0],a:r[1]??"",b:r[2]??""})),
    sets:JSON.parse(JSON.stringify(p.sets||{list:"1-30",a:{k:"even",n:2},b:{k:"mult",n:3}})),
    picto:{sym:"circle",key:0},showWork:true,practice:false};
}
try{const saved=JSON.parse(localStorage.getItem("u7cb")||"null");if(saved&&saved.rows&&TYPES[saved.type])S=saved}catch(e){}
if(!S)S=fromPreset(PRESETS[0]);
const save=()=>{try{localStorage.setItem("u7cb",JSON.stringify(S))}catch(e){}};

/* ---------- maths helpers ---------- */
function nice(max,target=6,integer=true){
  if(!(max>0))return{step:1,top:5};
  const raw=max/target,p=10**Math.floor(Math.log10(raw)),m=raw/p;
  let step=(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p;
  if(integer&&step<1)step=1;
  return{step,top:Math.ceil(max/step-1e-9)*step};
}
function largestRemainder(vals,target){
  const T=vals.reduce((a,b)=>a+b,0);if(!T)return vals.map(()=>0);
  const ex=vals.map(v=>v/T*target),fl=ex.map(Math.floor);
  let left=target-fl.reduce((a,b)=>a+b,0);
  ex.map((e,i)=>[e-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){fl[i]++;left--}});
  return fl;
}
const single=()=>S.rows.filter(r=>String(r.l).trim()!==""||has(r.a)).map(r=>({l:String(r.l).trim(),v:Math.max(0,num(r.a))}));
const double=()=>S.rows.filter(r=>String(r.l).trim()!==""||has(r.a)||has(r.b)).map(r=>({l:String(r.l).trim(),a:Math.max(0,num(r.a)),b:Math.max(0,num(r.b))}));
const lineData=()=>S.rows.filter(r=>String(r.l).trim()!==""&&(has(r.a)||has(r.b))).map(r=>({l:String(r.l).trim(),a:has(r.a)?num(r.a):null,b:has(r.b)?num(r.b):null}));
const xyData=()=>S.rows.filter(r=>has(r.a)&&has(r.b)).map(r=>({x:num(r.a),y:num(r.b)}));

/* ---------- sets ---------- */
const isPrime=n=>{if(n<2||n%1)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const CRIT={
  even:{t:()=>"Even",f:n=>n%2===0,needN:false},
  odd:{t:()=>"Odd",f:n=>Math.abs(n%2)===1,needN:false},
  prime:{t:()=>"Prime",f:isPrime,needN:false},
  square:{t:()=>"Square number",f:n=>n>=0&&Number.isInteger(Math.sqrt(n)),needN:false},
  mult:{t:k=>`Multiple of ${k}`,f:(n,k)=>k!==0&&n%k===0,needN:true},
  factor:{t:k=>`Factor of ${k}`,f:(n,k)=>n!==0&&k%n===0,needN:true},
  gt:{t:k=>`Greater than ${k}`,f:(n,k)=>n>k,needN:true},
  lt:{t:k=>`Less than ${k}`,f:(n,k)=>n<k,needN:true}
};
function parseList(s){
  const out=[];String(s).split(/[,;\s]+/).forEach(tok=>{
    const m=tok.match(/^(-?\d+)\s*[-–]\s*(-?\d+)$/);
    if(m){let a=+m[1],b=+m[2];if(b<a)[a,b]=[b,a];if(b-a<=300)for(let i=a;i<=b;i++)out.push(i)}
    else if(tok!==""&&isFinite(+tok))out.push(+tok);
  });return out;
}
function sortSets(){
  const nums=parseList(S.sets.list),A=S.sets.a,B=S.sets.b;
  const ca=CRIT[A.k],cb=CRIT[B.k];
  const r={both:[],a:[],b:[],none:[],nameA:ca.t(A.n),nameB:cb.t(B.n),nums};
  nums.forEach(n=>{const x=ca.f(n,A.n),y=cb.f(n,B.n);(x&&y?r.both:x?r.a:y?r.b:r.none).push(n)});
  return r;
}

/* ---------- svg helpers ---------- */
const W=680;
function svgOpen(h,label){return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">`}
function titleText(y=26){return S.title?`<text x="${W/2}" y="${y}" text-anchor="middle" class="cb-tt" font-size="17">${esc(S.title)}</text>`:""}
function yAxis(x0,y0,h,top,step,label,x1){
  let s="";
  for(let v=0;v<=top+1e-9;v+=step){const y=y0-v/top*h;
    s+=`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" class="cb-gr"/><line x1="${x0-5}" x2="${x0}" y1="${y}" y2="${y}" class="cb-ax"/><text x="${x0-9}" y="${y+4}" text-anchor="end" class="cb-t" font-size="12">${fmt(v)}</text>`}
  s+=`<line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y0-h-6}" class="cb-ax"/>`;
  if(label)s+=`<text transform="translate(18 ${y0-h/2}) rotate(-90)" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(label)}</text>`;
  return s;
}
function xLabels(items,x0,step,y0,width){
  const long=items.some(t=>t.length>7)&&step<80;
  return items.map((t,i)=>{const x=x0+step*i+step/2;
    return long?`<text transform="translate(${x} ${y0+14}) rotate(-35)" text-anchor="end" class="cb-t" font-size="12">${esc(t)}</text>`
               :`<text x="${x}" y="${y0+18}" text-anchor="middle" class="cb-t" font-size="12">${esc(t)}</text>`}).join("");
}
function emptyMsg(m){return `<div class="hidden-chart"><div><b>Nothing to draw yet</b>${esc(m)}</div></div>`}

/* ---------- renderers ---------- */
function tallySvg(n){
  n=Math.round(n);const groups=Math.floor(n/5),rest=n%5;let x=2,s="";
  for(let g=0;g<groups;g++){for(let i=0;i<4;i++)s+=`<line x1="${x+i*6}" x2="${x+i*6}" y1="3" y2="23" stroke="currentColor" stroke-width="2"/>`;
    s+=`<line x1="${x-3}" x2="${x+21}" y1="20" y2="6" stroke="currentColor" stroke-width="2"/>`;x+=34}
  for(let i=0;i<rest;i++)s+=`<line x1="${x+i*6}" x2="${x+i*6}" y1="3" y2="23" stroke="currentColor" stroke-width="2"/>`;
  x+=rest*6;return `<svg viewBox="0 0 ${Math.max(x,8)} 26" width="${Math.max(x,8)}" height="26" aria-label="${n} tally marks">${s}</svg>`;
}
function renderTally(){
  const d=single();if(!d.length)return emptyMsg("Add rows to the data table.");
  const T=d.reduce((a,r)=>a+r.v,0);
  return `<div class="chart-title">${esc(S.title)}</div><div class="tbl-wrap"><table class="cb-k"><thead><tr><th class="l">${esc(S.xLabel||"Category")}</th><th class="l">Tally</th><th>Frequency</th></tr></thead><tbody>
  ${d.map(r=>`<tr><td class="l">${esc(r.l)}</td><td class="l tally">${r.v>200?"(too many to draw)":tallySvg(r.v)}</td><td>${fmt(r.v)}</td></tr>`).join("")}
  <tr class="tot"><td class="l">Total</td><td></td><td>${fmt(T)}</td></tr></tbody></table></div>`;
}
function renderBar(touch){
  const d=single();if(!d.length)return emptyMsg("Add rows to the data table.");
  const max=Math.max(...d.map(r=>r.v)),{step,top}=nice(max);
  const H=420,x0=70,x1=W-20,y0=H-80,h=y0-60,band=(x1-x0)/d.length,gap=touch?0:band*.3,bw=band-gap;
  let s=svgOpen(H,S.title)+titleText()+yAxis(x0,y0,h,top,step,S.yLabel,x1);
  d.forEach((r,i)=>{const bh=r.v/top*h,x=x0+band*i+gap/2;
    s+=`<rect x="${x}" y="${y0-bh}" width="${bw}" height="${bh}" fill="${touch?"var(--c6)":"var(--c1)"}" ${touch?'stroke="var(--panel)" stroke-width="1.5"':""}/>`;
    s+=`<text x="${x+bw/2}" y="${y0-bh-6}" text-anchor="middle" class="cb-tm" font-size="12">${fmt(r.v)}</text>`});
  s+=`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="cb-ax"/>`;
  s+=xLabels(d.map(r=>r.l),x0,band,y0);
  s+=`<text x="${(x0+x1)/2}" y="${H-12}" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text></svg>`;
  return s;
}
function bounds(label){const m=String(label).match(/-?\d+(?:\.\d+)?/g);return m&&m.length>=2?[+m[0],+m[m.length-1]]:null}
function renderFreq(){
  const d=single();if(!d.length)return emptyMsg("Add classes such as 10 ≤ t < 20 with their frequencies.");
  const b=d.map(r=>bounds(r.l));
  if(b.some(x=>!x||x[1]<=x[0]))return renderBar(true)+`<p class="legend-note">Tip: write classes as “10 ≤ t < 20” or “10–20” to get a number-line axis.</p>`;
  const lo=Math.min(...b.map(x=>x[0])),hi=Math.max(...b.map(x=>x[1]));
  const max=Math.max(...d.map(r=>r.v)),{step,top}=nice(max);
  const H=420,x0=70,x1=W-30,y0=H-80,h=y0-60,sx=v=>x0+12+(v-lo)/(hi-lo)*(x1-x0-12);
  let s=svgOpen(H,S.title)+titleText()+yAxis(x0,y0,h,top,step,S.yLabel,x1);
  d.forEach((r,i)=>{const bh=r.v/top*h,xa=sx(b[i][0]),xb=sx(b[i][1]);
    s+=`<rect x="${xa}" y="${y0-bh}" width="${xb-xa}" height="${bh}" fill="var(--c6)" stroke="var(--panel)" stroke-width="1.5"/><text x="${(xa+xb)/2}" y="${y0-bh-6}" text-anchor="middle" class="cb-tm" font-size="12">${fmt(r.v)}</text>`});
  s+=`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="cb-ax"/>`;
  const ticks=[...new Set(b.flat())].sort((p,q)=>p-q);
  ticks.forEach(t=>{s+=`<line x1="${sx(t)}" x2="${sx(t)}" y1="${y0}" y2="${y0+5}" class="cb-ax"/><text x="${sx(t)}" y="${y0+20}" text-anchor="middle" class="cb-t" font-size="12">${fmt(t)}</text>`});
  if(lo!==0)s+=`<path d="M${x0} ${y0} l3 -4 l4 8 l4 -8 l1 4" fill="none" class="cb-ax"/>`;
  s+=`<text x="${(x0+x1)/2}" y="${H-24}" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text></svg>`;
  return s;
}
function legendSvg(items,x,y){return items.map((it,i)=>`<rect x="${x}" y="${y+i*20-10}" width="13" height="13" rx="2" fill="${it.c}"/><text x="${x+19}" y="${y+i*20+1}" class="cb-t" font-size="13">${esc(it.t)}</text>`).join("")}
function renderDual(){
  const d=double();if(!d.length)return emptyMsg("Add categories and two values for each.");
  const max=Math.max(...d.map(r=>Math.max(r.a,r.b))),{step,top}=nice(max);
  const H=440,x0=70,x1=W-20,y0=H-80,h=y0-80,band=(x1-x0)/d.length,gap=band*.28,bw=(band-gap)/2;
  let s=svgOpen(H,S.title)+titleText()+yAxis(x0,y0,h,top,step,S.yLabel,x1);
  d.forEach((r,i)=>{const x=x0+band*i+gap/2;[[r.a,"var(--c1)"],[r.b,"var(--c2)"]].forEach(([v,c],j)=>{const bh=v/top*h;
    s+=`<rect x="${x+j*bw}" y="${y0-bh}" width="${bw}" height="${bh}" fill="${c}"/><text x="${x+j*bw+bw/2}" y="${y0-bh-5}" text-anchor="middle" class="cb-tm" font-size="11">${fmt(v)}</text>`})});
  s+=`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="cb-ax"/>`+xLabels(d.map(r=>r.l),x0,band,y0);
  s+=`<g>${legendSvg([{t:S.s1||"Group 1",c:"var(--c1)"},{t:S.s2||"Group 2",c:"var(--c2)"}],x1-150,50)}</g>`;
  s+=`<text x="${(x0+x1)/2}" y="${H-12}" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text></svg>`;
  return s;
}
function pieAngles(d){const T=d.reduce((a,r)=>a+r.v,0);return d.map(r=>T?r.v/T*360:0)}
function renderPie(){
  const d=single().filter(r=>r.v>0);if(!d.length)return emptyMsg("Add categories with frequencies above zero.");
  const ang=pieAngles(d),H=Math.max(420,90+d.length*24),cx=200,cy=H/2+12,R=150;
  let s=svgOpen(H,S.title)+titleText(),a0=-90;
  const pt=(deg,r)=>[cx+r*Math.cos(deg*Math.PI/180),cy+r*Math.sin(deg*Math.PI/180)];
  d.forEach((r,i)=>{const a1=a0+ang[i];
    if(ang[i]>=359.999)s+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${col(i)}"/>`;
    else{const [x1,y1]=pt(a0,R),[x2,y2]=pt(a1,R);s+=`<path d="M${cx} ${cy}L${x1} ${y1}A${R} ${R} 0 ${ang[i]>180?1:0} 1 ${x2} ${y2}Z" fill="${col(i)}" stroke="var(--panel)" stroke-width="1.5"/>`}
    if(ang[i]>=22){const [lx,ly]=pt(a0+ang[i]/2,R*.64);s+=`<text x="${lx}" y="${ly+4}" text-anchor="middle" class="cb-on" font-size="12.5" style="paint-order:stroke;stroke:rgba(0,0,0,.25);stroke-width:2px">${fmt(ang[i],1)}°</text>`}
    a0=a1});
  s+=`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-R}" stroke="var(--fg)" stroke-width="1.5"/>`;
  const lx=cx+R+50,ly=cy-(d.length-1)*12;
  s+=legendSvg(d.map((r,i)=>({t:`${r.l}${S.xLabel&&/^\d/.test(r.l)?"":""} — ${fmt(r.v)} (${fmt(ang[i],1)}°)`,c:col(i)})),lx,ly);
  if(S.xLabel)s+=`<text x="${lx}" y="${ly-26}" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text>`;
  return s+"</svg>";
}
function renderWaffle(){
  const d=single().filter(r=>r.v>0);if(!d.length)return emptyMsg("Add categories with frequencies above zero.");
  const sq=largestRemainder(d.map(r=>r.v),100),H=Math.max(400,90+d.length*24),size=30,g=3,ox=40,oy=56;
  let s=svgOpen(H,S.title)+titleText(),k=0;const owner=[];sq.forEach((n,i)=>{for(let j=0;j<n;j++)owner.push(i)});
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){const i=owner[k++];s+=`<rect x="${ox+c*(size+g)}" y="${oy+r*(size+g)}" width="${size}" height="${size}" rx="3" fill="${i==null?"var(--line2)":col(i)}"/>`}
  const lx=ox+10*(size+g)+34,ly=oy+20;
  s+=`<text x="${lx}" y="${ly-24}" class="cb-t" font-size="13" font-weight="600">Key (1 square = 1%)</text>`;
  s+=legendSvg(d.map((r,i)=>({t:`${r.l} — ${sq[i]} squares`,c:col(i)})),lx,ly);
  return s+"</svg>";
}
function symbolPath(sym,x,y,s,fill){
  switch(sym){
    case"square":return `<rect x="${x-s*.42}" y="${y-s*.42}" width="${s*.84}" height="${s*.84}" rx="3" fill="${fill}"/>`;
    case"star":{let p="";for(let i=0;i<10;i++){const r=i%2?s*.22:s*.5,a=-Math.PI/2+i*Math.PI/5;p+=(i?"L":"M")+(x+r*Math.cos(a)).toFixed(1)+" "+(y+r*Math.sin(a)).toFixed(1)}return `<path d="${p}Z" fill="${fill}"/>`}
    case"person":return `<g fill="${fill}"><circle cx="${x}" cy="${y-s*.28}" r="${s*.17}"/><path d="M${x-s*.3} ${y+s*.48}V${y+s*.02}a${s*.12} ${s*.12} 0 0 1 ${s*.12}-${s*.12}h${s*.36}a${s*.12} ${s*.12} 0 0 1 ${s*.12} ${s*.12}V${y+s*.48}z"/></g>`;
    case"book":return `<g fill="${fill}"><path d="M${x-s*.45} ${y-s*.35}h${s*.4}v${s*.75}h-${s*.4}z"/><path d="M${x+s*.05} ${y-s*.35}h${s*.4}v${s*.75}h-${s*.4}z"/></g>`;
    default:return `<circle cx="${x}" cy="${y}" r="${s*.44}" fill="${fill}"/>`;
  }
}
function pictoKey(d){
  if(S.picto.key>0)return S.picto.key;
  const max=Math.max(...d.map(r=>r.v),1);
  for(const k of [1,2,4,5,10,20,25,50,100,200,500,1000])if(max/k<=10)return k;return 1000;
}
function renderPicto(){
  const d=single();if(!d.length)return emptyMsg("Add rows to the data table.");
  const k=pictoKey(d),sz=34,lab=130,H=90+d.length*(sz+12)+40;let s=svgOpen(H,S.title)+titleText(),uid=0;
  d.forEach((r,i)=>{const y=60+i*(sz+12)+sz/2,n=r.v/k;
    s+=`<text x="${lab-14}" y="${y+5}" text-anchor="end" class="cb-t" font-size="13">${esc(r.l)}</text>`;
    const full=Math.floor(n+1e-9),part=n-full;
    for(let j=0;j<Math.min(full,14);j++)s+=symbolPath(S.picto.sym,lab+sz/2+j*(sz+4),y,sz,"var(--c1)");
    if(part>1e-6&&full<14){const x=lab+sz/2+full*(sz+4),id="cp"+(uid++);
      s+=`<clipPath id="${id}"><rect x="${x-sz/2}" y="${y-sz/2}" width="${sz*part}" height="${sz}"/></clipPath><g clip-path="url(#${id})">${symbolPath(S.picto.sym,x,y,sz,"var(--c1)")}</g>`}
  });
  s+=`<line x1="${lab-4}" x2="${lab-4}" y1="52" y2="${60+d.length*(sz+12)}" class="cb-ax"/>`;
  const ky=H-26;s+=symbolPath(S.picto.sym,lab+sz/2,ky,26,"var(--c1)")+`<text x="${lab+sz+6}" y="${ky+5}" class="cb-t" font-size="14" font-weight="600">= ${fmt(k)} ${esc((S.yLabel||"items").toLowerCase())}</text><text x="${lab-14}" y="${ky+5}" text-anchor="end" class="cb-tm" font-size="12">Key</text>`;
  return s+"</svg>";
}
function renderLine(){
  const d=lineData();if(d.length<2)return emptyMsg("A line graph needs at least two readings.");
  const two=d.some(r=>r.b!=null),vals=d.flatMap(r=>[r.a,r.b]).filter(v=>v!=null);
  const max=Math.max(...vals),{step,top}=nice(max,6,false);
  const H=420,x0=70,x1=W-30,y0=H-80,h=y0-70,numX=d.every(r=>isFinite(+r.l));
  const xs=numX?d.map(r=>+r.l):null,lo=numX?Math.min(...xs):0,hi=numX?Math.max(...xs):0;
  const px=i=>numX&&hi>lo?x0+20+(xs[i]-lo)/(hi-lo)*(x1-x0-40):x0+20+i*(x1-x0-40)/(d.length-1);
  let s=svgOpen(H,S.title)+titleText()+yAxis(x0,y0,h,top,step,S.yLabel,x1);
  s+=`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="cb-ax"/>`;
  d.forEach((r,i)=>{s+=`<line x1="${px(i)}" x2="${px(i)}" y1="${y0}" y2="${y0+5}" class="cb-ax"/><text x="${px(i)}" y="${y0+20}" text-anchor="middle" class="cb-t" font-size="12">${esc(r.l)}</text>`});
  [["a","var(--c1)"],["b","var(--c2)"]].forEach(([key,c])=>{const pts=d.map((r,i)=>r[key]==null?null:[px(i),y0-r[key]/top*h]).filter(Boolean);if(!pts.length)return;
    s+=`<polyline points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>`;
    pts.forEach(([x,y])=>{s+=`<path d="M${x-4} ${y-4}l8 8M${x+4} ${y-4}l-8 8" stroke="${c}" stroke-width="2.2"/>`})});
  if(two)s+=legendSvg([{t:S.s1||"Series 1",c:"var(--c1)"},{t:S.s2||"Series 2",c:"var(--c2)"}],x1-150,52);
  s+=`<text x="${(x0+x1)/2}" y="${H-24}" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text></svg>`;
  return s;
}
function corr(p){const n=p.length;if(n<3)return 0;const mx=p.reduce((a,q)=>a+q.x,0)/n,my=p.reduce((a,q)=>a+q.y,0)/n;let sxy=0,sxx=0,syy=0;p.forEach(q=>{sxy+=(q.x-mx)*(q.y-my);sxx+=(q.x-mx)**2;syy+=(q.y-my)**2});return sxx&&syy?sxy/Math.sqrt(sxx*syy):0}
const relWord=r=>r>=.5?"positive":r<=-.5?"negative":"none";
function renderScatter(){
  const p=xyData();if(p.length<2)return emptyMsg("Add at least two (x, y) pairs.");
  const axisRange=vs=>{const mn=Math.min(...vs),mx=Math.max(...vs),{step}=nice(Math.max(mx-mn,1),6,false);const lo=Math.floor(mn/step)*step-(mn%step===0&&mn>0?step:0);return{lo:Math.max(mn>=0?0:-Infinity,lo),hi:Math.ceil(mx/step)*step+(mx%step===0?step:0),step}};
  const X=axisRange(p.map(q=>q.x)),Y=axisRange(p.map(q=>q.y));
  const H=440,x0=72,x1=W-24,y0=H-70,y1=50,sx=v=>x0+(v-X.lo)/(X.hi-X.lo)*(x1-x0),sy=v=>y0-(v-Y.lo)/(Y.hi-Y.lo)*(y0-y1);
  let s=svgOpen(H,S.title)+titleText();
  for(let v=Y.lo;v<=Y.hi+1e-9;v+=Y.step)s+=`<line x1="${x0}" x2="${x1}" y1="${sy(v)}" y2="${sy(v)}" class="cb-gr"/><text x="${x0-9}" y="${sy(v)+4}" text-anchor="end" class="cb-t" font-size="12">${fmt(v)}</text>`;
  for(let v=X.lo;v<=X.hi+1e-9;v+=X.step)s+=`<line x1="${sx(v)}" x2="${sx(v)}" y1="${y0}" y2="${y1}" class="cb-gr"/><text x="${sx(v)}" y="${y0+18}" text-anchor="middle" class="cb-t" font-size="12">${fmt(v)}</text>`;
  s+=`<line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="cb-ax"/><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" class="cb-ax"/>`;
  if(X.lo!==0||Y.lo!==0)s+=`<path d="M${x0} ${y0} m6 0 l3 -4 l4 8 l4 -8 l2 4" fill="none" class="cb-ax"/>`;
  p.forEach(q=>{const x=sx(q.x),y=sy(q.y);s+=`<path d="M${x-4.5} ${y-4.5}l9 9M${x+4.5} ${y-4.5}l-9 9" stroke="var(--c5)" stroke-width="2.4"/>`});
  s+=`<text transform="translate(18 ${(y0+y1)/2}) rotate(-90)" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.yLabel)}</text>`;
  s+=`<text x="${(x0+x1)/2}" y="${H-18}" text-anchor="middle" class="cb-t" font-size="13" font-weight="600">${esc(S.xLabel)}</text></svg>`;
  return s;
}
function renderTwoway(practice){
  const d=double();if(!d.length)return emptyMsg("Add row categories and the two column values.");
  const ta=d.reduce((a,r)=>a+r.a,0),tb=d.reduce((a,r)=>a+r.b,0);
  const cell=(v,id)=>practice?`<input type="number" data-ans="${v}" id="${id}" style="width:80px;text-align:center" aria-label="total">`:fmt(v);
  return `<div class="chart-title">${esc(S.title)}</div><div class="tbl-wrap"><table class="cb-k"><thead><tr><th class="l">${esc(S.xLabel)}</th><th>${esc(S.s1||"Column 1")}</th><th>${esc(S.s2||"Column 2")}</th><th>Total</th></tr></thead><tbody>
   ${d.map((r,i)=>`<tr><td class="l">${esc(r.l)}</td><td>${fmt(r.a)}</td><td>${fmt(r.b)}</td><td>${cell(r.a+r.b,"tw_r"+i)}</td></tr>`).join("")}
   <tr class="tot"><td class="l">Total</td><td>${cell(ta,"tw_a")}</td><td>${cell(tb,"tw_b")}</td><td>${cell(ta+tb,"tw_t")}</td></tr></tbody></table></div>`;
}
function renderVenn(){
  const r=sortSets();if(!r.nums.length)return emptyMsg("Type the numbers to sort, e.g. 1-30 or 4, 9, 12.");
  const H=460,cxA=255,cxB=425,cy=222,R=135;
  let s=svgOpen(H,S.title)+titleText();
  s+=`<rect x="20" y="48" width="${W-40}" height="${H-66}" rx="10" fill="none" stroke="var(--fg)" stroke-width="1.5"/><text x="34" y="70" class="cb-tm" font-size="13" font-weight="600">ξ</text>`;
  s+=`<circle cx="${cxA}" cy="${cy}" r="${R}" fill="var(--c1)" fill-opacity=".14" stroke="var(--c1)" stroke-width="2"/><circle cx="${cxB}" cy="${cy}" r="${R}" fill="var(--c2)" fill-opacity=".16" stroke="var(--c2)" stroke-width="2"/>`;
  s+=`<text x="${cxA-60}" y="${cy-R-8}" text-anchor="middle" class="cb-t" font-size="14" font-weight="700">${esc(r.nameA)}</text><text x="${cxB+60}" y="${cy-R-8}" text-anchor="middle" class="cb-t" font-size="14" font-weight="700">${esc(r.nameB)}</text>`;
  const place=(arr,cx,width,cols)=>{const rows=Math.ceil(arr.length/cols)||1,lh=Math.min(22,190/rows);return arr.map((n,i)=>{const c=i%cols,rr=Math.floor(i/cols),cc=Math.min(cols,arr.length-rr*cols);return `<text x="${cx+(c-(cc-1)/2)*width/cols}" y="${cy-(rows-1)*lh/2+rr*lh+5}" text-anchor="middle" class="cb-t" font-size="${arr.length>40?11:13}" font-family="JetBrains Mono, monospace">${n}</text>`}).join("")};
  s+=place(r.a,cxA-62,120,Math.max(2,Math.ceil(Math.sqrt(r.a.length*.8))));
  s+=place(r.both,(cxA+cxB)/2,60,Math.max(1,Math.ceil(Math.sqrt(r.both.length*.4))));
  s+=place(r.b,cxB+62,120,Math.max(2,Math.ceil(Math.sqrt(r.b.length*.8))));
  const none=r.none;const perRow=Math.floor((W-80)/30);
  none.forEach((n,i)=>{const row=Math.floor(i/perRow);s+=`<text x="${50+(i%perRow)*30}" y="${H-46+row*16- (Math.ceil(none.length/perRow)-1)*16}" class="cb-tm" font-size="12" font-family="JetBrains Mono, monospace">${n}</text>`});
  return s+"</svg>";
}
function renderCarroll(){
  const r=sortSets();if(!r.nums.length)return emptyMsg("Type the numbers to sort, e.g. 1-30 or 4, 9, 12.");
  const cell=a=>a.length?a.map(n=>`<span>${n}</span>`).join(""):'<span style="color:var(--muted)">—</span>';
  return `<div class="chart-title">${esc(S.title)}</div><div class="tbl-wrap"><table class="cb-k carroll"><thead><tr><th></th><th>${esc(r.nameA)}</th><th>Not ${esc(r.nameA.toLowerCase())}</th></tr></thead><tbody>
  <tr><th class="l">${esc(r.nameB)}</th><td>${cell(r.both)}</td><td>${cell(r.b)}</td></tr>
  <tr><th class="l">Not ${esc(r.nameB.toLowerCase())}</th><td>${cell(r.a)}</td><td>${cell(r.none)}</td></tr></tbody></table></div>`;
}
const RENDER={tally:renderTally,bar:()=>renderBar(false),dual:renderDual,pie:renderPie,waffle:renderWaffle,picto:renderPicto,freq:renderFreq,line:renderLine,scatter:renderScatter,twoway:()=>renderTwoway(false),venn:renderVenn,carroll:renderCarroll};

/* ---------- working ---------- */
const step=(n,html)=>`<div class="cb-step"><span class="no">${n}</span><div>${html}</div></div>`;
function working(){
  const t=S.type;
  if(["tally","bar","picto","freq","pie","waffle"].includes(t)){
    const d=single(),T=d.reduce((a,r)=>a+r.v,0);if(!d.length)return"";
    if(t==="pie"){const ang=pieAngles(d),per=T?360/T:0;
      return `<h3>Working: angles for the pie chart</h3>${step(1,`Total frequency = ${d.map(r=>fmt(r.v)).join(" + ")} = <b>${fmt(T)}</b>`)}
      ${step(2,`One item is worth <span class="formula">360° ÷ ${fmt(T)} = ${fmt(per,3)}°</span>`)}
      ${step(3,`Angle for each category <span class="formula">= frequency × ${fmt(per,3)}°</span>`)}
      <div class="tbl-wrap"><table class="cb-k"><thead><tr><th class="l">${esc(S.xLabel||"Category")}</th><th>Frequency</th><th>Calculation</th><th>Angle</th></tr></thead><tbody>
      ${d.map((r,i)=>`<tr><td class="l">${esc(r.l)}</td><td>${fmt(r.v)}</td><td class="calc">${fmt(r.v)} ÷ ${fmt(T)} × 360</td><td><b>${fmt(ang[i],1)}°</b></td></tr>`).join("")}
      <tr class="tot"><td class="l">Total</td><td>${fmt(T)}</td><td></td><td>${fmt(ang.reduce((a,b)=>a+b,0),1)}°</td></tr></tbody></table></div>
      ${step(4,"Draw a circle and a vertical radius. Measure the first angle clockwise from it with a protractor, draw the next radius, and carry on from there.")}`}
    if(t==="waffle"){const sq=largestRemainder(d.map(r=>r.v),100);
      return `<h3>Working: squares for the waffle diagram</h3>${step(1,`Total = <b>${fmt(T)}</b>. The grid has 100 squares, so 1 square = 1% = ${fmt(T/100,3)} ${T/100===1?"item":"items"}.`)}
      ${step(2,`Percentage <span class="formula">= frequency ÷ ${fmt(T)} × 100</span>`)}
      <div class="tbl-wrap"><table class="cb-k"><thead><tr><th class="l">${esc(S.xLabel||"Category")}</th><th>Frequency</th><th>Calculation</th><th>Percentage</th><th>Squares</th></tr></thead><tbody>
      ${d.map((r,i)=>`<tr><td class="l">${esc(r.l)}</td><td>${fmt(r.v)}</td><td class="calc">${fmt(r.v)} ÷ ${fmt(T)} × 100</td><td>${fmt(T?r.v/T*100:0,1)}%</td><td><b>${sq[i]}</b></td></tr>`).join("")}
      <tr class="tot"><td class="l">Total</td><td>${fmt(T)}</td><td></td><td>100%</td><td>100</td></tr></tbody></table></div>
      ${step(3,"Round each percentage to a whole number of squares. If the rounded numbers do not add to 100, give the extra square to the category whose percentage was closest to rounding up.")}`}
    if(t==="picto"){const k=pictoKey(d);
      return `<h3>Working: symbols in the pictogram</h3>${step(1,`Key: one symbol = <b>${fmt(k)}</b>. Number of symbols <span class="formula">= frequency ÷ ${fmt(k)}</span>`)}
      <div class="tbl-wrap"><table class="cb-k"><thead><tr><th class="l">${esc(S.xLabel||"Category")}</th><th>Frequency</th><th>Calculation</th><th>Symbols</th></tr></thead><tbody>
      ${d.map(r=>`<tr><td class="l">${esc(r.l)}</td><td>${fmt(r.v)}</td><td class="calc">${fmt(r.v)} ÷ ${fmt(k)}</td><td><b>${fmt(r.v/k,2)}</b></td></tr>`).join("")}</tbody></table></div>
      ${step(2,"A part symbol shows a remainder: half a symbol is half the key value, a quarter is a quarter.")}`}
    const max=Math.max(...d.map(r=>r.v)),modes=d.filter(r=>r.v===max).map(r=>r.l);
    let out=`<h3>Reading the data</h3>${step(1,`Total frequency = <b>${fmt(T)}</b>`)}${step(2,`Highest frequency: <b>${esc(modes.join(", "))}</b> (${fmt(max)}) — the ${t==="freq"?"modal class":"mode"}.`)}`;
    if(t!=="tally"){const {step:st,top}=nice(max);out+=step(3,`Scale on the frequency axis: each gridline is ${fmt(st)}, from 0 to ${fmt(top)}.`)}
    if(t==="freq")out+=step(4,"The bars touch because time (or height, mass…) is continuous: there is no gap between 14.99… and 15.");
    if(t==="bar")out+=step(4,"Equal gaps between bars because each category is separate.");
    return out;
  }
  if(t==="dual"||t==="twoway"){const d=double();if(!d.length)return"";const ta=d.reduce((a,r)=>a+r.a,0),tb=d.reduce((a,r)=>a+r.b,0);
    return `<h3>${t==="dual"?"Comparing the two groups":"Working out the totals"}</h3>
    ${step(1,`${esc(S.s1)} total = ${d.map(r=>fmt(r.a)).join(" + ")} = <b>${fmt(ta)}</b>`)}
    ${step(2,`${esc(S.s2)} total = ${d.map(r=>fmt(r.b)).join(" + ")} = <b>${fmt(tb)}</b>`)}
    ${step(3,`Grand total = ${fmt(ta)} + ${fmt(tb)} = <b>${fmt(ta+tb)}</b>${t==="twoway"?" — the row totals add to this as well: "+d.map(r=>fmt(r.a+r.b)).join(" + ")+" = "+fmt(ta+tb):""}`)}
    ${t==="dual"?step(4,"Biggest difference: <b>"+esc(d.slice().sort((p,q)=>Math.abs(q.a-q.b)-Math.abs(p.a-p.b))[0].l)+"</b>"):""}`}
  if(t==="line"){const d=lineData();if(d.length<2)return"";const f=d.find(r=>r.a!=null),l=[...d].reverse().find(r=>r.a!=null);
    let big=null;for(let i=1;i<d.length;i++)if(d[i].a!=null&&d[i-1].a!=null){const c=d[i].a-d[i-1].a;if(!big||c>big.c)big={c,from:d[i-1].l,to:d[i].l}}
    return `<h3>Reading the line graph</h3>${step(1,`${esc(S.s1||"Value")} goes from ${fmt(f.a)} to ${fmt(l.a)}: a change of <b>${fmt(l.a-f.a)}</b>.`)}
    ${big?step(2,`Steepest increase: between ${esc(big.from)} and ${esc(big.to)} (+${fmt(big.c)}). The steeper the line, the faster the change.`):""}
    ${step(3,"Points are joined because the quantity changes continuously between readings.")}`}
  if(t==="scatter"){const p=xyData();if(p.length<2)return"";const r=corr(p),w=relWord(r);
    return `<h3>Describing the relationship</h3>${step(1,`${p.length} points plotted, one for each pair of measurements.`)}
    ${step(2,w==="none"?"The points are spread out with no clear pattern: <b>no relationship</b>.":`The points go ${w==="positive"?"up":"down"} from left to right: a <b>${w} relationship</b>. As ${esc(S.xLabel||"x")} increases, ${esc(S.yLabel||"y")} tends to ${w==="positive"?"increase":"decrease"}.`)}
    ${step(3,`Strength (correlation coefficient, for teachers): r = ${fmt(r,2)}`)}`}
  if(t==="venn"||t==="carroll"){const r=sortSets();if(!r.nums.length)return"";
    return `<h3>Sorting the numbers</h3>${step(1,`${esc(r.nameA)} and ${esc(r.nameB)}: <b>${r.both.length}</b> — ${r.both.join(", ")||"none"}`)}
    ${step(2,`${esc(r.nameA)} only: <b>${r.a.length}</b> — ${r.a.join(", ")||"none"}`)}
    ${step(3,`${esc(r.nameB)} only: <b>${r.b.length}</b> — ${r.b.join(", ")||"none"}`)}
    ${step(4,`Neither: <b>${r.none.length}</b> — ${r.none.join(", ")||"none"}`)}
    ${step(5,`Check: ${r.both.length} + ${r.a.length} + ${r.b.length} + ${r.none.length} = ${r.nums.length} numbers.`)}`}
  return "";
}

/* ---------- practice ---------- */
function qRow(text,ans,kind="num",opts){
  const id="q"+Math.random().toString(36).slice(2,8);
  const ctl=kind==="sel"?`<select id="${id}" data-ans="${esc(ans)}" data-kind="sel"><option value="">Choose…</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select>`
    :`<input type="number" step="any" id="${id}" data-ans="${ans}" data-tol="${kind==="ang"?1:kind==="sym"?0.01:0.001}" inputmode="decimal">`;
  return `<div class="q"><label for="${id}">${text}</label>${ctl}<span class="mark" aria-live="polite"></span></div>`;
}
function practice(){
  const t=S.type;let qs="",intro="";
  if(t==="pie"){const d=single().filter(r=>r.v>0),ang=pieAngles(d),T=d.reduce((a,r)=>a+r.v,0);
    intro=`Total = ${fmt(T)}. Work out the angle for each category (to the nearest degree), then check.`;
    qs=qRow(`Angle for one item (360 ÷ ${fmt(T)})`,Math.round(360/T*1000)/1000,"sym")+d.map((r,i)=>qRow(`Angle for <b>${esc(r.l)}</b> (frequency ${fmt(r.v)})`,ang[i],"ang")).join("")}
  else if(t==="waffle"){const d=single().filter(r=>r.v>0),sq=largestRemainder(d.map(r=>r.v),100),T=d.reduce((a,r)=>a+r.v,0);
    intro=`Total = ${fmt(T)}. How many of the 100 squares should each category get?`;
    qs=d.map((r,i)=>qRow(`Squares for <b>${esc(r.l)}</b> (frequency ${fmt(r.v)})`,sq[i],"ang")).join("")}
  else if(t==="picto"){const d=single(),k=pictoKey(d);intro=`Key: one symbol = ${fmt(k)}. How many symbols for each row?`;
    qs=d.map(r=>qRow(`Symbols for <b>${esc(r.l)}</b> (${fmt(r.v)})`,Math.round(r.v/k*100)/100,"sym")).join("")}
  else if(t==="twoway"){intro="Fill in every total in the table, then check.";return {intro,html:renderTwoway(true)}}
  else if(t==="scatter"){const p=xyData();intro="Look at the scatter graph (it stays visible) and describe it.";
    qs=qRow("What type of relationship does the graph show?",relWord(corr(p)),"sel",["positive","negative","none"]);return {intro,html:qs,keepChart:true}}
  else if(t==="venn"||t==="carroll"){const r=sortSets();intro=`Sort the numbers ${esc(S.sets.list)} yourself, then count each region.`;
    qs=qRow(`How many are <b>${esc(r.nameA)}</b> and <b>${esc(r.nameB)}</b>?`,r.both.length)+qRow(`How many are ${esc(r.nameA)} only?`,r.a.length)+qRow(`How many are ${esc(r.nameB)} only?`,r.b.length)+qRow("How many are in neither?",r.none.length)}
  else if(t==="line"){const d=lineData();intro="Read the graph (it stays visible) to answer.";const f=d.find(r=>r.a!=null),l=[...d].reverse().find(r=>r.a!=null);
    qs=f&&l?qRow(`${esc(S.s1||"Value")} at ${esc(f.l)}`,f.a)+qRow(`${esc(S.s1||"Value")} at ${esc(l.l)}`,l.a)+qRow(`Increase from ${esc(f.l)} to ${esc(l.l)}`,l.a-f.a):"";return {intro,html:qs,keepChart:true}}
  else if(t==="dual"){const d=double(),ta=d.reduce((a,r)=>a+r.a,0),tb=d.reduce((a,r)=>a+r.b,0);intro="Read the chart (it stays visible) to answer.";
    qs=qRow(`Total for ${esc(S.s1)}`,ta)+qRow(`Total for ${esc(S.s2)}`,tb)+qRow("Which group is larger overall?",ta>=tb?S.s1:S.s2,"sel",[S.s1,S.s2]);return {intro,html:qs,keepChart:true}}
  else{const d=single(),T=d.reduce((a,r)=>a+r.v,0),max=Math.max(...d.map(r=>r.v)),min=Math.min(...d.map(r=>r.v));
    intro=t==="tally"?"Count the tallies yourself.":"Answer from the data.";
    if(t==="tally")qs=d.map(r=>qRow(`Frequency for <b>${esc(r.l)}</b> — ${r.v<=200?tallySvg(r.v).replace("<svg",'<svg style="height:20px;vertical-align:middle;color:var(--fg)"'):""}`,r.v)).join("")+qRow("Total frequency",T);
    else qs=qRow("Total frequency",T)+qRow("Highest frequency minus lowest frequency",max-min)+(d.filter(r=>r.v===max).length===1?qRow(t==="freq"?"Which is the modal class?":"Which is the mode (most common)?",d.find(r=>r.v===max).l,"sel",d.map(r=>r.l)):"");
    return {intro,html:qs,keepChart:t!=="tally"}}
  return {intro,html:qs};
}
function checkAll(){
  let right=0,total=0;
  $("#paper").querySelectorAll("[data-ans]").forEach(el=>{total++;const ok=el.dataset.kind==="sel"?el.value===el.dataset.ans:(el.value!==""&&Math.abs(num(el.value)-num(el.dataset.ans))<=num(el.dataset.tol||0.001));if(ok)right++;el.style.borderColor=ok?"var(--ok)":"var(--bad)";el.style.background=ok?"var(--ok-soft)":"var(--bad-soft)"});
  $("#work").querySelectorAll("[data-ans]").forEach(el=>{total++;const q=el.closest(".q"),m=q.querySelector(".mark");
    const ok=el.dataset.kind==="sel"?el.value===el.dataset.ans:(el.value!==""&&Math.abs(num(el.value)-num(el.dataset.ans))<=num(el.dataset.tol));
    if(ok)right++;q.classList.toggle("ok",ok);q.classList.toggle("bad",!ok);m.textContent=ok?"✓":"✗";m.className="mark "+(ok?"ok":"bad")});
  const sc=$("#score");if(sc)sc.textContent=`${right} / ${total} correct${right===total&&total?" — well done!":""}`;
}
function revealAll(){
  if($("#paper .hidden-chart"))$("#paper").innerHTML=RENDER[S.type]();
  document.querySelectorAll("#paper [data-ans], #work [data-ans]").forEach(el=>{const a=el.dataset.ans;el.value=el.dataset.kind==="sel"?a:fmt(num(a),el.dataset.tol==="1"?1:2)});checkAll();
}

/* ---------- UI ---------- */
function buildTypes(){
  $("#types").innerHTML=Object.entries(TYPES).map(([k,t])=>`<button class="type" data-t="${k}" aria-pressed="${S.type===k}"><svg viewBox="0 0 34 24" aria-hidden="true">${ICONS[k]}</svg><span>${t.name}</span><small>${t.sub}</small></button>`).join("");
}
function buildPresets(){$("#preset").innerHTML=`<option value="">— choose an example —</option>`+PRESETS.map(p=>`<option value="${p.id}" ${S.preset===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}
function critSel(which){const c=S.sets[which];return `<div class="row2"><select id="sk_${which}" aria-label="Property ${which.toUpperCase()}">${Object.entries(CRIT).map(([k,v])=>`<option value="${k}" ${c.k===k?"selected":""}>${v.t("n").replace(/ n$/," …")}</option>`).join("")}</select><input type="number" id="sn_${which}" value="${c.n}" aria-label="Number for property ${which.toUpperCase()}" ${CRIT[c.k].needN?"":"disabled"}></div>`}
function buildEditor(){
  const mode=TYPES[S.type].mode;const ed=$("#editor");
  $("#axisRow").hidden=mode==="sets";
  $("#xLabelLab").textContent=mode==="xy"?"x-axis label":mode==="double"&&S.type==="twoway"?"Row heading":"Horizontal axis label";
  $("#yLabelLab").textContent=mode==="xy"?"y-axis label":S.type==="picto"?"Item name (for the key)":"Vertical axis label";
  if(mode==="sets"){
    ed.innerHTML=`<div class="stack" style="gap:10px"><div class="cb-field"><label for="setList">Numbers to sort</label><input type="text" id="setList" value="${esc(S.sets.list)}"><p class="cb-hint">Use a range like 1-30 or a list like 3, 8, 12, 15.</p></div>
    <div class="cb-field"><span class="lab">Property A</span>${critSel("a")}</div><div class="cb-field"><span class="lab">Property B</span>${critSel("b")}</div></div>`;
    return;
  }
  const showL=mode!=="xy",showB=mode==="double"||mode==="line"||mode==="xy";
  const hL=mode==="line"?"Time":S.type==="freq"?"Class":"Category";
  const hA=mode==="xy"?"x":mode==="single"?"Frequency":null,hB=mode==="xy"?"y":null;
  const head=`<tr><th></th>${showL?`<th>${hL}</th>`:""}<th>${hA?hA:`<input type="text" id="s1" value="${esc(S.s1)}" aria-label="First series name">`}</th>${showB?`<th>${hB?hB:`<input type="text" id="s2" value="${esc(S.s2)}" placeholder="${mode==="line"?"2nd line (optional)":"Group 2"}" aria-label="Second series name">`}</th>`:""}<th></th></tr>`;
  const body=S.rows.map((r,i)=>`<tr><td class="cb-n">${i+1}</td>${showL?`<td><input type="text" data-i="${i}" data-f="l" value="${esc(r.l)}" aria-label="Label row ${i+1}"></td>`:""}<td><input type="number" step="any" data-i="${i}" data-f="a" value="${esc(r.a)}" aria-label="Value row ${i+1}"></td>${showB?`<td><input type="number" step="any" data-i="${i}" data-f="b" value="${esc(r.b)}" aria-label="Second value row ${i+1}"></td>`:""}<td class="x"><button class="icon-btn" data-del="${i}" aria-label="Delete row ${i+1}"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8"/></svg></button></td></tr>`).join("");
  let extra="";
  if(S.type==="picto")extra=`<div class="row2"><div class="cb-field"><label for="pSym">Symbol</label><select id="pSym">${["circle","square","star","person","book"].map(s=>`<option ${S.picto.sym===s?"selected":""}>${s}</option>`).join("")}</select></div><div class="cb-field"><label for="pKey">1 symbol = (0 = auto)</label><input type="number" id="pKey" min="0" value="${S.picto.key}"></div></div>`;
  const raw=mode==="single"?`<details class="raw"><summary>Build the table from raw results</summary><div class="body"><textarea id="rawText" placeholder="e.g. 36, 35, 36, 38, 34, 36, 37 … or red blue red green"></textarea><div class="row2"><div class="cb-field"><label for="rawW">Group width (optional)</label><input type="number" id="rawW" step="any" placeholder="e.g. 10"></div><div class="cb-field"><label for="rawS">First class starts at</label><input type="number" id="rawS" step="any" placeholder="auto"></div></div><div class="btns"><button class="cb-btn cb-primary" id="rawGo">Make frequency table</button></div><p class="cb-hint">Leave the width empty to count each value. Give a width to group continuous data into classes like 10 ≤ x &lt; 20.</p></div></details>`:"";
  ed.innerHTML=`<div class="tbl-wrap"><table class="dt"><thead>${head}</thead><tbody>${body}</tbody></table></div><div class="btns" style="margin-top:6px"><button class="cb-btn" id="addRow">+ Add row</button><button class="cb-btn" id="clearRows">Clear values</button></div>${extra}${raw}`;
}
function buildTips(){
  const t=TYPES[S.type];$("#tipsTitle").textContent=t.name;$("#useWhen").textContent=t.use;
  $("#tipList").innerHTML=t.tips.map(x=>`<li>${esc(x)}</li>`).join("");
}
function totalChip(){
  const m=TYPES[S.type].mode;let txt="";
  if(m==="single")txt="Total "+fmt(single().reduce((a,r)=>a+r.v,0));
  else if(m==="double"){const d=double();txt="Total "+fmt(d.reduce((a,r)=>a+r.a+r.b,0))}
  else if(m==="xy")txt=xyData().length+" points";
  else if(m==="line")txt=lineData().length+" readings";
  else txt=parseList(S.sets.list).length+" numbers";
  $("#totalChip").textContent=txt;
}
function renderStage(){
  const t=S.type;$("#stageTitle").textContent=TYPES[t].name;
  $("#tWork").setAttribute("aria-pressed",S.showWork);$("#tPractice").setAttribute("aria-pressed",S.practice);
  totalChip();
  if(S.practice){
    const p=practice();
    if(t==="twoway"){$("#paper").innerHTML=p.html;$("#work").innerHTML=`<h3>Practice</h3><p class="cb-hint">${p.intro}</p><div class="btns"><button class="cb-btn cb-primary" id="chk">Check answers</button><button class="cb-btn" id="rev">Show answers</button><span class="score" id="score"></span></div>`;return}
    $("#paper").innerHTML=p.keepChart?RENDER[t]():`<div class="hidden-chart"><div><b>Chart hidden while you practise</b>Work out the answers below, then press “Show answers” or switch practice mode off to see the finished chart.</div></div>`;
    $("#work").innerHTML=`<h3>Practice</h3><p class="cb-hint">${p.intro}</p><div>${p.html||'<p class="cb-hint">Add data first.</p>'}</div><div class="btns"><button class="cb-btn cb-primary" id="chk">Check answers</button><button class="cb-btn" id="rev">Show answers</button><span class="score" id="score"></span></div>`;
    return;
  }
  $("#paper").innerHTML=RENDER[t]();
  $("#work").innerHTML=S.showWork?working():"";
  $("#work").hidden=!S.showWork;
}
function chooser(){
  const d=$("#chData").value,g=$("#chGoal").value;let r=[];
  if(d==="sets")r=["venn","carroll"];
  else if(d==="two")r=g==="time"?["line"]:["scatter"];
  else if(g==="record")r=["tally"];
  else if(g==="share")r=d==="cont"?["freq"]:["pie","waffle"];
  else if(g==="groups")r=d==="cont"?["line","dual"]:["dual","twoway"];
  else if(g==="time")r=["line"];
  else if(g==="rel")r=["scatter"];
  else r=d==="cont"?["freq"]:["bar","picto"];
  $("#rec").innerHTML=`<span>Try:</span>`+r.map(k=>`<button data-go="${k}">${TYPES[k].name}</button>`).join("");
}
function full(){buildTypes();buildPresets();$("#title").value=S.title;$("#xLabel").value=S.xLabel;$("#yLabel").value=S.yLabel;buildEditor();buildTips();renderStage();save()}
function soft(){renderStage();save()}

/* ---------- events ---------- */
$("#types").addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;const nt=b.dataset.t,om=TYPES[S.type].mode,nm=TYPES[nt].mode;
  S.type=nt;full()});
$("#preset").addEventListener("change",e=>{const p=PRESETS.find(x=>x.id===e.target.value);if(!p)return;const keep={showWork:S.showWork};S=fromPreset(p);S.showWork=keep.showWork;full()});
["title","xLabel","yLabel"].forEach(id=>$("#"+id).addEventListener("input",e=>{S[id]=e.target.value;soft()}));
$("#editor").addEventListener("input",e=>{const el=e.target;
  if(el.dataset.i!=null){S.rows[+el.dataset.i][el.dataset.f]=el.value;soft();return}
  if(el.id==="s1"||el.id==="s2"){S[el.id]=el.value;soft();return}
  if(el.id==="setList"){S.sets.list=el.value;soft();return}
  if(el.id==="sn_a"||el.id==="sn_b"){S.sets[el.id.slice(-1)].n=num(el.value);soft();return}
  if(el.id==="pKey"){S.picto.key=Math.max(0,num(el.value));soft();return}
});
$("#editor").addEventListener("change",e=>{const el=e.target;
  if(el.id==="sk_a"||el.id==="sk_b"){const w=el.id.slice(-1);S.sets[w].k=el.value;buildEditor();soft()}
  if(el.id==="pSym"){S.picto.sym=el.value;soft()}
});
$("#editor").addEventListener("click",e=>{
  const del=e.target.closest("[data-del]");if(del){S.rows.splice(+del.dataset.del,1);buildEditor();soft();return}
  if(e.target.id==="addRow"){S.rows.push({l:"",a:"",b:""});buildEditor();soft();const ins=$("#editor").querySelectorAll('input[data-f]');const last=[...ins].filter(x=>x.dataset.i==S.rows.length-1)[0];last&&last.focus();return}
  if(e.target.id==="clearRows"){S.rows.forEach(r=>{r.a="";r.b=""});buildEditor();soft();return}
  if(e.target.id==="rawGo"){
    const toks=$("#rawText").value.split(/[,;\n\t ]+/).map(x=>x.trim()).filter(Boolean);if(!toks.length)return;
    const w=num($("#rawW").value),allNum=toks.every(x=>isFinite(+x));
    if(w>0&&allNum){const v=toks.map(Number),mn=Math.min(...v),mx=Math.max(...v);let st=$("#rawS").value!==""?num($("#rawS").value):Math.floor(mn/w)*w;const rows=[];
      for(let a=st;a<=mx;a=Math.round((a+w)*1e9)/1e9){const b=Math.round((a+w)*1e9)/1e9;rows.push({l:`${fmt(a)} ≤ x < ${fmt(b)}`,a:v.filter(x=>x>=a&&x<b).length,b:""});if(rows.length>40)break}
      S.rows=rows;if(!["freq","tally","bar"].includes(S.type))S.type="freq";}
    else{const cnt=new Map();toks.forEach(t=>cnt.set(t,(cnt.get(t)||0)+1));let keys=[...cnt.keys()];if(allNum)keys.sort((a,b)=>a-b);S.rows=keys.map(k=>({l:k,a:cnt.get(k),b:""}))}
    S.preset="";full();
  }
});
$("#tWork").addEventListener("click",()=>{S.showWork=!S.showWork;if(S.showWork)S.practice=false;soft()});
$("#tPractice").addEventListener("click",()=>{S.practice=!S.practice;if(S.practice)S.showWork=true;soft()});
$("#stagePanel").addEventListener("click",e=>{if(e.target.id==="chk")checkAll();if(e.target.id==="rev")revealAll()});
$("#chData").addEventListener("change",chooser);$("#chGoal").addEventListener("change",chooser);
$("#rec").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b){S.type=b.dataset.go;full();document.getElementById("cbRoot").scrollIntoView({behavior:"smooth"})}});
if(location.hash&&TYPES[location.hash.slice(1)]){S.type=location.hash.slice(1)}
chooser();full();
})();
