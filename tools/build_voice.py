#!/usr/bin/env python3
"""Gera mocks/voice/*.json (lista de audios de cada simulado) e o SQL de jobs para a edge function tts-gen."""
import json,re,sys
STAGES=[1,2,3,6]; V=['Puck','Kore','Orus','Charon']
BASE='https://isrvmwebubjcvzxkorpf.supabase.co/storage/v1/object/public/simulado-voice/'
pl=json.load(open('mocks/places.json'))
BRK=set('and but when who that with in on at of to by because if or so while where which'.split())
def chunks(txt):
    out=[]
    for s in re.findall(r'[^.?!]+[.?!]+[”"’]*|[^.?!]+$',txt.strip()):
        s=s.strip()
        if not s: continue
        parts=[p.strip() for p in re.split(r'(?<=,)\s+',s) if p.strip()]
        for p in parts:
            w=p.split();cur=[]
            for i,x in enumerate(w):
                if len(cur)>=3 and (len(cur)>=6 or x.lower() in BRK and len(w)-i>=2) and len(w)>6:
                    out.append(' '.join(cur));cur=[]
                cur.append(x)
            if cur: out.append(' '.join(cur))
    return out
jobs=[]
for st in STAGES:
  for ed in ('2nd','3rd'):
    for t in 'AB':
      name='stage%02d-%s-%s'%(st,ed,t); d=json.load(open('mocks/%s.json'%name))
      items=[]; pi=0
      for p in d['items']['parts']:
        voice=V[(st+pi+(t=='B'))%4]
        kp=next((k for k in d['keys']['parts'] if k['id']==p['id']),{})
        if p['id']=='yesno':
            src=[{'n':n,'q':q} for n,q in kp['teacher'].items()] if 'items' not in p else p['items']
            for it in src:
                n=int(it['n']);items.append({'id':'y%02d'%n,'kind':'yn','n':n,'text':it['q'],'voice':voice})
                for pk,v in pl.items():
                    o=v['patches'].get(name,{}).get('yesno',{}).get(str(n))
                    if o and o.get('q'):items.append({'id':'y%02d-%s'%(n,pk),'kind':'yn','n':n,'place':pk,'text':o['q'],'voice':voice})
        elif p['id']=='oral':
            for n,q in sorted(kp['teacher'].items(),key=lambda x:int(x[0])):
                items.append({'id':'o%02d'%int(n),'kind':'or','n':int(n),'text':q,'voice':voice})
        elif p['id']=='dictation':
            cs=p.get('chunks') or chunks(kp['text'])
            for i,c in enumerate(cs,1):
                items.append({'id':'d%02d'%i,'kind':'dc','n':i,'text':c,'voice':voice})
        pi+=1
      json.dump({'name':name,'base':BASE+ed+'/'+name+'/','ext':'wav','items':items},open('mocks/voice/%s.json'%name,'w'),ensure_ascii=False,indent=0)
      for it in items:
        base=ed+'/'+name+'/'
        AB=lambda s:re.sub(r'\b(Mr|Mrs|Ms|Dr)\.',lambda m:{'Mr':'Mister','Mrs':'Missus','Ms':'Miss','Dr':'Doctor'}[m.group(1)],s).replace('´','’')
        P=lambda s:AB(s).replace(',',' comma,').replace(';',' semicolon;').replace('.',' full stop.').replace('?',' question mark.').replace('!',' exclamation mark.')
        if it['kind']=='dc':
            jobs.append((base+it['id']+'p.wav',P(it['text']),it['voice']))
            jobs.append((base+it['id']+'s.wav',re.sub(r'[,.?!;]','',AB(it['text'])),it['voice']))
        else: jobs.append((base+it['id']+'.wav',AB(it['text']),it['voice']))
q=lambda s:"'"+s.replace("'","''")+"'"
open(sys.argv[1],'w').write("insert into public.tts_jobs(path,txt,voice) values\n"+",\n".join('(%s,%s,%s)'%(q(a),q(b),q(c)) for a,b,c in jobs)+"\non conflict(path) do nothing;\n")
print(len(jobs),'jobs')
