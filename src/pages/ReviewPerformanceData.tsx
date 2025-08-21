import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Search, Download, Filter } from "lucide-react";

interface PerformanceData {
  id: string;
  employeeName: string;
  reviewerName: string;
  mentorName: string;
  question1Feedback: string;
  question2Feedback: string;
  question3Feedback: string;
  fiscalYear: string;
  cycleType: "Mid-Year" | "Year-End";
  submittedAt: string;
}

export default function ReviewPerformanceData() {
  const { user } = useAuth();
  const [searchCriteria, setSearchCriteria] = useState({
    fiscalYear: "",
    cycleType: "" as "Mid-Year" | "Year-End" | ""
  });
  const [searchResults, setSearchResults] = useState<PerformanceData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Generate financial years (current year + 5 years back)
  const financialYears = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return `${year}-${year + 1}`;
  });

  // Initialize dummy performance data
  useEffect(() => {
    const existingData = localStorage.getItem('performanceData');
    if (!existingData) {
      const dummyData: PerformanceData[] = [
        {
          id: "1",
          employeeName: "Arjun Mehta",
          reviewerName: "Priya Singh",
          mentorName: "Dr. Robert Chen",
          question1Feedback: "Excellent problem-solving skills and strong technical knowledge. Shows great initiative in taking on complex projects.",
          question2Feedback: "Could improve time management and delegation skills. Should focus more on strategic thinking.",
          question3Feedback: "Tracking above expectations",
          fiscalYear: "2024-2025",
          cycleType: "Mid-Year",
          submittedAt: "2024-12-15"
        },
        {
          id: "2",
          employeeName: "Priya Singh",
          reviewerName: "Arjun Mehta",
          mentorName: "Dr. Robert Chen",
          question1Feedback: "Outstanding leadership qualities and excellent project management skills. Very detail-oriented.",
          question2Feedback: "Could be more patient with team members who are still learning. Should work on providing more constructive feedback.",
          question3Feedback: "Tracking above expectations",
          fiscalYear: "2024-2025",
          cycleType: "Mid-Year",
          submittedAt: "2024-12-16"
        },
        {
          id: "3",
          employeeName: "Ravi Kumar",
          reviewerName: "Arjun Mehta",
          mentorName: "Sarah Williams",
          question1Feedback: "Very reliable and consistent in delivering high-quality work. Great team player.",
          question2Feedback: "Needs to work on being more proactive in identifying potential issues early.",
          question3Feedback: "Tracking as expected",
          fiscalYear: "2024-2025",
          cycleType: "Mid-Year",
          submittedAt: "2024-12-17"
        },
        {
          id: "4",
          employeeName: "Neha Kapoor",
          reviewerName: "Priya Singh",
          mentorName: "Sarah Williams",
          question1Feedback: "Very creative and innovative in her approach to problem-solving. Excellent at thinking outside the box.",
          question2Feedback: "Needs to improve documentation and follow-up on projects. Should be more systematic.",
          question3Feedback: "Tracking as expected",
          fiscalYear: "2024-2025",
          cycleType: "Mid-Year",
          submittedAt: "2024-12-18"
        },
        {
          id: "5",
          employeeName: "Arjun Mehta",
          reviewerName: "Ravi Kumar",
          mentorName: "Dr. Robert Chen",
          question1Feedback: "Strong technical expertise and excellent problem-solving abilities. Great mentor to junior developers.",
          question2Feedback: "Could improve cross-functional communication and stakeholder management skills.",
          question3Feedback: "Tracking above expectations",
          fiscalYear: "2023-2024",
          cycleType: "Year-End",
          submittedAt: "2024-06-15"
        },
        {
          id: "6",
          employeeName: "Priya Singh",
          reviewerName: "Neha Kapoor",
          mentorName: "Dr. Robert Chen",
          question1Feedback: "Excellent analytical skills and very thorough in her work. Great at identifying potential risks.",
          question2Feedback: "Sometimes takes too long to make decisions. Could be more decisive in time-sensitive situations.",
          question3Feedback: "Tracking as expected",
          fiscalYear: "2023-2024",
          cycleType: "Year-End",
          submittedAt: "2024-06-16"
        }
      ];
      localStorage.setItem('performanceData', JSON.stringify(dummyData));
    }
  }, []);

  const handleSearch = () => {
    if (!searchCriteria.fiscalYear || !searchCriteria.cycleType) {
      toast.error("Please select both Fiscal Year and Type of Cycle");
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const allData = JSON.parse(localStorage.getItem('performanceData') || '[]');
      const filteredData = allData.filter((item: PerformanceData) => 
        item.fiscalYear === searchCriteria.fiscalYear && 
        item.cycleType === searchCriteria.cycleType
      );
      
      setSearchResults(filteredData);
      setIsSearching(false);
      
      if (filteredData.length === 0) {
        toast.info("No performance data found for the selected criteria");
      } else {
        toast.success(`Found ${filteredData.length} performance records`);
      }
    }, 1000);
  };

  const exportToExcel = () => {
    if (searchResults.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Employee Name",
      "Reviewer Name", 
      "Mentor Name",
      "Question 1 Feedback",
      "Question 2 Feedback", 
      "Question 3 Feedback",
      "Fiscal Year",
      "Cycle Type",
      "Submitted Date"
    ];

    const csvContent = [
      headers.join(','),
      ...searchResults.map(row => [
        `"${row.employeeName}"`,
        `"${row.reviewerName}"`,
        `"${row.mentorName}"`,
        `"${row.question1Feedback}"`,
        `"${row.question2Feedback}"`,
        `"${row.question3Feedback}"`,
        `"${row.fiscalYear}"`,
        `"${row.cycleType}"`,
        `"${row.submittedAt}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance_data_${searchCriteria.fiscalYear}_${searchCriteria.cycleType}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Performance data exported successfully");
  };

  const clearSearch = () => {
    setSearchCriteria({
      fiscalYear: "",
      cycleType: ""
    });
    setSearchResults([]);
  };

  return (
    <div 
      className="space-y-6"
      style={{
        width: '100%',
        maxWidth: 'none',
        minWidth: '100%',
        margin: '0',
        padding: '0'
      }}
    >
      <header 
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100%',
          margin: '0',
          padding: '0'
        }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Review Performance Data
        </h1>
        <p className="text-muted-foreground">Search and analyze past performance review data</p>
      </header>

      {/* Search Criteria */}
      <Card 
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100%',
          margin: '0',
          padding: '0'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fiscalYear">Fiscal Year</Label>
              <Select 
                value={searchCriteria.fiscalYear} 
                onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, fiscalYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cycleType">Type of Cycle</Label>
              <Select 
                value={searchCriteria.cycleType} 
                onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, cycleType: value as "Mid-Year" | "Year-End" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mid-Year">Mid-Year</SelectItem>
                  <SelectItem value="Year-End">Year-End</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchCriteria.fiscalYear || !searchCriteria.cycleType}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearSearch}
              disabled={isSearching}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card 
          style={{
            width: '100%',
            maxWidth: 'none',
            minWidth: '100%',
            margin: '0',
            padding: '0'
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Results ({searchResults.length} records)
              </CardTitle>
              <Button 
                onClick={exportToExcel}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Reviewer Name</TableHead>
                    <TableHead>Mentor Name</TableHead>
                    <TableHead>Question 1 Feedback</TableHead>
                    <TableHead>Question 2 Feedback</TableHead>
                    <TableHead>Question 3 Feedback</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Cycle Type</TableHead>
                    <TableHead>Submitted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.employeeName}</TableCell>
                      <TableCell>{row.reviewerName}</TableCell>
                      <TableCell>{row.mentorName}</TableCell>
                      <TableCell className="max-w-xs truncate" title={row.question1Feedback}>
                        {row.question1Feedback}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={row.question2Feedback}>
                        {row.question2Feedback}
                      </TableCell>
                      <TableCell>{row.question3Feedback}</TableCell>
                      <TableCell>{row.fiscalYear}</TableCell>
                      <TableCell>{row.cycleType}</TableCell>
                      <TableCell>{new Date(row.submittedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && !isSearching && (
        <Card 
          style={{
            width: '100%',
            maxWidth: 'none',
            minWidth: '100%',
            margin: '0',
            padding: '0'
          }}
        >
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchCriteria.fiscalYear && searchCriteria.cycleType 
                ? "No performance data found for the selected criteria. Try different search parameters."
                : "Select fiscal year and cycle type to search for performance data."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
