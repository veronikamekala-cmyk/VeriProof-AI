'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserVerifications } from '@/lib/supabase';
import Sidebar from '@/components/common/Sidebar';
import { Eye, Download, Trash2, Loader2, Search } from 'lucide-react';
import { formatDate, getAuthenticityBadge } from '@/lib/utils';
import { Verification } from '@/lib/types';
import Link from 'next/link';

const mockVerifications: Verification[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    certificate_id: '550e8400-e29b-41d4-a716-446655440002',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    extracted_text: 'This is to certify that John Doe has successfully completed the Bachelor of Science degree in Computer Science from Harvard University on May 15, 2023.',
    authenticity_score: 0.95,
    verification_status: 'verified' as const,
    verification_details: {
      issuer: 'Harvard University',
      issue_date: '2023-05-15',
      recipient_name: 'John Doe',
      credentials: 'Bachelor of Science in Computer Science',
    },
    qr_code: 'https://example.com/verify/550e8400-e29b-41d4-a716-446655440001',
    ai_analysis: {
      confidence_score: 0.93,
      key_findings: ['Certificate format matches official templates'],
      red_flags: [],
      recommendations: ['Certificate is authentic'],
      verification_result: true,
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    certificate_id: '550e8400-e29b-41d4-a716-446655440005',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    extracted_text: 'Certificate of Completion: Python Programming Bootcamp. Awarded to Jane Smith on March 20, 2024. Issued by CodeAcademy Institute.',
    authenticity_score: 0.72,
    verification_status: 'unverified' as const,
    verification_details: {
      issuer: 'CodeAcademy Institute',
      issue_date: '2024-03-20',
      recipient_name: 'Jane Smith',
      credentials: 'Python Programming Bootcamp',
    },
    qr_code: 'https://example.com/verify/550e8400-e29b-41d4-a716-446655440004',
    ai_analysis: {
      confidence_score: 0.68,
      key_findings: ['Standard certificate format detected'],
      red_flags: ['Unknown issuer institution'],
      recommendations: ['Contact issuing institution for verification'],
      verification_result: false,
    },
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:25:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    certificate_id: '550e8400-e29b-41d4-a716-446655440007',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    extracted_text: 'Diploma text appears incomplete or corrupted',
    authenticity_score: 0.35,
    verification_status: 'suspicious' as const,
    verification_details: {
      issuer: 'Unknown',
      issue_date: '2024-01-01',
      recipient_name: 'Robert Johnson',
      credentials: 'Unknown',
    },
    qr_code: 'https://example.com/verify/550e8400-e29b-41d4-a716-446655440006',
    ai_analysis: {
      confidence_score: 0.32,
      key_findings: [],
      red_flags: ['Incomplete text extraction', 'Missing security features', 'Invalid date format'],
      recommendations: ['Do not use this certificate', 'Contact issuing institution'],
      verification_result: false,
    },
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-05T09:05:00Z',
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setVerifications(mockVerifications);
          setFilteredVerifications(mockVerifications);
        } else {
          setUser(currentUser);
          const verifs = await getUserVerifications(currentUser.id);
          setVerifications(verifs || mockVerifications);
          setFilteredVerifications(verifs || mockVerifications);
        }
      } catch (error) {
        console.error('Failed to load verifications:', error);
        setVerifications(mockVerifications);
        setFilteredVerifications(mockVerifications);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  useEffect(() => {
    let filtered = verifications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((v) => v.verification_status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.id.includes(searchTerm) ||
        v.verification_details?.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVerifications(filtered);
  }, [searchTerm, filterStatus, verifications]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Verification History</h2>
          </div>
        </div>

        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">Verification History</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            View and manage all your certificate verifications.
          </p>

          <div className="card mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by ID or recipient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="suspicious">Suspicious</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No verifications found</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-700">
                    <th className="text-left py-3 px-4 font-semibold">Verification ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Score</th>
                    <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerifications.map((v) => {
                    const badge = getAuthenticityBadge(v.authenticity_score);
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50"
                      >
                        <td className="py-3 px-4 font-mono text-sm">{v.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">
                          <span className={`badge badge-${badge.color}`}>{badge.label}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {(v.authenticity_score * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          {v.verification_details?.recipient_name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(v.created_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/verification/${v.id}`}
                              className="p-2 hover:bg-primary/10 rounded-lg transition text-primary"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              className="p-2 hover:bg-primary/10 rounded-lg transition text-primary"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 hover:bg-danger/10 rounded-lg transition text-danger"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
