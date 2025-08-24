import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const ApiTest: React.FC = () => {
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("password123");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (testName: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Health Check
      try {
        const healthResponse = await apiService.healthCheck();
        if (healthResponse.data) {
          addTestResult("Health Check", true, "API is healthy", healthResponse.data);
        } else {
          addTestResult("Health Check", false, healthResponse.error || "Unknown error");
        }
      } catch (error) {
        addTestResult("Health Check", false, `Error: ${error}`);
      }

      // Test 2: Login
      try {
        const loginResponse = await apiService.login({ email, password });
        if (loginResponse.data) {
          addTestResult("Login", true, "Login successful", {
            user: loginResponse.data.user.name,
            role: loginResponse.data.user.role
          });
        } else {
          addTestResult("Login", false, loginResponse.error || "Login failed");
        }
      } catch (error) {
        addTestResult("Login", false, `Error: ${error}`);
      }

      // Test 3: Get Active Performance Cycle
      try {
        const cycleResponse = await apiService.getActivePerformanceCycle();
        if (cycleResponse.data) {
          addTestResult("Get Active Cycle", true, "Cycle loaded", {
            name: cycleResponse.data.name,
            status: cycleResponse.data.status
          });
        } else {
          addTestResult("Get Active Cycle", false, cycleResponse.error || "No active cycle");
        }
      } catch (error) {
        addTestResult("Get Active Cycle", false, `Error: ${error}`);
      }

      // Test 4: Get Available Reviewers
      try {
        const reviewersResponse = await apiService.getAvailableReviewers();
        if (reviewersResponse.data) {
          addTestResult("Get Reviewers", true, `${reviewersResponse.data.length} reviewers found`);
        } else {
          addTestResult("Get Reviewers", false, reviewersResponse.error || "No reviewers found");
        }
      } catch (error) {
        addTestResult("Get Reviewers", false, `Error: ${error}`);
      }

      // Test 5: Dashboard Stats
      try {
        const statsResponse = await apiService.getDashboardStats();
        if (statsResponse.data) {
          addTestResult("Dashboard Stats", true, "Stats loaded successfully");
        } else {
          addTestResult("Dashboard Stats", false, statsResponse.error || "Stats not available");
        }
      } catch (error) {
        addTestResult("Dashboard Stats", false, `Error: ${error}`);
      }

    } catch (error) {
      addTestResult("Test Suite", false, `Test suite error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Integration Test</h1>
        <p className="text-gray-600 mt-2">Test the connection to your FastAPI backend</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.testName}</div>
                      <AlertDescription>{result.message}</AlertDescription>
                      {result.data && (
                        <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                          <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Base URL:</strong> http://localhost:8000/api/v1</div>
            <div><strong>Health Check:</strong> GET /health</div>
            <div><strong>Login:</strong> POST /auth/login</div>
            <div><strong>Active Cycle:</strong> GET /performance-cycles/active</div>
            <div><strong>Reviewers:</strong> GET /users/reviewers</div>
            <div><strong>Dashboard Stats:</strong> GET /dashboard/stats</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
