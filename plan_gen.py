import openpyxl,collections,re,json,sys
def load():
    wb=openpyxl.load_workbook('/mnt/attach/outputs/Callan_Vocabulario_por_Paragrafo.xlsx',read_only=True)
    P=collections.OrderedDict();R={};D={};G=collections.defaultdict(set);global W;W=collections.defaultdict(list)
    for i,r in enumerate(wb.worksheets[0].iter_rows(values_only=True)):
        if i==0 or not r[0]:continue
        st,le,pa,w,m,rd,di=r[:7]
        P[(st,pa)]=le;W[(st,pa)].append(str(w))
        if rd:R[(st,pa)]=rd
        if di:D[(st,le)]=di
        if w and re.search(r'past (continuous|perfect|simple)|present (perfect|continuous|simple)|conditional|passive|reported|relative|question tag|causative|modal|used to|future|comparative|superlative|gerund|infinitive|clause|prefix|suffix',str(w),re.I):G[(st,le)].add(pa)
    return P,R,D,G
UL=None
NUMW=set('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred first second third fourth fifth sixth seventh eighth ninth tenth'.split())
def uload():
    global UL
    import json
    d=json.load(open('/tmp/plan/underlines.json'));UL=collections.defaultdict(list)
    for st,L in d.items():
        for par,t,pn,x,y in L:
            if par is not None:UL[(int(st),par)].append(t.strip())
def plan(st,P,R,D,G,k=4):
    if UL is None:uload()
    wl=collections.defaultdict(set)
    for (s_,p_),ws in W.items():
        if s_==st:
            for w in ws:wl[P[(s_,p_)]].add(w.strip().lower())
    for (s_,p_),ts in UL.items():
        if s_==st and (s_,p_) in P and any(t.lower() in wl[P[(s_,p_)]] for t in ts):G[(st,P[(s_,p_)])].add(p_)
    ps=sorted(p for (s_,p) in P if s_==st)
    lesson={p:P[(st,p)] for p in ps}
    last={}
    for p in ps:last[lesson[p]]=p
    first_par=ps[0]
    onb_end=ps[min(4,len(ps)-1)]
    NWMAX,REVMAX=5,12                      # NW nunca passa de 5 parágrafos; REV usa 12 (nunca mais de 13)
    rows=[];start=onb_end+1;used_r=set();used_d=set()
    def dens(a,b):return sum(len(UL.get((st,p),[])) for p in range(a,b+1))
    while start<=ps[-1]:
        # fim do NW: último parágrafo com vocabulário dentro de [start, start+lim-1]
        lim=NWMAX if (G.get((st,lesson[next(p for p in ps if p>=start)])) ) else k
        if lim<NWMAX and dens(start,start+lim-1)>=6:lim=3
        cand=[p for p in ps if start<=p<=start+lim-1]
        if not cand:start+=1;continue
        end=cand[-1]
        rest=[p for p in ps if p>end]
        if rest and rest[-1]-(end+1)+1<3 and rest[-1]-start+1<=NWMAX:end=rest[-1]   # não deixa sobrar 1-2 parágrafos no fim
        nw=[p for p in ps if start<=p<=end]
        rv_a=max(first_par,start-REVMAX);rv=[p for p in ps if rv_a<=p<start]
        rvr=(rv_a,start-1) if rv else None
        rd=[R[(st,p)] for p in rv if (st,p) in R and (st,p) not in used_r]
        dc=[D[(st,lesson[p])] for p in rv if last[lesson[p]]==p and (st,lesson[p]) in D and (st,lesson[p]) not in used_d]
        for p in rv:
            if (st,p) in R:used_r.add((st,p))
            if last[lesson[p]]==p:used_d.add((st,lesson[p]))
        done=sorted({lesson[p] for p in nw if last[lesson[p]]==p})
        rows.append({'nw':(start,end),'nwp':nw,'rv':rvr,'read':rd,'dict':dc,'done':done})
        start=end+1
    out=[{'c':'ONBOARDING','par':f'{first_par}-{onb_end}'}]
    lc_due=[]
    for c in rows:
        ws=[w for p in range(c['nw'][0],c['nw'][1]+1) for w in W.get((st,p),[])]
        t=''
        if c['rv']:t+=f"REV {c['rv'][0]}-{c['rv'][1]} / "
        rng=f"{c['nw'][0]}-{c['nw'][1]}" if c['nw'][1]!=c['nw'][0] else f"{c['nw'][0]}"
        t+=f"NW {ws[0]} - {ws[-1]} [{rng}]" if len(ws)>1 else f"NW {ws[0] if ws else ''} [{rng}]"
        lc=lc_due.pop(0) if lc_due else '—'
        lc_due+=c['done']
        notes=[]
        for p in range(c['nw'][0],c['nw'][1]+1):
            for u in UL.get((st,p),[]):
                u=u.strip()
                if u not in notes and (len(u)>=5 or ' ' in u) and not u.isdigit() and u.lower() not in NUMW:notes.append(u)
        out.append({'notes':' · '.join(notes[:6]),'c':t,'read':';'.join(re.sub(r'\D','',x) for x in c['read']) or '—','dict':';'.join(re.sub(r'\D','',x) for x in c['dict']) or '—','lc':lc})
    out.append({'c':f'STAGE {st} FULL REVISION'+(' (Stages %d + %d)'%(st-1,st) if st%2==0 else ''),'lc':', '.join(str(x) for x in lc_due) or '—'})
    out.append({'c':f'STAGE {st} MOCK EXAM','read':'—','dict':'—','lc':'—','notes':'Aula de tira-dúvidas e prévia do exame'})
    out.append({'c':f'OFFICIAL STAGE {st} EXAM'})
    return out
if __name__=='__main__':
    P,R,D,G=load();st=int(sys.argv[1]);o=plan(st,P,R,D,G)
    import csv;w=csv.writer(open(f'/tmp/plan/plano_stage{st}.csv','w',newline='',encoding='utf-8-sig'));w.writerow(['Aula','Contents','Read.','Dict.','LC','Notes'])
    for i,r in enumerate(o,1):w.writerow([i,r['c'],r.get('read',''),r.get('dict',''),r.get('lc',''),r.get('notes','')])
    print(len(o),'aulas')
    for i,r in enumerate(o[:9],1):print(i,r)
