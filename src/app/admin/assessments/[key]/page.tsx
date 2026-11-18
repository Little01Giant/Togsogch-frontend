'use client';
import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { t } from '@/i18n';
import { ConfirmDialog, StateBoundary } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Alert, Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/data-display';
import { Textarea } from '@/components/ui/form-controls';
import { notify } from '@/components/ui/misc';
import { Hint, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/overlays';
import { Field } from '@/features/admin/config';
import { FieldForm, validate } from '@/features/admin/FieldForm';

const TYPES = [['single', 'Нэг сонголт'], ['multi', 'Олон сонголт'], ['likert', 'Likert (1–5)'], ['rating', 'Үнэлгээ'], ['text', 'Текст'], ['number', 'Тоо']].map(([value, label]) => ({ value, label }));
const DIMS = ['interest', 'skill', 'workstyle', 'value', 'academic'].map((v) => ({ value: v, label: v }));
const QFIELDS: Field[] = [
  { name: 'key', label: 'Key (давхцахгүй)', type: 'text', required: true }, { name: 'section', label: 'Бүлгийн key', type: 'text', required: true },
  { name: 'text', label: 'Асуулт', type: 'textarea', required: true }, { name: 'type', label: 'Төрөл', type: 'select', options: TYPES, required: true },
  { name: 'order', label: 'Дараалал', type: 'number' }, { name: 'required', label: 'Заавал', type: 'checkbox' },
  { name: 'scale.min', label: 'Хэмжүүр: доод', type: 'number' }, { name: 'scale.max', label: 'Хэмжүүр: дээд', type: 'number' }, { name: 'scale.minLabel', label: 'Доод шошго', type: 'text' }, { name: 'scale.maxLabel', label: 'Дээд шошго', type: 'text' },
  { name: 'options', label: 'Сонголтууд', type: 'group', fields: [{ name: 'key', label: 'Key', type: 'text', required: true }, { name: 'label', label: 'Текст', type: 'text', required: true }] },
  { name: 'scoring.dimension', label: 'Онооны хэмжигдэхүүн', type: 'select', options: DIMS }, { name: 'scoring.target', label: 'Зорилт (R/I/A…, чадварын key…)', type: 'text' },
  { name: 'scoring.weight', label: 'Жин', type: 'number' }, { name: 'scoring.reverse', label: 'Урвуу оноо', type: 'checkbox' },
  { name: 'showIf.questionKey', label: 'Нөхцөл: асуултын key', type: 'text' }, { name: 'showIf.equals', label: 'Нөхцөл: утга', type: 'text' },
];

export default function AssessmentEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const qc = useQueryClient();
  const a = useQuery<any>({ queryKey: ['admin-assessment', key], queryFn: () => api(`/admin/assessments/${key}`) });
  const qs = useQuery<any[]>({ queryKey: ['admin-questions', key], queryFn: () => api(`/admin/assessments/${key}/questions`) });
  const [editing, setEditing] = useState<any>(null); const [errors, setErrors] = useState<Record<string, string>>({}); const [del, setDel] = useState<any>(null);
  const [cfgText, setCfgText] = useState<string | null>(null);
  const fail = (e: any) => notify({ color: 'red', message: e.message });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-questions', key] }); qc.invalidateQueries({ queryKey: ['admin-assessment', key] }); qc.invalidateQueries({ queryKey: ['admin-assessments'] }); };

  const save = useMutation({
    mutationFn: (d: any) => { const body = { ...d, showIf: d.showIf?.questionKey ? d.showIf : undefined }; return d._id ? api(`/admin/assessments/${key}/questions/${d._id}`, { method: 'PATCH', body }) : api(`/admin/assessments/${key}/questions`, { method: 'POST', body }); },
    onSuccess: () => { notify({ color: 'teal', message: t.common.saved }); setEditing(null); refresh(); }, onError: fail,
  });
  const remove = useMutation({ mutationFn: (id: string) => api(`/admin/assessments/${key}/questions/${id}`, { method: 'DELETE' }), onSuccess: () => { setDel(null); refresh(); }, onError: fail });
  const publish = useMutation({ mutationFn: () => api(`/admin/assessments/${key}/publish`, { method: 'POST' }), onSuccess: (r: any) => { notify({ color: 'teal', message: `v${r.version} нийтлэгдлээ (${r.questionCount} асуулт)` }); refresh(); }, onError: fail });
  const saveCfg = useMutation({ mutationFn: (scoringConfig: any) => api(`/admin/assessments/${key}`, { method: 'PATCH', body: { scoringConfig } }), onSuccess: () => { notify({ color: 'teal', message: t.common.saved }); refresh(); }, onError: fail });

  const submit = () => { const e = validate(QFIELDS, editing); setErrors(e); if (!Object.keys(e).length) save.mutate(editing); };
  const cfgValue = cfgText ?? JSON.stringify(a.data?.scoringConfig ?? {}, null, 2);
  let cfgErr: string | undefined; try { JSON.parse(cfgValue); } catch { cfgErr = 'JSON буруу байна'; }

  return (
    <StateBoundary isLoading={a.isLoading} error={a.error} onRetry={a.refetch}>
      {a.data && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-h1">{a.data.title}</h1><p className="text-body-sm text-muted-foreground">{t.admin.draftVersion}: v{a.data.draftVersion} · {t.admin.versionNote}</p></div>
            <Button loading={publish.isPending} onClick={() => publish.mutate()}>{t.admin.publishVersion}</Button></div>
          <Tabs defaultValue="questions">
            <TabsList><TabsTrigger value="questions">{t.admin.questions}</TabsTrigger><TabsTrigger value="scoring">{t.admin.scoringConfig}</TabsTrigger></TabsList>
            <TabsContent value="questions" className="grid gap-3">
              <div><Button variant="outline" onClick={() => { setErrors({}); setEditing({ required: true, type: 'likert', scale: { min: 1, max: 5 }, section: a.data.sections?.[0]?.key }); }}><Plus />{t.admin.addQuestion}</Button></div>
              <StateBoundary isLoading={qs.isLoading} error={qs.error} isEmpty={!qs.data?.length}>
                <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Key</TableHead><TableHead>Асуулт</TableHead><TableHead>Төрөл</TableHead><TableHead>Онооны чиглэл</TableHead><TableHead /></TableRow></TableHeader>
                  <TableBody>{qs.data?.map((q) => (
                    <TableRow key={q._id}><TableCell>{q.order + 1}</TableCell><TableCell><code className="text-caption">{q.key}</code></TableCell><TableCell className="max-w-sm"><span className="line-clamp-2 whitespace-normal">{q.text}</span></TableCell>
                      <TableCell><Badge variant="muted">{q.type}</Badge></TableCell><TableCell className="text-caption">{q.scoring?.dimension ? `${q.scoring.dimension}:${q.scoring.target ?? ''}` : '—'}</TableCell>
                      <TableCell><div className="flex justify-end gap-1"><Hint label={t.common.edit}><Button variant="ghost" size="icon" className="size-8" aria-label={t.common.edit} onClick={() => { setErrors({}); setEditing({ ...q, showIf: q.showIf ?? {} }); }}><Pencil /></Button></Hint><Hint label={t.common.delete}><Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={t.common.delete} onClick={() => setDel(q)}><Trash2 /></Button></Hint></div></TableCell></TableRow>
                  ))}</TableBody></Table>
              </StateBoundary>
            </TabsContent>
            <TabsContent value="scoring"><Card className="grid gap-3 p-5">
              <Alert variant="info">Жин (weights), topN зэргийг эндээс тохируулна. «Шинэ хувилбар нийтлэх» үед тохиргоо хөлдөөгдөнө.</Alert>
              <Textarea rows={10} className="font-mono text-xs" value={cfgValue} aria-invalid={!!cfgErr} onChange={(e) => setCfgText(e.target.value)} />
              {cfgErr && <p role="alert" className="text-caption font-medium text-destructive">{cfgErr}</p>}
              <div><Button disabled={!!cfgErr || cfgText === null} loading={saveCfg.isPending} onClick={() => saveCfg.mutate(JSON.parse(cfgValue))}>{t.common.save}</Button></div>
            </Card></TabsContent>
          </Tabs>

          <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
            <SheetContent side="right" widthClass="w-[min(100vw,760px)] sm:max-w-none" onInteractOutside={(e) => e.preventDefault()}>
              <SheetHeader><SheetTitle>{editing?._id ? t.common.edit : t.admin.addQuestion}</SheetTitle><SheetDescription className="sr-only">{t.admin.questions}</SheetDescription></SheetHeader>
              {editing && <><FieldForm fields={QFIELDS} data={editing} onChange={setEditing} errors={errors} />
                <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 flex justify-end gap-2 border-t bg-card px-6 py-3"><Button variant="outline" onClick={() => setEditing(null)}>{t.common.cancel}</Button><Button loading={save.isPending} onClick={submit}>{t.common.save}</Button></div></>}
            </SheetContent>
          </Sheet>
          <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={t.common.delete} description={t.common.confirmDelete} loading={remove.isPending} onConfirm={() => remove.mutate(del._id)} />
        </div>
      )}
    </StateBoundary>
  );
}
