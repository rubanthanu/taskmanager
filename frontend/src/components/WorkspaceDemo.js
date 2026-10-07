"use client";
import { useState } from "react";
import { Clock, PlayCircle, CheckCircle2, Plus, RotateCcw, X } from "lucide-react";
import Dialog from "./Dialog";
import { KanbanColumn } from "./TaskBoard";
const examples = [
 {id:1,title:"Outline the launch plan",description:"Turn the big idea into clear next steps.",status:"TODO"},
 {id:2,title:"Review homepage designs",description:"Check the final layouts and share feedback.",status:"IN_PROGRESS"},
 {id:3,title:"Gather project requirements",description:"A clear starting point for the next sprint.",status:"DONE"}
];
export default function WorkspaceDemo(){
 const [tasks,setTasks]=useState(examples);
 const [title,setTitle]=useState("");
 const [editing,setEditing]=useState(null);
 const [editTitle,setEditTitle]=useState("");
 const [notice,setNotice]=useState("");
 const done=tasks.filter(t=>t.status === "DONE").length;
 const lanes=[{status:"TODO",title:"To Do",icon:Clock},{status:"IN_PROGRESS",title:"In Progress",icon:PlayCircle},{status:"DONE",title:"Done",icon:CheckCircle2}];
 return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--card)] shadow-xl shadow-teal-950/5">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><CheckCircle2 size={18}/></span><div><h3 className="text-sm font-semibold">A fresh start</h3><p className="mt-0.5 text-[11px] text-slate-500">Interactive demo · Changes stay in this preview</p></div></div><button onClick={()=>{setTasks(examples);setNotice("Demo reset");}} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700"><RotateCcw size={13}/>Reset demo</button></div>
 <div className="p-4 sm:p-6"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-slate-500">{tasks.length} tasks · {done} completed</span><span role="status" className="text-xs text-teal-700">{notice || "Try moving a task"}</span></div>
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{lanes.map(({status,title:laneTitle,icon:Icon})=><KanbanColumn key={status} title={laneTitle} count={tasks.filter(t=>t.status===status).length} icon={<Icon size={16} className="text-teal-700"/>} badgeColor="bg-slate-100 text-slate-600 border-slate-200" tasks={tasks.filter(t=>t.status===status)} onEdit={task=>{setEditing(task);setEditTitle(task.title);}} onDelete={task=>{setTasks(current=>current.filter(t=>t.id!==task.id));setNotice("Demo task removed");}} onQuickStatus={(task,next)=>{setTasks(current=>current.map(t=>t.id===task.id?{...t,status:next}:t));setNotice(next==="DONE"?"Nice work. Task completed!":"Task moved");}} busy={false} formatDate={()=>"Example task"}/>)}</div>
 <form onSubmit={e=>{e.preventDefault();if(!title.trim())return;setTasks(current=>[...current,{id:Date.now(),title:title.trim(),status:"TODO"}]);setTitle("");setNotice("Demo task added");}} className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end"><div className="flex-1"><label htmlFor="demo-task" className="mb-2 block text-xs font-medium text-slate-600">Try a task of your own</label><input id="demo-task" value={title} onChange={e=>setTitle(e.target.value)} maxLength={200} placeholder="What is your next step?" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"/></div><button disabled={!title.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Plus size={16}/>Add task</button></form>
 </div>
 {editing && <Dialog onClose={()=>setEditing(null)} labelledBy="demo-edit-title"><section className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6"><div className="flex items-center justify-between"><h3 id="demo-edit-title" className="font-semibold">Edit demo task</h3><button onClick={()=>setEditing(null)} aria-label="Close editor"><X size={18}/></button></div><form className="mt-5" onSubmit={e=>{e.preventDefault();setTasks(current=>current.map(t=>t.id===editing.id?{...t,title:editTitle.trim()}:t));setEditing(null);setNotice("Demo task updated");}}><label htmlFor="demo-edit-input" className="mb-2 block text-xs">Task title</label><input autoFocus id="demo-edit-input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} required maxLength={200} className="w-full rounded-lg border border-slate-200 px-3 py-2.5"/><button disabled={!editTitle.trim()} className="mt-5 rounded-lg bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-50">Save changes</button></form></section></Dialog>}
 </div>;
}
