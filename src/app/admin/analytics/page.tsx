'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Percent, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  
  // States for aggregated stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 2.4, // placeholder stat
  });

  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryShares, setCategoryShares] = useState<any[]>([]);

  const supabase = createClient();
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // 1. Fetch Orders to calculate revenue history & general stats
        let ordersQuery = supabase
          .from('orders')
          .select('id, total, created_at, payment_status')
          .eq('payment_status', 'paid');

        // Apply time range filter
        if (timeRange === '7d') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          ordersQuery = ordersQuery.gte('created_at', sevenDaysAgo.toISOString());
        } else if (timeRange === '30d') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          ordersQuery = ordersQuery.gte('created_at', thirtyDaysAgo.toISOString());
        }

        const { data: orders, error: ordersError } = await ordersQuery.order('created_at', { ascending: true });
        if (ordersError) throw ordersError;

        const totalOrders = orders?.length || 0;
        const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
          totalRevenue,
          totalOrders,
          averageOrderValue,
          conversionRate: 2.8,
        });

        // 2. Generate sales history data for AreaChart
        const salesByDate: { [key: string]: number } = {};
        (orders || []).forEach((order) => {
          const date = new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          salesByDate[date] = (salesByDate[date] || 0) + Number(order.total || 0);
        });

        const historyArray = Object.keys(salesByDate).map((date) => ({
          date,
          revenue: salesByDate[date],
        }));
        setSalesHistory(historyArray);

        // 3. Fetch top products (by items sold)
        // Since we want to join order_items, let's fetch them
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('title, quantity, line_total, product_id, orders!inner(payment_status)')
          .eq('orders.payment_status', 'paid');

        if (itemsError) throw itemsError;

        const productSales: { [key: string]: { name: string; quantity: number; sales: number } } = {};
        (orderItems || []).forEach((item) => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: item.title, quantity: 0, sales: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
          productSales[item.product_id].sales += Number(item.line_total || 0);
        });

        const topProductsArray = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setTopProducts(topProductsArray);

        // 4. Fetch category stats
        // We'll fetch categories to map products to categories
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, category_id, categories(name)');

        if (productsError) throw productsError;

        const categorySales: { [key: string]: number } = {};
        (orderItems || []).forEach((item) => {
          const matchedProd = (products || []).find((p) => p.id === item.product_id) as any;
          const catName = matchedProd?.categories?.name || 'Uncategorized';
          categorySales[catName] = (categorySales[catName] || 0) + Number(item.line_total || 0);
        });

        const categorySharesArray = Object.keys(categorySales).map((name) => ({
          name,
          value: categorySales[name],
        }));
        setCategoryShares(categorySharesArray);

      } catch (err) {
        console.error('Error fetching analytics details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, supabase]);

  if (loading || !mounted) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-[#2563EB] gap-2">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-[13px] text-gray-400">Compiling analytical aggregates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-normal text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Performance Analytics
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Monitor sales curves, top-performing ceramic lines, and core conversion metrics.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center bg-white border border-gray-200 rounded-[12px] p-1 gap-1">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id as any)}
              className={`px-3 py-1.5 text-[12.5px] font-medium rounded-[8px] transition-all cursor-pointer ${
                timeRange === item.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
          },
          {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'text-green-600 bg-green-50 border-green-100',
          },
          {
            label: 'Average Order Value',
            value: formatCurrency(stats.averageOrderValue),
            icon: TrendingUp,
            color: 'text-purple-600 bg-purple-50 border-purple-100',
          },
          {
            label: 'Store Conversion Rate',
            value: `${stats.conversionRate}%`,
            icon: Percent,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[12px] uppercase tracking-wider text-gray-400 font-bold">
                  {stat.label}
                </span>
                <h3 className="text-[24px] font-semibold text-gray-900 font-mono">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm space-y-4">
          <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Sales Over Time
          </h3>
          <div className="h-[300px] w-full">
            {salesHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13.5px]">
                No sales data recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm space-y-4">
          <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            Sales by Category
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center relative">
            {categoryShares.length === 0 ? (
              <div className="text-gray-400 text-[13.5px]">No category sales records.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShares}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryShares.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Donut Legend */}
          <div className="space-y-2 pt-2 border-t border-gray-50">
            {categoryShares.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center text-[12.5px]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Selling Products */}
      <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm space-y-4">
        <h3 className="text-[16px] font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
          Top Performing Ceramic Lines
        </h3>
        <div className="h-[300px] w-full">
          {topProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13.5px]">
              No product sales data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="quantity" fill="#10B981" radius={[0, 8, 8, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
