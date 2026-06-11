import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getAuthenticityBadge(score: number) {
  if (score >= 0.8) return { label: 'Verified', color: 'success' };
  if (score >= 0.6) return { label: 'Likely Verified', color: 'warning' };
  if (score >= 0.4) return { label: 'Suspicious', color: 'warning' };
  return { label: 'Not Verified', color: 'danger' };
}

export function calculateAuthenticityScore(
  factors: Record<string, number>
): number {
  const weights = {
    format: 0.2,
    content: 0.3,
    issuer: 0.25,
    dates: 0.15,
    metadata: 0.1,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += (factors[key] || 0) * weight;
  }

  return Math.min(1, Math.max(0, score));
}

export function generateQRCode(verificationId: string, baseUrl: string): string {
  return `${baseUrl}/verify/${verificationId}`;
}

export function getFileIcon(fileType: string) {
  const iconMap: Record<string, string> = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/jpg': '🖼️',
  };
  return iconMap[fileType] || '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function validateFileType(file: File): boolean {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  return validTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export async function extractTextFromImage(
  file: File
): Promise<string> {
  return 'OCR extraction would happen here';
}

export function parseVerificationDetails(text: string) {
  const details: Record<string, string> = {};

  const patterns = {
    recipient_name: /Recipient[:\s]+(.+)/i,
    issuer: /Issued by[:\s]+(.+)/i,
    issue_date: /Date[:\s]+(.+)/i,
    credentials: /Credential[:\s]+(.+)/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      details[key] = match[1].trim();
    }
  }

  return details;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateVerificationReport(verification: any): string {
  return `
VERIFICATION REPORT
==================
ID: ${verification.id}
Status: ${verification.verification_status}
Authenticity Score: ${(verification.authenticity_score * 100).toFixed(2)}%
Date: ${formatDateTime(verification.created_at)}

EXTRACTED INFORMATION:
${Object.entries(verification.verification_details || {})
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

AI ANALYSIS:
${verification.ai_analysis ? Object.entries(verification.ai_analysis)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n') : 'No analysis available'}
  `;
}
