const $=id=>document.getElementById(id), K="ups_studio_v10";
const apiBase=()=>String($("backendUrl")?.value||localStorage.getItem("ups_api_base")||"").trim().replace(/\/$/,"");
if($("backendUrl")){ $("backendUrl").value=localStorage.getItem("ups_api_base")||""; $("backendUrl").addEventListener("change",()=>localStorage.setItem("ups_api_base",$("backendUrl").value.trim().replace(/\/$/,""))); }
const state=(()=>{try{
 const current=JSON.parse(localStorage.getItem(K)||"null");
 if(current && typeof current==="object") return {...{projects:[],scenes:[],captions:[],clips:[],assets:[]},...current};
 const legacy=JSON.parse(localStorage.getItem("ups_studio_v2")||"{}");
 return {...{projects:[],scenes:[],captions:[],clips:[],assets:[]},...legacy};
 }catch(e){return {projects:[],scenes:[],captions:[],clips:[],assets:[]};}})();
state.clips=state.clips.map((c,i)=>({...c,id:c.id||`legacy-clip-${i}-${Date.now()}`,start:Number(c.start)||0,duration:Number(c.duration)||1}));
const save=()=>{try{localStorage.setItem(K,JSON.stringify(state));$("saveFlag").textContent="SAVED LOCALLY";$("projectCount").textContent=state.projects.length;return true;}catch(e){$("saveFlag").textContent="STORAGE FULL";alert("Browser storage भर गया है। Backup डाउनलोड करें; बड़ी media files यहाँ सेव नहीं होतीं।");return false;}};
const readStored=k=>{try{return JSON.parse(localStorage.getItem(k)||"null");}catch{return null;}};
const draftIds=["pName","mode","pFormat","pCategory","pLanguage","pDuration","pRatio","pPurpose","pTopic","pNarration"];
function restoreBriefDraft(){const d=readStored("ups_brief_draft_v10");if(d)draftIds.forEach(id=>{if(d[id]!=null && $(id))$(id).value=d[id];});}
let draftTimer;function bindBriefAutosave(){draftIds.forEach(id=>$(id)?.addEventListener("input",()=>{clearTimeout(draftTimer);draftTimer=setTimeout(()=>{const d={};draftIds.forEach(k=>d[k]=$(k).value);try{localStorage.setItem("ups_brief_draft_v10",JSON.stringify(d));$("saveFlag").textContent="DRAFT SAVED";}catch{$("saveFlag").textContent="STORAGE FULL";}},350);}));}

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function page(id){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===id));window.scrollTo({top:0,behavior:"smooth"});}
restoreBriefDraft();bindBriefAutosave();
document.querySelectorAll(".nav").forEach(x=>x.onclick=()=>page(x.dataset.page));document.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>page(x.dataset.go));$("themeToggle").onclick=()=>document.body.classList.toggle("light");
function download(name,data,type="application/json"){let b=new Blob([data],{type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function brief(){return {name:$("pName").value||"Untitled",mode:$("mode").value,format:$("pFormat").value,category:$("pCategory").value,language:$("pLanguage").value,duration:$("pDuration").value,aspectRatio:$("pRatio").value,purpose:$("pPurpose").value,topic:$("pTopic").value,narration:$("pNarration")?.value||"",quality:"Best actually supported by connected provider",workflow:["Research / concept","Script and dialogue","Storyboard","Image/video prompts","Voice and audio","Transitions and edit","Captions","QA","Export"]};}
$("saveProject").onclick=()=>{
 const rec={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),...brief(),
 scenes:state.scenes,captions:state.captions,clips:state.clips,assets:state.assets,
 continuity:localStorage.getItem("ups_continuity_v10")||null,
 transitions:localStorage.getItem("ups_transitions_v10")||null,
 quality:localStorage.getItem("ups_quality_v10")||null,
 settings:{continuity:readStored("ups_continuity_v10"),transitions:readStored("ups_transitions_v10"),quality:readStored("ups_quality_v10")},
 savedAt:new Date().toISOString()};
 state.projects.unshift(rec);save();renderProjects();alert("पूरा project snapshot इस browser में सेव हुआ।");
};
function renderProjects(){
 const box=$("projectList");if(!box)return;
 box.innerHTML=state.projects.map((p,i)=>`<div class="listrow"><span><b>${esc(p.name||"Untitled")}</b><br><small>${esc(p.topic||"No topic")} · ${esc(p.savedAt||"")}</small></span><button data-restore="${i}">Restore</button><button data-remove-project="${i}">Delete</button></div>`).join("")||"No saved projects.";
 box.querySelectorAll("[data-restore]").forEach(b=>b.onclick=()=>{const p=state.projects[+b.dataset.restore];if(!p)return;
  ["pName","mode","pFormat","pCategory","pLanguage","pDuration","pRatio","pPurpose","pTopic","pNarration"].forEach((id)=>{const key={pName:"name",mode:"mode",pFormat:"format",pCategory:"category",pLanguage:"language",pDuration:"duration",pRatio:"aspectRatio",pPurpose:"purpose",pTopic:"topic",pNarration:"narration"}[id];if(p[key]!=null)$(id).value=p[key];});
  ["scenes","captions","clips","assets"].forEach(k=>{if(Array.isArray(p[k]))state[k]=p[k];});
  if(p.continuity)localStorage.setItem("ups_continuity_v10",p.continuity);
  if(p.transitions)localStorage.setItem("ups_transitions_v10",p.transitions);
  if(p.quality)localStorage.setItem("ups_quality_v10",p.quality);
  const settings=p.settings||{};const maps={continuity:{name:"charName",status:"identityStatus",description:"identityDesc",rules:"continuityRules"},transitions:{mode:"trMode",style:"trStyle",speed:"trSpeed",beat:"trBeat"},quality:{level:"qLevel",photo:"qPhoto",video:"qVideo",format:"qFormat",resolution:"qResolution",color:"qColor"}};
  Object.entries(maps).forEach(([group,fields])=>{const obj=settings[group]||readStored("ups_"+group+"_v10");if(!obj)return;Object.entries(fields).forEach(([key,id])=>{if(obj[key]!=null && $(id))$(id).value=obj[key];});});
  const q=settings.quality||readStored("ups_quality_v10");if(q?.level)$("qualityMetric").textContent=q.level.startsWith("ULTRA")?"ULTRA":q.level;
  save();renderScenes();renderCaps();renderClips();renderAssets();alert("Project data और सभी saved settings restore हो गईं।");
 });
 box.querySelectorAll("[data-remove-project]").forEach(b=>b.onclick=()=>{if(confirm("इस project को हटाएँ?")){state.projects.splice(+b.dataset.removeProject,1);save();renderProjects();}});
}
$("exportBackup")?.addEventListener("click",()=>download("ups-v10-full-backup.json",JSON.stringify({schema:"ups-creator-studio-backup",version:"10.3.0",createdAt:new Date().toISOString(),state,preferences:{continuity:readStored("ups_continuity_v10"),transitions:readStored("ups_transitions_v10"),quality:readStored("ups_quality_v10"),briefDraft:readStored("ups_brief_draft_v10"),speechDraft:localStorage.getItem("ups_speech_draft_v10")||""}},null,2)));
$("importBackup")?.addEventListener("change",async e=>{try{const f=e.target.files[0];if(!f)return;const d=JSON.parse(await f.text());if(d.schema && d.schema!=="ups-creator-studio-backup")throw Error("Unknown backup schema");const x=d.state||d;if(!x||typeof x!=="object"||Array.isArray(x))throw Error("Invalid backup structure");
 const clean={projects:Array.isArray(x.projects)?x.projects:[],scenes:Array.isArray(x.scenes)?x.scenes:[],captions:Array.isArray(x.captions)?x.captions:[],clips:Array.isArray(x.clips)?x.clips:[],assets:Array.isArray(x.assets)?x.assets:[]};
 Object.assign(state,clean);const prefs=d.preferences||{};[["ups_continuity_v10",prefs.continuity],["ups_transitions_v10",prefs.transitions],["ups_quality_v10",prefs.quality],["ups_brief_draft_v10",prefs.briefDraft]].forEach(([k,v])=>{if(v!=null)localStorage.setItem(k,JSON.stringify(v));});if(typeof prefs.speechDraft==="string")localStorage.setItem("ups_speech_draft_v10",prefs.speechDraft);if(!save())throw Error("Browser storage quota exceeded");restoreBriefDraft();renderProjects();renderScenes();renderCaps();renderClips();renderAssets();alert("Backup imported successfully.");}catch(err){alert("Import failed: "+err.message);}});
function makeProductionPack(){
 const b=brief(), topic=b.topic.trim()||"Untitled creative concept", total=parseInt(b.duration,10)||10;
 const count=total<=10?3:total<=15?4:total<=30?5:total<=60?7:5;
 const script=b.narration.trim();
 const scriptParts=script?script.split(/(?<=[.!?।])\s+|\n+/).map(x=>x.trim()).filter(Boolean):[];
 const beats=["HOOK — attention-grabbing opening","CONTEXT — establish subject and setting","DEVELOPMENT — show the key idea or action","PAYOFF — reveal the learning, result or emotional turn","CTA / RESOLUTION — close clearly"];
 const scenes=Array.from({length:count},(_,i)=>{
  const start=Math.round(i*total/count*10)/10, end=Math.round((i+1)*total/count*10)/10;
  const beat=beats[Math.min(i,beats.length-1)];
  const visual=i===0?`Open with a visually clear hook about: ${topic}. Establish the main subject immediately.`:i===count-1?`Resolve the central idea: ${topic}. End with a memorable closing image and clear call to action where appropriate.`:`Develop the idea of ${topic}; show one clear visual action or example, avoid unrelated details.`;
  const dialogue=script? (scriptParts.slice(Math.floor(i*scriptParts.length/count),Math.max(Math.floor((i+1)*scriptParts.length/count),Math.floor(i*scriptParts.length/count)+1)).join(" ")) : (b.language.includes("Hindi")?`[${beat}] विषय: ${topic} — इस दृश्य के लिए संक्षिप्त, स्वाभाविक हिंदी संवाद लिखें।`:`[${beat}] Topic: ${topic} — write concise, natural dialogue for this scene.`);
  return {id:`SC${String(i+1).padStart(2,"0")}`,start,end,duration:Math.round((end-start)*10)/10,beat,visual,dialogue,camera:i===0?"Establishing shot; controlled push-in":"Choose shot size and movement to support the action",lighting:"Motivated, consistent lighting; preserve scene continuity",audio:"Clear dialogue priority; subtle relevant ambience and music",transition:i===count-1?"Clean end / fade if appropriate":"Motivated cut or match cut",qa:["identity and wardrobe continuity","correct anatomy and natural motion","dialogue timing and pronunciation","text accuracy and safe-zone","audio clarity"]};
 });
 const style=b.format.includes("Animation")?"Use a coherent 2D/3D animation style appropriate to the subject; do not force live-action photorealism.":b.format.includes("Photo")?"Create a premium photographic composition with realistic materials, natural lighting and accurate details.":"Use cinematic live-action realism, believable motion, natural skin and lighting, and physically plausible camera movement.";
 const master=`UPS CREATOR STUDIO — DIRECTOR PRODUCTION BRIEF\nProject: ${b.name}\nTopic: ${topic}\nFormat: ${b.format} | Category: ${b.category} | Language: ${b.language}\nDuration target: ${b.duration} | Aspect ratio: ${b.aspectRatio}\nPurpose: ${b.purpose||"Auto-detect from topic"}\n\nCREATIVE DIRECTION: ${style}\n\nMASTER INSTRUCTIONS: Create a coherent, audience-appropriate production. Keep one visual idea per scene. Maintain character, wardrobe, prop, location, lighting and screen-direction continuity. Dialogue must fit the actual scene duration; do not force excess words. Use only supported output resolution, frame rate and codec. Do not invent facts or UI. No unwanted logos, watermarks or misspelled text. Captions must remain in platform safe zones.\n\nSCENE PLAN:\n${scenes.map(x=>`${x.id} (${x.start}-${x.end}s) — ${x.beat}\nVisual: ${x.visual}\nDialogue: ${x.dialogue}\nCamera: ${x.camera}\nTransition: ${x.transition}`).join("\n\n")}\n\nFINAL QA: verify story clarity, timing, continuity, natural motion, dialogue/lip-sync where supported, audio balance, caption spelling, framing and exported file integrity.`;
 return {schema:"ups-director-pack",version:"10.1-planning",createdAt:new Date().toISOString(),brief:b,scenes,masterPrompt:master,capabilityNote:"Planning artifact only. Image/video generation, voice synthesis, lip-sync and rendering require connected providers and a tested renderer."};
}
let latestDirectorPack=null;
$("autoProductionPack")?.addEventListener("click",()=>{latestDirectorPack=makeProductionPack();const b=brief();const story=(b.narration||b.topic||"").trim();if(story && typeof makeStoryFrames==="function"){state.scenes=makeStoryFrames(story,parseInt(b.duration,10)||10,"balanced");if($("storyInput"))$("storyInput").value=story;}else{state.scenes=latestDirectorPack.scenes;}save();renderScenes();if(typeof renderAutoFrames==="function")renderAutoFrames();$("briefPreview").hidden=false;$("briefPreview").textContent=latestDirectorPack.masterPrompt;$("autoPackStatus").textContent=`${state.scenes.length} frames/scenes planned for ${b.duration}. Story beats and frame prompts are available in Storyboard.`;page("storyboard");});
$("downloadDirectorPack")?.addEventListener("click",()=>{latestDirectorPack=latestDirectorPack||makeProductionPack();download("UPS_Director_Production_Pack.json",JSON.stringify(latestDirectorPack,null,2));});
$("buildPrompt").onclick=()=>{$("briefPreview").hidden=false;$("briefPreview").textContent=JSON.stringify(brief(),null,2);};
$("briefExport").onclick=()=>download("ups-production-brief.json",JSON.stringify(brief(),null,2));
$("generatePrompt").onclick=()=>{const type=$("mediaType").value,subject=$("promptSubject").value.trim(),camera=$("camera").value.trim(),constraints=$("promptConstraints").value.trim();const animation=/animation/i.test(type),photo=/photo/i.test(type),poster=/poster/i.test(type);const engine=animation?"Select a suitable 2D/3D animation engine and preserve style consistency.":photo?"Use a premium RAW-style photographic aesthetic, realistic materials, natural skin texture and physically plausible light.":poster?"Use a professional graphic-design composition, strong hierarchy, readable typography and clean margins.":"Use cinematic live-action realism, believable movement, natural lighting and coherent camera motion.";$("promptResult").textContent=[`MEDIA: ${type}`,`SUBJECT: ${subject||"Define the subject clearly."}`,`ENGINE DIRECTION: ${engine}`,`CAMERA: ${camera||"Choose lens, framing and movement to fit the scene."}`,`QUALITY / CONSTRAINTS: ${constraints}`,"CONTINUITY: preserve identity, wardrobe, props, location and screen direction across related shots.","NEGATIVE CHECKS: avoid distorted anatomy, extra fingers, flicker, inconsistent faces, unintended text, logos and watermarks.","DELIVERY: follow the connected provider's actual aspect ratio, resolution, duration and format limits; never claim unsupported specs.","FINAL QA: inspect composition, text spelling, motion, timing, audio and export integrity."].join("\n\n");};
$("copyPrompt").onclick=async()=>{try{await navigator.clipboard.writeText($("promptResult").textContent);alert("Prompt copied.");}catch(e){alert("Clipboard unavailable. Select and copy the text.");}};
function renderScenes(){$("sceneList").innerHTML=state.scenes.map((s,i)=>`<div class="listrow"><span><b>${i+1}. ${esc(s.title)}</b><br><small>${esc(s.duration)}s · ${esc(s.visual)}</small></span><button data-rms="${i}">Remove</button></div>`).join("")||"No scenes yet.";document.querySelectorAll("[data-rms]").forEach(b=>b.onclick=()=>{state.scenes.splice(+b.dataset.rms,1);save();renderScenes();});}
$("addScene").onclick=()=>{state.scenes.push({title:$("sceneTitle").value||`Scene ${state.scenes.length+1}`,duration:+$("sceneDuration").value||3,visual:$("sceneVisual").value,dialogue:$("sceneDialogue").value});save();renderScenes();};
$("exportStoryboard").onclick=()=>download("ups-storyboard.json",JSON.stringify(state.scenes,null,2));
$("saveContinuity").onclick=()=>{localStorage.setItem("ups_continuity_v10",JSON.stringify({name:$("charName").value,status:$("identityStatus").value,description:$("identityDesc").value,rules:$("continuityRules").value}));$("continuityStatus").textContent="Continuity rules saved locally.";};
$("saveTransitions").onclick=()=>{localStorage.setItem("ups_transitions_v10",JSON.stringify({mode:$("trMode").value,style:$("trStyle").value,speed:$("trSpeed").value,beat:$("trBeat").value}));$("trStatus").textContent="Transition plan saved locally.";};
$("saveQuality").onclick=()=>{let q={level:$("qLevel").value,photo:$("qPhoto").value,video:$("qVideo").value,format:$("qFormat").value,resolution:$("qResolution").value,color:$("qColor").value};localStorage.setItem("ups_quality_v10",JSON.stringify(q));$("qualityMetric").textContent=q.level.startsWith("ULTRA")?"ULTRA":q.level;$("qStatus").textContent="Quality profile saved locally.";};
$("speechText").value=localStorage.getItem("ups_speech_draft_v10")||"";$("speechText").addEventListener("input",()=>{try{localStorage.setItem("ups_speech_draft_v10",$("speechText").value);}catch{}});
let recognition=null;
$("speechStart").onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("speechStatus").textContent="BLOCKED: इस browser में SpeechRecognition उपलब्ध नहीं है।";return;}recognition=new SR();recognition.lang="hi-IN";recognition.continuous=true;recognition.interimResults=true;recognition.onresult=e=>{let out="";for(let i=e.resultIndex;i<e.results.length;i++)out+=e.results[i][0].transcript+(e.results[i].isFinal?" ":"");$("speechText").value+=out;};recognition.onerror=e=>$("speechStatus").textContent="Speech error: "+e.error;recognition.onend=()=>$("speechStatus").textContent="Recognition stopped.";recognition.start();$("speechStatus").textContent="Listening… microphone permission may be requested.";};
$("speechStop").onclick=()=>{if(recognition)recognition.stop();$("speechStatus").textContent="Stopped.";};$("speechClear").onclick=()=>{$("speechText").value="";localStorage.removeItem("ups_speech_draft_v10");};
function timeSrt(v){v=Math.max(0,Number(v)||0);let ms=Math.round(v*1000),h=Math.floor(ms/3600000);ms%=3600000;let m=Math.floor(ms/60000);ms%=60000;let s=Math.floor(ms/1000);ms%=1000;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(ms).padStart(3,"0")}`;}
function renderCaps(){$("captionList").innerHTML=state.captions.map((c,i)=>`<div class="listrow"><span>${esc(c.text)}<br><small>${c.start}s → ${c.end}s</small></span><button data-rmc="${i}">Remove</button></div>`).join("")||"No captions yet.";document.querySelectorAll("[data-rmc]").forEach(b=>b.onclick=()=>{state.captions.splice(+b.dataset.rmc,1);save();renderCaps();});}
$("addCaption").onclick=()=>{let start=+$("capStart").value,end=+$("capEnd").value,text=$("capText").value.trim();if(!text||end<=start){alert("Caption text भरें और End समय Start से बड़ा रखें.");return;}state.captions.push({start,end,text});state.captions.sort((a,b)=>a.start-b.start);save();renderCaps();};
$("downloadSrt").onclick=()=>{let s=state.captions.map((c,i)=>`${i+1}\n${timeSrt(c.start)} --> ${timeSrt(c.end)}\n${c.text}\n`).join("\n");download("captions.srt",s,"text/plain");};
$("assetInput").onchange=e=>{state.assets=[...state.assets,...Array.from(e.target.files).map(f=>({name:f.name,type:f.type,size:f.size,lastModified:f.lastModified}))];renderAssets();save();e.target.value="";};
function renderAssets(){const box=$("assetList");if(!box)return;box.innerHTML=state.assets.map((a,i)=>`<div class="listrow"><span><b>${esc(a.name||"Unnamed asset")}</b><br><small>${esc(a.type||"Unknown type")} · ${Math.round((Number(a.size)||0)/1024)} KB · metadata only</small></span><button data-rmasset="${i}">Remove</button></div>`).join("")||"No assets selected.";box.querySelectorAll("[data-rmasset]").forEach(b=>b.onclick=()=>{state.assets.splice(+b.dataset.rmasset,1);save();renderAssets();});}
let selectedClipId=null, timelineUndo=[], timelineRedo=[], trackState={};
const trackNames=["Video","Voice","Music","Sound Effect","Caption / Text"];
const cloneClips=()=>JSON.parse(JSON.stringify(state.clips));
function rememberTimeline(){timelineUndo.push(cloneClips());if(timelineUndo.length>60)timelineUndo.shift();timelineRedo=[];syncHistoryButtons();}
function syncHistoryButtons(){if($("undoTimeline"))$("undoTimeline").disabled=!timelineUndo.length;if($("redoTimeline"))$("redoTimeline").disabled=!timelineRedo.length;}
function updateClip(id,patch){const c=state.clips.find(x=>x.id===id);if(!c)return;rememberTimeline();Object.assign(c,patch);save();renderClips();}
function renderClips(){
 const box=$("timelineList");if(!box)return;
 const ordered=[...state.clips].sort((a,b)=>(+a.start)-(+b.start));
 box.innerHTML=ordered.map(c=>`<div class="listrow ${c.id===selectedClipId?'selected-clip':''}"><span><b>${esc(c.label)}</b> · ${esc(c.track)}<br><small>Start ${Number(c.start).toFixed(1)}s · Duration ${Number(c.duration).toFixed(1)}s</small></span><button data-select-clip="${esc(c.id)}">Select</button><button data-rmclip="${esc(c.id)}">Remove</button></div>`).join("")||"No timeline items.";
 box.querySelectorAll("[data-select-clip]").forEach(b=>b.onclick=()=>selectClip(b.dataset.selectClip));
 box.querySelectorAll("[data-rmclip]").forEach(b=>b.onclick=()=>{rememberTimeline();state.clips=state.clips.filter(c=>c.id!==b.dataset.rmclip);if(selectedClipId===b.dataset.rmclip)selectedClipId=null;save();renderClips();});
 renderTimelineVisual();syncHistoryButtons();
}
function selectClip(id){selectedClipId=id;const c=state.clips.find(x=>x.id===id);if(!c)return;$("selectedClipLabel").textContent=`Selected: ${c.label} (${c.track})`;$("clipLabel").value=c.label;$("trackType").value=c.track;$("clipStart").value=c.start;$("clipDuration").value=c.duration;$("timelineStatus").textContent=`${c.label} selected.`;renderTimelineVisual();renderClipsListSelection();}
function renderClipsListSelection(){document.querySelectorAll("[data-select-clip]").forEach(b=>b.closest(".listrow")?.classList.toggle("selected-clip",b.dataset.selectClip===selectedClipId));}
function renderTimelineVisual(){const root=$("timelineVisual");if(!root)return;const zoom=Number($("timelineZoom")?.value)||48;const max=Math.max(10,...state.clips.map(c=>(+c.start||0)+(+c.duration||0)),Number($("playheadTime")?.value)||0);const width=Math.max(600,max*zoom+100);root.innerHTML=trackNames.map(track=>{const clips=state.clips.filter(c=>c.track===track);const muted=trackState[track]?.muted,solo=trackState[track]?.solo;return `<div class="track-row"><div class="track-label"><b>${esc(track)}</b><div><button data-mute-track="${esc(track)}">${muted?'Unmute':'Mute'}</button><button data-solo-track="${esc(track)}">${solo?'Unsolo':'Solo'}</button></div></div><div class="track-lane" data-track-lane="${esc(track)}" style="min-width:${width}px">${clips.map(c=>{const left=Math.max(0,(+c.start||0)*zoom),w=Math.max(24,(+c.duration||0)*zoom);return `<button draggable="true" class="timeline-clip ${c.id===selectedClipId?'chosen':''} ${muted?'muted':''}" data-timeline-clip="${esc(c.id)}" style="left:${left}px;width:${w}px" title="${esc(c.label)} · ${c.start}s + ${c.duration}s">${esc(c.label)}<small>${Number(c.duration).toFixed(1)}s</small></button>`;}).join('')}<div class="playhead-line" style="left:${(Number($("playheadTime")?.value)||0)*zoom}px"></div></div></div>`;}).join("");
 root.querySelectorAll("[data-timeline-clip]").forEach(el=>{el.addEventListener("click",()=>selectClip(el.dataset.timelineClip));el.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/ups-clip",el.dataset.timelineClip);});});
 root.querySelectorAll("[data-track-lane]").forEach(lane=>{lane.addEventListener("dragover",e=>e.preventDefault());lane.addEventListener("drop",e=>{e.preventDefault();const id=e.dataTransfer.getData("text/ups-clip"),c=state.clips.find(x=>x.id===id);if(!c)return;const rect=lane.getBoundingClientRect(),zoom=Number($("timelineZoom").value)||48;let t=Math.max(0,(e.clientX-rect.left+lane.scrollLeft)/zoom);if($("snapToggle").checked)t=Math.round(t*10)/10;rememberTimeline();c.start=Number(t.toFixed(2));c.track=lane.dataset.trackLane;save();renderClips();selectClip(id);});});
 root.querySelectorAll("[data-mute-track]").forEach(b=>b.onclick=()=>{const t=b.dataset.muteTrack;trackState[t]??={};trackState[t].muted=!trackState[t].muted;renderTimelineVisual();});root.querySelectorAll("[data-solo-track]").forEach(b=>b.onclick=()=>{const t=b.dataset.soloTrack;trackState[t]??={};trackState[t].solo=!trackState[t].solo;renderTimelineVisual();});
}
$("addClip").onclick=()=>{const start=Number($("clipStart").value),duration=Number($("clipDuration").value);if(start<0||duration<=0||!Number.isFinite(start+duration)){alert("Start 0 या अधिक और Duration 0 से अधिक रखें।");return;}rememberTimeline();const id=(crypto.randomUUID?crypto.randomUUID():`clip-${Date.now()}-${Math.random().toString(36).slice(2,7)}`);state.clips.push({id,track:$("trackType").value,label:$("clipLabel").value||"Untitled clip",start,duration});selectedClipId=id;save();renderClips();selectClip(id);};
$("exportTimeline").onclick=()=>download("ups-timeline-plan.json",JSON.stringify({schema:"ups-interactive-timeline",version:"10.4",clips:state.clips,tracks:trackNames},null,2));
$("timelineZoom")?.addEventListener("input",renderTimelineVisual);$("playheadTime")?.addEventListener("input",renderTimelineVisual);
$("undoTimeline")?.addEventListener("click",()=>{if(!timelineUndo.length)return;timelineRedo.push(cloneClips());state.clips=timelineUndo.pop();save();renderClips();syncHistoryButtons();});
$("redoTimeline")?.addEventListener("click",()=>{if(!timelineRedo.length)return;timelineUndo.push(cloneClips());state.clips=timelineRedo.pop();save();renderClips();syncHistoryButtons();});
function getSelected(){return state.clips.find(c=>c.id===selectedClipId);}
$("splitClip")?.addEventListener("click",()=>{const c=getSelected(),t=Number($("playheadTime").value);if(!c){alert("पहले timeline clip select करें।");return;}if(t<=Number(c.start)+.05||t>=Number(c.start)+Number(c.duration)-.05){alert("Playhead को selected clip के बीच में रखें।");return;}rememberTimeline();const oldEnd=Number(c.start)+Number(c.duration),ratio=(t-Number(c.start))/Number(c.duration),sourceMid=c.sourceIn!=null?Number(c.sourceIn)+(Number(c.sourceOut)-Number(c.sourceIn))*ratio:null;const second={...c,id:(crypto.randomUUID?crypto.randomUUID():`clip-${Date.now()}-b`),label:`${c.label} (B)`,start:t,duration:Number((oldEnd-t).toFixed(3))};c.duration=Number((t-Number(c.start)).toFixed(3));if(sourceMid!=null){c.sourceOut=sourceMid;second.sourceIn=sourceMid;}state.clips.push(second);save();renderClips();selectClip(second.id);$("timelineStatus").textContent="Clip split into two non-destructive timeline segments.";});
$("duplicateClip")?.addEventListener("click",()=>{const c=getSelected();if(!c){alert("पहले clip select करें।");return;}rememberTimeline();const copy={...c,id:(crypto.randomUUID?crypto.randomUUID():`clip-${Date.now()}-copy`),label:`${c.label} copy`,start:Number((Number(c.start)+Number(c.duration)).toFixed(2))};state.clips.push(copy);save();renderClips();selectClip(copy.id);});
$("trimSelected")?.addEventListener("click",()=>{const c=getSelected();if(!c){alert("पहले clip select करें।");return;}const start=Number($("trimIn").value),end=Number($("trimOut").value);if(start<0||end<=start){alert("Valid Trim In / Out दें।");return;}rememberTimeline();c.sourceIn=start;c.sourceOut=end;c.duration=Number((end-start).toFixed(3));save();renderClips();selectClip(c.id);});
$("applyClipEdits")?.addEventListener("click",()=>{const c=getSelected();if(!c){alert("पहले clip select करें।");return;}const start=Number($("clipStart").value),duration=Number($("clipDuration").value);if(start<0||duration<=0||!Number.isFinite(start+duration)){alert("Start और Duration सही भरें।");return;}rememberTimeline();c.label=$("clipLabel").value||c.label;c.track=$("trackType").value;c.start=start;c.duration=duration;save();renderClips();selectClip(c.id);});
$("mergeNextClip")?.addEventListener("click",()=>{const c=getSelected();if(!c){alert("पहले clip select करें।");return;}const next=state.clips.filter(x=>x.id!==c.id&&x.track===c.track&&Math.abs(Number(x.start)-(Number(c.start)+Number(c.duration)))<.11).sort((a,b)=>Number(a.start)-Number(b.start))[0];if(!next){alert("इसी track पर selected clip के ठीक बाद कोई clip नहीं मिला।");return;}rememberTimeline();c.duration=Number((Number(c.duration)+Number(next.duration)).toFixed(3));c.label=`${c.label} + ${next.label}`;if(c.sourceOut!=null&&next.sourceIn!=null)c.sourceOut=next.sourceOut;state.clips=state.clips.filter(x=>x.id!==next.id);save();renderClips();selectClip(c.id);$("timelineStatus").textContent="Adjacent timeline items merged as one edit-plan clip. Original media not rendered.";});
function nudgeSelected(delta){const c=getSelected();if(!c){alert("पहले clip select करें।");return;}rememberTimeline();c.start=Math.max(0,Number((Number(c.start)+delta).toFixed(2)));if($("snapToggle").checked)c.start=Math.round(c.start*10)/10;save();renderClips();selectClip(c.id);}
$("moveEarlier")?.addEventListener("click",()=>nudgeSelected(-.5));$("moveLater")?.addEventListener("click",()=>nudgeSelected(.5));
$("deleteSelected")?.addEventListener("click",()=>{const c=getSelected();if(!c)return;rememberTimeline();state.clips=state.clips.filter(x=>x.id!==c.id);selectedClipId=null;save();renderClips();$("selectedClipLabel").textContent="No clip selected";});
$("rippleDelete")?.addEventListener("click",()=>{const c=getSelected();if(!c)return;rememberTimeline();const end=Number(c.start)+Number(c.duration),track=c.track,dur=Number(c.duration);state.clips=state.clips.filter(x=>x.id!==c.id).map(x=>x.track===track&&Number(x.start)>=end?{...x,start:Number((Number(x.start)-dur).toFixed(3))}:x);selectedClipId=null;save();renderClips();$("selectedClipLabel").textContent="No clip selected";});
$("validateTimeline")?.addEventListener("click",()=>{const r=validateTimeline();$("timelineStatus").textContent=r.valid?`VALID — ${r.items} timeline items checked.`:`${r.issues.length} issue(s): ${r.issues.join("; ")}`;});
$("downloadEditDecision")?.addEventListener("click",()=>{const r=validateTimeline();download("UPS_V10_4_edit_decision_list.json",JSON.stringify({schema:"ups-edit-decision-list",createdAt:new Date().toISOString(),validation:r,tracks:["Video","Voice","Music","Sound Effect","Caption / Text"],clips:[...state.clips].sort((a,b)=>(+a.start)-(+b.start)),note:"Planning EDL only; not a rendered video."},null,2));});
// Local media preview, waveform visualization and editor helper controls.
let editorObjectUrl=null, editorMediaDuration=0, editorFile=null;
async function drawWaveform(file){
 const canvas=$("mediaWaveform"); if(!canvas)return;
 canvas.hidden=true; const ctx=canvas.getContext("2d"); ctx.clearRect(0,0,canvas.width,canvas.height);
 if(!file || !file.type.startsWith("audio/"))return;
 if(file.size>50*1024*1024){$("mixerStatus").textContent="Waveform skipped: mobile safety limit is 50 MB. Audio preview can still be used.";return;}
 try{
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)throw Error("Web Audio API unavailable");
  const ac=new AC(); const buffer=await ac.decodeAudioData(await file.arrayBuffer());
  const data=buffer.getChannelData(0), step=Math.max(1,Math.floor(data.length/canvas.width));
  ctx.strokeStyle="#67d7e7";ctx.lineWidth=1;ctx.beginPath();
  for(let x=0;x<canvas.width;x++){let min=1,max=-1;for(let j=0;j<step;j++){const v=data[x*step+j]||0;if(v<min)min=v;if(v>max)max=v;}ctx.moveTo(x,(1+min)*canvas.height/2);ctx.lineTo(x,(1+max)*canvas.height/2);}
  ctx.stroke();canvas.hidden=false;await ac.close();
  $("mixerStatus").textContent=`Waveform ready · ${buffer.duration.toFixed(2)} sec · local analysis only`;
 }catch(err){$("mixerStatus").textContent=`Waveform unavailable: ${err.message}`;}
}
function updatePreviewGain(){const el=activeMedia();if(!el)return;const gain=Math.max(0,Math.min(1.5,Number($("trackGain")?.value||100)/100));el.volume=$("previewMute")?.checked?0:Math.min(1,gain);$("gainValue").textContent=`${$("trackGain")?.value||100}%`;$("mixerStatus").textContent=`${$("mixerTrack")?.value||"Music"} preview gain updated. Loaded media preview only; no multitrack mix.`;}

$("editorMedia")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;editorFile=f;if(editorObjectUrl)URL.revokeObjectURL(editorObjectUrl);editorObjectUrl=URL.createObjectURL(f);const isVideo=f.type.startsWith("video/");const v=$("editorPreview"),a=$("audioPreview");v.hidden=!isVideo;a.hidden=isVideo;v.pause();a.pause();(isVideo?v:a).src=editorObjectUrl;$("clipLabel").value=f.name;$("trackType").value=isVideo?"Video":"Music";$("mediaStatus").textContent=`Loaded locally: ${f.name} · ${Math.round(f.size/1024)} KB`;const el=isVideo?v:a;drawWaveform(f);el.onloadedmetadata=()=>{editorMediaDuration=el.duration;$("trimOut").value=Math.min(5,editorMediaDuration).toFixed(1);$("mediaStatus").textContent=`${f.name} · ${editorMediaDuration.toFixed(2)} sec · local preview only`;};});
function activeMedia(){return $("editorPreview").hidden?$("audioPreview"):$("editorPreview");}
$("setTrimIn")?.addEventListener("click",()=>{const el=activeMedia();if(el?.src)$("trimIn").value=(el.currentTime||0).toFixed(1);});
$("setTrimOut")?.addEventListener("click",()=>{const el=activeMedia();if(el?.src)$("trimOut").value=(el.currentTime||0).toFixed(1);});
$("addTrimmedClip")?.addEventListener("click",()=>{const start=Number($("trimIn").value),end=Number($("trimOut").value);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||(editorMediaDuration&&end>editorMediaDuration)){alert("Valid Trim In / Out समय दें। Out, In से बड़ा और media duration के भीतर होना चाहिए।");return;}state.clips.push({track:$("trackType").value,label:$("clipLabel").value||"Local media range",start:Number($("clipStart").value)||0,duration:Number((end-start).toFixed(3)),sourceIn:start,sourceOut:end,sourceName:$("editorMedia").files?.[0]?.name||"Local media"});save();renderClips();$("timelineStatus").textContent="Trim range timeline में जोड़ा गया (planning only; original file render नहीं हुई)।";});

// Transfer storyboard scenes and timed captions into the editable timeline.
$("sendStoryboardToTimeline")?.addEventListener("click",()=>{
 if(!state.scenes.length){toast("पहले Storyboard में कहानी से frames बनाएँ");page("storyboard");return;}
 rememberTimeline();let cursor=state.clips.filter(c=>c.track==="Video").reduce((m,c)=>Math.max(m,Number(c.start)+Number(c.duration)),0);
 state.scenes.forEach((scene,i)=>{const dur=Math.max(.5,Number(scene.duration)||3);state.clips.push({id:`story-${Date.now()}-${i}`,track:"Video",label:scene.title||`Storyboard Frame ${i+1}`,start:Number(cursor.toFixed(2)),duration:dur,storySceneId:scene.id||null,visual:scene.visual||scene.storyBeat||"",imagePrompt:scene.imagePrompt||"",videoPrompt:scene.videoPrompt||"",dialogue:scene.dialogue||""});cursor+=dur;});
 save();renderClips();$("timelineStatus").textContent=`${state.scenes.length} storyboard frame(s) timeline में जोड़े गए। Scene metadata सुरक्षित है; media render नहीं हुआ।`;toast("Storyboard frames added to Video track");
});
$("sendCaptionsToTimeline")?.addEventListener("click",()=>{
 if(!state.captions.length){toast("पहले Captions Studio में captions बनाएँ");page("captions");return;}
 rememberTimeline();state.clips=state.clips.filter(c=>!c.fromCaption);
 state.captions.forEach((c,i)=>state.clips.push({id:`caption-${Date.now()}-${i}`,track:"Caption / Text",label:String(c.text).slice(0,48),start:Number(c.start),duration:Number((Number(c.end)-Number(c.start)).toFixed(3)),captionText:c.text,fromCaption:true}));
 save();renderClips();$("timelineStatus").textContent=`${state.captions.length} timed captions Timeline में sync किए गए।`;toast("Captions synced to timeline");
});
$("clearTimeline")?.addEventListener("click",()=>{if(!state.clips.length)return;if(!confirm("पूरी Timeline साफ करें?"))return;rememberTimeline();state.clips=[];selectedClipId=null;save();renderClips();$("selectedClipLabel").textContent="No clip selected";$("timelineStatus").textContent="Timeline cleared.";});
["trackGain","previewMute","mixerTrack","previewSolo"].forEach(id=>$(id)?.addEventListener("input",updatePreviewGain));
$("previewMute")?.addEventListener("change",updatePreviewGain);

// Synchronized multi-track local preview + server-side FFmpeg MP4 render.
const previewFiles=new Map();let previewNodes=[],previewTimers=[],previewRAF=0,previewStartClock=0,previewStartAt=0;
function rememberPreviewFile(file){if(!file)return;const old=previewFiles.get(file.name);if(old?.url)URL.revokeObjectURL(old.url);previewFiles.set(file.name,{file,url:URL.createObjectURL(file)});}
function clearMultiPreview(){previewTimers.forEach(clearTimeout);previewTimers=[];previewNodes.forEach(n=>{try{n.el.pause();n.el.removeAttribute("src");n.el.load();}catch{}if(n.url)URL.revokeObjectURL(n.url);});previewNodes=[];cancelAnimationFrame(previewRAF);}
function stopMultiPreview(){clearMultiPreview();const stage=$("multiPreviewStage");if(stage){stage.innerHTML="";stage.hidden=true;}$("renderStatus").textContent="Multi-track preview stopped.";}
$("editorMedia")?.addEventListener("change",e=>rememberPreviewFile(e.target.files?.[0]));
$("renderMediaFiles")?.addEventListener("change",e=>{[...(e.target.files||[])].forEach(rememberPreviewFile);$("renderStatus").textContent=`${e.target.files.length} render media file(s) ready in this session.`;});
function previewMediaElement(file,video){const url=previewFiles.get(file)?.url;if(!url)throw Error(`Preview file not loaded: ${file}`);const el=document.createElement(video?"video":"audio");el.src=url;el.preload="auto";el.playsInline=true;if(video){el.muted=true;el.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#050914;display:none";$("multiPreviewStage").appendChild(el);}return el;}
$("previewMultiTrack")?.addEventListener("click",async()=>{
 try{
  stopMultiPreview();const clips=state.clips.filter(c=>["Video","Voice","Music","Sound Effect"].includes(c.track)).sort((a,b)=>Number(a.start)-Number(b.start));if(!clips.length)throw Error("पहले media clips timeline में जोड़ें।");
  const stage=$("multiPreviewStage");stage.hidden=false;let maxEnd=0;
  for(const c of clips){if(!previewFiles.has(c.sourceName))throw Error(`Preview के लिए file चुनें: ${c.sourceName||c.label}`);const isVideo=c.track==="Video";const el=previewMediaElement(c.sourceName,isVideo);previewNodes.push({clip:c,el,isVideo});maxEnd=Math.max(maxEnd,Number(c.start)+Number(c.duration));}
  previewStartAt=Number($("playheadTime").value)||0;previewStartClock=performance.now();
  previewNodes.forEach(n=>{const c=n.clip,delay=Math.max(0,(Number(c.start)-previewStartAt)*1000);const timer=setTimeout(async()=>{const elapsed=Math.max(0,(performance.now()-previewStartClock)/1000-(Number(c.start)-previewStartAt));if(elapsed>=Number(c.duration))return;try{n.el.currentTime=(Number(c.sourceIn)||0)+elapsed;if(n.isVideo){n.el.style.display="block";}else{const gain=Math.max(0,Math.min(1.5,Number(c.gain??100)/100));const anySolo=Object.values(trackState).some(x=>x?.solo);const soloBlocked=anySolo&&!trackState[c.track]?.solo;n.el.volume=(trackState[c.track]?.muted||soloBlocked)?0:Math.min(1,gain);}await n.el.play();const stop=setTimeout(()=>{n.el.pause();if(n.isVideo)n.el.style.display="none";},Math.max(0,(Number(c.duration)-elapsed)*1000));previewTimers.push(stop);}catch(err){$("renderStatus").textContent=`Playback warning: ${err.message}`;}},delay);previewTimers.push(timer);});
  const tick=()=>{if(!previewNodes.length)return;const t=previewStartAt+(performance.now()-previewStartClock)/1000;const active=previewNodes.filter(n=>n.isVideo&&t>=Number(n.clip.start)&&t<Number(n.clip.start)+Number(n.clip.duration)).sort((a,b)=>Number(a.clip.start)-Number(b.clip.start)).pop();previewNodes.filter(n=>n.isVideo).forEach(n=>{n.el.style.display=n===active?"block":"none";});if(t<maxEnd)previewRAF=requestAnimationFrame(tick);else stopMultiPreview();};tick();
  $("renderStatus").textContent="Synchronized preview running. Video clips display by timeline order; audio clips overlap at their timeline start times.";
 }catch(err){stopMultiPreview();$("renderStatus").textContent=err.message;alert(err.message);}
});
$("stopMultiTrack")?.addEventListener("click",stopMultiPreview);
$("renderMp4")?.addEventListener("click",async()=>{
 const input=$("renderMediaFiles"),files=[...(input?.files||[])];if(!files.length){alert("पहले Render media files चुनें।");return;}if(!state.clips.length){alert("Timeline खाली है।");return;}
 const btn=$("renderMp4");btn.disabled=true;$("renderStatus").textContent="Uploading media and rendering MP4 on backend…";
 try{const fd=new FormData();files.forEach(f=>fd.append("media",f,f.name));fd.append("timeline",JSON.stringify({clips:state.clips}));fd.append("width",$("renderWidth").value);fd.append("fps",$("renderFps").value);fd.append("trackGains",JSON.stringify({Voice:Number($("voiceGain").value),Music:Number($("musicGain").value),"Sound Effect":Number($("sfxGain").value)}));fd.append("trackState",JSON.stringify(trackState));
  const response=await fetch(`${apiBase()}/api/render/mp4`,{method:"POST",body:fd});if(!response.ok){let msg="Render failed";try{msg=(await response.json()).error||msg;}catch{}throw Error(msg);}const blob=await response.blob();if(!blob.size)throw Error("Renderer returned an empty file.");const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="UPS_CREATOR_STUDIO_FINAL.mp4";a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);const preview=$("renderPreview");preview.src=URL.createObjectURL(blob);preview.hidden=false;$("renderStatus").textContent=`MP4 ready · ${(blob.size/1024/1024).toFixed(2)} MB · ${$("renderWidth").value}px · ${$("renderFps").value} FPS`;
 }catch(err){$("renderStatus").textContent=`Render unavailable: ${err.message}`;alert(`MP4 Render: ${err.message}`);}finally{btn.disabled=false;}
});


$("copyEmail").onclick=async()=>{let t=`${$("mailSubject").value}\n\n${$("mailBody").value}`;try{await navigator.clipboard.writeText(t);alert("Email draft copied.");}catch(e){alert("Clipboard unavailable; select and copy.");}};
$("downloadEmail").onclick=()=>download("email-draft.txt",`${$("mailSubject").value}\n\n${$("mailBody").value}`,"text/plain");
$("checkBackend").onclick=async()=>{try{let r=await fetch(`${apiBase()}/api/health`);$("monitorOutput").textContent=JSON.stringify(await r.json(),null,2);}catch(e){$("monitorOutput").textContent="Backend unavailable. Run Node server; static hosting alone does not provide API.";}};$("showCapabilities").onclick=async()=>{try{let r=await fetch(`${apiBase()}/api/capabilities`);$("monitorOutput").textContent=JSON.stringify(await r.json(),null,2);}catch(e){$("monitorOutput").textContent="Capabilities endpoint unavailable until backend is running.";}}
const tests=[["Navigation targets exist","RUNTIME CHECK"],["Local storage write/read","RUNTIME CHECK"],["Project data collections","RUNTIME CHECK"],["SRT timestamp accuracy","RUNTIME CHECK"],["Transition controls","RUNTIME CHECK"],["Quality controls","RUNTIME CHECK"],["Backup JSON serialization","RUNTIME CHECK"],["Auto-Pilot scene pack structure","RUNTIME CHECK"],["Timeline validation","RUNTIME CHECK"],["Brief draft autosave controls","RUNTIME CHECK"],["Local media preview controls","RUNTIME CHECK"],["Caption timing validity","RUNTIME CHECK"],["Project snapshot settings","RUNTIME CHECK"],["Story to storyboard generation","RUNTIME CHECK"],["Per-frame image/video prompts","RUNTIME CHECK"],["Guided NEXT/BACK navigation","RUNTIME CHECK"],["Interactive timeline visual tracks","RUNTIME CHECK"],["Timeline split / duplicate controls","RUNTIME CHECK"],["Timeline undo / redo controls","RUNTIME CHECK"],["Timeline drag reorder and snap controls","RUNTIME CHECK"],["Timeline trim / ripple delete controls","RUNTIME CHECK"],["Timeline clip field editing","RUNTIME CHECK"],["Adjacent clip merge control","RUNTIME CHECK"],["Storyboard to timeline transfer","RUNTIME CHECK"],["Caption timing to timeline sync","RUNTIME CHECK"],["Local audio waveform and preview mixer","RUNTIME CHECK"],["Synchronized multi-track preview controls","RUNTIME CHECK"],["FFmpeg render controls and media upload","RUNTIME CHECK"],["Backend health endpoint","SERVER REQUIRED"],["AI providers / real generation","NOT CONNECTED"],["FFmpeg binary and MP4 render service","SERVER REQUIRED"]];
function renderQA(){ $("qaItems").innerHTML=tests.map((t,i)=>`<div class="qa-row"><span>${esc(t[0])}</span><span class="badge" id="gate${i}">PENDING</span></div>`).join("");}
async function runQA(){
 let passed=0,failed=0,blocked=0;
 const checks=[
  ()=>[...document.querySelectorAll(".nav")].every(n=>document.getElementById(n.dataset.page)) && [...document.querySelectorAll("[data-go]")].every(n=>document.getElementById(n.dataset.go)),
  ()=>{localStorage.setItem("__ups_qa","ok");const ok=localStorage.getItem("__ups_qa")==="ok";localStorage.removeItem("__ups_qa");return ok;},
  ()=>["projects","scenes","captions","clips","assets"].every(k=>Array.isArray(state[k])),
  ()=>timeSrt(1.25)==="00:00:01,250",
  ()=>!!$("saveTransitions")&&!!$("trMode"),
  ()=>!!$("saveQuality")&&!!$("qLevel"),
  ()=>{const x=JSON.stringify({state});return JSON.parse(x).state.projects instanceof Array;},
  ()=>{const p=makeProductionPack();return p.scenes.length>=3&&p.scenes.every(x=>x.end>x.start)&&!!p.masterPrompt;},
  ()=>{const old=state.clips;state.clips=[{track:"Video",label:"QA-A",start:0,duration:2},{track:"Video",label:"QA-B",start:2,duration:2}];const ok=typeof validateTimeline==="function"&&validateTimeline().valid;state.clips=old;return ok;},
  ()=>draftIds.every(id=>!!$(id))&&typeof bindBriefAutosave==="function",
  ()=>!!$("editorMedia")&&!!$("editorPreview")&&!!$("addTrimmedClip"),
  ()=>state.captions.every(c=>Number(c.start)>=0&&Number(c.end)>Number(c.start)&&String(c.text||"").trim()),
  ()=>state.projects.every(p=>Array.isArray(p.scenes||[])&&typeof p==="object"),
  ()=>makeStoryFrames("एक बच्चा गाँव में रहता था। उसने मेहनत की। अंत में वह सफल हुआ।",30,"balanced").length>=3,
  ()=>makeStoryFrames("एक बच्चा गाँव में रहता था। उसने मेहनत की। अंत में वह सफल हुआ।",30,"balanced").every(f=>!!f.imagePrompt&&!!f.videoPrompt&&f.end>f.start),
  ()=>workflowSteps.length>=10&&!!$("stepNext")&&!!$("stepBack"),
  ()=>!!$("timelineVisual")&&trackNames.length===5,
  ()=>!!$("splitClip")&&!!$("duplicateClip"),
  ()=>!!$("undoTimeline")&&!!$("redoTimeline"),
  ()=>!!$("timelineZoom")&&!!$("snapToggle")&&!!$("moveEarlier"),
  ()=>!!$("trimSelected")&&!!$("rippleDelete")&&!!$("deleteSelected"),
  ()=>!!$("applyClipEdits")&&!!$("clipStart")&&!!$("clipDuration"),
  ()=>!!$("mergeNextClip")&&!!$("timelineVisual"),
  ()=>!!$("sendStoryboardToTimeline")&&!!$("timelineVisual"),
  ()=>!!$("sendCaptionsToTimeline")&&!!$("captionList"),
  ()=>!!$("mediaWaveform")&&!!$("trackGain")&&!!$("previewMute"),
  ()=>!!$("previewMultiTrack")&&!!$("stopMultiTrack")&&!!$("multiPreviewStage"),
  ()=>!!$("renderMediaFiles")&&!!$("renderMp4")&&!!$("renderWidth")&&!!$("renderFps")&&!!$("backendUrl"),
 ];
 for(let i=0;i<checks.length;i++){const el=$("gate"+i);el.className="badge";try{if(checks[i]()){el.textContent="PASSED";el.classList.add("pass");passed++;}else{el.textContent="FAILED";failed++;}}catch(e){el.textContent="FAILED";failed++;}}
 try{const r=await fetch(`${apiBase()}/api/health`);const el=$("gate28");el.className="badge";if(r.ok){el.textContent="PASSED";el.classList.add("pass");passed++;}else{el.textContent="FAILED";failed++;}}catch(e){$("gate28").textContent="BLOCKED";blocked++;}
 $("gate29").textContent="BLOCKED";blocked++;try{const cap=await fetch(`${apiBase()}/api/capabilities`).then(x=>x.json());const el=$("gate30");if(cap.ffmpegMultiTrackRender){el.textContent="AVAILABLE — TEST RENDER REQUIRED";el.className="badge";}else{el.textContent="BLOCKED";blocked++;}}catch{$("gate30").textContent="BLOCKED";blocked++;}
 $("passMetric").textContent=passed+" / 31";$("qaSummary").textContent=`Executed checks: ${passed} PASSED, ${failed} FAILED, ${blocked} BLOCKED. AI generation और rendered MP4 external provider/renderer के बिना blocked हैं।`;
}
$("runQA").onclick=runQA;

// V10 unified workflow + deterministic story-to-storyboard engine (local planning; no AI claim)
const workflowSteps=["dashboard","workflow","storyboard","prompt","continuity","transitions","quality","speech","captions","assets","editor","email","monitor","qa"];
function splitStoryIntoBeats(text){
 let units=text.replace(/\r/g,"\n").split(/\n+/).flatMap(p=>p.match(/[^.!?।]+[.!?।]?/g)||[]).map(x=>x.trim()).filter(Boolean);
 if(units.length<=1 && text.length>260){units=text.split(/[,;:]+/).map(x=>x.trim()).filter(Boolean);}
 return units.length?units:[text.trim()];
}
function makeStoryFrames(text,duration,detail){
 const units=splitStoryIntoBeats(text); const target=Math.max(3,Math.min(16,Math.round(duration/5)));
 const count=Math.min(16,Math.max(3,Math.min(target,units.length||3)));
 const buckets=Array.from({length:count},()=>[]);
 units.forEach((u,i)=>buckets[Math.min(count-1,Math.floor(i*count/units.length))].push(u));
 const total=Number(duration)||30, frames=[];
 const roles=["HOOK / परिचय","SETTING / परिस्थिति","INCITING EVENT / घटना","DEVELOPMENT / विकास","TURNING POINT / मोड़","CLIMAX / मुख्य क्षण","RESOLUTION / समाधान","CLOSING / समापन"];
 for(let i=0;i<count;i++){
  const narrative=buckets[i].join(" ")||units[Math.min(i,units.length-1)]||text;
  const start=+(i*total/count).toFixed(2),end=+((i+1)*total/count).toFixed(2),role=roles[Math.min(i,roles.length-1)];
  const visual=`${role}: ${narrative} Show one clear, readable visual action. Preserve the story's cause-and-effect and avoid adding unsupported plot events.`;
  const character=`Infer only characters explicitly mentioned in this beat; keep recurring characters visually consistent. If identity is unspecified, use a coherent fictional design.`;
  const camera= i===0?"Establishing shot; readable composition; gentle push-in.":i===count-1?"Closing shot; hold long enough for the ending to register.":"Choose a motivated shot size and camera movement that communicates this beat; preserve screen direction.";
  const imagePrompt=`FRAME ${i+1} — ${role}\nSTORY BEAT: ${narrative}\nVISUAL: ${visual}\nCHARACTER CONTINUITY: ${character}\nCAMERA: ${camera}\nLIGHTING: motivated, consistent with adjacent frames; physically plausible.\nSTYLE: choose best-fit photo / live-action / animation style from project format; do not force photorealism on animation.\nCOMPOSITION: clear subject, readable action, correct anatomy, no unintended text or logos.`;
  const videoPrompt=`FRAME ${i+1} VIDEO DIRECTION (${(end-start).toFixed(2)}s)\nAnimate this exact story beat: ${narrative}\nACTION: one primary action with natural start, middle and settle; no unrelated movement.\nCAMERA: ${camera}\nCONTINUITY: same recurring character identity, outfit, props, location, lighting direction and screen direction unless story changes them.\nMOTION: natural timing, stable anatomy, no flicker or sudden morphing.\nAUDIO: dialogue/voiceover must fit ${ (end-start).toFixed(2)} seconds; add only relevant ambience.\nTRANSITION: motivated cut to the next beat.`;
  frames.push({id:`FRAME_${String(i+1).padStart(2,"0")}`,title:`Frame ${i+1} — ${role}`,start,end,duration:+(end-start).toFixed(2),beat:role,storyBeat:narrative,visual,dialogue:narrative,camera,lighting:"Motivated and consistent lighting",characterContinuity:character,imagePrompt,videoPrompt,transition:i===count-1?"End hold / fade":"Motivated cut",detail});
 }
 return frames;
}
function renderAutoFrames(){const box=$("autoFrameList");if(!box)return;box.innerHTML=state.scenes.map((f,i)=>`<article class="frame-card"><div class="frame-head"><b>${esc(f.title||`Frame ${i+1}`)}</b><span>${esc(f.start??0)}–${esc(f.end??f.duration??0)}s</span></div><p><b>Story:</b> ${esc(f.storyBeat||f.visual||"")}</p><p><b>Dialogue / VO:</b> ${esc(f.dialogue||"")}</p><details><summary>Image Prompt</summary><pre>${esc(f.imagePrompt||"Not generated for this manual scene")}</pre><button data-copy-frame="${i}" data-copy-kind="image">Copy Image Prompt</button></details><details><summary>Video Prompt</summary><pre>${esc(f.videoPrompt||"Not generated for this manual scene")}</pre><button data-copy-frame="${i}" data-copy-kind="video">Copy Video Prompt</button></details><button data-remove-frame="${i}">Remove Frame</button></article>`).join("")||"अभी कोई auto-generated frame नहीं है।";
 box.querySelectorAll("[data-copy-frame]").forEach(b=>b.onclick=()=>{const f=state.scenes[+b.dataset.copyFrame];copyText(b.dataset.copyKind==="image"?f.imagePrompt:f.videoPrompt);});
 box.querySelectorAll("[data-remove-frame]").forEach(b=>b.onclick=()=>{state.scenes.splice(+b.dataset.removeFrame,1);save();renderAutoFrames();renderScenes();});
}
async function copyText(t){try{await navigator.clipboard.writeText(String(t||""));toast("Copied to clipboard");}catch{const ta=document.createElement("textarea");ta.value=String(t||"");document.body.appendChild(ta);ta.select();const ok=document.execCommand("copy");ta.remove();toast(ok?"Copied":"Copy unavailable — select text manually");}}
function toast(msg){let n=$("toastMessage");if(!n){n=document.createElement("div");n.id="toastMessage";n.className="toast-message";document.body.appendChild(n);}n.textContent=msg;n.classList.add("show");setTimeout(()=>n.classList.remove("show"),2200);}
$("generateStoryStoryboard")?.addEventListener("click",()=>{const text=$("storyInput").value.trim();if(!text){toast("पहले पूरी कहानी डालें");$("storyInput").focus();return;}const frames=makeStoryFrames(text,$("storyDuration").value,$("storyDetail").value);state.scenes=frames;state.storyInput=text;state.storyDuration=Number($("storyDuration").value);save();renderAutoFrames();renderScenes();$("storyStatus").textContent=`${frames.length} frames तैयार। प्रत्येक frame में story beat, timing, dialogue, camera, image prompt और video prompt है। यह prompt-planning है, वास्तविक image/video generation नहीं।`;$("autoFrameList").scrollIntoView({behavior:"smooth",block:"start"});});
$("copyAllFrames")?.addEventListener("click",()=>copyText(state.scenes.map(f=>`${f.title}\n${f.start}-${f.end}s\nSTORY: ${f.storyBeat||f.visual}\nDIALOGUE: ${f.dialogue}\nIMAGE PROMPT:\n${f.imagePrompt||""}\nVIDEO PROMPT:\n${f.videoPrompt||""}`).join("\n\n----------------\n\n")));
$("downloadStoryPack")?.addEventListener("click",()=>download("UPS_V10_STORY_TO_STORYBOARD.json",JSON.stringify({schema:"ups-story-to-storyboard",version:"10.2-local-planning",createdAt:new Date().toISOString(),story:$("storyInput").value,frames:state.scenes,note:"Rule-based local planning. AI media generation requires provider integration."},null,2)));
// Replace the earlier scene renderer so auto-generated prompts remain visible.
renderScenes=function(){const box=$("sceneList");if(!box)return;box.innerHTML=state.scenes.map((f,i)=>`<div class="listrow"><span><b>${esc(f.title||f.id||`Scene ${i+1}`)}</b><br><small>${esc(f.duration||0)}s · ${esc(f.visual||f.storyBeat||"")}</small></span><button data-rms="${i}">Remove</button></div>`).join("")||"No scenes yet.";box.querySelectorAll("[data-rms]").forEach(b=>b.onclick=()=>{state.scenes.splice(+b.dataset.rms,1);save();renderScenes();renderAutoFrames();});};
// Single guided navigation: BACK/NEXT automatically switches section and scrolls to its top.
let stepIndex=Math.max(0,workflowSteps.indexOf(document.querySelector(".page.active")?.id||"dashboard"));
function syncStep(){const el=$("stepIndicator");if(el)el.textContent=`STEP ${stepIndex+1} / ${workflowSteps.length} · ${workflowSteps[stepIndex].toUpperCase()}`;}
$("stepBack")?.addEventListener("click",()=>{stepIndex=Math.max(0,stepIndex-1);page(workflowSteps[stepIndex]);syncStep();});
$("stepNext")?.addEventListener("click",()=>{stepIndex=Math.min(workflowSteps.length-1,stepIndex+1);page(workflowSteps[stepIndex]);syncStep();});
document.querySelectorAll(".nav,[data-go]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.page||el.dataset.go;const ix=workflowSteps.indexOf(id);if(ix>=0){stepIndex=ix;syncStep();}}));
$("copyCurrentOutput")?.addEventListener("click",()=>{const active=document.querySelector(".page.active");const output=active?.querySelector("pre.output:not([hidden])")||active?.querySelector("pre.output")||active?.querySelector("textarea");if(output)copyText(output.textContent||output.value);else if(active?.id==="storyboard")copyText(state.scenes.map(x=>x.imagePrompt+"\n\n"+x.videoPrompt).join("\n\n"));else toast("इस पेज पर कॉपी करने योग्य आउटपुट अभी उपलब्ध नहीं है");});
renderAutoFrames();syncStep();

window.addEventListener("pagehide",()=>{try{localStorage.setItem(K,JSON.stringify(state));}catch{}});
$("projectCount").textContent=state.projects.length;renderProjects();renderScenes();renderCaps();renderClips();renderQA();
const q=readStored("ups_quality_v10");if(q){$("qLevel").value=q.level;$("qPhoto").value=q.photo;$("qVideo").value=q.video;$("qFormat").value=q.format;$("qResolution").value=q.resolution;$("qColor").value=q.color;$("qualityMetric").textContent=q.level.startsWith("ULTRA")?"ULTRA":q.level;}renderAssets();
