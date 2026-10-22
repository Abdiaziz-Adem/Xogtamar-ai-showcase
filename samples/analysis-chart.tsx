'use client';

import {useRef, useState} from 'react';
import {Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {ArrowDownToLine, BarChart3, ChartNoAxesCombined, Check, ShieldCheck} from 'lucide-react';

export type AnalysisVisual = {
  type: 'line'|'bar'|'histogram'; title: string; x_label: string; y_label: string; method: string;
  points: {row?:number; label?:string; mean?:number|null; min?:number|null; max?:number|null; count?:number}[];
};

export default function AnalysisChart({visual:recommended,charts,onTypeChange}:{visual:AnalysisVisual;charts:Record<AnalysisVisual['type'],AnalysisVisual>;onTypeChange?:(type:AnalysisVisual['type'])=>void}) {
  const [selected,setSelected]=useState<AnalysisVisual['type']>(recommended.type);
  const visual=charts[selected];
  const chartRef=useRef<HTMLDivElement>(null);
  function saveChart() {
    const source=chartRef.current?.querySelector('svg.recharts-surface');
    if(!source)return;
    const svg=source.cloneNode(true) as SVGElement;
    const theme=getComputedStyle(document.documentElement);
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    svg.style.background=theme.getPropertyValue('--panel');
    for(const name of ['--accent','--muted','--border']) svg.style.setProperty(name,theme.getPropertyValue(name));
    svg.setAttribute('font-family','Segoe UI, Arial, sans-serif');
    const {width,height}=source.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 -50 ${width} ${height+95}`);
    svg.setAttribute('height',String(height+95));
    const addText=(text:string,x:number,y:number,size:number)=>{
      const label=document.createElementNS('http://www.w3.org/2000/svg','text');
      label.textContent=text;label.setAttribute('x',String(x));label.setAttribute('y',String(y));
      label.setAttribute('font-size',String(size));label.setAttribute('fill',theme.getPropertyValue('--text'));
      svg.appendChild(label);
    };
    addText(visual.title,18,-23,16);
    addText(`${visual.x_label} · ${visual.y_label}`,18,height+20,11);
    if(visual.type==='line')addText('Average (green) · Minimum (blue) · Maximum (amber)',18,height+38,10);
    const description=document.createElementNS('http://www.w3.org/2000/svg','desc');
    description.textContent=visual.method;svg.appendChild(description);
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='xogtamar-analysis.svg';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const distribution=visual.type==='histogram';
  const tooltip={background:'var(--panel)',border:'1px solid var(--border)',borderRadius:12,color:'var(--text)'};
  const axes=<><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5"/>
    <XAxis dataKey={distribution?'label':'row'} tick={{fill:'var(--muted)',fontSize:11}} axisLine={false} tickLine={false} minTickGap={35}/>
    <YAxis tick={{fill:'var(--muted)',fontSize:11}} width={62} axisLine={false} tickLine={false}/>
    <Tooltip contentStyle={tooltip}/></>;
  return <section className="generated-chart">
    <div className="chart-picker">
      <div className="chart-picker-label"><strong>Choose a chart</strong><span>Same verified data. Three perspectives.</span></div>
      <div className="chart-options" role="group" aria-label="Chart type">
        {([{type:'line',name:'Line chart',description:'Follow the pattern across rows',icon:ChartNoAxesCombined},
           {type:'bar',name:'Bar chart',description:'Compare averages across row groups',icon:BarChart3},
           {type:'histogram',name:'Histogram',description:'See how values are distributed',icon:BarChart3}] as const).map(option=><button
             key={option.type} className={`chart-option ${selected===option.type?'selected':''}`} aria-pressed={selected===option.type}
             aria-label={option.name} onClick={()=>{setSelected(option.type);onTypeChange?.(option.type);}}>
             <option.icon size={19}/><span><b>{option.name}</b><small>{option.description}</small>{recommended.type===option.type&&<em>Suggested for this question</em>}</span>
             {selected===option.type&&<Check size={15} className="chart-choice-check"/>}
           </button>)}
      </div>
    </div>
    <div className="generated-chart-heading"><h3>{visual.title}</h3><button className="button secondary" onClick={saveChart}><ArrowDownToLine size={15}/> Save SVG</button></div>
    {visual.type==='line'&&<div className="chart-series" aria-label="Chart series"><span><i className="series-average"/>Average</span><span><i className="series-minimum"/>Minimum</span><span><i className="series-maximum"/>Maximum</span></div>}
    <div className="generated-chart-canvas" ref={chartRef} role="img" aria-label={`${visual.title}. ${visual.method}`}><ResponsiveContainer width="100%" height="100%">
      {visual.type==='line'?<AreaChart data={visual.points} margin={{top:15,right:20,left:0,bottom:15}}>{axes}<defs><linearGradient id="assistantFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={.15}/><stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs><Area name="Maximum" dataKey="max" stroke="#a67827" fill="none" strokeWidth={1} isAnimationActive={false} connectNulls={false}/><Area name="Minimum" dataKey="min" stroke="#52799f" fill="none" strokeWidth={1} isAnimationActive={false} connectNulls={false}/><Area name="Average" dataKey="mean" stroke="var(--accent)" fill="url(#assistantFill)" strokeWidth={2.5} isAnimationActive={false} connectNulls={false}/></AreaChart>
      :<BarChart data={visual.points} margin={{top:15,right:20,left:0,bottom:15}}>{axes}<Bar name={distribution?'Observations':'Average'} dataKey={distribution?'count':'mean'} fill="var(--accent)" radius={[4,4,0,0]} isAnimationActive={false}/></BarChart>}
    </ResponsiveContainer></div>
    <div className="generated-chart-axis">{visual.x_label} <span>{visual.y_label}</span></div>
    <p className="chart-explanation"><ShieldCheck size={15}/>{visual.method}</p>
  </section>;
}
