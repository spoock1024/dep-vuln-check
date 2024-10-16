import type { NextApiRequest, NextApiResponse } from 'next'

interface DepCheckResponse {
  dependencies: {
    [key: string]: {
      version: string;
      depType: string;
      vulnerable: boolean;
      recommendation: string;
    };
  };
}

interface SbomItem {
  dependency: string;
  version: string;
  depType: string;
  vulnerable: string;
  recommendation: string;
}

export default async function handler(repository: string, branch: string): Promise<SbomItem[]> {
  try {
    const response = await fetch('http://localhost:8899/depcheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repository, branch }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DepCheckResponse = await response.json();

    // Transform the data to match the SbomItem interface
    const sbomData: SbomItem[] = Object.entries(data.dependencies).map(([dependency, details]) => ({
      dependency,
      version: details.version,
      depType: details.depType,
      vulnerable: details.vulnerable ? 'Yes' : 'No',
      recommendation: details.recommendation,
    }));

    return sbomData;
  } catch (error) {
    console.error('Error fetching SBOM data:', error);
    throw new Error('Failed to scan SBOM');
  }
}
