<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\IngredientRepository;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        private IngredientRepository $ingredientRepository
    ) {}

    public function summary(): array
    {
        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $dailySales = Order::whereDate('created_at', $today)->sum('total_amount');
        $transactionsToday = Order::whereDate('created_at', $today)->count();
        $averageOrderValueToday = $transactionsToday > 0 ? $dailySales / $transactionsToday : 0;

        $monthlyRevenue = Order::whereBetween(DB::raw('DATE(created_at)'), [$startOfMonth, $endOfMonth])->sum('total_amount');

        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $total = (float) Order::whereDate('created_at', $date)->sum('total_amount');
            $salesTrend[] = ['date' => $date, 'total' => $total];
        }

        $topProducts = OrderItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween(DB::raw('DATE(orders.created_at)'), [$startOfMonth, $endOfMonth])
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->with('product:id,name')
            ->get();

        $lowStockIngredients = $this->ingredientRepository->getLowStock();

        $recentTransactions = Order::with('cashier:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'cashier_id', 'total_amount', 'created_at']);

        return [
            'daily_sales' => (float) $dailySales,
            'monthly_revenue' => (float) $monthlyRevenue,
            'transactions_today' => (int) $transactionsToday,
            'average_order_value_today' => round((float) $averageOrderValueToday, 2),
            'sales_trend' => $salesTrend,
            'top_selling_products' => $topProducts->map(fn ($row) => [
                'product_id' => $row->product_id,
                'product_name' => $row->product?->name,
                'quantity_sold' => (int) $row->total_quantity,
            ]),
            'low_stock_ingredients' => $lowStockIngredients->map(fn (Ingredient $i) => [
                'id' => $i->id,
                'name' => $i->name,
                'stock' => (float) $i->stock,
                'par_level' => (float) $i->par_level,
                'unit' => $i->unit,
            ]),
            'low_stock_count' => $lowStockIngredients->count(),
            'recent_transactions' => $recentTransactions->map(fn (Order $o) => [
                'id' => $o->id,
                'total_amount' => (float) $o->total_amount,
                'created_at' => $o->created_at?->toIso8601String(),
                'cashier_name' => $o->cashier?->name ?? '—',
            ]),
        ];
    }
}
