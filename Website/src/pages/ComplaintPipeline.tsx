import { useComplaints } from '@/hooks/useComplaints';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Complaint } from '@/types/complaint';
import { DEPARTMENTS } from '@/data/departments';
import { Badge } from '@/components/ui/Badge';
import { updateComplaint } from '@/api/complaints';
import { useState } from 'react';
import {
  ACTION_TO_STATUS,
  actionDisabledReason,
  canPerformAction,
  type ComplaintAction,
} from '@/utils/complaintActions';

const ACTION_LABEL: Record<ComplaintAction, string> = {
  accept: 'Approve',
  reject: 'Reject',
  resolve: 'Mark Resolved',
};

const ACTION_BUTTON_CLASS: Record<ComplaintAction, string> = {
  accept: 'bg-emerald-600 hover:bg-emerald-700',
  reject: 'bg-rose-600 hover:bg-rose-700',
  resolve: 'bg-blue-600 hover:bg-blue-700',
};

const getSuggestedDepartment = (roadType?: string | null) => {
  if (!roadType) return null;
  return DEPARTMENTS.find(dept => dept.roadTypes.includes(roadType)) || null;
};

const ComplaintCard = ({ complaint, onUpdate }: { complaint: Complaint, onUpdate: (id: number, payload: any) => void }) => {
  const suggestedDept = getSuggestedDepartment(complaint.roadType);
  const [notes, setNotes] = useState('');

  const handleAction = (action: ComplaintAction) => {
    const payload: Record<string, string> = { status: ACTION_TO_STATUS[action] };
    if (notes) payload.adminNotes = notes;
    onUpdate(complaint.id, payload);
  };

  const handleForward = () => {
    if (!suggestedDept) return;
    const payload: Record<string, string> = {
      status: 'ASSIGNED',
      department: suggestedDept.name,
    };
    if (notes) payload.adminNotes = notes;
    onUpdate(complaint.id, payload);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">Complaint #{complaint.id}</h3>
          <p className="text-sm text-slate-500">
            {complaint.location ? `Lat: ${complaint.location.latitude.toFixed(4)}, Lon: ${complaint.location.longitude.toFixed(4)}` : 'No location'}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="severity" value={complaint.severity} />
            <Badge variant="status" value={complaint.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
        <span className={complaint.status === 'PENDING' ? 'font-bold text-amber-600' : 'text-slate-400'}>Pending</span>
        <span className="text-slate-300">→</span>
        <span className={complaint.status === 'UNDER_REVIEW' ? 'font-bold text-blue-600' : 'text-slate-400'}>Under review</span>
        <span className="text-slate-300">→</span>
        <span className={complaint.status === 'ASSIGNED' ? 'font-bold text-purple-600' : 'text-slate-400'}>Assigned</span>
        <span className="text-slate-300">→</span>
        <span className={complaint.status === 'IN_PROGRESS' ? 'font-bold text-orange-600' : 'text-slate-400'}>In progress</span>
        <span className="text-slate-300">→</span>
        <span className={complaint.status === 'RESOLVED' ? 'font-bold text-emerald-600' : 'text-slate-400'}>Resolved</span>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes for this action…"
        rows={2}
        className="w-full border border-slate-300 rounded-md p-2 text-sm"
      />

      <div className="flex flex-wrap gap-2 pt-1">
        {(['accept', 'reject', 'resolve'] as ComplaintAction[]).map((action) => {
          const allowed = canPerformAction(action, complaint.status);
          if (!allowed) return null;
          return (
            <button
              key={action}
              type="button"
              onClick={() => handleAction(action)}
              title={actionDisabledReason(action, complaint.status) ?? undefined}
              className={`text-white px-3 py-1.5 rounded-md text-sm font-medium ${ACTION_BUTTON_CLASS[action]}`}
            >
              {ACTION_LABEL[action]}
            </button>
          );
        })}

        {complaint.status === 'UNDER_REVIEW' && suggestedDept && (
          <button
            type="button"
            onClick={handleForward}
            className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
          >
            Forward to {suggestedDept.name}
          </button>
        )}
      </div>
    </div>
  );
};

export default function ComplaintPipeline() {
  const { complaints, loading, error, reload, updateComplaint: updateLocalComplaint } = useComplaints();

  const handleUpdate = async (id: number, payload: any) => {
    try {
      const updated = await updateComplaint(id, payload);
      updateLocalComplaint(id, updated);
    } catch (err) {
      console.error("Failed to update complaint", err);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // Pipeline page is meant for in-flight work. Hide terminal complaints
  // (RESOLVED / REJECTED) here so the surface stays focused on actionable
  // items. Resolved complaints still have their dedicated page.
  const inFlight = complaints.filter((c) => {
    const s = (c.status || '').toUpperCase();
    return s !== 'RESOLVED' && s !== 'REJECTED';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned / Forwarded Complaints"
        subtitle="Review complaints assigned to departments and monitor ongoing actions."
      />
      {inFlight.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No in-flight complaints — all complaints are resolved or rejected.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inFlight.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
