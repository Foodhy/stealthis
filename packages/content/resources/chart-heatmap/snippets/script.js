// Generate a year of random contribution data
const COLORS = ['#1e2130','#2a3a5c','#3b5998','#6366f1','#a5b4fc'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const tooltip = document.getElementById('chartTooltip');
const svgEl   = document.getElementById('heatmapSvg');

function level(v){ if(v===0)return 0; if(v<2)return 1; if(v<5)return 2; if(v<9)return 3; return 4; }

function draw(){
  const CELL=14, GAP=3, STEP=CELL+GAP;
  const today=new Date();
  const start=new Date(today);
  start.setFullYear(start.getFullYear()-1);
  // align to Sunday
  start.setDate(start.getDate()-start.getDay());

  const weeks=[];
  const d=new Date(start);
  while(d<=today){
    const week=[];
    for(let i=0;i<7;i++){
      const val = d<=today ? Math.floor(Math.pow(Math.random(),1.5)*15) : -1;
      week.push({date:new Date(d),val});
      d.setDate(d.getDate()+1);
    }
    weeks.push(week);
  }

  const LEFT_PAD=28, TOP_PAD=20, BOTTOM_PAD=8;
  const W=weeks.length*STEP+LEFT_PAD;
  const H=7*STEP+TOP_PAD+BOTTOM_PAD;
  svgEl.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svgEl.style.width=Math.min(document.getElementById('heatmapWrap').clientWidth-32,W)+'px';
  svgEl.style.height=(H*((document.getElementById('heatmapWrap').clientWidth-32)/W))+'px';
  svgEl.innerHTML='';

  // Day labels
  ['S','M','T','W','T','F','S'].forEach((lbl,i)=>{
    if(i%2===0){
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',LEFT_PAD-6);t.setAttribute('y',TOP_PAD+i*STEP+CELL-1);
      t.setAttribute('class','hm-label');t.setAttribute('text-anchor','end');
      t.textContent=lbl;svgEl.appendChild(t);
    }
  });

  // Month labels
  let prevMonth=-1;
  weeks.forEach((week,wi)=>{
    const month=week[0].date.getMonth();
    if(month!==prevMonth){
      prevMonth=month;
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',LEFT_PAD+wi*STEP);t.setAttribute('y',TOP_PAD-6);
      t.setAttribute('class','hm-label');
      t.textContent=MONTHS[month];svgEl.appendChild(t);
    }
  });

  // Cells
  weeks.forEach((week,wi)=>{
    week.forEach((day,di)=>{
      if(day.val<0)return;
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x',LEFT_PAD+wi*STEP);
      rect.setAttribute('y',TOP_PAD+di*STEP);
      rect.setAttribute('width',CELL);rect.setAttribute('height',CELL);
      rect.setAttribute('rx',2);
      rect.setAttribute('fill',COLORS[level(day.val)]);
      rect.setAttribute('class','hm-cell-rect');
      rect.addEventListener('mouseenter',e=>{
        const fmt=day.date.toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});
        tooltip.innerHTML=`<strong>${fmt}</strong><br/>${day.val} contribution${day.val!==1?'s':''}`;
        tooltip.hidden=false;tooltip.style.left=(e.clientX+12)+'px';tooltip.style.top=(e.clientY-40)+'px';
      });
      rect.addEventListener('mousemove',e=>{tooltip.style.left=(e.clientX+12)+'px';tooltip.style.top=(e.clientY-40)+'px';});
      rect.addEventListener('mouseleave',()=>tooltip.hidden=true);
      svgEl.appendChild(rect);
    });
  });
}

draw();
