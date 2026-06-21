import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import crypto from "crypto";
import { User, CarbonResult } from './types';
import CarbonCalculator from './components/CarbonCalculator';
import PulseAssistant from './components/PulseAssistant';
import Leaderboard from './components/Leaderboard';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import CarbonTwin from './components/CarbonTwin';
import RewardsStore from './components/RewardsStore';

// Hashing helper replica test
const PASSWORD_SALT = "greenpulse_salt_2026";

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

// Mock standard canvas context and scrollIntoView to support JSDOM testing
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  });
});

const mockUser: User = {
  id: "test-user-id",
  email: "test@pulse.eco",
  name: "Test User",
  avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Test",
  createdAt: new Date().toISOString(),
  carbonScore: 5.5,
  ecoRank: "Green Warrior",
  badgeIds: ["badge-1"],
  points: 1200,
  completedChallenges: [],
  role: "user"
};

const mockResult: CarbonResult = {
  score: 6.5,
  yearlyScore: 2.37,
  grade: "B",
  comparisonPercent: -15,
  breakdown: {
    transport: 2.0,
    electricity: 1.5,
    food: 1.9,
    waste: 1.1
  },
  equivalents: {
    treesPlanted: 4,
    carsRemovedDays: 10,
    electricitySavedKwh: 8
  },
  suggestions: {
    transport: ["Avoid flying private.", "Carpool twice a week."],
    energy: ["Turn off AC early.", "Switch to LEDs."],
    food: ["Eat local grains.", "Choose seasonal greens."],
    waste: ["Refuse plastic straws.", "Sort wet waste."]
  }
};

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

describe('PulseAssistant eco guide rendering', () => {
  it('renders chat layout with initial greeting', () => {
    render(<PulseAssistant />);
    expect(screen.getByText('Pulse Eco Agent')).toBeDefined();
    expect(screen.getByPlaceholderText(/Ask about your score/i)).toBeDefined();
  });
});

describe('Leaderboard filters and search queries', () => {
  it('renders active tabs and search text fields', () => {
    const onBack = vi.fn();
    render(<Leaderboard onBack={onBack} />);
    expect(screen.getByText('Global Sustainability League')).toBeDefined();
    expect(screen.getByPlaceholderText(/Search/i)).toBeDefined();
  });
});

describe('AuthModal controls', () => {
  it('correctly toggles state views', () => {
    const onAuthSuccess = vi.fn();
    const onClose = vi.fn();
    
    render(<AuthModal onAuthSuccess={onAuthSuccess} onClose={onClose} />);
    expect(screen.getByText('Secure Gate Control')).toBeDefined();
    expect(screen.getByLabelText('Email Address')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
  });
});

describe('Dashboard layout display', () => {
  it('renders carbon grade, circularities, and recommendations tab', () => {
    const onReset = vi.fn();
    const onUserUpdate = vi.fn();
    const onBack = vi.fn();
    
    render(
      <Dashboard
        user={mockUser}
        result={mockResult}
        onReset={onReset}
        onUserUpdate={onUserUpdate}
        onBack={onBack}
      />
    );
    
    expect(screen.getByText('FOOTPRINT GRADE')).toBeDefined();
    expect(screen.getByText('CARBON SPEEDOMETER')).toBeDefined();
    expect(screen.getByText('Carbon Source Circularities')).toBeDefined();
    expect(screen.getByText('Personalized Gemini AI Suggestions')).toBeDefined();
  });
});

describe('CarbonTwin Simulation controls', () => {
  it('renders simulator sliders and future timelines', () => {
    const onBack = vi.fn();
    
    render(
      <CarbonTwin
        user={mockUser}
        baseScore={6.5}
        onBack={onBack}
      />
    );
    
    expect(screen.getByText('Carbon Twin & Lifestyle Sandbox')).toBeDefined();
    expect(screen.getByLabelText('Home Solar Generation Share')).toBeDefined();
  });
});

describe('RewardsStore points and transactions checks', () => {
  it('renders points bank and available certificate list', () => {
    const onPointsRedeemed = vi.fn();
    const onBack = vi.fn();
    
    render(
      <RewardsStore
        user={mockUser}
        onPointsRedeemed={onPointsRedeemed}
        onBack={onBack}
      />
    );
    
    expect(screen.getByText('Eco Rewards Store')).toBeDefined();
    expect(screen.getByText(/1200 GreenPoints/i)).toBeDefined();
    expect(screen.getByText('Varanasi Reforestation Sapling', { exact: false })).toBeDefined();
  });
});
