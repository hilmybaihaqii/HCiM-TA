'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ACTIVE_STATUSES, DEFAULT_DOSES, DrugDb, PipelineJob, PipelineRequest,
  createJob, getDrugs, getJob, isFormError, joinList, listJobs, readApiError,
} from '@/lib/pipeline';
import { FormState, formFromRequest, initialForm } from './form';
import DrugParamsForm from './components/DrugParamsForm';
import LabPageHeader from '../components/LabPageHeader';
import LabContainer from '../components/LabContainer';
import PipelineMonitor, { RunningDetails } from './components/JobProgress';
import { PageSkeleton } from '../components/Skeletons';
import PipelineResult, { PipelineFailure, failureCopy } from './components/PipelineResult';

const POLL_MS = 3000;                     // jangan lebih cepat: rate limit 2 req/s per user
const POLL_TIMEOUT_MS = 10 * 60 * 1000;   // backend sendiri menyerah di 8 menit
const BASE_PATH = '/lab/pipeline';

type View = 'form' | 'running' | 'result' | 'failed' | 'error';
type PollIssue = { jobId: string; kind: 'timeout' | 'fatal'; message: string };

function PipelinePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');

  const [db, setDb] = useState<DrugDb | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  // Wizard dibuka dari pemilihan mode, atau langsung di Review saat "Try again". key memaksa remount.
  const [formEntry, setFormEntry] = useState<{ at: 'choose' | 'review'; key: number }>({ at: 'choose', key: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [job, setJob] = useState<PipelineJob | null>(null);
  const [pollIssue, setPollIssue] = useState<PollIssue | null>(null);
  const [pollNonce, setPollNonce] = useState(0);


  const goToJob = useCallback((id: string) => {
    router.replace(`${BASE_PATH}?job=${encodeURIComponent(id)}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);

  const goToForm = useCallback(() => {
    router.replace(BASE_PATH, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);

  /* ---------- Database 28 obat ---------- */
  useEffect(() => {
    let alive = true;
    getDrugs()
      .then(d => { if (alive) setDb(d); })
      .catch(err => {
        if (!alive) return;
        const { status } = readApiError(err);
        setDbError(status === 503
          ? 'The simulation service is not available right now.'
          : 'Could not load the CiPA drug database. Please reload the page to try again.');
      });
    return () => { alive = false; };
  }, []);

  /* ---------- Polling job aktif (setTimeout, bukan setInterval) ---------- */
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let waiting = false; // true saat timer berikutnya sudah dijadwalkan
    const pollStart = Date.now();

    const schedule = () => {
      waiting = true;
      timer = setTimeout(() => { waiting = false; void tick(); }, POLL_MS);
    };

    const tick = async () => {
      try {
        const j = await getJob(jobId);
        if (cancelled) return;

        // Error validasi dari server -> kembali ke form dengan nilai tetap
        if (j.status === 'failed' && isFormError(j.error)) {
          setForm(formFromRequest(j.request));
          setFormEntry(e => ({ at: 'review', key: e.key + 1 }));
          setFormError(j.error);
          router.replace(BASE_PATH, { scroll: false });
          return;
        }

        setJob(j);
        if (j.status === 'done' || j.status === 'failed') return; // berhenti polling
      } catch (err) {
        if (cancelled) return;
        const { status } = readApiError(err);
        if (status === 401) {
          setPollIssue({ jobId, kind: 'fatal', message: 'Session expired. Please reload the page to authenticate.' });
          return;
        }
        if (status === 404) {
          setPollIssue({ jobId, kind: 'fatal', message: 'This simulation could not be found.' });
          return;
        }
        // 429 / 5xx / jaringan: anggap sementara, coba lagi di tick berikutnya
      }

      if (Date.now() - pollStart > POLL_TIMEOUT_MS) {
        setPollIssue({ jobId, kind: 'timeout', message: 'The simulation took too long. The server may be busy; please try again.' });
        return;
      }
      schedule();
    };

    // Kembali ke tab: langsung cek tanpa menunggu timer (browser memperlambat timer di tab background)
    const onVisible = () => {
      if (document.visibilityState === 'visible' && waiting && !cancelled) {
        clearTimeout(timer);
        waiting = false;
        void tick();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [jobId, pollNonce, router]);

  /* ---------- Submit ---------- */
  const handleSubmit = async (req: PipelineRequest) => {
    setSubmitting(true);
    setFormError(null);
    setNotice(null);
    try {
      const res = await createJob(req);
      if (!res?.job_id) throw new Error('The server did not return a job id.');
      goToJob(res.job_id);
    } catch (err) {
      const { status, message, isNetwork } = readApiError(err);
      if (status === 409) {
        // Sudah ada simulasi berjalan -> lanjutkan job itu, bukan tampilkan error
        try {
          const active = (await listJobs()).find(j => ACTIVE_STATUSES.includes(j.status));
          if (active) {
            setNotice('You already have a simulation running. Showing it now.');
            goToJob(active.id);
            return;
          }
        } catch {
          /* jatuh ke pesan di bawah */
        }
        setFormError(message || 'You already have a simulation running.');
      } else if (status === 401) {
        setFormError('Session expired. Please reload the page to authenticate.');
      } else if (status === 422) {
        setFormError(message ? `Invalid input: ${message}` : 'Invalid input.');
      } else if (status === 429) {
        setFormError('Too many requests. Please wait a few seconds.');
      } else if (status === 503) {
        setFormError('The simulation service is not available right now.');
      } else if (isNetwork) {
        setFormError('Could not reach the simulation service. Please check your connection and try again.');
      } else {
        setFormError(`Could not start the simulation${message ? `: ${message}` : '.'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const runAnother = () => {
    setFormEntry(e => ({ at: 'choose', key: e.key + 1 }));
    setNotice(null);
    setFormError(null);
    goToForm();
  };

  const tryAgainFromJob = (j: PipelineJob | null) => {
    if (j?.request) setForm(formFromRequest(j.request));
    setFormEntry(e => ({ at: j?.request ? 'review' : 'choose', key: e.key + 1 }));
    setNotice(null);
    setFormError(null);
    goToForm();
  };

  const retryPolling = () => {
    setPollIssue(null);
    setPollNonce(n => n + 1);
  };

  /* ---------- View turunan dari URL + state ---------- */
  const currentJob = job && job.id === jobId ? job : null;
  const issue = pollIssue && pollIssue.jobId === jobId ? pollIssue : null;
  const view: View = !jobId ? 'form'
    : issue ? 'error'
    : !currentJob ? 'running'
    : currentJob.status === 'done' ? 'result'
    : currentJob.status === 'failed' ? 'failed'
    : 'running';

  const doses = currentJob?.sim_result?.doses ?? currentJob?.sim_params?.doses ?? db?.doses ?? DEFAULT_DOSES;

  return (
    <div className="w-full flex flex-col min-h-100 text-foreground overflow-x-hidden">
      <div className="w-full relative z-10">
        {/* pb-0: tiap tampilan (form/running/result) sudah punya pb-20 sendiri */}
        <LabContainer className="flex flex-col gap-8 pb-0!">
          <LabPageHeader
            eyebrow="Full pipeline"
            title="From drug data"
            accent="to TdP risk."
            description={`Enter a drug's exposure and ion-channel block. We simulate a human ventricular cell at ${joinList(db?.doses ?? DEFAULT_DOSES)}× Cmax, measure 11 biomarkers, and classify the risk for the mean and for each dose.`}
          />
          <PipelineMonitor job={currentJob} loading={!!jobId && !currentJob && view !== 'error'} doses={doses} db={db} />

          {/* Tanpa AnimatePresence mode="wait": bisa macet di opacity 0 sehingga hasil tidak tampil */}
            {view === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6 pb-20"
              >
                <DrugParamsForm
                  key={formEntry.key}
                  startAt={formEntry.at}
                  form={form}
                  onChange={f => { setForm(f); setFormError(null); }}
                  db={db}
                  dbError={dbError}
                  doses={db?.doses ?? DEFAULT_DOSES}
                  submitting={submitting}
                  serverError={formError}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}

            {view === 'running' && (
              <motion.div key="running" className="pb-20" exit={{ opacity: 0 }}>
                <RunningDetails job={currentJob} notice={notice} />
              </motion.div>
            )}

            {view === 'result' && currentJob && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <PipelineResult key={currentJob.id} job={currentJob} db={db} onRunAnother={runAnother} />
              </motion.div>
            )}

            {view === 'failed' && currentJob && (
              <motion.div key="failed">
                <PipelineFailure
                  {...failureCopy(currentJob.error)}
                  onRetry={() => tryAgainFromJob(currentJob)}
                />
              </motion.div>
            )}

            {view === 'error' && issue && (
              <motion.div key="error">
                <PipelineFailure
                  headline={issue.message}
                  onRetry={issue.kind === 'timeout' ? retryPolling : () => window.location.reload()}
                  retryLabel={issue.kind === 'timeout' ? 'Keep waiting' : 'Reload page'}
                  secondary={{ label: 'Back to form', onClick: () => tryAgainFromJob(job && job.id === jobId ? job : null) }}
                />
              </motion.div>
            )}
        </LabContainer>
      </div>
    </div>
  );
}

// useSearchParams() wajib dibungkus Suspense, kalau tidak `next build` gagal
export default function FullPipelinePage() {
  return (
    <Suspense
      fallback={<PageSkeleton />}
    >
      <PipelinePageInner />
    </Suspense>
  );
}
