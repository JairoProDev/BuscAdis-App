import { AchievementsService } from './achievements.service';
import { Logger } from './logging.service';
import { ApiService } from './api.service';

// Mock the Logger service
jest.mock('./logging.service', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock the API service
jest.mock('./api.service', () => ({
  ApiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('AchievementsService', () => {
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
  });

  describe('getAchievements', () => {
    it('fetches achievements successfully', async () => {
      ApiService.get.mockResolvedValueOnce({ data: mockAchievements });

      const achievements = await AchievementsService.getAchievements();

      expect(achievements).toEqual(mockAchievements);
      expect(ApiService.get).toHaveBeenCalledWith('/achievements');
      expect(Logger.info).toHaveBeenCalledWith(
        'Achievements fetched successfully',
        expect.objectContaining({
          details: { count: mockAchievements.length },
        })
      );
    });

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch achievements');
      ApiService.get.mockRejectedValueOnce(error);

      await expect(AchievementsService.getAchievements()).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to fetch achievements',
        expect.objectContaining({
          details: error,
        })
      );
    });
  });

  describe('checkPublishAchievements', () => {
    const mockPublicationData = {
      images: ['image1.jpg', 'image2.jpg'],
      category: 'test-category',
      title: 'Test Title',
    };

    it('checks achievements successfully', async () => {
      ApiService.post.mockResolvedValueOnce({
        data: [{ ...mockAchievements[0], progress: 1, unlocked: true }],
      });

      const result = await AchievementsService.checkPublishAchievements(mockPublicationData);

      expect(result[0].unlocked).toBe(true);
      expect(ApiService.post).toHaveBeenCalledWith(
        '/achievements/check',
        mockPublicationData
      );
      expect(Logger.info).toHaveBeenCalledWith(
        'Achievements checked successfully',
        expect.objectContaining({
          details: { publicationData: mockPublicationData },
        })
      );
    });

    it('handles check error', async () => {
      const error = new Error('Failed to check achievements');
      ApiService.post.mockRejectedValueOnce(error);

      await expect(
        AchievementsService.checkPublishAchievements(mockPublicationData)
      ).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to check achievements',
        expect.objectContaining({
          details: error,
        })
      );
    });
  });

  describe('unlockAchievement', () => {
    it('unlocks achievement successfully', async () => {
      const achievementId = 1;
      const unlockedAchievement = {
        ...mockAchievements[0],
        unlocked: true,
        progress: 1,
      };
      ApiService.put.mockResolvedValueOnce({ data: unlockedAchievement });

      const result = await AchievementsService.unlockAchievement(achievementId);

      expect(result).toEqual(unlockedAchievement);
      expect(ApiService.put).toHaveBeenCalledWith(
        `/achievements/${achievementId}/unlock`
      );
      expect(Logger.success).toHaveBeenCalledWith(
        'Achievement unlocked successfully',
        expect.objectContaining({
          details: { achievementId, achievementName: unlockedAchievement.name },
        })
      );
    });

    it('handles unlock error', async () => {
      const achievementId = 1;
      const error = new Error('Failed to unlock achievement');
      ApiService.put.mockRejectedValueOnce(error);

      await expect(
        AchievementsService.unlockAchievement(achievementId)
      ).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to unlock achievement',
        expect.objectContaining({
          details: { achievementId, error },
        })
      );
    });
  });

  describe('updateProgress', () => {
    it('updates achievement progress successfully', async () => {
      const achievementId = 2;
      const progress = 2;
      const updatedAchievement = {
        ...mockAchievements[1],
        progress,
      };
      ApiService.put.mockResolvedValueOnce({ data: updatedAchievement });

      const result = await AchievementsService.updateProgress(achievementId, progress);

      expect(result).toEqual(updatedAchievement);
      expect(ApiService.put).toHaveBeenCalledWith(
        `/achievements/${achievementId}/progress`,
        { progress }
      );
      expect(Logger.info).toHaveBeenCalledWith(
        'Achievement progress updated successfully',
        expect.objectContaining({
          details: {
            achievementId,
            progress,
            achievementName: updatedAchievement.name,
          },
        })
      );
    });

    it('handles update progress error', async () => {
      const achievementId = 2;
      const progress = 2;
      const error = new Error('Failed to update achievement progress');
      ApiService.put.mockRejectedValueOnce(error);

      await expect(
        AchievementsService.updateProgress(achievementId, progress)
      ).rejects.toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to update achievement progress',
        expect.objectContaining({
          details: { achievementId, progress, error },
        })
      );
    });
  });

  describe('validateAchievement', () => {
    it('validates achievement data successfully', () => {
      const validAchievement = mockAchievements[0];
      expect(() =>
        AchievementsService.validateAchievement(validAchievement)
      ).not.toThrow();
    });

    it('throws error for invalid achievement data', () => {
      const invalidAchievement = {
        ...mockAchievements[0],
        progress: -1, // Invalid progress value
      };
      expect(() =>
        AchievementsService.validateAchievement(invalidAchievement)
      ).toThrow();
      expect(Logger.error).toHaveBeenCalledWith(
        'Invalid achievement data',
        expect.objectContaining({
          details: { achievement: invalidAchievement },
        })
      );
    });
  });
}); 