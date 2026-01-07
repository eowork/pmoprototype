import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';

interface WeightedScoreCardProps {
  categoryName: string;
  totalRatings: number;
  maxPossibleScore: number;
  categoryScore: number;
  weight: number;
  weightedScore: number;
}

export function WeightedScoreCard({
  categoryName,
  totalRatings,
  maxPossibleScore,
  categoryScore,
  weight,
  weightedScore
}: WeightedScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-slate-700">{categoryName}</h4>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Weight: {weight}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-2">
              <div className="text-lg text-blue-600">{totalRatings}</div>
              <div className="text-xs text-slate-600">Total Rating</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className={`text-lg ${getScoreColor(categoryScore)}`}>
                {categoryScore.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600">Category Score</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className={`text-lg ${getScoreColor(weightedScore)}`}>
                {weightedScore.toFixed(2)}
              </div>
              <div className="text-xs text-slate-600">Weighted Score</div>
            </div>
          </div>

          <Progress value={categoryScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
