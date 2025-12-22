import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SymptomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Symptom Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Log and monitor your PCOS symptoms
          </p>
        </div>
        <Button>Log Symptoms</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Symptoms</CardTitle>
          <CardDescription>Track how you&apos;re feeling today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Symptom logging form will go here</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Symptom History</CardTitle>
          <CardDescription>Your recorded symptoms over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Symptom history chart will go here</p>
        </CardContent>
      </Card>
    </div>
  );
}
