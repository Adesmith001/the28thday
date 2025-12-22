import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CycleTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cycle Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track and predict your menstrual cycle
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Calendar</CardTitle>
          <CardDescription>Your monthly cycle overview</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Calendar component will go here</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Average Cycle Length</span>
              <span className="text-sm font-medium">28 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Average Period Length</span>
              <span className="text-sm font-medium">5 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Last Period Start</span>
              <span className="text-sm font-medium">Dec 15, 2025</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Next Period</span>
              <span className="text-sm font-medium">Jan 12, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Fertile Window</span>
              <span className="text-sm font-medium">Dec 28 - Jan 2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Ovulation Day</span>
              <span className="text-sm font-medium">Dec 29, 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
