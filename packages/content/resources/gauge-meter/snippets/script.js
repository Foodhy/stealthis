const GAUGES=[
  { id:'gauge1', value:68, min:0, max:100, zones:[{from:0,to:50,color:'#34d399'},{from:50,to:75,color:'#f59e0b'},{from:75,to:100,color:'#f87171'}] },
  { id:'gauge2', value:42, min:0, max:100, zones:[{from:0,to:50,color:'#34d399'},{from:50,to:80,color:'#f59e0b'},{from:80,to:100,color:'#f87171'}] },
  { id:'gauge3', value:87, min:0, max:100, zones:[{from:0,to:40,color:'#f87171'},{from:40,to:70,color:'#f59e0b'},{from:70,to:100,color:'#34d399'}] },
];

const SIZE=200, CX=SIZE/2, CY=SIZE*0.6, R=80, STROKE=16;
const START_ANG=-210*(Math.PI/180), END_ANG=30*(Math.PI/180);

function ptOnArc(r,ang){
  return [CX+r*Math.cos(ang), CY+r*Math.sin(ang)];
}

function arcD(r,a1,a2){
  const [sx,sy]=ptOnArc(r,a1);
  const [ex,ey]=ptOnArc(r,a2);
  const large=a2-a1>Math.PI?1:0;
  return `M${sx.toFixed(2)},${sy.toFixed(2)} A${r},${r} 0 ${large},1 ${ex.toFixed(2)},${ey.toFixed(2)}`;
}

function valToAng(v,min,max){
  return START_ANG+(v-min)/(max-min)*(END_ANG-START_ANG);
}

function buildGauge(cfg){
  const wrap=document.getElementById(cfg.id);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',SIZE);svg.setAttribute('height',SIZE*0.7);
  svg.setAttribute('viewBox',`0 0 ${SIZE} ${SIZE*0.7}`);
  svg.classList.add('gauge-svg');

  // Track
  const track=document.createElementNS('http://www.w3.org/2000/svg','path');
  track.setAttribute('d',arcD(R,START_ANG,END_ANG));
  track.setAttribute('fill','none');track.setAttribute('stroke','#1e2130');
  track.setAttribute('stroke-width',STROKE);track.setAttribute('stroke-linecap','round');
  svg.appendChild(track);

  // Zones
  cfg.zones.forEach(z=>{
    const a1=valToAng(z.from,cfg.min,cfg.max);
    const a2=valToAng(z.to,cfg.min,cfg.max);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',arcD(R,a1,a2));
    p.setAttribute('fill','none');p.setAttribute('stroke',z.color);
    p.setAttribute('stroke-width',STROKE*0.55);p.setAttribute('stroke-linecap','round');
    svg.appendChild(p);
  });

  // Min / Max labels
  const [mlx,mly]=ptOnArc(R+18,START_ANG);
  const ml=document.createElementNS('http://www.w3.org/2000/svg','text');
  ml.setAttribute('x',mlx);ml.setAttribute('y',mly);ml.setAttribute('text-anchor','middle');
  ml.setAttribute('fill','#64748b');ml.setAttribute('font-size','10');
  ml.setAttribute('font-family','inherit');ml.textContent=cfg.min;
  svg.appendChild(ml);

  const [mxlx,mxly]=ptOnArc(R+18,END_ANG);
  const mxl=document.createElementNS('http://www.w3.org/2000/svg','text');
  mxl.setAttribute('x',mxlx);mxl.setAttribute('y',mxly);mxl.setAttribute('text-anchor','middle');
  mxl.setAttribute('fill','#64748b');mxl.setAttribute('font-size','10');
  mxl.setAttribute('font-family','inherit');mxl.textContent=cfg.max;
  svg.appendChild(mxl);

  // Needle
  const needleG=document.createElementNS('http://www.w3.org/2000/svg','g');
  const needle=document.createElementNS('http://www.w3.org/2000/svg','line');
  needle.setAttribute('x1',CX);needle.setAttribute('y1',CY);
  needle.setAttribute('stroke','#e2e8f0');needle.setAttribute('stroke-width','2.5');
  needle.setAttribute('stroke-linecap','round');
  needleG.appendChild(needle);

  // Pivot
  const pivot=document.createElementNS('http://www.w3.org/2000/svg','circle');
  pivot.setAttribute('cx',CX);pivot.setAttribute('cy',CY);pivot.setAttribute('r','6');
  pivot.setAttribute('fill','#e2e8f0');
  needleG.appendChild(pivot);
  svg.appendChild(needleG);

  // Value label
  const valLbl=document.createElementNS('http://www.w3.org/2000/svg','text');
  valLbl.setAttribute('x',CX);valLbl.setAttribute('y',CY-16);
  valLbl.setAttribute('text-anchor','middle');valLbl.setAttribute('font-size','22');
  valLbl.setAttribute('font-weight','800');valLbl.setAttribute('fill','#e2e8f0');
  valLbl.setAttribute('font-family','inherit');
  svg.appendChild(valLbl);

  wrap.appendChild(svg);
  cfg._needle=needle;cfg._valLbl=valLbl;
  animateGauge(cfg,cfg.value);
}

function setNeedle(cfg,v){
  const ang=valToAng(v,cfg.min,cfg.max);
  const [ex,ey]=ptOnArc(R-STROKE/2-2,ang);
  cfg._needle.setAttribute('x2',ex.toFixed(2));
  cfg._needle.setAttribute('y2',ey.toFixed(2));
  cfg._valLbl.textContent=Math.round(v);
}

function animateGauge(cfg,target){
  let start=null;const duration=1000;const from=+(cfg._current||cfg.min);
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/duration,1);
    const v=from+(target-from)*(1-Math.pow(1-p,3));
    setNeedle(cfg,v);
    if(p<1)requestAnimationFrame(step);
    else cfg._current=target;
  }
  requestAnimationFrame(step);
}

GAUGES.forEach(buildGauge);

document.getElementById('randomBtn')?.addEventListener('click',()=>{
  GAUGES.forEach(g=>animateGauge(g,Math.floor(Math.random()*91)+5));
});
