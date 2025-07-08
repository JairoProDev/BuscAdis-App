import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PublishAchievements } from './PublishAchievements';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { AchievementsService } from '@/services/achievements.service';
import { Logger } from '@/services/logging.service';

// Mock the Logger service
jest.mock('@/services/logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the Achievements service
jest.mock('@/services/achievements.service', () => ({
  AchievementsService: {
    checkPublishAchievements: jest.fn(),
    unlockAchievement: jest.fn(),
    getAchievements: jest.fn(),
  },
}));

describe('PublishAchievements', () => {
  const mockAchievements = [
    {
      id: 1,
      name: 'First Publication',
      description: 'Published your first ad',
      icon: '🌟',
      type: 'PUBLISH',
      condition: 'FIRST_PUBLICATION',
      progress: 0,
      target: 1,
      unlocked: false,
    },
    {
      id: 2,
      name: 'Image Master',
      description: 'Added multiple images to a publication',
      icon: '📸',
      type: 'PUBLISH',
      condition: 'IMAGES_ADDED',
      progress: 0,
      target: 3,
      unlocked: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    AchievementsService.getAchievements.mockResolvedValue(mockAchievements);
  });

  const renderComponent = () => {
    return render(
      <PublicationProvider>
        <PublishAchievements />
      </PublicationProvider>
    );
  };

  it('renders achievement list', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('First Publication')).toBeInTheDocument();
      expect(screen.getByText('Image Master')).toBeInTheDocument();
    });
  });

  it('displays achievement icons', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('🌟')).toBeInTheDocument();
      expect(screen.getByText('📸')).toBeInTheDocument();
    });
  });

  it('shows achievement progress', async () => {
    const achievementsWithProgress = mockAchievements.map(achievement => ({
      ...achievement,
      progress: 1,
    }));
    AchievementsService.getAchievements.mockResolvedValueOnce(achievementsWithProgress);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('1/1')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  it('handles achievement unlock', async () => {
    const unlockedAchievement = {
      ...mockAchievements[0],
      unlocked: true,
      progress: 1,
    };
    
    AchievementsService.checkPublishAchievements.mockResolvedValueOnce([unlockedAchievement]);
    AchievementsService.unlockAchievement.mockResolvedValueOnce(unlockedAchievement);
    
    renderComponent();
    
    await waitFor(() => {
      expect(Logger.success).toHaveBeenCalledWith(
        'Achievement unlocked',
        expect.objectContaining({
          details: { achievementName: unlockedAchievement.name },
        })
      );
    });
  });

  it('handles achievement check failure', async () => {
    const error = new Error('Failed to check achievements');
    AchievementsService.checkPublishAchievements.mockRejectedValueOnce(error);
    
    renderComponent();
    
    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to check achievements',
        expect.objectContaining({
          details: error,
        })
      );
    });
  });

  it('updates achievement progress', async () => {
    const progressUpdate = {
      ...mockAchievements[1],
      progress: 2,
    };
    
    AchievementsService.checkPublishAchievements.mockResolvedValueOnce([progressUpdate]);
    
    renderComponent();
    
    await waitFor(() => {
      expect(Logger.info).toHaveBeenCalledWith(
        'Achievement progress updated',
        expect.objectContaining({
          details: {
            achievementName: progressUpdate.name,
            progress: progressUpdate.progress,
            target: progressUpdate.target,
          },
        })
      );
    });
  });

  it('displays achievement descriptions', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Published your first ad')).toBeInTheDocument();
      expect(screen.getByText('Added multiple images to a publication')).toBeInTheDocument();
    });
  });

  it('shows locked achievement state', async () => {
    renderComponent();
    
    await waitFor(() => {
      const lockedAchievements = screen.getAllByTestId('locked-achievement');
      expect(lockedAchievements).toHaveLength(2);
    });
  });

  it('shows unlocked achievement state', async () => {
    const unlockedAchievements = mockAchievements.map(achievement => ({
      ...achievement,
      unlocked: true,
      progress: achievement.target,
    }));
    AchievementsService.getAchievements.mockResolvedValueOnce(unlockedAchievements);
    
    renderComponent();
    
    await waitFor(() => {
      const unlockedElements = screen.getAllByTestId('unlocked-achievement');
      expect(unlockedElements).toHaveLength(2);
    });
  });
}); 