import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrition Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your meals with Nigerian foods
          </p>
        </div>
        <Button>Log Meal</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Calories Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,450</div>
            <p className="text-xs text-muted-foreground">Goal: 2,000 kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Meals Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Breakfast, Lunch, Snack</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Water Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.5L</div>
            <p className="text-xs text-muted-foreground">Goal: 2.5L</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals</CardTitle>
          <CardDescription>Your food log for today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Meal list will go here</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PCOS-Friendly Nigerian Foods</CardTitle>
          <CardDescription>Recommended foods for your condition</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Food recommendations will go here</p>
        </CardContent>
      </Card>
    </div>
  );
}
