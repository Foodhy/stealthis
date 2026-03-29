const GROUPS = [
  { label: 'Team A', color: '#818cf8', points: [
    {name:'Auth',x:12,y:3},{name:'Dashboard',x:18,y:7},{name:'Profile',x:8,y:2},
    {name:'Settings',x:22,y:11},{name:'Reports',x:15,y:5}
  ]},
  { label: 'Team B', color: '#34d399', points: [
    {name:'API',x:25,y:9},{name:'Search',x:30,y:14},{name:'Payments',x:20,y:6},
    {name:'Mobile',x:35,y:18},{name:'Export',x:14,y:4}
  ]},
  { label: 'Team C', color: '#f59e0b', points: [
    {name:'Admin',x:40,y:20},{name:'CMS',x:28,y:12},{name:'Email',x:10,y:1},
    {name:'CDN',x:45,y:22}
  ]},
];

const PAD = {top:24,right:24,bottom:48,left:52};
const svg = document.getElementById('chartSvg');
const tooltip = document.getElementById('chartTooltip');
const wrap  = document.getElementById('chartWrap');
const legend = document.getElementById('legend');

GROUPS.forEach(g=>{
  const item=document.createElement('div');item.className='legend-item';
  item.innerHTML=`<span class="legend-swatch" style="background:${g.color}"></span><span>${g.label}</span>`;
  legend.appendChild(item);
});

function el(tag,attrs={}){
  const e=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
  return e;
}

function linReg(pts){
  const n=pts.length;
  const sumX=pts.reduce((a,p)=>a+p.x,0),sumY=pts.reduce((a,p)=>a+p.y,0);
  const sumXY=pts.reduce((a,p)=>a+p.x*p.y,0),sumX2=pts.reduce((a,p)=>a+p.x*p.x,0);
  const m=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX);
  const b=(sumY-m*sumX)/n;
  return {m,b};
}

function draw(){
  const W=wrap.clientWidth-32;
  const H=Math.round(W*0.5);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML='';

  const allPts=GROUPS.flatMap(g=>g.points);
  const maxX=Math.ceil(Math.max(...allPts.map(p=>p.x))*1.1);
  const maxY=Math.ceil(Math.max(...allPts.map(p=>p.y))*1.15);
  const cW=W-PAD.left-PAD.right;
  const cH=H-PAD.top-PAD.bottom;
  const xOf=v=>PAD.left+(v/maxX)*cW;
  const yOf=v=>PAD.top+cH-(v/maxY)*cH;

  // Grid
  for(let t=0;t<=5;t++){
    const v=Math.round((maxX/5)*t);
    const x=xOf(v);
    svg.appendChild(el('line',{class:'grid-line',x1:x,x2:x,y1:PAD.top,y2:PAD.top+cH}));
    const lbl=el('text',{class:'grid-label',x,y:H-8,'text-anchor':'middle'});
    lbl.textContent=v+' features';
    svg.appendChild(lbl);
  }
  for(let t=0;t<=5;t++){
    const v=Math.round((maxY/5)*t);
    const y=yOf(v);
    svg.appendChild(el('line',{class:'grid-line',x1:PAD.left,x2:PAD.left+cW,y1:y,y2:y}));
    const lbl=el('text',{class:'grid-label',x:PAD.left-6,y:y+3.5,'text-anchor':'end'});
    lbl.textContent=v;
    svg.appendChild(lbl);
  }

  // Regression line (all points)
  const reg=linReg(allPts);
  const rx1=0,ry1=reg.m*rx1+reg.b;
  const rx2=maxX,ry2=reg.m*rx2+reg.b;
  svg.appendChild(el('line',{class:'regression-line',x1:xOf(rx1),y1:yOf(ry1),x2:xOf(rx2),y2:yOf(ry2)}));

  // Points
  GROUPS.forEach(g=>{
    g.points.forEach((p,i)=>{
      const dot=el('circle',{class:'scatter-dot',cx:xOf(p.x),cy:yOf(p.y),r:7,fill:g.color,opacity:0.85,
        style:`animation:dotIn .4s ${i*0.05}s ease both`});
      dot.addEventListener('mouseenter',e=>{
        tooltip.innerHTML=`<strong>${p.name}</strong><br/>Features: ${p.x} &nbsp;|&nbsp; Bugs: ${p.y}`;
        tooltip.hidden=false;posTooltip(e);
      });
      dot.addEventListener('mousemove',posTooltip);
      dot.addEventListener('mouseleave',()=>tooltip.hidden=true);
      svg.appendChild(dot);
    });
  });

  const style=document.createElement('style');
  style.textContent=`@keyframes dotIn{from{r:0;opacity:0}to{opacity:.85}}`;
  document.head.querySelectorAll('style').length||document.head.appendChild(style);
}

function posTooltip(e){
  tooltip.style.left=(e.clientX+12)+'px';
  tooltip.style.top=(e.clientY-40)+'px';
}

if(!document.head.querySelector('[data-scatter-anim]')){
  const s=document.createElement('style');s.dataset.scatterAnim='1';
  s.textContent=`@keyframes dotIn{from{r:0;opacity:0}to{opacity:.85}}`;
  document.head.appendChild(s);
}

const ro=new ResizeObserver(draw);
ro.observe(wrap);
draw();
