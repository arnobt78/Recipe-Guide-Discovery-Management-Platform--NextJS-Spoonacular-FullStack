/**
 * Business Insights Dashboard Component
 *
 * Features:
 * - Global statistics display with trends
 * - AI Insights & Predictions
 * - Live data with auto-refresh
 * - Glassmorphic design matching project style
 * - Responsive grid layout
 * - Animated entry with framer-motion
 * - ShadCN UI components
 * - Comprehensive stats with badges
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, optimized performance
 */

"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Heart,
  FolderOpen,
  Calendar,
  ShoppingCart,
  FileText,
  Image as ImageIcon,
  Video,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Clock,
  Sparkles,
  ChefHat,
  RefreshCw,
  Star,
  Zap,
  Award,
  CheckCircle2,
  BarChart3,
  PieChart,
  Target,
  Flame,
  Crown,
  Server,
  HardDrive,
  Brain,
  Lightbulb,
  TrendingUpIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Utensils,
  Leaf,
  ThumbsUp,
  LineChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useBusinessInsights } from "../../hooks/useBusinessInsights";
import { BusinessInsightsStats } from "../../types";

/**
 * Color classes for cards and icons
 */
const colorClasses = {
  purple: "from-purple-500/20 to-purple-900/30 border-purple-500/30",
  pink: "from-pink-500/20 to-pink-900/30 border-pink-500/30",
  blue: "from-blue-500/20 to-blue-900/30 border-blue-500/30",
  green: "from-green-500/20 to-green-900/30 border-green-500/30",
  amber: "from-amber-500/20 to-amber-900/30 border-amber-500/30",
  red: "from-red-500/20 to-red-900/30 border-red-500/30",
  cyan: "from-cyan-500/20 to-cyan-900/30 border-cyan-500/30",
  emerald: "from-emerald-500/20 to-emerald-900/30 border-emerald-500/30",
  indigo: "from-indigo-500/20 to-indigo-900/30 border-indigo-500/30",
  orange: "from-orange-500/20 to-orange-900/30 border-orange-500/30",
  violet: "from-violet-500/20 to-violet-900/30 border-violet-500/30",
  rose: "from-rose-500/20 to-rose-900/30 border-rose-500/30",
};

const iconColorClasses = {
  purple: "text-purple-400 bg-purple-500/20",
  pink: "text-pink-400 bg-pink-500/20",
  blue: "text-blue-400 bg-blue-500/20",
  green: "text-green-400 bg-green-500/20",
  amber: "text-amber-400 bg-amber-500/20",
  red: "text-red-400 bg-red-500/20",
  cyan: "text-cyan-400 bg-cyan-500/20",
  emerald: "text-emerald-400 bg-emerald-500/20",
  indigo: "text-indigo-400 bg-indigo-500/20",
  orange: "text-orange-400 bg-orange-500/20",
  violet: "text-violet-400 bg-violet-500/20",
  rose: "text-rose-400 bg-rose-500/20",
};

type ColorType = keyof typeof colorClasses;

/**
 * Stat Card Component
 */
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: ColorType;
  trend?: { value: number; label: string; isPositive?: boolean };
  badges?: Array<{ label: string; value: string | number; color?: string }>;
}

const StatCard = memo(
  ({ title, value, subtitle, icon, color, trend, badges }: StatCardProps) => {
    return (
      <Card className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend.isPositive !== false ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={`text-xs ${trend.isPositive !== false ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.isPositive !== false ? '+' : ''}{trend.value}% {trend.label}
                  </span>
                </div>
              )}
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((badge, idx) => (
                    <Badge key={idx} variant="outline" className={`text-xs ${badge.color || 'bg-white/10 border-white/20 text-gray-300'}`}>
                      {badge.label}: {badge.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";

/**
 * Trend Indicator Component
 */
const TrendIndicator = memo(({ trend, size = "sm" }: { trend: 'rising' | 'stable' | 'declining'; size?: "sm" | "md" }) => {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  if (trend === 'rising') return <ArrowUpRight className={`${iconSize} text-green-400`} />;
  if (trend === 'declining') return <ArrowDownRight className={`${iconSize} text-red-400`} />;
  return <Minus className={`${iconSize} text-gray-400`} />;
});
TrendIndicator.displayName = "TrendIndicator";

/**
 * Activity Item Component
 */
const ActivityItem = memo(({ type, description, timestamp, userName }: {
  type: string; description: string; timestamp: string; userName?: string;
}) => {
  const getTypeIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      favourite: <Heart className="h-4 w-4 text-pink-400" />,
      collection: <FolderOpen className="h-4 w-4 text-purple-400" />,
      meal_plan: <Calendar className="h-4 w-4 text-blue-400" />,
      shopping_list: <ShoppingCart className="h-4 w-4 text-green-400" />,
      user_signup: <Users className="h-4 w-4 text-cyan-400" />,
      note: <FileText className="h-4 w-4 text-amber-400" />,
      filter_preset: <Sparkles className="h-4 w-4 text-indigo-400" />,
    };
    return icons[type] || <Activity className="h-4 w-4 text-gray-400" />;
  };

  const typeColors: Record<string, string> = {
    favourite: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    collection: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    meal_plan: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    shopping_list: "bg-green-500/20 text-green-300 border-green-500/30",
    user_signup: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    note: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    filter_preset: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  };

  const labels: Record<string, string> = {
    favourite: "Fav", collection: "Coll", meal_plan: "Meal",
    shopping_list: "Shop", user_signup: "New", note: "Note", filter_preset: "Preset",
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="p-1.5 bg-slate-700/50 rounded-lg">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{description}</p>
        {userName && <span className="text-xs text-gray-500">{userName}</span>}
      </div>
      <Badge variant="outline" className={`text-xs ${typeColors[type] || ''}`}>{labels[type]}</Badge>
      <span className="text-xs text-gray-500">{timeAgo(timestamp)}</span>
    </div>
  );
});
ActivityItem.displayName = "ActivityItem";

/**
 * Popular Recipe Item Component
 */
const PopularRecipeItem = memo(({
  recipeId, recipeTitle, favouriteCount, collectionCount, mealPlanCount, totalEngagement, trendDirection, rank,
}: {
  recipeId: number; recipeTitle: string; favouriteCount: number; collectionCount: number;
  mealPlanCount: number; totalEngagement: number; trendDirection: 'up' | 'down' | 'stable'; rank: number;
}) => {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (rank === 2) return <Award className="h-4 w-4 text-gray-300" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-purple-300">#{rank}</span>;
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return <ArrowUpRight className="h-3 w-3 text-green-400" />;
    if (trendDirection === 'down') return <ArrowDownRight className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg">
        {getRankIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{recipeTitle}</p>
        <span className="text-xs text-gray-500">ID: {recipeId}</span>
      </div>
      {getTrendIcon()}
      <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs">
        {totalEngagement}
      </Badge>
      <div className="hidden sm:flex items-center gap-1">
        <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300 text-xs p-1">
          <Heart className="h-3 w-3" /> {favouriteCount}
        </Badge>
        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs p-1 hidden md:flex">
          <FolderOpen className="h-3 w-3" /> {collectionCount}
        </Badge>
        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs p-1 hidden lg:flex">
          <Calendar className="h-3 w-3" /> {mealPlanCount}
        </Badge>
      </div>
    </div>
  );
});
PopularRecipeItem.displayName = "PopularRecipeItem";

/**
 * Top Contributor Item Component
 */
const TopContributorItem = memo(({
  userName, totalFavourites, totalCollections, totalMealPlans, activityScore, rank,
}: {
  userName: string; email: string; totalFavourites: number; totalCollections: number;
  totalMealPlans: number; joinedAt: string; activityScore: number; rank: number;
}) => {
  const getRankBadge = () => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (rank === 2) return <Star className="h-4 w-4 text-gray-300" />;
    if (rank === 3) return <Star className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-gray-400">#{rank}</span>;
  };

  const totalActivity = totalFavourites + totalCollections + totalMealPlans;

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
      <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg">
        {getRankBadge()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{userName}</p>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs">
            Score: {activityScore}
          </Badge>
        </div>
      </div>
      <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300 text-xs">
        <Flame className="h-3 w-3 mr-1" />{totalActivity}
      </Badge>
    </div>
  );
});
TopContributorItem.displayName = "TopContributorItem";

/**
 * Loading Skeleton Component
 */
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  </div>
);

/**
 * Main Dashboard Component
 */
const BusinessInsightsDashboard = memo(() => {
  const { data, isLoading, error, refetch, isFetching } = useBusinessInsights();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-500/30">
        <CardContent className="p-8 text-center">
          <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4">
            <Database className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Insights</h3>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} className="bg-red-500/20 hover:bg-red-500/30 text-red-300">
            <RefreshCw className="h-4 w-4 mr-2" />Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.data as BusinessInsightsStats | undefined;
  if (!stats) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border-amber-500/30">
        <CardContent className="p-8 text-center">
          <ChefHat className="h-8 w-8 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Insights data is currently unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <BarChart3 className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Business Insights</h1>
            <p className="text-sm text-gray-400">Real-time platform statistics, AI insights & predictions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-300">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />Live
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
            <Clock className="h-3 w-3 mr-1" />30s refresh
          </Badge>
          <Button
            variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}
            className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>

      {/* AI Predictions & Health Score */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-400" />
          AI Predictions & Platform Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Platform Health"
            value={`${stats.predictions?.healthScore || 0}/100`}
            subtitle={stats.predictions?.healthScore >= 70 ? "Excellent" : stats.predictions?.healthScore >= 40 ? "Good" : "Needs Attention"}
            icon={<ThumbsUp className="h-6 w-6" />}
            color={stats.predictions?.healthScore >= 70 ? "emerald" : stats.predictions?.healthScore >= 40 ? "amber" : "red"}
          />
          <StatCard
            title="Est. Users Next Month"
            value={stats.predictions?.estimatedUsersNextMonth || 0}
            icon={<TrendingUpIcon className="h-6 w-6" />}
            color="cyan"
            trend={{ value: stats.predictions?.projectedGrowthRate || 0, label: "projected", isPositive: (stats.predictions?.projectedGrowthRate || 0) >= 0 }}
          />
          <StatCard
            title="Est. Actions/Week"
            value={stats.predictions?.estimatedActionsNextWeek || 0}
            icon={<Zap className="h-6 w-6" />}
            color="amber"
          />
          <StatCard
            title="Retention Rate"
            value={`${stats.users?.retentionRate || 0}%`}
            subtitle="Returning users"
            icon={<Users className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Engagement Score"
            value={`${stats.engagement?.engagementScore || 0}/100`}
            icon={<Target className="h-6 w-6" />}
            color="purple"
          />
        </div>
        {stats.predictions?.recommendedFocus && (
          <Card className="mt-4 bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">AI Recommended Focus</p>
                <p className="text-white font-medium">{stats.predictions.recommendedFocus}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trends Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-blue-400" />
          Trends & Growth
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">User Growth</p>
                <p className="text-lg font-bold text-white capitalize">{stats.trends?.userGrowthTrend || 'stable'}</p>
              </div>
              <TrendIndicator trend={stats.trends?.userGrowthTrend || 'stable'} size="md" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Engagement</p>
                <p className="text-lg font-bold text-white capitalize">{stats.trends?.engagementTrend || 'stable'}</p>
              </div>
              <TrendIndicator trend={stats.trends?.engagementTrend || 'stable'} size="md" />
            </CardContent>
          </Card>
          <StatCard
            title="Favourites Trend"
            value={`${stats.trends?.favouritesTrend >= 0 ? '+' : ''}${stats.trends?.favouritesTrend || 0}%`}
            subtitle="vs last week"
            icon={<Heart className="h-5 w-5" />}
            color="pink"
          />
          <StatCard
            title="Collections Trend"
            value={`${stats.trends?.collectionsTrend >= 0 ? '+' : ''}${stats.trends?.collectionsTrend || 0}%`}
            subtitle="vs last week"
            icon={<FolderOpen className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Meal Plans Trend"
            value={`${stats.trends?.mealPlansTrend >= 0 ? '+' : ''}${stats.trends?.mealPlansTrend || 0}%`}
            subtitle="vs last week"
            icon={<Calendar className="h-5 w-5" />}
            color="blue"
          />
        </div>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-400" />
          User Statistics
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-xs ml-2">
            {stats.users?.total || 0} total
          </Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.users?.total || 0}
            icon={<Users className="h-6 w-6" />}
            color="cyan"
            trend={stats.users?.growthRate ? { value: stats.users.growthRate, label: "vs last month", isPositive: stats.users.growthRate >= 0 } : undefined}
            badges={[{ label: "Today", value: stats.users?.newToday || 0, color: "bg-green-500/10 border-green-500/30 text-green-300" }]}
          />
          <StatCard
            title="New This Month"
            value={stats.users?.newThisMonth || 0}
            subtitle="Registered this month"
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
            badges={[{ label: "Week", value: stats.users?.newThisWeek || 0, color: "bg-blue-500/10 border-blue-500/30 text-blue-300" }]}
          />
          <StatCard
            title="Avg Favourites/User"
            value={stats.users?.avgFavouritesPerUser || 0}
            icon={<Heart className="h-6 w-6" />}
            color="pink"
          />
          <StatCard
            title="Avg Collections/User"
            value={stats.users?.avgCollectionsPerUser || 0}
            icon={<FolderOpen className="h-6 w-6" />}
            color="purple"
          />
        </div>
      </div>

      {/* Recipe Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-pink-400" />
          Recipe Activity
          <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300 text-xs ml-2">
            {stats.engagement?.totalUniqueRecipesSaved || 0} unique recipes
          </Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Favourites"
            value={stats.recipes?.totalFavourites || 0}
            icon={<Heart className="h-6 w-6" />}
            color="pink"
            badges={[{ label: "Unique", value: stats.engagement?.totalUniqueRecipesSaved || 0, color: "bg-purple-500/10 border-purple-500/30 text-purple-300" }]}
          />
          <StatCard
            title="Collections"
            value={stats.recipes?.totalCollections || 0}
            subtitle={`${stats.recipes?.totalCollectionItems || 0} total items`}
            icon={<FolderOpen className="h-6 w-6" />}
            color="purple"
            badges={[{ label: "Avg", value: stats.recipes?.avgItemsPerCollection || 0, color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" }]}
          />
          <StatCard
            title="Meal Plans"
            value={stats.recipes?.totalMealPlans || 0}
            subtitle={`${stats.recipes?.totalMealPlanItems || 0} total meals`}
            icon={<Calendar className="h-6 w-6" />}
            color="blue"
            badges={[{ label: "Avg", value: stats.recipes?.avgMealsPerPlan || 0, color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" }]}
          />
          <StatCard
            title="Shopping Lists"
            value={stats.recipes?.totalShoppingLists || 0}
            icon={<ShoppingCart className="h-6 w-6" />}
            color="green"
            badges={[{ label: "Done", value: stats.recipes?.completedShoppingLists || 0, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" }]}
          />
        </div>
      </div>

      {/* Content & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Recipe Notes" value={stats.recipes?.totalNotes || 0} icon={<FileText className="h-6 w-6" />} color="amber" />
        <StatCard title="Filter Presets" value={stats.recipes?.totalFilterPresets || 0} icon={<Sparkles className="h-6 w-6" />} color="indigo" />
        <StatCard title="Recipe Images" value={stats.content?.totalRecipeImages || 0} icon={<ImageIcon className="h-6 w-6" />} color="cyan" />
        <StatCard title="Recipe Videos" value={stats.content?.totalRecipeVideos || 0} icon={<Video className="h-6 w-6" />} color="red" />
      </div>

      {/* AI Insights Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-400" />
          AI Insights & Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Search Terms */}
          <Card className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 border-indigo-500/30 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Search className="h-4 w-4 text-indigo-400" />Top Search Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.aiInsights?.topSearchTerms?.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-white">{item.term}</span>
                  <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Cuisines */}
          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Utensils className="h-4 w-4 text-orange-400" />Popular Cuisines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.aiInsights?.popularCuisines?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-white">{item.cuisine}</span>
                  <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-300 text-xs">
                    {item.percentage}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Leaf className="h-4 w-4 text-green-400" />Dietary Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.aiInsights?.dietaryPreferences?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                  <span className="text-sm text-white">{item.diet}</span>
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-300 text-xs">
                    {item.percentage}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        {stats.aiInsights?.userBehaviorSummary && (
          <Card className="mt-4 bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/30 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Brain className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">AI User Behavior Summary</p>
                  <p className="text-white text-sm">{stats.aiInsights.userBehaviorSummary}</p>
                  {stats.aiInsights.peakUsagePattern && (
                    <p className="text-gray-400 text-xs mt-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {stats.aiInsights.peakUsagePattern}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Popular Recipes, Top Contributors & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Popular Recipes */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />Popular Recipes
              </div>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs">Top 10</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-80 overflow-y-auto">
            {stats.popularRecipes?.length > 0 ? (
              stats.popularRecipes.map((recipe, i) => (
                <PopularRecipeItem key={recipe.recipeId} rank={i + 1} {...recipe} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No popular recipes yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-cyan-400" />Top Contributors
              </div>
              <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-xs">Top 5</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-80 overflow-y-auto">
            {stats.topContributors?.length > 0 ? (
              stats.topContributors.map((c, i) => <TopContributorItem key={c.email} rank={i + 1} {...c} />)
            ) : (
              <p className="text-center text-gray-500 py-4">No contributors yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />Recent Activity
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-80 overflow-y-auto">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((a, i) => <ActivityItem key={i} {...a} />)
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500/30 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <Server className="h-4 w-4 text-slate-400" />System Health & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${stats.systemHealth?.databaseStatus === "healthy" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
              <Database className="h-3 w-3 mr-1" />DB: {stats.systemHealth?.databaseStatus || 'unknown'}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Clock className="h-3 w-3 mr-1" />Uptime: {stats.systemHealth?.uptime || 'N/A'}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <HardDrive className="h-3 w-3 mr-1" />Records: {stats.systemHealth?.totalDbRecords?.toLocaleString() || 'N/A'}
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Server className="h-3 w-3 mr-1" />Response: {stats.systemHealth?.responseTime || 0}ms
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />Error Rate: {stats.systemHealth?.errorRate || 0}%
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              <PieChart className="h-3 w-3 mr-1" />Synced: {new Date(data?.timestamp || "").toLocaleTimeString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

BusinessInsightsDashboard.displayName = "BusinessInsightsDashboard";

export default BusinessInsightsDashboard;
