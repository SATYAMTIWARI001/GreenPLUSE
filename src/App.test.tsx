import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CarbonCalculator from './components/CarbonCalculator';

// Hashing helper replica test
const PASSWORD_SALT = "greenpulse_salt_2026";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

function sanitizeInput(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe('Server-side Security Logic helpers', () => {
  it('correctly hashes password with HMAC SHA-256', () => {
    const hashed = hashPassword("password123");
    expect(hashed).toBe("53ca1e32ad82e329b2d1f33a214e1bbe7d4089acbcaa053289e2edb5c64be078");
  });

  it('correctly sanitizes input strings to prevent XSS', () => {
    const dirty = "<script>alert('xss')</script>";
    const clean = sanitizeInput(dirty);
    expect(clean).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
  });
});

describe('CarbonCalculator component rendering', () => {
  it('renders step 1 with commute labels and inputs', () => {
    const onCalculationCompleted = vi.fn();
    const onBack = vi.fn();
    
    render(
      <CarbonCalculator
        user={null}
        onCalculationCompleted={onCalculationCompleted}
        onBack={onBack}
      />
    );
    
    expect(screen.getByText('Commute & Transportation Habits')).toBeDefined();
    expect(screen.getByLabelText('Commute Distance')).toBeDefined();
  });
});
