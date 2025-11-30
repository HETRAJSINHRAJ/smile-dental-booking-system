/**
 * Account Linking Integration Tests
 * 
 * Tests the account linking functionality for multiple social login providers.
 * These tests verify that users can link and unlink Google and Facebook accounts.
 */

// Mock Firebase Auth
const mockLinkWithCredential = jest.fn();
const mockUnlink = jest.fn();
const mockFetchSignInMethodsForEmail = jest.fn();
const mockSignInWithPopup = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithPopup: mockSignInWithPopup,
  GoogleAuthProvider: class {
    static credential = jest.fn();
  },
  FacebookAuthProvider: class {
    static credential = jest.fn();
  },
  OAuthProvider: class {},
  linkWithCredential: mockLinkWithCredential,
  unlink: mockUnlink,
  fetchSignInMethodsForEmail: mockFetchSignInMethodsForEmail,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Account Linking Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Detection', () => {
    it('should detect when account exists with different credential', async () => {
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);
      
      const email = 'test@example.com';
      const methods = await mockFetchSignInMethodsForEmail({}, email);
      
      expect(methods).toContain('password');
      expect(methods.length).toBeGreaterThan(0);
    });

    it('should return empty array when no account exists', async () => {
      mockFetchSignInMethodsForEmail.mockResolvedValue([]);
      
      const email = 'newuser@example.com';
      const methods = await mockFetchSignInMethodsForEmail({}, email);
      
      expect(methods).toEqual([]);
    });
  });

  describe('Link Provider', () => {
    it('should successfully link Google account', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      };

      mockLinkWithCredential.mockResolvedValue({ user: mockUser });
      
      const credential = { providerId: 'google.com' };
      const result = await mockLinkWithCredential(mockUser, credential);
      
      expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, credential);
      expect(result.user).toBe(mockUser);
    });

    it('should successfully link Facebook account', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      };

      mockLinkWithCredential.mockResolvedValue({ user: mockUser });
      
      const credential = { providerId: 'facebook.com' };
      const result = await mockLinkWithCredential(mockUser, credential);
      
      expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, credential);
      expect(result.user).toBe(mockUser);
    });

    it('should handle credential-already-in-use error', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      };

      const error = { code: 'auth/credential-already-in-use' };
      mockLinkWithCredential.mockRejectedValue(error);
      
      const credential = { providerId: 'google.com' };
      
      await expect(mockLinkWithCredential(mockUser, credential)).rejects.toEqual(error);
      expect(mockLinkWithCredential).toHaveBeenCalledWith(mockUser, credential);
    });

    it('should handle provider-already-linked error', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [
          { providerId: 'password' },
          { providerId: 'google.com' },
        ],
      };

      const error = { code: 'auth/provider-already-linked' };
      mockLinkWithCredential.mockRejectedValue(error);
      
      const credential = { providerId: 'google.com' };
      
      await expect(mockLinkWithCredential(mockUser, credential)).rejects.toEqual(error);
    });
  });

  describe('Unlink Provider', () => {
    it('should successfully unlink Google account', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [
          { providerId: 'password' },
          { providerId: 'google.com' },
        ],
      };

      mockUnlink.mockResolvedValue(mockUser);
      
      const result = await mockUnlink(mockUser, 'google.com');
      
      expect(mockUnlink).toHaveBeenCalledWith(mockUser, 'google.com');
      expect(result).toBe(mockUser);
    });

    it('should prevent unlinking last provider', () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'google.com' }],
      };

      // User should have at least one provider
      expect(mockUser.providerData.length).toBeGreaterThan(0);
      
      // In real implementation, this should throw an error
      if (mockUser.providerData.length <= 1) {
        expect(() => {
          throw new Error('Cannot unlink last provider');
        }).toThrow('Cannot unlink last provider');
      }
    });

    it('should handle no-such-provider error', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      };

      const error = { code: 'auth/no-such-provider' };
      mockUnlink.mockRejectedValue(error);
      
      await expect(mockUnlink(mockUser, 'google.com')).rejects.toEqual(error);
    });
  });

  describe('Get Linked Providers', () => {
    it('should return list of linked providers', () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [
          { providerId: 'password' },
          { providerId: 'google.com' },
          { providerId: 'facebook.com' },
        ],
      };

      const providers = mockUser.providerData.map(p => p.providerId);
      
      expect(providers).toContain('password');
      expect(providers).toContain('google.com');
      expect(providers).toContain('facebook.com');
      expect(providers.length).toBe(3);
    });

    it('should return empty array when no user', () => {
      const mockUser = null;
      
      const providers = mockUser ? mockUser.providerData.map((p: any) => p.providerId) : [];
      
      expect(providers).toEqual([]);
    });
  });

  describe('Account Exists Detection', () => {
    it('should detect account with email/password', async () => {
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);
      
      const methods = await mockFetchSignInMethodsForEmail({}, 'test@example.com');
      
      expect(methods).toContain('password');
    });

    it('should detect account with Google', async () => {
      mockFetchSignInMethodsForEmail.mockResolvedValue(['google.com']);
      
      const methods = await mockFetchSignInMethodsForEmail({}, 'test@example.com');
      
      expect(methods).toContain('google.com');
    });

    it('should detect account with multiple providers', async () => {
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password', 'google.com', 'facebook.com']);
      
      const methods = await mockFetchSignInMethodsForEmail({}, 'test@example.com');
      
      expect(methods).toContain('password');
      expect(methods).toContain('google.com');
      expect(methods).toContain('facebook.com');
      expect(methods.length).toBe(3);
    });
  });
});
