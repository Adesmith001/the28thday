import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          AI-powered insights about your PCOS management
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>This Week&apos;s Insights</CardTitle>
          <CardDescription>Powered by Google Gemini AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Cycle Pattern Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Your cycle has been consistent over the past 3 months. Keep up the good work!
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Nutrition Recommendation</h3>
            <p className="text-sm text-muted-foreground">
              Consider adding more protein-rich Nigerian foods like beans and fish to your diet.
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Exercise Suggestion</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;re in the follicular phase - perfect time for high-intensity workouts!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Symptom Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Symptom trend chart will go here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Mood pattern chart will go here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
