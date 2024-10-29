'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import handler from './api/sbom'

// Define the type for SBOM data
interface SbomItem {
  dependency: string;
  version: string;
  depType: string;
  vulnerable: string;
  recommendation: string;
}

const initialSbomData: SbomItem[] = [
  { dependency: "org.springframework.boot:spring-boot-starter-data-jpa", version: "2.5.4", depType: "Direct", vulnerable: "No", recommendation: "Consider upgrading to the latest version for performance improvements." },
  { dependency: "com.fasterxml.jackson.datatype:jackson-datatype-jsr310", version: "2.12.3", depType: "Direct", vulnerable: "Yes", recommendation: "Urgent: Upgrade to version 2.12.6.1 or later to address critical vulnerabilities." },
  { dependency: "org.apache.logging.log4j:log4j-core", version: "2.14.1", depType: "Transitive", vulnerable: "Yes", recommendation: "Critical: Upgrade to version 2.15.0 or later immediately to address security vulnerabilities." },
  { dependency: "org.springframework.security.oauth:spring-security-oauth2", version: "2.5.1.RELEASE", depType: "Direct", vulnerable: "No", recommendation: "Consider migrating to Spring Security 5.x OAuth2 support for long-term maintenance." },
  { dependency: "io.springfox:springfox-swagger2", version: "3.0.0", depType: "Direct", vulnerable: "No", recommendation: "Consider migrating to springdoc-openapi for better Spring Boot 3.x compatibility." },
]

export default function Component() {
  const [currentPage, setCurrentPage] = useState(1)
  const [repository, setRepository] = useState("")
  const [branch, setBranch] = useState("")
  const [sbomData, setSbomData] = useState<SbomItem[]>(initialSbomData)
  const [scanTime, setScanTime] = useState("2023-10-15 14:30:00")
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 100
  const totalPages = Math.ceil(sbomData.length / itemsPerPage)

  const paginatedData = sbomData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isScanning) {
      setShowModal(true)
      return
    }
    setIsScanning(true)
    setShowModal(true)
    setError(null)

    try {
      const result = await handler(repository, branch);
      setSbomData(result);
      setCurrentPage(1);
      setScanTime(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching SBOM data:', err);
      setError('Failed to fetch SBOM data. Please try again.');
      setSbomData([]);
    } finally {
      setIsScanning(false);
      // 移除这行，让用户手动关闭对话框
      // setShowModal(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SBOM Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repository">Repository</Label>
                <Input
                  id="repository"
                  placeholder="Enter repository name"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="Enter branch name"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isScanning}>
              {isScanning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SBOM Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Repository</Label>
              <p className="text-sm font-semibold">{repository || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Branch</Label>
              <p className="text-sm font-semibold">{branch || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Scan Time</Label>
              <p className="text-sm font-semibold">{scanTime}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dependency</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Dep Type</TableHead>
                  <TableHead>Vulnerable</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.dependency}</TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>
                      <Badge variant={item.depType === "Direct" ? ("default" as "default") : ("secondary" as "secondary")}>
                        {item.depType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.vulnerable === "Yes" ? ("destructive" as "destructive") : ("outline" as "outline")}>
                        {item.vulnerable}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">{item.recommendation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Scan in Progress</DialogTitle>
            <DialogDescription>
              Please wait while we analyze the dependencies.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 text-center">Scanning repository: {repository}</p>
            <p className="text-sm text-gray-500 text-center">Branch: {branch}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
