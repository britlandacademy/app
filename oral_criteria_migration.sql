-- Critérios do Oral exam: antes [Entendeu 0-1, Completa 0-1, Gramática 0-2, Pronúncia 0-1],
-- agora [Comprehension 0-1, Fluency 0-1, Grammar 0-1, Pronunciation 0-2]. O total de 5 pontos por pergunta não muda.
-- Converte só as perguntas que já têm as 4 notas: [a,b,c,d] -> [a,b,min(c,1),d+max(c-1,0)]. Rode UMA vez no SQL Editor do Supabase.
update public.exam_results r
set oral = jsonb_set(r.oral,'{q}',(
  select jsonb_agg(
    case when jsonb_typeof(x->'s')='array' and (x->'s'->>0) is not null and (x->'s'->>1) is not null and (x->'s'->>2) is not null and (x->'s'->>3) is not null
      then jsonb_set(x,'{s}',jsonb_build_array(x->'s'->0, x->'s'->1, to_jsonb(least((x->'s'->>2)::int,1)), to_jsonb((x->'s'->>3)::int + greatest((x->'s'->>2)::int-1,0))))
      else x end order by ord)
  from jsonb_array_elements(r.oral->'q') with ordinality t(x,ord)))
where oral is not null and jsonb_array_length(oral->'q')>0;
