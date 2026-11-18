'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StateBoundary } from '@/components/common';
import { PageContainer } from '@/components/layout/page-container';
import { RequireUser } from '@/features/consent';
import { CareerResult } from '@/features/career-result';
import { LanguageResult, MastersResult } from '@/features/phase2-results';
import { CityResult } from '@/features/city-result';
import { PersonaResult } from '@/features/persona-result';
import { ThinkingResult } from '@/features/thinking-result';
import { LockBanner } from '@/features/paywall';

function Result({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useQuery<any>({ queryKey: ['result', id], queryFn: () => api(`/attempts/${id}/result`) });
  return (
    <PageContainer className="px-3 py-4 sm:px-6 md:py-12">
      <StateBoundary isLoading={isLoading} error={error} onRetry={refetch}>
        {data && (
          <div className="grid grid-cols-1 gap-4 md:gap-5 [&>*]:min-w-0">
            {data.locked
              ? <LockBanner attemptId={id} />
              : <>{data.kind === 'persona' ? <PersonaResult r={data} /> : data.kind === 'thinking' ? <ThinkingResult r={data} /> :data.kind === 'masters' ? <MastersResult r={data} /> : data.kind === 'language' ? <LanguageResult r={data} /> : data.kind === 'city' ? <CityResult r={data} /> : <CareerResult r={data} />}</>}
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}

export default function ResultPage({ params }: { params: Promise<{ key: string; id: string }> }) {
  const { id } = use(params);
  return <RequireUser>{() => <Result id={id} />}</RequireUser>;
}
