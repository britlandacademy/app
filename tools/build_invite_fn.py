#!/usr/bin/env python3
# Junta js/invite.js ao corpo da funcao invite-text e grava supabase/functions/invite-text/index.ts
import pathlib
r=pathlib.Path(__file__).resolve().parent.parent
t=r/'tools'
src=(t/'invite_fn_head.ts').read_text(encoding='utf-8')+'\n'+(r/'js/invite.js').read_text(encoding='utf-8')+'\n'+(t/'invite_fn_body.ts').read_text(encoding='utf-8')
(r/'supabase/functions/invite-text').mkdir(parents=True,exist_ok=True)
(r/'supabase/functions/invite-text/index.ts').write_text(src,encoding='utf-8')
print(len(src))
