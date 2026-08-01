'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Loader2, UserCheck, Shield, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Profile } from '@/types';

interface ExtendedProfile extends Profile {
  totalOrders: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const supabase = createClient();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // Fetch profiles matching search query
        let queryBuilder = supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        if (search.trim()) {
          queryBuilder = queryBuilder.or(
            `full_name.ilike.%${search}%,email.ilike.%${search}%`
          );
        }

        // Paginate
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;

        const { data: profilesData, count, error: profilesError } = await queryBuilder
          .order('created_at', { ascending: false })
          .range(start, end);

        if (profilesError) throw profilesError;

        setTotalCount(count || 0);

        if (profilesData && profilesData.length > 0) {
          // For each profile, let's fetch their order aggregates
          const profileIds = profilesData.map((p) => p.id);
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('user_id, total, payment_status')
            .in('user_id', profileIds);

          if (ordersError) throw ordersError;

          const extended = profilesData.map((p) => {
            const userOrders = (ordersData || []).filter(
              (o) => o.user_id === p.id && o.payment_status === 'paid'
            );
            const totalOrders = userOrders.length;
            const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

            return {
              ...p,
              totalOrders,
              totalSpent,
            };
          });

          setCustomers(extended as ExtendedProfile[]);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, page, supabase]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-normal text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Customers Directory
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Manage user profiles, purchase histories, and check user credentials.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-[20px] border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-[12px] pl-10 pr-4 py-2.5 text-[13.5px] outline-none focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </div>
        <div className="text-[13px] text-gray-500 font-medium">
          Total Customers: <span className="text-gray-900 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-[#2563EB] gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[13px] font-medium text-gray-500">Loading customers database...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-[14px]">
            No customers found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Orders Paid</th>
                  <th className="py-4 px-6 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13.5px]">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                          {customer.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={customer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.full_name || 'No name'}</h4>
                          <p className="text-[12px] text-[#6B6B6B]">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold border ${
                          customer.role === 'admin'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-green-50 text-green-700 border-green-100'
                        }`}
                      >
                        {customer.role === 'admin' ? (
                          <>
                            <Shield size={12} />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} />
                            Customer
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[13px] text-gray-500">
              Page <span className="font-semibold text-gray-800">{page}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 border border-gray-200 rounded-[10px] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border border-gray-200 rounded-[10px] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
