const express=require("express");
const OpenAI=require("openai");
const path=require("path");
const app=express();
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname,"public")));
const client=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;
app.get("/api/health",(req,res)=>res.json({ok:true,apiKeyConfigured:!!client}));
app.post("/api/generate-image",async(req,res)=>{
 try{
  if(!client)return res.status(503).json({error:"Server पर OPENAI_API_KEY Environment Variable सेट नहीं है।"});
  const {prompt,ratio="9:16",quality="high"}=req.body||{};
  if(typeof prompt!=="string"||prompt.trim().length<10)return res.status(400).json({error:"Valid image prompt required."});
  const sizes={"9:16":"1024x1536","16:9":"1536x1024","1:1":"1024x1024","3:4":"1024x1536","4:3":"1536x1024"};
  const result=await client.images.generate({model:"gpt-image-1",prompt:prompt.trim(),size:sizes[ratio]||"1024x1536",quality:["low","medium","high"].includes(quality)?quality:"high",output_format:"png"});
  const image=result.data?.[0]?.b64_json;
  if(!image)return res.status(502).json({error:"Image provider returned no image data."});
  res.json({image,mime:"image/png"});
 }catch(e){console.error("Image generation error:",e);res.status(e.status||500).json({error:e.message||"Image generation failed."});}
});
app.listen(process.env.PORT||3000,()=>console.log("UPS Creator Studio server running"));
