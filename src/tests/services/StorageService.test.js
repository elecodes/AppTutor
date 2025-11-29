import { describe, it, expect, vi, beforeEach } from "vitest";
import StorageService from "../../services/StorageService.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Mock Firebase Storage functions
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

// Mock Firebase initialization
vi.mock("../../firebase/firebase", () => ({
  storage: {},
}));

describe("StorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("uploads file successfully and returns download URL", async () => {
      const mockFile = new File(["content"], "test.png", { type: "image/png" });
      const mockPath = "test/path/image.png";
      const mockDownloadURL = "https://example.com/image.png";

      ref.mockReturnValue({});
      uploadBytes.mockResolvedValue({ ref: {} });
      getDownloadURL.mockResolvedValue(mockDownloadURL);

      const result = await StorageService.uploadFile(mockFile, mockPath);

      expect(ref).toHaveBeenCalledWith(expect.anything(), mockPath);
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(result).toBe(mockDownloadURL);
    });

    it("throws error if file or path is missing", async () => {
      await expect(StorageService.uploadFile(null, "path")).rejects.toThrow("File and path are required");
      await expect(StorageService.uploadFile(new File([], "test"), null)).rejects.toThrow("File and path are required");
    });

    it("throws error if upload fails", async () => {
      const mockFile = new File(["content"], "test.png", { type: "image/png" });
      const mockPath = "test/path/image.png";
      const mockError = new Error("Upload failed");

      ref.mockReturnValue({});
      uploadBytes.mockRejectedValue(mockError);

      await expect(StorageService.uploadFile(mockFile, mockPath)).rejects.toThrow("Upload failed");
    });
  });

  describe("uploadAvatar", () => {
    it("constructs correct path and uploads avatar", async () => {
      const mockFile = new File(["content"], "avatar.jpg", { type: "image/jpeg" });
      const userId = "user123";
      const mockDownloadURL = "https://example.com/avatar.jpg";

      // Spy on uploadFile since uploadAvatar calls it
      const uploadFileSpy = vi.spyOn(StorageService, "uploadFile");
      uploadFileSpy.mockResolvedValue(mockDownloadURL);

      const result = await StorageService.uploadAvatar(userId, mockFile);

      expect(uploadFileSpy).toHaveBeenCalledWith(
        mockFile, 
        "users/user123/avatar.jpg"
      );
      expect(result).toBe(mockDownloadURL);
    });

    it("throws error if userId is missing", async () => {
      await expect(StorageService.uploadAvatar(null, new File([], "test"))).rejects.toThrow("User ID is required");
    });
  });

  describe("deleteFile", () => {
    it("deletes file successfully", async () => {
      const mockPath = "test/path/file.txt";
      ref.mockReturnValue({});
      deleteObject.mockResolvedValue();

      await StorageService.deleteFile(mockPath);

      expect(ref).toHaveBeenCalledWith(expect.anything(), mockPath);
      expect(deleteObject).toHaveBeenCalled();
    });

    it("handles error gracefully", async () => {
      const mockPath = "test/path/file.txt";
      ref.mockReturnValue({});
      deleteObject.mockRejectedValue(new Error("Delete failed"));

      // Should not throw
      await StorageService.deleteFile(mockPath);
      
      expect(deleteObject).toHaveBeenCalled();
    });
  });
});
